import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';



const FetchBusLocation = ({ busNumber }) => {
  const map = useMap();
  const [position, setPosition] = useState(null);

  useEffect(() => {
    const fetchBusLocation = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/bus-location/${busNumber}`);
        if (response.data) {
          const latitude = 28.8703;
          const longitude = 78.7571;
          setPosition([latitude, longitude]);
          map.setView([latitude, longitude], 17);
        } else {
          console.error('No data found for the bus number');
        }
      } catch (error) {
        console.error('Error fetching bus location:', error);
      }
    };

    fetchBusLocation();
  }, [busNumber, map]);

  return position ? (
    <Marker position={position}>
      <Popup>Bus {busNumber} is here</Popup>
    </Marker>
  ) : null;
};

const GoogleMap = () => {
  const [busNumber, setBusNumber] = useState('');
  const [showLocation, setShowLocation] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleInputChange = (event) => {
    setBusNumber(event.target.value);
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/bus-location/${busNumber}`);
      if (response.data) {
        setShowLocation(true);
        setNotFound(false);
      } else {
        setShowLocation(false);
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error fetching bus location:', error);
      setShowLocation(false);
      setNotFound(true);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={busNumber}
        onChange={handleInputChange}
        placeholder="Enter bus number"
      />
      <button onClick={handleSearch}>Search</button>
      {notFound && <p>Bus number not found</p>}
      <MapContainer center={[28.832144542791458, 78.77574510089143]} zoom={14} style={{ height: "100vh", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {showLocation && <FetchBusLocation busNumber={busNumber} />}
      </MapContainer>
    </div>
  );
};

export default GoogleMap;