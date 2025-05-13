const express = require('express');
const controller = require('../controllers/controller');
const {check} = require('express-validator');
const verifyToken = require('../middleware/verifyToken');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.post('/login', [check('cardnum').not().isEmpty(), check('password').not().isEmpty()], controller.login);

router.post('/signup', [check('cardnum').not().isEmpty(), check('password').isLength({min: 10}), check('firstName').not().isEmpty(), check('lastName').not().isEmpty(), check('email').isEmail(), check('phone').not().isEmpty()], controller.signup);

router.get('/balance/:id', verifyToken, controller.getBalance);

router.post('/deposit/:id', [check('amount').not().isEmpty()], verifyToken, controller.deposit);
router.post('/etransfer/:id', [check('amount').not().isEmpty(), check('email').not().isEmpty()], verifyToken, controller.etransfer);

router.get('/publicKey', controller.getKeys);
router.get('/getinfo/:id', verifyToken, controller.getInfo);
router.put('/saveinfo/:id', verifyToken, controller.saveInfo);

module.exports = router;