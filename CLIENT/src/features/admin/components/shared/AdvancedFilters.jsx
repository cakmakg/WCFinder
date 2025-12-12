// features/admin/components/shared/AdvancedFilters.jsx
// Reusable advanced filter component

import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Chip,
  Stack,
  Typography,
  Collapse
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

/**
 * AdvancedFilters Component
 * Reusable multi-criteria filter with search
 */
const AdvancedFilters = ({
  searchPlaceholder = 'Suchen...',
  filters = [],
  onFilterChange,
  onSearchChange,
  onReset,
  showSearch = true,
  defaultExpanded = false,
  sx = {}
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [searchValue, setSearchValue] = useState('');
  const [filterValues, setFilterValues] = useState(
    filters.reduce((acc, filter) => {
      acc[filter.key] = filter.defaultValue || '';
      return acc;
    }, {})
  );

  // Handle search change
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchValue(value);

    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    const newFilterValues = {
      ...filterValues,
      [key]: value
    };
    setFilterValues(newFilterValues);

    if (onFilterChange) {
      onFilterChange(newFilterValues);
    }
  };

  // Handle reset
  const handleReset = () => {
    setSearchValue('');
    const resetValues = filters.reduce((acc, filter) => {
      acc[filter.key] = filter.defaultValue || '';
      return acc;
    }, {});
    setFilterValues(resetValues);

    if (onReset) {
      onReset();
    }

    if (onSearchChange) {
      onSearchChange('');
    }

    if (onFilterChange) {
      onFilterChange(resetValues);
    }
  };

  // Check if any filter is active
  const hasActiveFilters = () => {
    return (
      searchValue ||
      Object.values(filterValues).some(
        (value) => value !== '' && value !== null && value !== undefined
      )
    );
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = searchValue ? 1 : 0;
    count += Object.values(filterValues).filter(
      (value) => value !== '' && value !== null && value !== undefined
    ).length;
    return count;
  };

  const activeCount = getActiveFilterCount();

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', ...sx }}>
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p={2}
        sx={{
          bgcolor: 'grey.50',
          borderBottom: expanded ? '1px solid' : 'none',
          borderColor: 'divider'
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <FilterListIcon color="primary" fontSize="small" />
          <Typography variant="subtitle2" fontWeight={600}>
            Filter
          </Typography>
          {activeCount > 0 && (
            <Chip label={activeCount} size="small" color="primary" sx={{ height: 20 }} />
          )}
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          {hasActiveFilters() && (
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleReset}
              sx={{ fontSize: '0.75rem' }}
            >
              Zurücksetzen
            </Button>
          )}
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Filters Content */}
      <Collapse in={expanded}>
        <Box p={2}>
          <Stack spacing={2}>
            {/* Search Field */}
            {showSearch && (
              <TextField
                fullWidth
                size="small"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            )}

            {/* Filter Controls */}
            {filters.length > 0 && (
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {filters.map((filter) => (
                  <FormControl key={filter.key} size="small" sx={{ minWidth: 200, flex: 1 }}>
                    {filter.type === 'select' && (
                      <>
                        <InputLabel>{filter.label}</InputLabel>
                        <Select
                          value={filterValues[filter.key] || ''}
                          onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                          label={filter.label}
                        >
                          <MenuItem value="">
                            <em>Alle</em>
                          </MenuItem>
                          {filter.options?.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </>
                    )}

                    {filter.type === 'text' && (
                      <TextField
                        label={filter.label}
                        value={filterValues[filter.key] || ''}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        size="small"
                      />
                    )}

                    {filter.type === 'number' && (
                      <TextField
                        label={filter.label}
                        type="number"
                        value={filterValues[filter.key] || ''}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        size="small"
                        inputProps={{
                          min: filter.min,
                          max: filter.max,
                          step: filter.step || 1
                        }}
                      />
                    )}

                    {filter.type === 'date' && (
                      <TextField
                        label={filter.label}
                        type="date"
                        value={filterValues[filter.key] || ''}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        size="small"
                        InputLabelProps={{
                          shrink: true
                        }}
                      />
                    )}
                  </FormControl>
                ))}
              </Stack>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters() && (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  Aktive Filter:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {searchValue && (
                    <Chip
                      label={`Suche: ${searchValue}`}
                      size="small"
                      onDelete={() => handleSearchChange({ target: { value: '' } })}
                    />
                  )}
                  {Object.entries(filterValues).map(([key, value]) => {
                    if (!value) return null;
                    const filter = filters.find((f) => f.key === key);
                    if (!filter) return null;

                    let displayValue = value;
                    if (filter.type === 'select') {
                      const option = filter.options?.find((opt) => opt.value === value);
                      displayValue = option?.label || value;
                    }

                    return (
                      <Chip
                        key={key}
                        label={`${filter.label}: ${displayValue}`}
                        size="small"
                        onDelete={() => handleFilterChange(key, '')}
                      />
                    );
                  })}
                </Stack>
              </Box>
            )}
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AdvancedFilters;
