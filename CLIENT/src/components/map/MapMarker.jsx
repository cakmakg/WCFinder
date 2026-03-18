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

  // Compute values before any early returns (hooks must be called unconditionally)
  const coordinates = toiletItem.business?.location?.coordinates;
  const position = coordinates ? [coordinates[1], coordinates[0]] : null;
  const isSelected = selectedBusiness?._id === toiletItem.business?._id;

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

  if (!coordinates || !position || !position[0] || !position[1]) return null;

  let markerColor = theme.palette.primary.main;

  if (isSelected) {
    markerColor = '#ff0000';
  } else if (toiletItem.fee === 0) {
    markerColor = theme.palette.success.main;
  } else if (toiletItem.features?.isAccessible) {
    markerColor = theme.palette.info.main;
  }

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={createCustomIcon(markerColor)}
    >
      <MarkerPopup toiletItem={toiletItem} />
    </Marker>
  );
};