import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import  Dashboard from './pages/Dashboard'
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage'
import Navigator from './components/Navigator'
import AccountPage from './pages/AccountPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);



  return (
    <Router>
      <Navigator isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
      <Routes>

        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}/>
        <Route path="/account" element={isLoggedIn ? <AccountPage /> : <Navigate to="/login" />}/>

      </Routes>
    </Router>
  );
}

export default App;