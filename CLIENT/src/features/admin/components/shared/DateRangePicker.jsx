// features/admin/components/shared/DateRangePicker.jsx
// Professional date range picker with presets

import React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormControlLabel,
  Switch,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { de } from 'date-fns/locale';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { useDateRange } from '../../hooks/useDateRange';
import { COLORS, RADII, SHADOWS } from '../../../../theme/designTokens';

const INPUT_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: RADII.input,
    backgroundColor: COLORS.backgroundLight,
    '& fieldset': { borderColor: COLORS.border },
    '&:hover fieldset': { borderColor: COLORS.primary },
    '&.Mui-focused fieldset': { borderColor: COLORS.primary }
  },
  '& .MuiInputLabel-root.Mui-focused': { color: COLORS.primary }
};

/**
 * DateRangePicker Component
 * Professional date range selector with presets and comparison mode
 */
const DateRangePicker = ({
  defaultPreset = 'month',
  enableComparison = true,
  onChange,
  sx = {}
}) => {
  const dateRange = useDateRange(defaultPreset, { enableComparison });

  // Handle date range change
  const handleDateRangeChange = (field, value) => {
    if (field === 'startDate') {
      dateRange.setStartDate(value);
    } else if (field === 'endDate') {
      dateRange.setEndDate(value);
    }

    // Notify parent component
    if (onChange) {
      const newRange = {
        startDate: field === 'startDate' ? value : dateRange.startDate,
        endDate: field === 'endDate' ? value : dateRange.endDate,
        preset: 'custom',
        compareMode: dateRange.compareMode,
        comparisonPeriod: dateRange.comparisonPeriod
      };
      onChange(newRange);
    }
  };

  // Handle preset selection
  const handlePresetChange = (preset) => {
    dateRange.applyPreset(preset);

    if (onChange) {
      const { startDate, endDate, compareMode, comparisonPeriod } = dateRange;
      onChange({
        startDate,
        endDate,
        preset,
        compareMode,
        comparisonPeriod
      });
    }
  };

  // Handle comparison toggle
  const handleCompareToggle = () => {
    dateRange.toggleCompareMode();

    if (onChange) {
      onChange({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        preset: dateRange.preset,
        compareMode: !dateRange.compareMode,
        comparisonPeriod: dateRange.comparisonPeriod
      });
    }
  };

  // Preset buttons configuration
  const presets = [
    { value: 'today', label: 'Heute' },
    { value: 'last7days', label: '7 Tage' },
    { value: 'last30days', label: '30 Tage' },
    { value: 'week', label: 'Diese Woche' },
    { value: 'month', label: 'Dieser Monat' },
    { value: 'lastMonth', label: 'Letzter Monat' }
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: COLORS.backgroundWhite,
          border: `1px solid ${COLORS.border}`,
          borderRadius: RADII.card,
          boxShadow: SHADOWS.subtle,
          ...sx
        }}
      >
        <Stack spacing={2}>
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarTodayIcon fontSize="small" sx={{ color: COLORS.primary }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.textHeading }}>
                Zeitraum wählen
              </Typography>
            </Box>

            {/* Comparison Mode Toggle */}
            {enableComparison && (
              <FormControlLabel
                control={
                  <Switch
                    checked={dateRange.compareMode}
                    onChange={handleCompareToggle}
                    size="small"
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CompareArrowsIcon fontSize="small" />
                    <Typography variant="caption">Vergleichen</Typography>
                  </Box>
                }
              />
            )}
          </Box>

          {/* Preset Buttons */}
          <ButtonGroup size="small" fullWidth>
            {presets.map((preset) => (
              <Button
                key={preset.value}
                variant={dateRange.preset === preset.value ? 'contained' : 'outlined'}
                onClick={() => handlePresetChange(preset.value)}
                sx={{
                  fontSize: '0.75rem',
                  py: 0.75,
                  textTransform: 'none',
                  fontWeight: 600,
                  ...(dateRange.preset === preset.value
                    ? {
                        bgcolor: COLORS.primary,
                        '&:hover': { bgcolor: COLORS.primaryDark }
                      }
                    : {
                        borderColor: COLORS.border,
                        color: COLORS.textSecondary,
                        '&:hover': {
                          borderColor: COLORS.primary,
                          color: COLORS.primary,
                          bgcolor: COLORS.accentBoxBg
                        }
                      })
                }}
              >
                {preset.label}
              </Button>
            ))}
          </ButtonGroup>

          {/* Date Pickers */}
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <DatePicker
                label="Von"
                value={dateRange.startDate}
                onChange={(value) => handleDateRangeChange('startDate', value)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: INPUT_SX
                  }
                }}
                maxDate={dateRange.endDate || undefined}
              />
            </FormControl>

            <FormControl fullWidth>
              <DatePicker
                label="Bis"
                value={dateRange.endDate}
                onChange={(value) => handleDateRangeChange('endDate', value)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: INPUT_SX
                  }
                }}
                minDate={dateRange.startDate || undefined}
              />
            </FormControl>
          </Stack>

          {/* Selected Range Display */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: COLORS.accentBoxBg,
              borderRadius: '8px',
              borderLeft: `3px solid ${COLORS.primary}`
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Gewählter Zeitraum:
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {dateRange.dateRangeLabel}
            </Typography>

            {/* Comparison Period Display */}
            {dateRange.compareMode && dateRange.comparisonPeriod && (
              <>
                <Typography variant="caption" color="text.secondary" display="block" mt={1} mb={0.5}>
                  Vergleichszeitraum:
                </Typography>
                <Typography variant="body2" fontWeight={500} sx={{ color: COLORS.primaryDark }}>
                  {new Date(dateRange.comparisonPeriod.startDate).toLocaleDateString('de-DE')} -{' '}
                  {new Date(dateRange.comparisonPeriod.endDate).toLocaleDateString('de-DE')}
                </Typography>
              </>
            )}
          </Box>

          {/* Validation Error */}
          {!dateRange.isValid && (
            <Typography variant="caption" color="error">
              Bitte wählen Sie einen gültigen Zeitraum
            </Typography>
          )}
        </Stack>
      </Paper>
    </LocalizationProvider>
  );
};

export default DateRangePicker;
