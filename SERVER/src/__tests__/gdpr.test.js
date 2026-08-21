require('./helpers/dbSetup');
const request = require('supertest');
const mongoose = require('mongoose');
const {
  createApp,
  createTestUser,
  createTestOwner,
  createTestBusiness,
  authHeader,
} = require('./helpers/testHelpers');

const User = require('../models/user');
const Token = require('../models/token');
const Payment = require('../models/payment');
const Review = require('../models/review');

const app = createApp();

describe('GDPR / DSGVO', () => {
  // ==================== EXPORT (Art. 15) ====================
  describe('GET /api/users/me/export', () => {
    it('should require authentication', async () => {
      const res = await request(app).get('/api/users/me/export');
      expect(res.status).toBe(401);
    });

    it('should export the user own data without the password', async () => {
      const user = await createTestUser();

      const res = await request(app)
        .get('/api/users/me/export')
        .set('Authorization', authHeader(user));

      expect(res.status).toBe(200);
      expect(res.body.error).toBe(false);
      expect(res.body.konto.email).toBe('test@example.com');
      expect(res.body.konto.password).toBeUndefined();
      expect(Array.isArray(res.body.buchungen)).toBe(true);
      expect(Array.isArray(res.body.zahlungen)).toBe(true);
      expect(res.headers['content-disposition']).toContain('attachment');
    });
  });

  // ==================== ERASURE (Art. 17) ====================
  describe('DELETE /api/users/me', () => {
    it('should require authentication', async () => {
      const res = await request(app).delete('/api/users/me');
      expect(res.status).toBe(401);
    });

    it('should anonymize the account, delete tokens/reviews and retain payments with PII cleared', async () => {
      const user = await createTestUser();
      const owner = await createTestOwner();
      const business = await createTestBusiness(owner._id);

      await Token.create({ userId: user._id, token: `sometoken-${user._id}` });
      await Review.create({
        userId: user._id,
        toiletId: new mongoose.Types.ObjectId(),
        rating: { cleanliness: 5, accessibility: 4, overall: 5 },
        comment: 'Sehr sauber',
      });
      await Payment.create({
        userId: user._id,
        businessId: business._id,
        amount: 1.75,
        platformFee: 0.5,
        businessFee: 1.0,
        currency: 'EUR',
        status: 'succeeded',
        paymentMethod: 'credit_card',
        paymentProvider: 'stripe',
        ipAddress: '1.2.3.4',
        userAgent: 'jest',
      });

      const res = await request(app)
        .delete('/api/users/me')
        .set('Authorization', authHeader(user));

      expect(res.status).toBe(200);
      expect(res.body.error).toBe(false);
      expect(res.body.result.geloescht.tokens).toBe(1);
      expect(res.body.result.geloescht.bewertungen).toBe(1);
      expect(res.body.result.aufbewahrt.zahlungen).toBe(1);

      // Konto anonymisiert -> Login gesperrt, PII entfernt
      const dbUser = await User.findById(user._id);
      expect(dbUser.isDeleted).toBe(true);
      expect(dbUser.isActive).toBe(false);
      expect(dbUser.email).not.toBe('test@example.com');
      expect(dbUser.username).not.toBe('testuser');

      // Session-/Sicherheitsdaten + Bewertungen gelöscht
      expect(await Token.countDocuments({ userId: user._id })).toBe(0);
      expect(await Review.countDocuments({ userId: user._id })).toBe(0);

      // Zahlung aufbewahrt, aber personenbezogene Merkmale entfernt
      const dbPayment = await Payment.findOne({ userId: user._id });
      expect(dbPayment).not.toBeNull();
      expect(dbPayment.ipAddress).toBeUndefined();
      expect(dbPayment.userAgent).toBeUndefined();
    });

    it('should return 404 when the account is already erased', async () => {
      const user = await createTestUser();
      const auth = authHeader(user);

      await request(app).delete('/api/users/me').set('Authorization', auth);
      const res = await request(app).delete('/api/users/me').set('Authorization', auth);

      expect(res.status).toBe(404);
    });
  });
});
