// src/components/map/MapMarker.jsx
import { useEffect, useRef } from 'react';
import { Marker } from 'react-leaflet';
import { MarkerPopup } from './MarkerPopup';
import { createCustomIcon } from '../../utils/markerUtils';

export const MapMarker = ({ 
  toiletItem, 
  selectedBusiness, 
  theme 
}) => {
  const markerRef = useRef(null);

  if (!toiletItem.business?.location?.coordinates) return null;

  const coordinates = toiletItem.business.location.coordinates;
  const position = [coordinates[1], coordinates[0]];

  if (!position[0] || !position[1]) return null;

  const isSelected = selectedBusiness?._id === toiletItem.business._id;
  let markerColor = theme.palette.primary.main;
  
  if (isSelected) {
    markerColor = '#ff0000';
  } else if (toiletItem.fee === 0) {
    markerColor = theme.palette.success.main;
  } else if (toiletItem.features?.isAccessible) {
    markerColor = theme.palette.info.main;
  }

  // selectedBusiness değiştiğinde popup'ı aç
  useEffect(() => {
    if (isSelected && markerRef.current) {
      // MapController zoom yaptıktan sonra popup'ı aç (1.5 saniye sonra)
      const timer = setTimeout(() => {
        if (markerRef.current) {
          markerRef.current.openPopup();
        }
      }, 1600); // MapController'daki flyTo duration (1.5s) + 100ms buffer
      
      return () => clearTimeout(timer);
    }
  }, [isSelected, selectedBusiness]);

  return (
    <Marker 
      ref={markerRef}
      position={position}
      icon={createCustomIcon(markerColor)}
    >
      <MarkerPopup toiletItem={toiletItem} theme={theme} />
    </Marker>
  );
};