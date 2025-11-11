// src/components/map/MapStatsPanel.jsx
import { Paper, Box, Typography, Chip } from '@mui/material';
import WcIcon from '@mui/icons-material/Wc';
import { Fade } from '@mui/material';

export const MapStatsPanel = ({ toilet, isMobile, theme }) => {
  return (
    <Fade in timeout={500}>
      <Paper sx={{ 
        position: 'absolute', 
        top: { xs: 8, sm: 16 }, 
        left: { xs: 8, sm: 16 },
        right: { xs: 8, sm: 'auto' }, // Mobile'da sağdan da padding
        zIndex: 1000,
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        boxShadow: theme.shadows[4],
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        minWidth: { xs: 180, sm: 200, md: 250 },
        maxWidth: { xs: 'calc(100% - 16px)', sm: 'none' } // Mobile'da taşmasın
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <WcIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Tuvalet Haritası
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={`${toilet.length} Tuvalet`}
            size="small"
            color="primary"
            variant="filled"
          />
          <Chip 
            label={`${toilet.filter(t => t.fee === 0).length} Ücretsiz`}
            size="small"
            color="success"
            variant="outlined"
          />
          <Chip 
            label={`${toilet.filter(t => t.features?.isAccessible).length} Erişilebilir`}
            size="small"
            color="info"
            variant="outlined"
          />
        </Box>
      </Paper>
    </Fade>
  );
};