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

/**
 * Haversine formülü ile iki koordinat arasındaki mesafeyi hesaplar (km cinsinden)
 * @param {number} lat1 - İlk noktanın enlemi
 * @param {number} lon1 - İlk noktanın boylamı
 * @param {number} lat2 - İkinci noktanın enlemi
 * @param {number} lon2 - İkinci noktanın boylamı
 * @returns {number} Mesafe (kilometre cinsinden)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Dünya yarıçapı (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Kullanıcı konumuna en yakın tuvaleti bulur
 * @param {Array} toilets - Tuvalet listesi
 * @param {number} userLat - Kullanıcı enlemi
 * @param {number} userLon - Kullanıcı boylamı
 * @returns {Object|null} En yakın tuvalet ve mesafesi
 */
export const findNearestToilet = (toilets, userLat, userLon) => {
  if (!toilets || toilets.length === 0 || !userLat || !userLon) {
    return null;
  }

  let nearest = null;
  let minDistance = Infinity;

  toilets.forEach(toilet => {
    const coords = toilet.business?.location?.coordinates;
    if (!coords || !coords[0] || !coords[1]) return;

    const toiletLat = coords[1];
    const toiletLon = coords[0];
    const distance = calculateDistance(userLat, userLon, toiletLat, toiletLon);

    if (distance < minDistance) {
      minDistance = distance;
      nearest = { toilet, distance };
    }
  });

  return nearest;
};

/**
 * Kullanıcı konumu için özel icon oluşturur
 */
export const createUserLocationIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background-color: #0891b2;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.4);
        animation: pulse 2s infinite;
      ">
      </div>
      <style>
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(8, 145, 178, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(8, 145, 178, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(8, 145, 178, 0);
          }
        }
      </style>
    `,
    className: 'user-location-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};