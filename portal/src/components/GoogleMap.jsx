// src/components/GoogleMap.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100vh'
};

const defaultCenter = {
  lat: 28.832144542791458,
  lng: 78.77574510089143
};

const GoogleMapComponent = () => {
  const [busNumber, setBusNumber] = useState('');
  const [showLocation, setShowLocation] = useState(false);
  const [driverOnline, setDriverOnline] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  useEffect(() => {
    let intervalId;
    if (showLocation && busNumber) {
      const fetchBusLocation = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/bus-location/${busNumber}`);
          console.log('API response:', response.data);

          if (response.data && response.data.online) {
            const { latitude, longitude } = response.data;
            setBusLocation({ lat: latitude, lng: longitude });
            setDriverOnline(true);
          } else {
            setDriverOnline(false);
            setBusLocation(null);
          }
        } catch (error) {
          console.error('Error fetching bus location:', error);
          setDriverOnline(false);
          setBusLocation(null);
        }
      };

      // Fetch immediately and then every 4 seconds
      fetchBusLocation();
      intervalId = setInterval(fetchBusLocation, 4000);
    }
    return () => clearInterval(intervalId);
  }, [busNumber, showLocation]);

  const handleSearch = () => {
    setShowLocation(true);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={busNumber}
        onChange={(e) => setBusNumber(e.target.value)}
        placeholder="Enter bus number"
        style={{
          padding: '8px',
          margin: '10px',
          border: '1px solid black' 
        }}
      />
      <button
        onClick={handleSearch}
        style={{
          backgroundColor: '#0f94ec',
          padding: '8px',
          margin: '10px',
          color: 'white',
          borderRadius: '2px solid #0f94ec',
        }}
        // Disable the button if the input field is empty
        disabled={!busNumber}
      >
        Search
      </button>

      <LoadScript googleMapsApiKey="AIzaSyAEvg7bTpUoReA0m-mIf55pEwp4YlwAWgM">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={busLocation || defaultCenter}
          zoom={busLocation ? 18 : 14}
        >
          {busLocation && (
            <Marker 
              position={busLocation}
              onClick={() => setSelectedMarker(busLocation)}
            />
          )}

          {selectedMarker && (
            <InfoWindow
              position={selectedMarker}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div>
                <h3>Bus {busNumber} is here</h3>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

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
            color: 'red'
          }}
        >
          {busNumber} Driver is offline
        </div>
      )}
    </div>
  );
};

export default GoogleMapComponent;
