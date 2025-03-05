# GuardianSync: Real-Time Child Safety & Tracking System

GuardianSync is a comprehensive solution that enhances child safety during school commutes by integrating real-time tracking, biometric verification, and automated notifications—all in one unified platform ! 

---

## 📑 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Troubleshooting & Bug Reporting](#troubleshooting--bug-reporting)
- [Contributing](#contributing)

---

## 🌟 Project Overview

GuardianSync empowers schools, parents, and drivers by providing:
- **Live Tracking:** Real-time GPS updates for monitoring vehicle locations. 📍
- **Facial Recognition:** Biometric verification to ensure the correct child is picked up or dropped off. 😊🔒
- **Attendance Management:** Automated status updates for "Picked Up", "Dropped", or "Not Present". ✔️
- **SMS Notifications:** Instant alerts to keep parents informed at every stage. 📲
- **Role-Based Dashboards:** Custom-tailored experiences for parents, administrators, and drivers. 👥

---

## 🚀 Features

- **Real-Time Monitoring:** Always know where the vehicle is. ⏱️
- **Biometric Authentication:** Secure pickups using facial recognition technology. 🔐
- **User-Friendly Dashboards:** Intuitive interfaces for a smooth user experience. 🖥️
- **Automated Communication:** SMS/Email alerts for timely updates. 📩
- **Robust Backend:** Powered by Express and MongoDB for scalable, real-time data processing. 🛠️

---

## 🛠️ Technologies Used

- **Frontend:**
  - **Parent Portal:** Vite + React ⚛️
  - **Admin Portal:** Vite + React (with its own `.env` file for device configuration) 🖥️
- **Backend:** Express, Node.js, MongoDB 🌐
- **Mobile App:** React Native CLI for the driver application 📱

---

## 📁 Project Structure

```
/project-root
├── portal/                  # Vite React app for parents
├── admin/                   # Vite React app for administrators (has its own .env file)
├── backend/                 # Express API (Node.js & MongoDB)
├── driver/                  # React Native CLI app for drivers (has its own .env file)
└── README.md                # This file
```

---

## 🔧 Installation & Setup

1. **Move Project Code:**  
   Place the entire project folder on your **C: drive** to avoid path issues during development. 💻

2. **Install Dependencies:**  
   Open a terminal in each folder and run:
   ```bash
   npm install
   ```
   Do this for:
   - `portal`
   - `admin`
   - `backend`
   - `driver`

3. **Update Environment Files:**  
   - **Admin Portal:**  
     In the `admin` folder, open the `.env` file and update it with your device IP or any required environment-specific variables. 🔧
   - **Driver App:**  
     In the `driver` folder, update the `.env` file similarly with your device IP. 🔄
     
   > **⚠️ Note:** These environment files are critical for network configurations. Incorrect values may cause connection issues.

4. **Important:**  
   **Do not move or modify files in other directories** as this can lead to errors. ❌

---

## ▶️ Running the Application

### Parent & Admin Portals

1. **Start the Development Server:**  
   Navigate to the respective folder (`portal` or `admin`) and run:
   ```bash
   npm run dev
   ```
   This will launch the Vite development server with hot reloading. 🔥

### Backend Server

1. **Launch the API Server:**  
   In the `backend` directory, run:
   ```bash
   node server.js
   ```
   Ensure your MongoDB instance is running and accessible. 🗄️

### Driver Mobile App (React Native)

1. **Start the Metro Bundler:**  
   From the `driver` folder, execute:
   ```bash
   npx react-native start --reset-cache
   ```
2. **Run on Android Device:**  
   Open a new terminal (still in the `driver` folder) and run:
   ```bash
   npx react-native run-android
   ```
3. **Diagnostic Command:**  
   If issues arise, run:
   ```bash
   npx react-native doctor
   ```
   This will help diagnose environment or dependency issues. 🔍

---

## 🐞 Troubleshooting & Bug Reporting

- **React Native Issues:**  
  Use `npx react-native doctor` to diagnose configuration issues.
- **Dependency Problems:**  
  Ensure you have run `npm install` in every project folder.
- **Environment Variables:**  
  Double-check the `.env` files in both the **admin** and **driver** folders.
- **Logs & Errors:**  
  Refer to terminal logs for detailed error messages. 📝

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:
1. **Fork** the repository.
2. **Create a new branch** for your feature or bugfix.
3. **Commit your changes** with clear messages.
4. **Open a pull request** with a detailed description of your changes.

---