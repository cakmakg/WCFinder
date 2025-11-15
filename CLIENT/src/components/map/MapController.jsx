// src/components/map/MapController.jsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export const MapController = ({ selectedBusiness, searchedLocation, userLocation }) => {
  const map = useMap();
  
  useEffect(() => {
    // searchedLocation'a öncelik ver (kullanıcı arama yaptığında)
    if (searchedLocation) {
      map.flyTo([searchedLocation.lat, searchedLocation.lng], 13, {
        duration: 1.5
      });
    } else if (userLocation) {
      // Kullanıcı konumuna zoom yap
      map.flyTo([userLocation.lat, userLocation.lng], 15, {
        duration: 1.5
      });
    } else if (selectedBusiness?.location?.coordinates) {
      const [lng, lat] = selectedBusiness.location.coordinates;
      map.flyTo([lat, lng], 16, {
        duration: 1.5
      });
    }
  }, [selectedBusiness, searchedLocation, userLocation, map]);
  
  return null;
};