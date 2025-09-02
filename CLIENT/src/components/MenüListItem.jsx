import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import { useLocation, useNavigate } from 'react-router-dom';

const toiletLocations = [
    { id: 1, name: "Public Toilet A", lat: 40.712, lng: -74.005, price: "Free" },
    { id: 2, name: "Cafe XYZ", lat: 40.715, lng: -74.01, price: "$2" },
    { id: 3, name: "Hotel ABC", lat: 40.710, lng: -74.008, price: "Free" }
];

const MenüListItem = () => {
    // Burada `useLocation` ve `useNavigate` kullanmıyorsunuz.
    // İhtiyacınız yoksa kaldırabilirsiniz.
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Box
            sx={{
                width: '100%',
                p: 2,
                display: 'flex',
                flexDirection: 'column', // Kartları dikey olarak sıralar
                gap: 2, // Kartlar arasına boşluk bırakır
            }}
        >
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                Tuvalet Listesi
            </Typography>
            {toiletLocations.map((location) => (
                <Card key={location.id} sx={{ height: '100%' }}>
                    <CardActionArea>
                        <CardContent>
                            <Typography variant="body1" component="div" sx={{ fontWeight: 'bold' }}>
                                {location.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Fiyat: {location.price}
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>
            ))}
        </Box>
    );
};

export default MenüListItem;