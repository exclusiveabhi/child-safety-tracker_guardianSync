import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
// import dotenv from 'dotenv';

const RegisterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
 margin-left: 550px;
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 500px;
`;

const InputField = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  font-size: 1rem;
`;

const RegisterButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 0.25rem;
  font-size: 1.25rem;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const AdminRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const register = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_DEVICE_IP}/admin/register`, { name, email, password });
      alert('Admin registered successfully');
    } catch (error) {
      alert('Registration failed');
    }
  };

  return (
    <RegisterContainer>
      <Title>Admin Register</Title>
      <InputContainer>
        <InputField 
          type="text" 
          placeholder="Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
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
      <RegisterButton onClick={register}>Register</RegisterButton>
    </RegisterContainer>
  );
};

export default AdminRegister;