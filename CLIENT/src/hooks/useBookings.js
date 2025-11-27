import { useState, useEffect } from 'react';
import usageService from '../services/usageService';
import paymentService from '../services/paymentService';

export const useBookings = (user, isOwner) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    if (!user || isOwner) {
      setLoading(false);
      return;
    }

    fetchBookings();
    fetchPaymentMethods();
  }, [user, isOwner]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await usageService.getMyUsages();
      setBookings(response.result || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Fehler beim Laden der Reservierungen.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await paymentService.getMyPayments();
      const methods = response.result || [];
      const uniqueMethods = Array.from(
        new Map(methods.map(p => [p.paymentMethod, p])).values()
      );
      setPaymentMethods(uniqueMethods);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
    }
  };

  return {
    bookings,
    loading,
    error,
    paymentMethods,
    refetchBookings: fetchBookings,
    setError,
  };
};

