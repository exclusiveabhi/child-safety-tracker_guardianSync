import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

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

const StudentRegister = () => {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [route, setRoute] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [photo, setPhoto] = useState('');

  const handlePhotoCapture = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const register = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_DEVICE_IP}/student/register`, { name, number, studentId, email, class: studentClass, route, busNumber, photo });
      alert('Student registered successfully');
    } catch (error) {
      alert('Registration failed');
    }
  };

  return (
    <RegisterContainer>
      <Title>Student Register</Title>
      <InputContainer>
        <InputField 
          type="text" 
          placeholder="Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
        <InputField 
          type="text" 
          placeholder="Number" 
          value={number} 
          onChange={(e) => setNumber(e.target.value)} 
        />
        <InputField 
          type="text" 
          placeholder="Student ID" 
          value={studentId} 
          onChange={(e) => setStudentId(e.target.value)} 
        />
        <InputField 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <InputField 
          type="text" 
          placeholder="Class" 
          value={studentClass} 
          onChange={(e) => setStudentClass(e.target.value)} 
        />
        <InputField 
          type="text" 
          placeholder="Route" 
          value={route} 
          onChange={(e) => setRoute(e.target.value)} 
        />
        <InputField 
          type="text" 
          placeholder="Bus Number" 
          value={busNumber} 
          onChange={(e) => setBusNumber(e.target.value)} 
        />
        <InputField 
          type="file" 
          accept="image/*" 
          onChange={handlePhotoCapture} 
        />
      </InputContainer>
      <RegisterButton onClick={register}>Register</RegisterButton>
    </RegisterContainer>
  );
};

export default StudentRegister;