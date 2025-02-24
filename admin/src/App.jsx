import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import AdminRegister from './AdminRegister';
import StudentRegister from './StudentRegister';

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/login" element={<AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />} />
        {isAdminLoggedIn ? (
          <Route path="/student/register" element={<StudentRegister />} />
        ) : (
          <Route path="*" element={<Navigate to="/admin/login" />} />
        )}
        <Route path="/" element={
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginLeft: '430px', 
            height: '100vh', 
             
            fontFamily: 'Arial, sans-serif' 
          }}>
            <h1 style={{ 
              fontSize: '3rem', 
              color: '#333', 
              marginBottom: '1rem' 
            }}>Welcome to Admin Portal</h1>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center' 
            }}>
              <a href="/admin/register" style={{ 
                textDecoration: 'none', 
                color: '#fff', 
                backgroundColor: '#007bff', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '0.25rem', 
                marginBottom: '1rem', 
                fontSize: '1.25rem', 
                textAlign: 'center' 
              }}>Register Admin</a>
              <a href="/admin/login" style={{ 
                textDecoration: 'none', 
                color: '#fff', 
                backgroundColor: '#28a745', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '0.25rem', 
                fontSize: '1.25rem', 
                textAlign: 'center' 
              }}>Login Admin</a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

function Dashboard() {
  return <h2>Admin Dashboard</h2>;
}

export default App;