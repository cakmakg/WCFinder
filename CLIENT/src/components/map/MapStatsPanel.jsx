// src/components/map/MapStatsPanel.jsx
import { useTranslation } from 'react-i18next';
import { Paper, Box, Typography, Chip } from '@mui/material';
import WcIcon from '@mui/icons-material/Wc';
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from 'framer-motion';
import { COLORS, RADII, SHADOWS } from '../../theme/designTokens';

export const MapStatsPanel = ({ toilet }) => {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 1000,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: RADII.panel,
          border: `1px solid ${COLORS.border}`,
          boxShadow: SHADOWS.subtle,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          minWidth: { xs: 180, sm: 200, md: 250 },
          maxWidth: { xs: 'calc(100vw - 32px)', sm: 'none' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '9px',
              background: COLORS.primaryGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <WcIcon sx={{ color: 'white', fontSize: '1rem' }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: COLORS.textHeading,
              letterSpacing: '-0.02em',
              fontSize: '1rem',
            }}
          >
            {t('map.title', 'Toiletten Karte')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`${toilet.length} ${t('map.toilets', 'Toiletten')}`}
            size="small"
            sx={{
              backgroundColor: COLORS.accentBoxBg,
              color: COLORS.primary,
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
          <Chip
            label={`${toilet.filter((item) => item.fee === 0).length} ${t('map.free', 'Kostenlos')}`}
            size="small"
            variant="outlined"
            sx={{
              borderColor: COLORS.success,
              color: COLORS.success,
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
          <Chip
            label={`${toilet.filter((item) => item.features?.isAccessible).length} ${t('map.accessible', 'Barrierefrei')}`}
            size="small"
            variant="outlined"
            sx={{
              borderColor: COLORS.primary,
              color: COLORS.primary,
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        </Box>
      </Paper>
    </motion.div>
  );
};
