import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import AdminRegister from './AdminRegister';
import StudentRegister from './StudentRegister';
import LandingPage from './LandingPage';
import Home from './Home';
import DriverRegister from '../DriverRegister';

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsAdminLoggedIn(true);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin-login" element={<AdminLogin onLogin={handleLogin} />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/student/register" element={<StudentRegister />} />
        <Route path="/home" element={<Home />} />
        <Route path="/driver/register" element={<DriverRegister />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;