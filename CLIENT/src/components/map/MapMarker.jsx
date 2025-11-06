// src/components/map/MapMarker.jsx
import { Marker } from 'react-leaflet';
import { MarkerPopup } from './MarkerPopup';
import { createCustomIcon } from '../../utils/markerUtils';

export const MapMarker = ({ 
  toiletItem, 
  selectedBusiness, 
  theme 
}) => {
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

  return (
    <Marker 
      position={position}
      icon={createCustomIcon(markerColor)}
    >
      <MarkerPopup toiletItem={toiletItem} theme={theme} />
    </Marker>
  );
};