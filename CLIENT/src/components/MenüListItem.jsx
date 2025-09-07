import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import Rating from '@mui/material/Rating';
import Divider from '@mui/material/Divider';
import { useLocation, useNavigate } from 'react-router-dom';
import WcIcon from '@mui/icons-material/Wc';
import AccessibleIcon from '@mui/icons-material/Accessible';

// Örnek veri seti. Bu veriyi API'nizden çekmelisiniz.
const toiletLocations = [
    {
        id: 1,
        name: "Public Toilet A",
        location: "Köln, Almanya",
        price: "Free",
        rating: 4.5,
        gender: "Unisex",
        accessible: true,
    },
    {
        id: 2,
        name: "Cafe XYZ",
        location: "Berlin, Almanya",
        price: "$2",
        rating: 3.8,
        gender: "Male",
        accessible: false,
    },
    {
        id: 3,
        name: "Hotel ABC",
        location: "München, Almanya",
        price: "Free",
        rating: 5.0,
        gender: "Female",
        accessible: true,
    },
];

const MenüListItem = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Box
            sx={{
                width: '100%',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                Tuvalet Listesi
            </Typography>

            {toiletLocations.map((loc) => (
                <Card key={loc.id} sx={{ height: '100%', borderRadius: 2 }}>
                    <CardActionArea onClick={() => navigate(`/toilets/${loc.id}`)}>
                        <CardContent>
                            <Typography component="div" variant="body1" sx={{ fontWeight: 'bold' }}>
                                {loc.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {loc.location}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Fiyat: {loc.price}
                                </Typography>
                                <Divider orientation="vertical" flexItem />
                                <Rating name="read-only" value={loc.rating} precision={0.5} size="small" readOnly />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                                {loc.gender === 'Unisex' && <WcIcon fontSize="small" />}
                                {loc.gender === 'Male' && <WcIcon fontSize="small" color="primary" />}
                                {loc.gender === 'Female' && <WcIcon fontSize="small" color="secondary" />}
                                {loc.accessible && <AccessibleIcon fontSize="small" color="success" />}
                            </Box>
                        </CardContent>
                    </CardActionArea>
                </Card>
            ))}
        </Box>
    );
};

export default MenüListItem;