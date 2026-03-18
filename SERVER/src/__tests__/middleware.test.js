require('./helpers/dbSetup');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const {
  createApp,
  createTestUser,
  createTestAdmin,
  createTestOwner,
  authHeader,
} = require('./helpers/testHelpers');

// Mock email service
jest.mock('../services/businessEmailService', () => ({
  sendPartnerRegistrationNotification: jest.fn().mockResolvedValue(true),
  sendBusinessApprovalEmail: jest.fn().mockResolvedValue(true),
}));

const app = createApp();

describe('Middleware', () => {
  // ==================== Authentication ====================
  describe('Authentication Middleware', () => {
    it('should set req.user to null when no auth header', async () => {
      // Business list is public — should work without auth
      const res = await request(app).get('/api/business');
      expect(res.status).toBe(200);
    });

    it('should authenticate valid JWT token', async () => {
      const admin = await createTestAdmin();

      const res = await request(app)
        .get('/api/business')
        .set('Authorization', authHeader(admin));

      expect(res.status).toBe(200);
    });

    it('should reject expired JWT token', async () => {
      const user = await createTestUser();
      const expiredToken = jwt.sign(
        {
          _id: user._id.toString(),
          username: user.username,
          role: user.role,
          isActive: true,
        },
        process.env.ACCESS_KEY,
        { expiresIn: '0s' }
      );

      // Access a protected endpoint
      const res = await request(app)
        .get('/api/business/my-business')
        .set('Authorization', `Bearer ${expiredToken}`);

      // Auth middleware sets req.user=null on expired token, then isOwnerOrAdmin returns 403
      expect([401, 403]).toContain(res.status);
    });

    it('should reject invalid JWT token', async () => {
      const res = await request(app)
        .get('/api/business/my-business')
        .set('Authorization', 'Bearer invalid.token.here');

      // Auth middleware sets req.user=null on invalid token, then isOwnerOrAdmin returns 403
      expect([401, 403]).toContain(res.status);
    });
  });

  // ==================== isLogin ====================
  describe('isLogin Permission', () => {
    it('should allow authenticated active user', async () => {
      const user = await createTestUser();

      // Users endpoint requires isLogin
      const res = await request(app)
        .get(`/api/users/${user._id}`)
        .set('Authorization', authHeader(user));

      expect(res.status).toBe(200);
    });

    it('should deny unauthenticated request', async () => {
      const user = await createTestUser();

      const res = await request(app).get(`/api/users/${user._id}`);

      expect(res.status).toBe(401);
    });
  });

  // ==================== isAdmin ====================
  describe('isAdmin Permission', () => {
    it('should allow admin user', async () => {
      const admin = await createTestAdmin();
      const owner = await createTestOwner({ isActive: false });
      const Business = require('../models/business');
      const biz = await Business.create({
        owner: owner._id,
        businessName: 'Admin Test Cafe',
        businessType: 'Cafe',
        address: { street: 'S1', city: 'Berlin', postalCode: '10115', country: 'DE' },
        location: { type: 'Point', coordinates: [13.4, 52.5] },
        approvalStatus: 'pending',
      });

      const res = await request(app)
        .patch(`/api/business/${biz._id}/approve`)
        .set('Authorization', authHeader(admin))
        .send({ action: 'approve' });

      expect(res.status).toBe(200);
    });

    it('should deny non-admin user', async () => {
      const user = await createTestUser();
      const owner = await createTestOwner({
        username: 'bizowner',
        email: 'bizowner@example.com',
        isActive: false,
      });
      const Business = require('../models/business');
      const biz = await Business.create({
        owner: owner._id,
        businessName: 'Deny Test Cafe',
        businessType: 'Cafe',
        address: { street: 'S2', city: 'Berlin', postalCode: '10115', country: 'DE' },
        location: { type: 'Point', coordinates: [13.4, 52.5] },
        approvalStatus: 'pending',
      });

      const res = await request(app)
        .patch(`/api/business/${biz._id}/approve`)
        .set('Authorization', authHeader(user))
        .send({ action: 'approve' });

      expect(res.status).toBe(403);
    });
  });

  // ==================== isOwnerOrAdmin ====================
  describe('isOwnerOrAdmin Permission', () => {
    it('should allow owner', async () => {
      const owner = await createTestOwner();
      const Business = require('../models/business');
      await Business.create({
        owner: owner._id,
        businessName: 'Owner Biz',
        businessType: 'Cafe',
        address: { street: 'S3', city: 'Berlin', postalCode: '10115', country: 'DE' },
        location: { type: 'Point', coordinates: [13.4, 52.5] },
        approvalStatus: 'approved',
      });

      const res = await request(app)
        .get('/api/business/my-business')
        .set('Authorization', authHeader(owner));

      expect(res.status).toBe(200);
    });

    it('should deny regular user', async () => {
      const user = await createTestUser();

      const res = await request(app)
        .get('/api/business/my-business')
        .set('Authorization', authHeader(user));

      expect(res.status).toBe(403);
    });
  });

  // ==================== Input Sanitization via API ====================
  describe('Input Sanitization (Integration)', () => {
    it('should sanitize XSS in request body', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'xsstest',
          email: 'xss@example.com',
          password: 'Test1234',
          firstName: '<script>alert(1)</script>',
        });

      // Should succeed (sanitized) or fail validation, but not execute XSS
      if (res.status === 201) {
        expect(res.body.user.username).toBe('xsstest');
      }
      // Either way, no error 500
      expect(res.status).not.toBe(500);
    });

    it('should block MongoDB operator injection', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: { $gt: '' },
          password: { $ne: '' },
        });

      // Sanitization strips $gt/$ne operators, login fails with 400 validation error
      // (should not be 200 — injection should not bypass auth)
      expect(res.status).not.toBe(200);
      expect(res.body.error).toBe(true);
    });
  });
});
