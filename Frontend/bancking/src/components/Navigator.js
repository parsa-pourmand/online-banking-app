import {useNavigate } from 'react-router-dom';
import './Navigator.css';

function Navigator({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <nav className="nav">
      <h2 className="logo">BankApp</h2>
      <div className="nav-links">

      {isLoggedIn ? (
          <button onClick={()=>{navigate('/dashboard')}} className="nav-button">Dashboard</button>
        ) : null}

      {isLoggedIn ? (
          <button onClick={()=>{navigate('/account')}} className="nav-button">Account</button>
        ) : null}

        {isLoggedIn ? (
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        ) : null}

        
      </div>
    </nav>
  );
}

export default Navigator;
