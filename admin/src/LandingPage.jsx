import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <a href="/" className="navbar-brand">Guardiansync</a>
        <div className="navbar-links">
          <Link to="/admin-login">Admin Login</Link>
          <Link to="/admin-register">Admin Register</Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <h1>Welcome to GuardianSync – Admin Dashboard</h1>    
        <div className="cards-container">
          <div className="card">
            <h3 className="card-title">Live Tracking</h3>
            <p className="card-text">Monitor driver locations in real-time and track children's routes for enhanced safety. The interactive map provides live updates, ensuring efficient transportation management. Admins can view current driver routes, estimated arrival times, and receive alerts for any deviations from the assigned path.</p>
          </div>
          <div className="card">
            <h3 className="card-title">Secure Face Recognition</h3>
            <p className="card-text">AI-powered face recognition ensures that only authorized drivers pick up children.Which is a secure system. Before marking a child as "Picked Up," the system verifies their identity using live camera authentication, preventing unauthorized access and ensuring maximum security.</p>
          </div>
          <div className="card">
            <h3 className="card-title">Instant Notifications</h3>
            <p className="card-text">Keep parents informed with real-time SMS alerts. The system automatically notifies parents when their child has been picked up, dropped off, or is absent for the day. This seamless communication helps reduce anxiety and ensures complete transparency in the pick-up and drop-off process.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        &copy; 2025 Guardiansync. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
