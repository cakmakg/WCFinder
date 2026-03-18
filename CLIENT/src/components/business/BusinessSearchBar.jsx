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
              <CircularProgress size={20} sx={{ color: '#0891b2' }} />
            ) : (
              <SearchIcon sx={{ fontSize: '1.2rem', color: '#94a3b8' }} />
            )}
          </InputAdornment>
        ),
        endAdornment: search && (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={onClear}
              sx={{
                color: '#94a3b8',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: 'rgba(8,145,178,0.08)',
                  color: '#0891b2',
                },
              }}
            >
              <ClearIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </InputAdornment>
        ),
        sx: {
          backgroundColor: 'white',
          borderRadius: '14px',
          fontSize: '0.9rem',
          fontWeight: 500,
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          transition: 'all 0.25s ease',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e2e8f0',
            borderWidth: '1.5px',
          },
          '&:hover': {
            boxShadow: '0 3px 10px rgba(0,0,0,0.09)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#cbd5e1',
            },
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(8,145,178,0.12), 0 2px 8px rgba(0,0,0,0.08)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0891b2',
              borderWidth: '2px',
            },
          },
        },
      }}
      sx={{
        mb: 2,
        '& .MuiInputBase-root': {
          height: '50px',
        },
      }}
    />
  );
};
