// src/components/GoogleMutantLayer.jsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.gridlayer.googlemutant';

const GoogleMutantLayer = ({ type = 'roadmap' }) => {
  const map = useMap();

  useEffect(() => {
    const googleMutant = L.gridLayer.googleMutant({
      type, // "roadmap", "satellite", "hybrid", or "terrain"
    });

    map.addLayer(googleMutant);

    return () => {
      map.removeLayer(googleMutant);
    };
  }, [map, type]);

  return null;
};

export default GoogleMutantLayer;
