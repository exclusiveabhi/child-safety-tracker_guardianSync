import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

console.log(import.meta.env.VITE_DEVICE_IP);

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f4f4f9;
  padding-top: 80px;
  margin-left: 700px;
  margin-right: 700px;
  margin-top: 1px;
`;

const Navbar = styled.nav`
  width: 100%;
  padding: 0.8rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #007bff;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
`;

const NavTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
`;

const StyledLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 1rem;

  &:hover {
    text-decoration: underline;
  }
`;

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: white;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin-top: 50px;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1rem;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const InputField = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  font-size: 1rem;
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 0.25rem;
  font-size: 1.25rem;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

const Footer = styled.footer`
  width: 100%;
  padding: 1rem;
  text-align: center;
  background-color: #007bff;
  color: white;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 0.9rem;
`;
const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const login = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_DEVICE_IP}/admin/login`, { email, password });
      const { token } = response.data;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      onLogin();
      const homeResponse = await axios.get(`${import.meta.env.VITE_DEVICE_IP}/home`);
      if (homeResponse.status === 200) {
        navigate('/home');
      }
    } catch (error) {
      console.error('Login failed', error);
      alert('Login failed');
    }
  };

  return (
    <>
      <Navbar>
        <NavTitle>GuardianSync</NavTitle>
        <StyledLink to="/admin-register">Admin Register</StyledLink>
      </Navbar>
      <Container>
        <LoginContainer>
          <Title>Admin Login</Title>
          <InputContainer>
            <InputField 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <InputField 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </InputContainer>
          <LoginButton onClick={login}>Login</LoginButton>
        </LoginContainer>
      </Container>
      <Footer>&copy; 2025 GuardianSync. All rights reserved.</Footer>
    </>
  );
};

export default AdminLogin;