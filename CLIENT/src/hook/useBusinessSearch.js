// src/hooks/useBusinessSearch.js
import { useState, useEffect, useRef } from 'react';
import { searchLocation } from '../services/geocoding';

export const useBusinessSearch = (onLocationFound) => {
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);
  const onLocationFoundRef = useRef(onLocationFound);

  // onLocationFound callback'ini ref'te tut ki dependency array'de olmasın
  useEffect(() => {
    onLocationFoundRef.current = onLocationFound;
  }, [onLocationFound]);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (search.trim().length > 2) {
      searchTimeout.current = setTimeout(async () => {
        setIsSearching(true);
        const location = await searchLocation(search);
        
        if (location && onLocationFoundRef.current) {
          onLocationFoundRef.current(location);
        }
        setIsSearching(false);
      }, 1000);
    } else {
      // Arama temizlendiğinde location'ı da temizle
      if (onLocationFoundRef.current) {
        onLocationFoundRef.current(null);
      }
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [search]); // onLocationFound'ı dependency'den çıkardık

  const clearSearch = () => {
    setSearch("");
    if (onLocationFoundRef.current) {
      onLocationFoundRef.current(null);
    }
  };

  return {
    search,
    setSearch,
    isSearching,
    clearSearch
  };
};