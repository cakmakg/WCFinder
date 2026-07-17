import { Link } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';

const NotFoundPage = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#f5f5f5',
      p: 2,
    }}
  >
    <Paper
      sx={{
        p: 4,
        maxWidth: 480,
        textAlign: 'center',
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      <SearchOffIcon sx={{ fontSize: 48, color: '#0891b2', mb: 2 }} />
      <Typography variant="h4" sx={{ color: '#0f172a', fontWeight: 700, mb: 1 }}>
        404
      </Typography>
      <Typography variant="h6" sx={{ color: '#0f172a', mb: 1 }}>
        Seite nicht gefunden
      </Typography>
      <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
        Die angeforderte Seite existiert nicht oder wurde verschoben.
      </Typography>
      <Button
        component={Link}
        to="/"
        variant="contained"
        sx={{
          bgcolor: '#0891b2',
          borderRadius: '12px',
          '&:hover': { bgcolor: '#0e7490' },
        }}
      >
        Zur Startseite
      </Button>
    </Paper>
  </Box>
);

export default NotFoundPage;
