require('./helpers/dbSetup');
const request = require('supertest');
const {
  createApp,
  createTestUser,
  createTestAdmin,
  createTestOwner,
  createTestBusiness,
  authHeader,
  passwordEncrypt,
} = require('./helpers/testHelpers');

// Mock email service (partner registration and approval send emails)
jest.mock('../services/businessEmailService', () => ({
  sendPartnerRegistrationNotification: jest.fn().mockResolvedValue(true),
  sendBusinessApprovalEmail: jest.fn().mockResolvedValue(true),
}));

// Mock fetch for Nominatim geocoding
global.fetch = jest.fn().mockResolvedValue({
  json: () => Promise.resolve([{ lat: '52.52', lon: '13.405' }]),
});

const app = createApp();

describe('Business Controller', () => {
  // ==================== PARTNER REGISTRATION ====================
  describe('POST /api/business/partner-registration', () => {
    it('should create owner + business with pending status', async () => {
      const res = await request(app)
        .post('/api/business/partner-registration')
        .send({
          owner: {
            username: 'newowner',
            email: 'newowner@example.com',
            password: 'Test1234',
            firstName: 'Max',
            lastName: 'Mustermann',
          },
          business: {
            businessName: 'Max Cafe',
            businessType: 'Cafe',
            address: {
              street: 'Berliner Str. 1',
              city: 'Berlin',
              postalCode: '10115',
              country: 'Deutschland',
            },
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.error).toBe(false);
      expect(res.body.result.owner).toBeDefined();
      expect(res.body.result.business).toBeDefined();
      expect(res.body.result.business.approvalStatus).toBe('pending');
    });

    it('should return 409 for duplicate email', async () => {
      await createTestUser({ email: 'dup@example.com', username: 'existuser' });

      const res = await request(app)
        .post('/api/business/partner-registration')
        .send({
          owner: {
            username: 'newowner2',
            email: 'dup@example.com',
            password: 'Test1234',
            firstName: 'Dup',
            lastName: 'User',
          },
          business: {
            businessName: 'Dup Cafe',
            businessType: 'Cafe',
            address: {
              street: 'Str. 2',
              city: 'Berlin',
              postalCode: '10115',
              country: 'Deutschland',
            },
          },
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe(true);
    });

    it('should return 400 for missing owner fields', async () => {
      const res = await request(app)
        .post('/api/business/partner-registration')
        .send({
          owner: {
            username: 'incomplete',
            email: 'incomplete@example.com',
            // missing password, firstName, lastName
          },
          business: {
            businessName: 'Incomplete Cafe',
            businessType: 'Cafe',
            address: {
              street: 'Str. 3',
              city: 'Berlin',
              postalCode: '10115',
              country: 'Deutschland',
            },
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
    });

    it('should return 400 for missing business fields', async () => {
      const res = await request(app)
        .post('/api/business/partner-registration')
        .send({
          owner: {
            username: 'noBiz',
            email: 'nobiz@example.com',
            password: 'Test1234',
            firstName: 'No',
            lastName: 'Biz',
          },
          business: {
            // missing businessName, businessType, address
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
    });

    it('should return 400 for weak password', async () => {
      const res = await request(app)
        .post('/api/business/partner-registration')
        .send({
          owner: {
            username: 'weakpw',
            email: 'weakpw@example.com',
            password: '123',
            firstName: 'Weak',
            lastName: 'Pw',
          },
          business: {
            businessName: 'Weak Cafe',
            businessType: 'Cafe',
            address: {
              street: 'Str. 4',
              city: 'Berlin',
              postalCode: '10115',
              country: 'Deutschland',
            },
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
    });
  });

  // ==================== APPROVE / REJECT ====================
  describe('PATCH /api/business/:id/approve', () => {
    let admin, owner, business;

    beforeEach(async () => {
      admin = await createTestAdmin();
      owner = await createTestOwner({ isActive: false });
      business = await createTestBusiness(owner._id, {
        approvalStatus: 'pending',
      });
    });

    it('should approve a business and activate owner', async () => {
      const res = await request(app)
        .patch(`/api/business/${business._id}/approve`)
        .set('Authorization', authHeader(admin))
        .send({ action: 'approve' });

      expect(res.status).toBe(200);
      expect(res.body.error).toBe(false);
      expect(res.body.result.approvalStatus).toBe('approved');
      expect(res.body.result.owner.isActive).toBe(true);
    });

    it('should reject a business', async () => {
      const res = await request(app)
        .patch(`/api/business/${business._id}/approve`)
        .set('Authorization', authHeader(admin))
        .send({ action: 'reject' });

      expect(res.status).toBe(200);
      expect(res.body.error).toBe(false);
      expect(res.body.result.approvalStatus).toBe('rejected');
      expect(res.body.result.owner.isActive).toBe(false);
    });

    it('should return 400 for invalid action', async () => {
      const res = await request(app)
        .patch(`/api/business/${business._id}/approve`)
        .set('Authorization', authHeader(admin))
        .send({ action: 'invalid' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
    });

    it('should deny non-admin users', async () => {
      const regularUser = await createTestUser({
        username: 'normaluser',
        email: 'normal@example.com',
      });

      const res = await request(app)
        .patch(`/api/business/${business._id}/approve`)
        .set('Authorization', authHeader(regularUser))
        .send({ action: 'approve' });

      expect(res.status).toBe(403);
    });

    it('should deny unauthenticated requests', async () => {
      const res = await request(app)
        .patch(`/api/business/${business._id}/approve`)
        .send({ action: 'approve' });

      // isAdmin returns 403 for both unauthenticated and non-admin users
      expect(res.status).toBe(403);
    });
  });

  // ==================== LIST BUSINESSES ====================
  describe('GET /api/business', () => {
    beforeEach(async () => {
      const owner1 = await createTestOwner();
      await createTestBusiness(owner1._id, {
        businessName: 'Approved Cafe',
        approvalStatus: 'approved',
      });
      await createTestBusiness(owner1._id, {
        businessName: 'Pending Cafe',
        approvalStatus: 'pending',
      });
    });

    it('should return only approved businesses for anonymous users', async () => {
      const res = await request(app).get('/api/business');

      expect(res.status).toBe(200);
      expect(res.body.error).toBe(false);
      expect(res.body.result).toHaveLength(1);
      expect(res.body.result[0].businessName).toBe('Approved Cafe');
    });

    it('should return all businesses for admin', async () => {
      const admin = await createTestAdmin();

      const res = await request(app)
        .get('/api/business')
        .set('Authorization', authHeader(admin));

      expect(res.status).toBe(200);
      expect(res.body.result.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ==================== MY BUSINESS ====================
  describe('GET /api/business/my-business', () => {
    it('should return owner business', async () => {
      const owner = await createTestOwner();
      await createTestBusiness(owner._id);

      const res = await request(app)
        .get('/api/business/my-business')
        .set('Authorization', authHeader(owner));

      expect(res.status).toBe(200);
      expect(res.body.error).toBe(false);
      expect(res.body.result).toBeDefined();
      expect(res.body.result.businessName).toBe('Test Cafe');
    });

    it('should deny regular users', async () => {
      const user = await createTestUser();

      const res = await request(app)
        .get('/api/business/my-business')
        .set('Authorization', authHeader(user));

      expect(res.status).toBe(403);
    });
  });

  // ==================== UPDATE MY BUSINESS ====================
  describe('PATCH /api/business/my-business', () => {
    it('should update allowed fields', async () => {
      const owner = await createTestOwner();
      await createTestBusiness(owner._id);

      const res = await request(app)
        .patch('/api/business/my-business')
        .set('Authorization', authHeader(owner))
        .send({ phone: '030-12345678' });

      expect(res.status).toBe(200);
      expect(res.body.result.phone).toBe('030-12345678');
    });

    it('should update bank account', async () => {
      const owner = await createTestOwner();
      await createTestBusiness(owner._id);

      const res = await request(app)
        .patch('/api/business/my-business')
        .set('Authorization', authHeader(owner))
        .send({
          bankAccount: {
            accountHolder: 'Max Mustermann',
            iban: 'DE89370400440532013000',
            bankName: 'Commerzbank',
            bic: 'COBADEFFXXX',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.result.bankAccount).toBeDefined();
      expect(res.body.result.bankAccount.iban).toBe('DE89370400440532013000');
    });

    it('should not allow approvalStatus change via update', async () => {
      const owner = await createTestOwner();
      await createTestBusiness(owner._id, { approvalStatus: 'pending' });

      const res = await request(app)
        .patch('/api/business/my-business')
        .set('Authorization', authHeader(owner))
        .send({ approvalStatus: 'approved' });

      expect(res.status).toBe(200);
      // approvalStatus should remain pending (not in allowed fields)
      expect(res.body.result.approvalStatus).toBe('pending');
    });
  });
});
