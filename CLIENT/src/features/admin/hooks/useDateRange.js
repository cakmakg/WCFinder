// features/admin/hooks/useDateRange.js
// Custom hook for date range management

import { useState, useCallback, useMemo } from 'react';
import {
  getPresetRange,
  getComparisonPeriod,
  formatDateRange,
  getDateRangeLabel
} from '../utils/dateHelpers';

/**
 * Custom hook for managing date ranges
 * @param {string} defaultPreset - Default preset ('month', 'week', etc.)
 * @param {Object} options - Options { enableComparison: boolean }
 * @returns {Object} Date range state and handlers
 */
export const useDateRange = (defaultPreset = 'month', options = {}) => {
  const { enableComparison = false } = options;

  // Initialize with preset range
  const initialRange = getPresetRange(defaultPreset);

  const [preset, setPreset] = useState(defaultPreset);
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);
  const [compareMode, setCompareMode] = useState(false);

  // Comparison period
  const comparisonPeriod = useMemo(() => {
    if (!compareMode || !enableComparison) return null;
    return getComparisonPeriod(startDate, endDate);
  }, [compareMode, enableComparison, startDate, endDate]);

  // Formatted date range string
  const dateRangeLabel = useMemo(() => {
    return formatDateRange(startDate, endDate);
  }, [startDate, endDate]);

  // Preset label
  const presetLabel = useMemo(() => {
    return getDateRangeLabel(preset);
  }, [preset]);

  /**
   * Apply a preset range
   */
  const applyPreset = useCallback((presetType) => {
    const range = getPresetRange(presetType);
    setPreset(presetType);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  }, []);

  /**
   * Set custom date range
   */
  const setCustomRange = useCallback((start, end) => {
    setPreset('custom');
    setStartDate(start);
    setEndDate(end);
  }, []);

  /**
   * Reset to default preset
   */
  const reset = useCallback(() => {
    const range = getPresetRange(defaultPreset);
    setPreset(defaultPreset);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
    setCompareMode(false);
  }, [defaultPreset]);

  /**
   * Toggle comparison mode
   */
  const toggleCompareMode = useCallback(() => {
    if (enableComparison) {
      setCompareMode(prev => !prev);
    }
  }, [enableComparison]);

  /**
   * Check if date range is valid
   */
  const isValid = useMemo(() => {
    return startDate && endDate && startDate <= endDate;
  }, [startDate, endDate]);

  /**
   * Get date range for API calls
   */
  const getApiDateRange = useCallback(() => {
    return {
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString()
    };
  }, [startDate, endDate]);

  /**
   * Get comparison date range for API calls
   */
  const getApiComparisonRange = useCallback(() => {
    if (!comparisonPeriod) return null;
    return {
      compareStartDate: comparisonPeriod.startDate?.toISOString(),
      compareEndDate: comparisonPeriod.endDate?.toISOString()
    };
  }, [comparisonPeriod]);

  return {
    // State
    preset,
    startDate,
    endDate,
    compareMode,
    comparisonPeriod,
    dateRangeLabel,
    presetLabel,
    isValid,

    // Setters
    setPreset,
    setStartDate,
    setEndDate,
    setCompareMode,

    // Methods
    applyPreset,
    setCustomRange,
    reset,
    toggleCompareMode,
    getApiDateRange,
    getApiComparisonRange
  };
};

export default useDateRange;
