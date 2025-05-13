import React, {useState, useEffect} from 'react';
import forge from 'node-forge';

function AccountPage (){

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const [message, setMessage] = useState('');

    const [formData, setFormData] = useState({
        cardnum: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    });
      
    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await fetch(`/onlinebanking/getinfo/${userId}`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            const data = await response.json();
            setFormData(data);
          } catch (err) {
            console.log(err);
          }
        };
      
        fetchData();
    }, [userId, token]);
      

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
      
    const handleSave = async (e) => {
        e.preventDefault();

        try {
            const publicKey = await fetchPublicKey();
        
            const encryptedCard = encrypt(formData.cardnum, publicKey);
            const encryptedFirstName = encrypt(formData.firstName, publicKey);
            const encryptedLastName = encrypt(formData.lastName, publicKey);
            const encryptedPhone = encrypt(formData.phone, publicKey);
            const encryptedEmail = encrypt(formData.email, publicKey);
            const encryptedData = {
                ...formData,
                cardnum: encryptedCard,
                firstName: encryptedFirstName,
                lastName: encryptedLastName,
                phone: encryptedPhone,
                email: encryptedEmail,
            };

            const response = await fetch(`/onlinebanking/saveinfo/${userId}`, {
                method: 'PUT',
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(encryptedData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Save Successful!');
                
            } else {
                setMessage(data.error || 'Save failed');
            }

        } catch (err) {
        setMessage('Server error. Please try again later.');
        console.log(err);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({
          ...prev,
          [e.target.name]: e.target.value,
        }));
      };
      

    return(
        
        <div className="signup-container">
            <h2 className="signup-heading">Account</h2>
            <form onSubmit={handleSave} className="signup-form">
                <input
                className="signup-input"
                type="text"
                name="cardnum"
                placeholder="Card Number"
                value={formData.cardnum}
                readOnly
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
                <button type="submit" className="signup-button">Save</button>
                {message && <p className="signup-message">{message}</p>}
            </form>
        </div>
    );

}

export default AccountPage;