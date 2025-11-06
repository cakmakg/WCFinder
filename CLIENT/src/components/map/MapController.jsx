// src/components/map/MapController.jsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export const MapController = ({ selectedBusiness, searchedLocation }) => {
  const map = useMap();
  
  useEffect(() => {
    if (searchedLocation) {
      map.flyTo([searchedLocation.lat, searchedLocation.lng], 13, {
        duration: 1.5
      });
    } else if (selectedBusiness?.location?.coordinates) {
      const [lng, lat] = selectedBusiness.location.coordinates;
      map.flyTo([lat, lng], 16, {
        duration: 1.5
      });
    }
  }, [selectedBusiness, searchedLocation, map]);
  
  return null;
};