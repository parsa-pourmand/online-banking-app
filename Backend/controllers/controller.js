const { validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET;

const privateKeyPath = path.join(__dirname, '..', 'keys', 'private.pem');
const publicKeyPath = path.join(__dirname, '..', 'keys', 'public.pem');

const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

function rsaDecrypt(encrypted) {
  return crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(encrypted, 'base64')
  ).toString('utf8');
}

async function login (req, res){

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const encryptedCard = req.body.cardnum;
    const encryptedPass = req.body.password;

    const cardnum = rsaDecrypt(encryptedCard);
    const password = rsaDecrypt(encryptedPass);

    try{
        const user = await User.findOne({cardnum});
        if(!user){
            return res.status(401).json({ error: 'Invalid Card Number or Password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid Card Number or password' });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
            expiresIn: '1h',
          });

        res.status(200).json({
            token,
            message: 'Login successful',
            userId: user._id, 
            balance: user.balance,
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
}

async function signup(req, res){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const {firstName, lastName, email, phone} = req.body;
    const encryptedCard = req.body.cardnum;
    const encryptedPassword = req.body.password;

    const cardnum = rsaDecrypt(encryptedCard);
    const password = rsaDecrypt(encryptedPassword);
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({ $or: [{ cardnum }, { email }] });

    if (existingUser) {
        return res.status(409).json({ error: 'Card Number or email already in use' });
    }

    const newUser = new User({
        cardnum,
        password: hashedPassword,
        firstName,
        lastName,
        email,
        phone,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
}

async function getBalance(req, res) {
    try {
      const userId = req.params.id;
  
      if (req.user.id !== userId) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      return res.status(200).json({ balance: user.balance });
    } catch (err) {
      console.error('Error in getBalance:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
  

async function deposit(req, res){
    const userId = req.params.id;

    if (req.user.id !== userId) {
        return res.status(403).json({ error: 'Unauthorized access' });
    }
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const {amount} = req.body;
    try{
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({ error: 'User not found' });
        }
        const depositAmount = Number(amount);
        if (isNaN(depositAmount) || depositAmount <= 0) {
            return res.status(400).json({ error: 'Invalid deposit amount' });
        }

        const newbalance = user.balance + depositAmount;
        user.balance = newbalance;

        await user.save();

        res.status(200).json({ message: 'Deposit successful', newBalance: user.balance });
    }catch(err){
        console.error('Error in deposit:', err);
        res.status(500).json({ error: 'Server error' });
    }
}

async function etransfer(req, res){
    const userId = req.params.id;
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const {amount, email} = req.body;

    const transferAmount = Number(amount);

    if(isNaN(transferAmount) || transferAmount<0){
        return res.status(400).json({ error: 'Invalid transfer amount' });
    }

    try{

        const userA = await User.findById(userId);
        if(!userA){
            return res.status(404).json({ error: 'User not found' });
        }

        const userB = await User.findOne({email});
        if(!userB){
            return res.status(404).json({ error: 'User not found' });
        }

        if(userA.balance<transferAmount){
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        const userA_New_Balance = userA.balance - transferAmount;
        const userB_New_Balance = userB.balance + transferAmount;

        userA.balance = userA_New_Balance;
        userB.balance = userB_New_Balance;

        await userA.save();
        await userB.save();

        res.status(200).json({ message: 'Transfer successful', newBalance: userA.balance });

    }catch(err){
        console.error('Error in transfer:', err);
        res.status(500).json({ error: 'Server error' });
    }

}

async function getKeys (req, res) {
    
    res.send( publicKey );
}

async function getInfo(req, res) {
    const userId = req.params.id;

    if (req.user.id !== userId) {
        return res.status(403).json({ error: 'Unauthorized access' });
    }

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
        cardnum: user.cardnum, 
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
    });
}


async function saveInfo(req, res) {
    const userId = req.params.id;

    if (req.user.id !== userId) {
        return res.status(403).json({ error: 'Unauthorized access' });
    }

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const encryptedFirstName = req.body.firstName;
    const encryptedLastName = req.body.lastName;
    const encryptedEmail = req.body.email;
    const encryptedPhone = req.body.phone;

    try {
        const firstName = rsaDecrypt(encryptedFirstName);
        const lastName = rsaDecrypt(encryptedLastName);
        const phone = rsaDecrypt(encryptedPhone);
        const email = rsaDecrypt(encryptedEmail);

        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.phone = phone;

        await user.save();

        return res.status(200).json({ message: 'User information updated successfully' });
    } catch (err) {
        console.error('Decryption or update error:', err);
        return res.status(500).json({ error: 'Failed to update user info' });
    }
}



exports.etransfer = etransfer;
exports.getBalance = getBalance;
exports.login = login;
exports.signup = signup;
exports.deposit = deposit;
exports.getKeys = getKeys;
exports.getInfo = getInfo;
exports.saveInfo = saveInfo;
