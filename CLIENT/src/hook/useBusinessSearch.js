// src/hooks/useBusinessSearch.js
import { useState, useEffect, useRef } from 'react';
import { searchLocation } from '../services/geocoding';

export const useBusinessSearch = (onLocationFound) => {
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (search.trim().length > 2) {
      searchTimeout.current = setTimeout(async () => {
        setIsSearching(true);
        const location = await searchLocation(search);
        
        if (location && onLocationFound) {
          onLocationFound(location);
        }
        setIsSearching(false);
      }, 1000);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [search, onLocationFound]);

  const clearSearch = () => {
    setSearch("");
    if (onLocationFound) {
      onLocationFound(null);
    }
  };

  return {
    search,
    setSearch,
    isSearching,
    clearSearch
  };
};