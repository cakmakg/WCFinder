// src/components/map/MapStatsPanel.jsx
import { Paper, Box, Typography, Chip } from '@mui/material';
import WcIcon from '@mui/icons-material/Wc';
import { Fade } from '@mui/material';

export const MapStatsPanel = ({ toilet, isMobile, theme }) => {
  return (
    <Fade in timeout={500}>
      <Paper sx={{ 
        position: 'absolute', 
        top: 16, 
        left: 16, 
        zIndex: 1000,
        p: 2,
        borderRadius: 2,
        boxShadow: theme.shadows[4],
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        minWidth: isMobile ? 200 : 250
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