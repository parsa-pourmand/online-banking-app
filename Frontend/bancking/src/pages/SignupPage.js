import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import forge from 'node-forge';
import './SignupPage.css';

function SignupPage() {
  const [formData, setFormData] = useState({
    cardnum: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const fetchPublicKey = async () => {
    const res = await fetch('/onlinebanking/publicKey');
    let key = await res.text();
  
  
    key = key.trim();
  
    if (!key.includes('-----BEGIN RSA PUBLIC KEY-----')) {
      throw new Error('Invalid PEM format');
    }
  
    return forge.pki.publicKeyFromPem(key);
  };
      
  
      const encrypt = (data, key) => {
        return window.btoa(key.encrypt(forge.util.encodeUtf8(data)));
      };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const publicKey = await fetchPublicKey();
      
      const encryptedCard = encrypt(formData.cardnum, publicKey);
      const encryptedPassword = encrypt(formData.password, publicKey);

      const encryptedData = {
        ...formData,
        cardnum: encryptedCard,
        password: encryptedPassword,
      };
      const response = await fetch('/onlinebanking/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(encryptedData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Signup successful!');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setMessage(data.error || 'Signup failed');
      }
    } catch (err) {
      setMessage('Server error. Please try again later.');
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-heading">Create an Account</h2>
      <form onSubmit={handleSignup} className="signup-form">
        <input
          className="signup-input"
          type="text"
          name="cardnum"
          placeholder="Card Number"
          value={formData.cardnum}
          onChange={handleChange}
          required
        />
        <input
          className="signup-input"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          className="signup-input"
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <input
          className="signup-input"
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        <input
          className="signup-input"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          className="signup-input"
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <button type="submit" className="signup-button">Sign Up</button>
        {message && <p className="signup-message">{message}</p>}
      </form>
      <button type="submit" className="log-button" onClick={()=>{navigate('/login')}}>Login</button>
    </div>
  );
}

export default SignupPage;
