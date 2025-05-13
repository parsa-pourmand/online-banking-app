import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import forge from 'node-forge';
import './LoginPage.css';

function LoginPage({setIsLoggedIn}) {
    const [cardnum, setCardnum] = useState('');
    const [password, setPassword] = useState('');
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
    
  const handleLogin = async (e) => {
    e.preventDefault();
    const key = await fetchPublicKey();

    const encryptedCard = encrypt(cardnum, key);
    const encryptedPass = encrypt(password, key);

    try {
      const response = await fetch('/onlinebanking/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardnum: encryptedCard, password: encryptedPass }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Login successful!');

        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        setIsLoggedIn(true);
        navigate('/dashboard');
  
      } else {
        setMessage(data.error || 'Login failed');
      }
    } catch (err) {
      setMessage('Server error. Please try again later.');
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-heading">Login</h2>
      <form onSubmit={handleLogin} className="login-form">
        <input
          className="login-input"
          type="text"
          placeholder="Card Number"
          value={cardnum}
          onChange={(e) => setCardnum(e.target.value)}
          required
        />
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-button">Login</button>
        {message && <p className="login-message">{message}</p>}
      </form>
      <button type="submit" className="sign-button" onClick={()=>{navigate('/signup')}}>Signup</button>
    </div>
  );
}

export default LoginPage;
