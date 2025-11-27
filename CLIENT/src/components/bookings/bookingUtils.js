// Helper functions for booking status and labels

export const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    confirmed: 'success',
    active: 'info',
    completed: 'default',
    cancelled: 'error',
    expired: 'default',
  };
  return colors[status] || 'default';
};

export const getStatusLabel = (status) => {
  const labels = {
    pending: 'Ausstehend',
    confirmed: 'Bestätigt',
    active: 'Aktiv',
    completed: 'Abgeschlossen',
    cancelled: 'Storniert',
    expired: 'Abgelaufen',
  };
  return labels[status] || status;
};

export const getPaymentStatusColor = (paymentStatus) => {
  const colors = {
    pending: 'warning',
    paid: 'success',
    failed: 'error',
    refunded: 'default',
  };
  return colors[paymentStatus] || 'default';
};

export const getPaymentStatusLabel = (paymentStatus) => {
  const labels = {
    pending: 'Ausstehend',
    paid: 'Bezahlt',
    failed: 'Fehlgeschlagen',
    refunded: 'Erstattet',
  };
  return labels[paymentStatus] || paymentStatus;
};

export const getPaymentMethodLabel = (payment) => {
  if (!payment) return 'N/A';
  if (payment.paymentMethod === 'credit_card' || payment.paymentProvider === 'stripe') {
    return 'Kreditkarte (Stripe)';
  }
  if (payment.paymentMethod === 'paypal' || payment.paymentProvider === 'paypal') {
    return 'PayPal';
  }
  return payment.paymentMethod || 'N/A';
};

export const getGenderLabel = (genderPreference) => {
  if (genderPreference === 'male') return 'Männlich';
  if (genderPreference === 'female') return 'Weiblich';
  return 'Gemischt';
};

