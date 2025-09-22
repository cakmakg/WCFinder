import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { useSelector } from 'react-redux';
import useCrudCall from '../hook/useCrudCall';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';

// Leaflet's default icon can sometimes break with bundlers like Vite.
// This code fixes the issue by manually setting the icon paths.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


const Dashboard = () => {
    const { getCrudData } = useCrudCall();
    const { toilets, loading, error } = useSelector((state) => state.crud);

    // Fetch toilet data when the component first mounts.
    useEffect(() => {
        getCrudData('toilets');
    }, []);

    // Determine the map center dynamically. Use the first toilet's location,
    // or fall back to a default location (Bonn, Germany) if no data exists.
    const mapCenter =
        toilets && toilets.length > 0
            ? [toilets[0].business.location.coordinates[1], toilets[0].business.location.coordinates[0]] // Lat, Lng
            : [50.7374, 7.0982]; // Default to Bonn

    if (loading) {
        return <CircularProgress sx={{ display: 'block', margin: '2rem auto' }} />;
    }

    if (error) {
        return <Alert severity="error">Map data could not be loaded.</Alert>;
    }

    return (
        <Box sx={{ height: 'calc(100vh - 64px)', width: '100%' }}> {/* 64px is the typical AppBar height */}
            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Map over the live toilet data from the Redux store */}
                {toilets?.map(toilet => {
                    // Backend sends [longitude, latitude], Leaflet needs [latitude, longitude].
                    const position = [
                        toilet.business.location.coordinates[1],
                        toilet.business.location.coordinates[0]
                    ];

                    return (
                        <Marker key={toilet._id} position={position}>
                            <Popup>
                                <Typography variant="subtitle1" component="strong">
                                    {toilet.business.businessName}
                                </Typography>
                                <br />
                                <Typography variant="body2">
                                    {toilet.name}
                                </Typography>
                                <Typography variant="caption">
                                    Fee: {toilet.fee > 0 ? `${toilet.fee.toFixed(2)}€` : 'Free'}
                                </Typography>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </Box>
    );
}

export default Dashboard;