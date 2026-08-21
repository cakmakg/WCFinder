import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { getCookieConsent, setCookieConsent } from '../../utils/cookieConsent';

// DSGVO-konformer Cookie-Banner: keine Vorauswahl, explizite Einwilligung, Widerruf möglich.
// Speichert die Entscheidung ('all' | 'necessary') in localStorage (siehe
// utils/cookieConsent). Aktuell sind keine nicht-notwendigen Cookies (z. B. Analytics)
// integriert – bei Einbindung solcher Dienste müssen diese erst NACH Einwilligung
// ('all') geladen werden.

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getCookieConsent()) setVisible(true);
  }, []);

  const decide = (choice) => {
    setCookieConsent(choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Box
      role="dialog"
      aria-live="polite"
      aria-label="Cookie-Hinweis"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1400,
        bgcolor: '#1e293b',
        color: 'white',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.2)',
        py: { xs: 2, md: 2.5 },
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          <Typography variant="body2" sx={{ color: '#cbd5e1', lineHeight: 1.6, flex: 1 }}>
            Wir verwenden technisch notwendige Cookies für den Betrieb der Website. Mit „Alle
            akzeptieren“ stimmen Sie auch optionalen Cookies zu. Weitere Informationen finden Sie in
            unserer{' '}
            <Typography
              component={RouterLink}
              to="/datenschutz"
              sx={{ color: '#0891b2', textDecoration: 'underline' }}
            >
              Datenschutzerklärung
            </Typography>
            .
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ flexShrink: 0 }}>
            <Button
              onClick={() => decide('necessary')}
              variant="outlined"
              sx={{
                borderColor: '#475569',
                color: 'white',
                textTransform: 'none',
                borderRadius: '12px',
                '&:hover': { borderColor: '#0891b2', bgcolor: 'rgba(8,145,178,0.1)' },
              }}
            >
              Nur notwendige
            </Button>
            <Button
              onClick={() => decide('all')}
              variant="contained"
              sx={{
                bgcolor: '#0891b2',
                textTransform: 'none',
                borderRadius: '12px',
                '&:hover': { bgcolor: '#0e7490' },
              }}
            >
              Alle akzeptieren
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default CookieConsent;
