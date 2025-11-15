// components/layout/AppBar/LanguageSelector.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import CheckIcon from '@mui/icons-material/Check';

const languages = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentLang, setCurrentLang] = useState(i18n.language || 'de');
  const open = Boolean(anchorEl);

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = async (langCode) => {
    try {
      await i18n.changeLanguage(langCode);
      setCurrentLang(langCode); // State'i güncelle
      handleClose();
      
      // Arapça için RTL (Right-to-Left) desteği
      if (langCode === 'ar') {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
      } else {
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = langCode;
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };
  
  // i18n dil değişikliğini dinle
  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setCurrentLang(lng);
    };
    
    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: '#0891b2',
          '&:hover': {
            bgcolor: 'rgba(8,145,178,0.08)',
          },
        }}
        title={currentLanguage.name}
      >
        <LanguageIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 200,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: 2,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={currentLang === language.code}
            sx={{
              '&.Mui-selected': {
                bgcolor: 'rgba(8,145,178,0.08)',
                '&:hover': {
                  bgcolor: 'rgba(8,145,178,0.12)',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Typography sx={{ fontSize: '1.5rem' }}>
                {language.flag}
              </Typography>
            </ListItemIcon>
            <ListItemText
              primary={language.name}
              primaryTypographyProps={{
                sx: {
                  fontWeight: currentLang === language.code ? 600 : 400,
                  color: currentLang === language.code ? '#0891b2' : 'inherit',
                },
              }}
            />
            {currentLang === language.code && (
              <CheckIcon sx={{ color: '#0891b2', fontSize: '1.2rem' }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSelector;

