// src/hooks/useBusinessSearch.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { searchLocation } from '../services/geocoding';

export const useBusinessSearch = (onLocationFound) => {
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);
  const onLocationFoundRef = useRef(onLocationFound);
  onLocationFoundRef.current = onLocationFound;

  const performSearch = useCallback(async (query) => {
    if (query.trim().length > 2) {
      setIsSearching(true);
      const location = await searchLocation(query);
      if (location && onLocationFoundRef.current) {
        onLocationFoundRef.current(location);
      }
      setIsSearching(false);
    } else {
      if (onLocationFoundRef.current) {
        onLocationFoundRef.current(null);
      }
    }
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => performSearch(search), 1000);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [search, performSearch]);

  const clearSearch = useCallback(() => {
    setSearch("");
    if (onLocationFoundRef.current) {
      onLocationFoundRef.current(null);
    }
  }, []);

  return { search, setSearch, isSearching, clearSearch };
};
