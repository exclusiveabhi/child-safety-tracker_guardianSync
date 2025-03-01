import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const RegisterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #74ebd5, #acb6e5);
  padding: 20px;
`;

const FormCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 400px;
  text-align: center;
  transition: transform 0.3s;
  &:hover {
    transform: scale(1.02);
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
`;

const InputField = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  transition: 0.3s;
  &:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  }
`;

const RegisterButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.25rem;
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    background-color: #0056b3;
  }
`;

const DriverRegister = () => {
  const [busNumber, setBusNumber] = useState('');
  const [password, setPassword] = useState('');
  const [route, setRoute] = useState('');

  const register = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_DEVICE_IP}/register`, {
        busNumber,
        password,
        route,
      });
      alert('Driver registered successfully');
    } catch (error) {
      alert('Registration failed');
    }
  };

  return (
    <RegisterContainer>
      <FormCard>
        <Title>Driver Register</Title>
        <InputField
          type="text"
          placeholder="Bus Number"
          value={busNumber}
          onChange={(e) => setBusNumber(e.target.value)}
        />
        <InputField
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <InputField
          type="text"
          placeholder="Route"
          value={route}
          onChange={(e) => setRoute(e.target.value)}
        />
        <RegisterButton onClick={register}>Register</RegisterButton>
      </FormCard>
    </RegisterContainer>
  );
};

export default DriverRegister;
