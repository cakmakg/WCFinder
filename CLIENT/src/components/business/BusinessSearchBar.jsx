// src/components/business/BusinessSearchBar.jsx
import React from 'react';
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
  return (
    <TextField
      fullWidth
      variant="outlined"
      placeholder="Search by city or location..."
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
      size="small"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            {isSearching ? (
              <CircularProgress size={20} />
            ) : (
              <SearchIcon fontSize="small" color="action" />
            )}
          </InputAdornment>
        ),
        endAdornment: search && (
          <InputAdornment position="end">
            <IconButton 
              size="small" 
              onClick={onClear}
              title="Clear search"
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
        sx: {
          borderRadius: 2,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.grey[300],
          }
        }
      }}
      sx={{ mb: 2 }}
    />
  );
};