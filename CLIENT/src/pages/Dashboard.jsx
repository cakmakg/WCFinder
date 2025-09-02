import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Leaflet için CSS import'u


const Dashboard = () => {
    // Harita merkezini ve zoom seviyesini ayarlayın
    const center = [40.7128, -74.0060]; // Örnek olarak New York koordinatları
    const zoom = 13;

    // Örnek tuvalet lokasyon verileri
    const toiletLocations = [
        { id: 1, name: "Public Toilet A", lat: 40.712, lng: -74.005, price: "Free" },
        { id: 2, name: "Cafe XYZ", lat: 40.715, lng: -74.01, price: "$2" },
        { id: 3, name: "Hotel ABC", lat: 40.710, lng: -74.008, price: "Free" }
    ];

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
            {/* Harita Bileşeni */}
            <div style={{ flex: 2 }}>
                <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {/* Lokasyonları harita üzerinde işaretle */}
                    {toiletLocations.map(location => (
                        <Marker key={location.id} position={[location.lat, location.lng]}>
                            <Popup>
                                <strong>{location.name}</strong><br />
                                Fiyat: {location.price}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
                
            </div>

        </div>
    );
}

export default Dashboard;