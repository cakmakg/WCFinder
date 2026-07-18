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
import { COLORS, RADII } from '../../theme/designTokens';

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
              <CircularProgress size={20} sx={{ color: COLORS.primary }} />
            ) : (
              <SearchIcon sx={{ fontSize: '1.2rem', color: COLORS.textLight }} />
            )}
          </InputAdornment>
        ),
        endAdornment: search && (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={onClear}
              sx={{
                color: COLORS.textLight,
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: 'rgba(8,145,178,0.08)',
                  color: COLORS.primary,
                },
              }}
            >
              <ClearIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </InputAdornment>
        ),
        sx: {
          backgroundColor: COLORS.backgroundLight,
          borderRadius: RADII.input,
          fontSize: '0.9rem',
          fontWeight: 500,
          transition: 'all 0.25s ease',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: COLORS.border,
          },
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: COLORS.primary,
            },
          },
          '&.Mui-focused': {
            backgroundColor: 'white',
            boxShadow: '0 0 0 3px rgba(8,145,178,0.12)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: COLORS.primary,
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
