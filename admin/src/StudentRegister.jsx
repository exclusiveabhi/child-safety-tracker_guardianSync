import React, { useState } from "react";
import axios from "axios";
import styled from "styled-components";

const RegisterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(to right, #a8edea, #fed6e3);
`;

const FormCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
`;

const InputField = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 8px rgba(0, 123, 255, 0.3);
    outline: none;
  }
`;

const RegisterButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.25rem;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

const StudentRegister = () => {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [route, setRoute] = useState("");
  const [busNumber, setBusNumber] = useState("");
  const [photo, setPhoto] = useState("");

  const handlePhotoCapture = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    if (!/^[A-Za-z\s]+$/.test(name)) {
      alert("Name should not contain numbers or special characters.");
      return false;
    }
    if (!/^\d{10}$/.test(number)) {
      alert("Number should be exactly 10 digits.");
      return false;
    }
    if (!/^\d+$/.test(studentId)) {
      alert("Student ID should be numeric.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address.");
      return false;
    }
    if (!/^\d{1,2}$/.test(studentClass)) {
      alert("Class should be numeric and maximum 2 digits.");
      return false;
    }
    if (!/^[A-Za-z]+$/.test(route)) {
      alert("Route should contain only letters and no spaces.");
      return false;
    }
    if (!/^\d{4}$/.test(busNumber)) {
      alert("Bus number should be exactly 4 digits.");
      return false;
    }
    if (!photo) {
      alert("Photo is required.");
      return false;
    }
    return true;
  };

  const register = async () => {
    if (!validate()) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_DEVICE_IP}/student/register`,
        {
          name,
          number,
          studentId,
          email,
          class: studentClass,
          route,
          busNumber,
          photo,
        }
      );
      alert("Student registered successfully");
    } catch (error) {
      alert("Registration failed");
    }
  };

  return (
    <RegisterContainer>
      <FormCard>
        <Title>Student Register</Title>
        <InputField type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <InputField type="text" placeholder="Number" value={number} onChange={(e) => setNumber(e.target.value)} />
        <InputField type="text" placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
        <InputField type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <InputField type="text" placeholder="Class" value={studentClass} onChange={(e) => setStudentClass(e.target.value)} />
        <InputField type="text" placeholder="Route" value={route} onChange={(e) => setRoute(e.target.value)} />
        <InputField type="text" placeholder="Bus Number" value={busNumber} onChange={(e) => setBusNumber(e.target.value)} />
        <InputField type="file" accept="image/*" onChange={handlePhotoCapture} />
        <RegisterButton onClick={register}>Register</RegisterButton>
      </FormCard>
    </RegisterContainer>
  );
};

export default StudentRegister;
