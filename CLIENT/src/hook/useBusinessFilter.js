// src/hooks/useBusinessFilter.js
import { useMemo } from 'react';

const normalize = (str) => (str || "").toLowerCase("tr-TR").trim();

export const useBusinessFilter = (businesses, searchTerm) => {
  return useMemo(() => {
    if (!businesses) return [];
    
    return businesses.filter((business) => {
      const searchableValues = [
        business.businessName,
        business.businessType,
        business.address?.city,
        business.address?.street,
      ];
      
      return searchableValues.some((value) =>
        normalize(String(value)).includes(normalize(searchTerm))
      );
    });
  }, [businesses, searchTerm]);
};