// src/components/business/BusinessSearchBar.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TextField, 
  InputAdornment, 
  IconButton,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

export const BusinessSearchBar = ({ 
  search, 
  onSearchChange, 
  onClear, 
  isSearching,
  theme 
}) => {
  const { t } = useTranslation();
  return (
    <TextField
      fullWidth
      variant="outlined"
      placeholder={t('businessList.searchPlaceholder')}
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
      size="medium"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            {isSearching ? (
              <CircularProgress size={22} sx={{ color: '#0891b2' }} />
            ) : (
              <SearchIcon 
                sx={{ 
                  fontSize: '1.25rem', 
                  color: '#0891b2',
                  fontWeight: 600
                }} 
              />
            )}
          </InputAdornment>
        ),
        endAdornment: search && (
          <InputAdornment position="end">
            <IconButton 
              size="small" 
              onClick={onClear}
              title={t('common.search')}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(8, 145, 178, 0.1)',
                }
              }}
            >
              <ClearIcon sx={{ fontSize: '1.1rem', color: '#64748b' }} />
            </IconButton>
          </InputAdornment>
        ),
        sx: {
          backgroundColor: 'white',
          borderRadius: 3,
          fontSize: '0.95rem',
          fontWeight: 500,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e2e8f0',
            borderWidth: '1.5px',
          },
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0891b2',
            }
          },
          '&.Mui-focused': {
            boxShadow: '0 4px 16px rgba(8, 145, 178, 0.2)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0891b2',
              borderWidth: '2px',
            }
          }
        }
      }}
      sx={{ 
        mb: 2,
        '& .MuiInputBase-root': {
          height: '48px',
        }
      }}
    />
  );
};