import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { useSelector } from 'react-redux';
import useCrudCall from '../hook/useCrudCall';
import { Box, CircularProgress, Alert, Typography, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WcIcon from '@mui/icons-material/Wc';

// Leaflet's default icon fix for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const Dashboard = () => {
    const { getCrudData } = useCrudCall();
    const { toilet, loading, error } = useSelector((state) => state.crud);

    // Fetch toilet data when component mounts
    useEffect(() => {
        getCrudData('toilet');
    }, []);

    // Loading state
    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: 'calc(100vh - 64px)' 
            }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    // Error state
    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    Map data could not be loaded. Please try refreshing the page.
                </Alert>
            </Box>
        );
    }

    // No data state
    if (!toilet || toilet.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="info">
                    No toilet data available. Please make sure you are logged in and have access to the data.
                </Alert>
            </Box>
        );
    }

    // Calculate map center dynamically
    const mapCenter =
        toilet && toilet.length > 0
            ? [
                toilet[0].business?.location?.coordinates?.[1] || 50.7374, 
                toilet[0].business?.location?.coordinates?.[0] || 7.0982
              ]
            : [50.7374, 7.0982]; // Default to Bonn, Germany

    return (
        <Box sx={{ height: 'calc(100vh - 64px)', width: '100%', position: 'relative' }}>
            {/* Map Info Badge */}
            <Box sx={{ 
                position: 'absolute', 
                top: 16, 
                left: 16, 
                zIndex: 1000,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: 1,
                borderRadius: 2,
                boxShadow: 2
            }}>
                <Typography variant="caption" display="flex" alignItems="center">
                    <WcIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                    {toilet.length} Toilets Found
                </Typography>
            </Box>

            <MapContainer 
                center={mapCenter} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Map over toilet data */}
                {toilet.map(toiletItem => {
                    // Safety check for business and location data
                    if (!toiletItem.business?.location?.coordinates) {
                        console.warn('Toilet missing location data:', toiletItem._id);
                        return null;
                    }

                    // Backend sends [longitude, latitude], Leaflet needs [latitude, longitude]
                    const position = [
                        toiletItem.business.location.coordinates[1], // latitude
                        toiletItem.business.location.coordinates[0]  // longitude
                    ];

                    // Skip if coordinates are invalid
                    if (!position[0] || !position[1]) {
                        console.warn('Invalid coordinates for toilet:', toiletItem._id);
                        return null;
                    }

                    return (
                        <Marker key={toiletItem._id} position={position}>
                            <Popup maxWidth={250}>
                                <Box sx={{ minWidth: 200 }}>
                                    {/* Business Name */}
                                    <Typography variant="subtitle1" component="div" sx={{ 
                                        fontWeight: 'bold',
                                        mb: 1,
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <LocationOnIcon sx={{ mr: 0.5, fontSize: '1.2rem' }} />
                                        {toiletItem.business.businessName}
                                    </Typography>

                                    {/* Business Type */}
                                    <Chip 
                                        label={toiletItem.business.businessType} 
                                        size="small" 
                                        sx={{ mb: 1 }}
                                        color="primary"
                                        variant="outlined"
                                    />

                                    {/* Toilet Name */}
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Toilet:</strong> {toiletItem.name}
                                    </Typography>

                                    {/* Fee */}
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Fee:</strong> {
                                            toiletItem.fee > 0 
                                                ? `${toiletItem.fee.toFixed(2)}€` 
                                                : '🆓 Free'
                                        }
                                    </Typography>

                                    {/* Features */}
                                    {toiletItem.features && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                                <strong>Features:</strong>
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                <Chip 
                                                    label={toiletItem.features.gender || 'Unisex'} 
                                                    size="small" 
                                                    variant="filled"
                                                />
                                                {toiletItem.features.isAccessible && (
                                                    <Chip 
                                                        label="♿ Accessible" 
                                                        size="small" 
                                                        color="success"
                                                        variant="filled"
                                                    />
                                                )}
                                                {toiletItem.features.hasBabyChangingStation && (
                                                    <Chip 
                                                        label="👶 Baby Station" 
                                                        size="small" 
                                                        color="info"
                                                        variant="filled"
                                                    />
                                                )}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Status */}
                                    <Box sx={{ mt: 1 }}>
                                        <Chip 
                                            label={toiletItem.status === 'available' ? '✅ Available' : 
                                                   toiletItem.status === 'in_use' ? '🚪 In Use' : 
                                                   '⚠️ Out of Order'} 
                                            size="small"
                                            color={toiletItem.status === 'available' ? 'success' : 
                                                   toiletItem.status === 'in_use' ? 'warning' : 'error'}
                                        />
                                    </Box>

                                    {/* Address */}
                                    {toiletItem.business.address && (
                                        <Typography variant="caption" sx={{ 
                                            display: 'block', 
                                            mt: 1, 
                                            color: 'text.secondary',
                                            fontStyle: 'italic'
                                        }}>
                                            {toiletItem.business.address.street}, {toiletItem.business.address.city}
                                        </Typography>
                                    )}
                                </Box>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </Box>
    );
};

export default Dashboard;