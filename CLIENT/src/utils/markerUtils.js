// src/utils/markerUtils.js
import L from 'leaflet';

export const createCustomIcon = (color = '#2196f3') => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <div style="
          color: white;
          font-size: 14px;
          transform: rotate(45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        ">
          🚻
        </div>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42]
  });
};

export const getMapCenter = (toilet) => {
  const validToilets = toilet.filter(t => 
    t.business?.location?.coordinates?.[0] && 
    t.business?.location?.coordinates?.[1]
  );
  
  if (validToilets.length > 0) {
    return [
      validToilets[0].business.location.coordinates[1],
      validToilets[0].business.location.coordinates[0]
    ];
  }
  return [50.7374, 7.0982]; // Bonn default
};