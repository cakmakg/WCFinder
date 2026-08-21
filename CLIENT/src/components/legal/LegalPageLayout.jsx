import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Paper, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WcIcon from '@mui/icons-material/Wc';

// Gemeinsames Layout für rechtliche Seiten (Impressum, Datenschutz, AGB).
// Standalone/öffentlich – nutzt NICHT AppLayout, da diese Seiten ohne Login erreichbar sein müssen.
const LegalPageLayout = ({ title, lastUpdated, children }) => (
  <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
    {/* Gradient-Header mit Logo */}
    <Box
      sx={{
        background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
        color: 'white',
        py: { xs: 3, md: 4 },
      }}
    >
      <Container maxWidth="md">
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            color: 'white',
            textDecoration: 'none',
            mb: 2,
          }}
        >
          <WcIcon sx={{ fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
            WCFinder
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', md: '2rem' } }}>
          {title}
        </Typography>
        {lastUpdated && (
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mt: 0.5 }}>
            Stand: {lastUpdated}
          </Typography>
        )}
      </Container>
    </Box>

    {/* Inhalt */}
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Paper
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: '16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          '& h2': {
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#0f172a',
            mt: 4,
            mb: 1.5,
          },
          '& h2:first-of-type': { mt: 0 },
          '& h3': {
            fontSize: '1rem',
            fontWeight: 600,
            color: '#0f172a',
            mt: 3,
            mb: 1,
          },
          '& p': {
            fontSize: '0.95rem',
            color: '#334155',
            lineHeight: 1.7,
            mb: 1.5,
          },
          '& ul': { pl: 3, mb: 1.5, color: '#334155' },
          '& li': { fontSize: '0.95rem', lineHeight: 1.7, mb: 0.5 },
          '& a': { color: '#0891b2' },
        }}
      >
        {children}
      </Paper>

      <Button
        component={RouterLink}
        to="/"
        startIcon={<ArrowBackIcon />}
        sx={{
          mt: 3,
          color: '#0891b2',
          textTransform: 'none',
          '&:hover': { bgcolor: 'rgba(8,145,178,0.08)' },
        }}
      >
        Zurück zur Startseite
      </Button>
    </Container>
  </Box>
);

export default LegalPageLayout;
