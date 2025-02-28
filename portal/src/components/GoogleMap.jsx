import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// This component fetches the bus location and updates the parent's driverOnline state
const FetchBusLocation = ({ busNumber, setDriverOnline }) => {
  const map = useMap();
  const [position, setPosition] = useState(null);

  useEffect(() => {
    const fetchBusLocation = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/bus-location/${busNumber}`);
        console.log('API response:', response.data);

        // Check if online is true in the returned document
        if (response.data && response.data.online) {
          const { latitude, longitude } = response.data;
          setPosition([latitude, longitude]);
          setDriverOnline(true);
          map.setView([latitude, longitude], 17);
        } else {
          setDriverOnline(false);
          setPosition(null);
        }
      } catch (error) {
        console.error('Error fetching bus location:', error);
        setDriverOnline(false);
        setPosition(null);
      }
    };

    fetchBusLocation();
    const intervalId = setInterval(fetchBusLocation, 2000);

    return () => clearInterval(intervalId);
  }, [busNumber, map, setDriverOnline]);

  return position ? (
    <Marker position={position}>
      <Popup>Bus {busNumber} is here</Popup>
    </Marker>
  ) : null;
};

const GoogleMap = () => {
  const [busNumber, setBusNumber] = useState('');
  const [showLocation, setShowLocation] = useState(false);
  // Parent state to hold driver online status from FetchBusLocation
  const [driverOnline, setDriverOnline] = useState(null);

  const handleInputChange = (event) => {
    setBusNumber(event.target.value);
  };

  const handleSearch = async () => {
    // Simply display the map; FetchBusLocation handles the online/offline check.
    setShowLocation(true);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={busNumber}
        onChange={handleInputChange}
        placeholder="Enter bus number"
      />
      <button onClick={handleSearch}>Search</button>
      <MapContainer
        center={[28.832144542791458, 78.77574510089143]}
        zoom={14}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {showLocation && (
          <FetchBusLocation busNumber={busNumber} setDriverOnline={setDriverOnline} />
        )}
      </MapContainer>
      {showLocation && driverOnline === false && (
        <div
          style={{
            position: 'absolute',
            top: '5px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            backgroundColor: 'rgba(255,255,255,0.9)',
            padding: '10px 20px',
            borderRadius: '5px',
            boxShadow: '0 0 10px rgba(229, 0, 0, 0.3)',
            color: 'red',
          }}
        >
         {busNumber} Driver is offline
        </div>
      )}
    </div>
  );
};

export default GoogleMap;
