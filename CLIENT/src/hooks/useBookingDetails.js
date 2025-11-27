/**
 * useBookingDetails Hook
 * 
 * Manages booking details state and fetching logic
 * Follows Clean Code principles: Single Responsibility, DRY
 * 
 * @returns {object} - Booking details state and methods
 */
import { useState } from 'react';
import usageService from '../services/usageService';
import paymentService from '../services/paymentService';
import { sanitizePaymentId, isValidObjectId } from '../utils/validation';
import { handleError } from '../utils/errorHandler';
import logger from '../utils/logger';

export const useBookingDetails = () => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isQROnly, setIsQROnly] = useState(false);

  /**
   * Fetches full booking details including payment information
   * @param {object} booking - Booking object with _id
   * @throws {Error} - If booking ID is invalid or fetch fails
   */
  const fetchBookingDetails = async (booking) => {
    // Input validation
    if (!booking || !booking._id) {
      const error = new Error('Invalid booking data');
      logger.error('fetchBookingDetails: Invalid booking data', error, { booking });
      throw error;
    }

    if (!isValidObjectId(booking._id)) {
      const error = new Error('Invalid booking ID format');
      logger.error('fetchBookingDetails: Invalid booking ID', error, { bookingId: booking._id });
      throw error;
    }

    try {
      setLoadingDetails(true);
      setSelectedBooking(booking);
      setIsQROnly(false);
      
      logger.debug('Fetching booking details', { bookingId: booking._id });
      
      // Fetch full booking details
      const usageResponse = await usageService.getUsage(booking._id);
      const fullBooking = usageResponse.result || usageResponse.data || usageResponse;
      
      if (!fullBooking) {
        throw new Error('Booking not found');
      }
      
      // Fetch payment details if paymentId exists
      let paymentDetails = null;
      if (fullBooking.paymentId) {
        try {
          // Sanitize payment ID (handles both string and object)
          const paymentIdString = sanitizePaymentId(fullBooking.paymentId);
          
          if (paymentIdString) {
            logger.debug('Fetching payment details', { paymentId: paymentIdString });
            const paymentResponse = await paymentService.getPayment(paymentIdString);
            paymentDetails = paymentResponse.result || paymentResponse.data || paymentResponse;
          } else {
            logger.warn('Invalid payment ID format', { paymentId: fullBooking.paymentId });
          }
        } catch (err) {
          // Payment details are optional, log but don't fail
          logger.warn('Failed to fetch payment details', err, { 
            bookingId: booking._id,
            paymentId: fullBooking.paymentId 
          });
        }
      }
      
      setBookingDetails({
        ...fullBooking,
        payment: paymentDetails,
      });
      
      logger.info('Booking details fetched successfully', { bookingId: booking._id });
    } catch (err) {
      const errorData = handleError(err, 'fetchBookingDetails');
      logger.error('Failed to fetch booking details', err, { bookingId: booking._id });
      throw errorData;
    } finally {
      setLoadingDetails(false);
    }
  };

  /**
   * Clears selected booking and details
   */
  const clearSelection = () => {
    setSelectedBooking(null);
    setBookingDetails(null);
    setIsQROnly(false);
    logger.debug('Booking selection cleared');
  };

  /**
   * Sets booking for QR-only view (no details fetch)
   * @param {object} booking - Booking object
   */
  const viewQROnly = (booking) => {
    if (!booking) {
      logger.warn('viewQROnly: Invalid booking data', { booking });
      return;
    }
    
    setSelectedBooking(booking);
    setBookingDetails(null);
    setIsQROnly(true);
    logger.debug('QR-only view activated', { bookingId: booking._id });
  };

  return {
    selectedBooking,
    bookingDetails,
    loadingDetails,
    isQROnly,
    fetchBookingDetails,
    clearSelection,
    viewQROnly,
  };
};

