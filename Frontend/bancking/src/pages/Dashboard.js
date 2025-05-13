import React, { useEffect, useState, useCallback } from 'react';

import './Dashboard.css';

function Dashboard() {
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);
  
  const [amountDeposit, setAmountDeposite] = useState('');
  const [transferData, setTransferData] = useState({
    amount:'',
    email:'',
  });
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  

  
  const fetchBalance = useCallback(async () => {
    try {
    
     const response = await fetch(`/onlinebanking/balance/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },      
      });
      const data = await response.json();

      if (response.ok) {
        setBalance(data.balance); 
        setError('');      
      } else {
        setError(data.error || 'Failed to fetch balance');
      }
    } catch (err) {
      setError('Server error');
      console.log(err);
    }
  }, [userId, token]);

  const handleDeposit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/onlinebanking/deposit/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json' },
        body: JSON.stringify({amount:amountDeposit}),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Deposit successful!');
        setRefreshCount(prev => prev + 1);
      } else {
        setMessage(data.error || 'Deposit failed');
      }
    } catch (err) {
      setMessage('Server error. Please try again later.');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/onlinebanking/etransfer/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json' },
        body: JSON.stringify(transferData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Transfer successful!');
        setRefreshCount(prev => prev + 1);
      } else {
        setMessage(data.error || 'Transfer failed');
      }
    } catch (err) {
      setMessage('Server error. Please try again later.');
    }
  };

  const handleChange = (e) => {
    setTransferData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance, refreshCount]);
  


  return (
    <div className="dashboard-container">
      <h2 className="dashboard-heading">Welcome to Your Dashboard</h2>
      
      {error && <p className="dashboard-error">{error}</p>}

      {balance !== null ? (
        <div className="dashboard-balance">
          <p>Your Current Balance:</p>
          <h1>${balance.toFixed(2)}</h1>
        </div>
      ) : (
        <p>Loading balance...</p>
      )}
      
      <form onSubmit={handleDeposit} className="dashboard-form">
  <input
    type="text"
    placeholder="Amount"
    value={amountDeposit}
    onChange={(e) => setAmountDeposite(e.target.value)}
    required
    className="dashboard-input"
  />
  <button type="submit" className="dashboard-button">Deposit</button>
</form>

    <form onSubmit={handleTransfer} className="dashboard-form">
        <input
            type="text"
            placeholder="Amount"
            name="amount"
            value={transferData.amount}
            onChange={handleChange}
            required
            className="dashboard-input"
        />
        <input
            type="text"
            placeholder="Email"
            name="email"
            value={transferData.email}
            onChange={handleChange}
            required
            className="dashboard-input"
        />
        <button type="submit" className="dashboard-button">Transfer</button>
    </form>

    {message && <p className="dashboard-message">{message}</p>}     
      
    </div>
  );
}

export default Dashboard;
