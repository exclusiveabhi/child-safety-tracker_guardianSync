import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('token');
    navigate('/admin-login');
  };
  const cardData = [
    {
      title: "Real-time Tracking",
      description: "Monitor student pick-up and drop-off with live location updates.",
      img: "tracking.avif"
    },
    {
      title: "Secure Face Recognition",
      description: "Ensuring students are safely picked up by authorized personnel.",
      img: "face-recognization.jpg"
    },
    {
      title: "Instant Notifications",
      description: "Parents receive SMS alerts when their child is picked up or dropped off.",
      img: "notification.png"
    }
  ];

  return (
    <>
      <nav className="navbar">
        <h1 className="nav-title">GuardianSync</h1>
        <div className="nav-links">
          <Link to="/student/register" className="nav-link">Student Register</Link>
          <Link to="/driver/register" className="nav-link">Driver Register</Link>
          <button onClick={logout} className="nav-link logout-button">Logout</button>
        </div>
      </nav>

      <div className="home-container">
        <section className="content">
          <h2>Welcome to GuardianSync</h2>
          <p>Effortlessly track student pick-up and drop-off with real-time updates.</p>
          <div className="image-container">
            <img src="child-management.avif" alt=" Child Management" />
            <img src="driver-management.webp" alt="Driver Management" />
          </div>
        </section>

        {/* Cards Section */}
        <div className="cards-container">
          {cardData.map((card, index) => (
            <div key={index} className="card">
              <img src={card.img} alt={card.title} className="card-img" />
              <h3 className="card-title">{card.title}</h3>
              <p className="card-description">{card.description}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="footer">
        &copy; 2025 GuardianSync. All rights reserved.
      </footer>
    </>
  );
};

export default Home;
