// // src/components/map/MapStatsPanel.jsx
// import { useTranslation } from 'react-i18next';
// import { Paper, Box, Typography, Chip } from '@mui/material';
// import WcIcon from '@mui/icons-material/Wc';
// import { Fade } from '@mui/material';

// export const MapStatsPanel = ({ toilet, isMobile, theme }) => {
//   const { t } = useTranslation();
  
//   return (
//     <Fade in timeout={500}>
//       <Paper sx={{ 
//         position: 'absolute', 
//         top: { xs: 8, sm: 16 }, 
//         left: { xs: 8, sm: 16 },
//         right: { xs: 8, sm: 'auto' }, // Mobile'da sağdan da padding
//         zIndex: 1000,
//         p: { xs: 1.5, sm: 2 },
//         borderRadius: 2,
//         boxShadow: theme.shadows[4],
//         backgroundColor: 'rgba(255, 255, 255, 0.95)',
//         backdropFilter: 'blur(10px)',
//         minWidth: { xs: 180, sm: 200, md: 250 },
//         maxWidth: { xs: 'calc(100% - 16px)', sm: 'none' } // Mobile'da taşmasın
//       }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//           <WcIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
//           <Typography variant="h6" sx={{ fontWeight: 600 }}>
//             {t('map.title', 'Toilet Map')}
//           </Typography>
//         </Box>
        
//         <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
//           <Chip 
//             label={`${toilet.length} ${t('map.toilets', 'Toilets')}`}
//             size="small"
//             color="primary"
//             variant="filled"
//           />
//           <Chip 
//             label={`${toilet.filter(t => t.fee === 0).length} ${t('map.free', 'Free')}`}
//             size="small"
//             color="success"
//             variant="outlined"
//           />
//           <Chip 
//             label={`${toilet.filter(t => t.features?.isAccessible).length} ${t('map.accessible', 'Accessible')}`}
//             size="small"
//             color="info"
//             variant="outlined"
//           />
//         </Box>
//       </Paper>
//     </Fade>
//   );
// };