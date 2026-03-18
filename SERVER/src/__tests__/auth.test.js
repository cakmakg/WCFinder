require('./helpers/dbSetup');
const request = require('supertest');
const {
  createApp,
  createTestUser,
  passwordEncrypt,
} = require('./helpers/testHelpers');

// Mock email sending
jest.mock('../helper/sendMail', () => jest.fn().mockResolvedValue(true));

const app = createApp();

describe('Auth Controller', () => {
  // ==================== REGISTER ====================
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'new@example.com',
          password: 'Test1234',
        });

      expect(res.status).toBe(201);
      expect(res.body.error).toBe(false);
      expect(res.body.bearer).toBeDefined();
      expect(res.body.bearer.accessToken).toBeDefined();
      expect(res.body.bearer.refreshToken).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.username).toBe('newuser');
      expect(res.body.user.role).toBe('user');
      expect(res.body.user.isActive).toBe(true);
    });

    it('should return 409 for duplicate email', async () => {
      await createTestUser({ email: 'dup@example.com', username: 'existinguser' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'anotheruser',
          email: 'dup@example.com',
          password: 'Test1234',
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe(true);
    });

    it('should return 409 for duplicate username', async () => {
      await createTestUser({ email: 'first@example.com', username: 'taken' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'taken',
          email: 'second@example.com',
          password: 'Test1234',
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe(true);
    });

    it('should return 400 for weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'weakpw',
          email: 'weak@example.com',
          password: '1234',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'nopass',
          email: 'nopass@example.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'bademail',
          email: 'not-an-email',
          password: 'Test1234',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
    });

    it('should block admin role registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'sneaky',
          email: 'sneaky@example.com',
          password: 'Test1234',
          role: 'admin',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
    });

    it('should allow owner role registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'owneruser',
          email: 'owneruser@example.com',
          password: 'Test1234',
          role: 'owner',
        });

      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe('owner');
    });
  });

  // ==================== LOGIN ====================
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await createTestUser({
        username: 'loginuser',
        email: 'login@example.com',
        password: passwordEncrypt('Test1234'),
      });
    });

    it('should login successfully with email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Test1234',
        });

      expect(res.status).toBe(200);
      expect(res.body.error).toBe(false);
      expect(res.body.bearer).toBeDefined();
      expect(res.body.bearer.accessToken).toBeDefined();
      expect(res.body.bearer.refreshToken).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.username).toBe('loginuser');
      expect(res.body.user.email).toBe('login@example.com');
    });

    it('should login successfully with username', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'loginuser',
          password: 'Test1234',
        });

      expect(res.status).toBe(200);
      expect(res.body.error).toBe(false);
      expect(res.body.bearer.accessToken).toBeDefined();
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPass1',
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe(true);
    });

    it('should return 401 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nobody@example.com',
          password: 'Test1234',
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe(true);
    });

    it('should return 400 for missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
    });

    it('should return 403 ACCOUNT_PENDING_APPROVAL for inactive account', async () => {
      await createTestUser({
        username: 'pendingowner',
        email: 'pending@example.com',
        password: passwordEncrypt('Test1234'),
        role: 'owner',
        isActive: false,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'pending@example.com',
          password: 'Test1234',
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe('ACCOUNT_PENDING_APPROVAL');
    });
  });

  // ==================== LOGOUT ====================
  describe('GET /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const res = await request(app).get('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.error).toBe(false);
    });

    it('should handle JWT bearer token logout', async () => {
      const user = await createTestUser({
        username: 'logoutuser',
        email: 'logout@example.com',
      });
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { _id: user._id, username: user.username, role: user.role, isActive: true },
        process.env.ACCESS_KEY,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .get('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.error).toBe(false);
    });
  });

  // ==================== FORGOT PASSWORD ====================
  describe('POST /api/auth/forgot-password', () => {
    it('should return 200 for existing email (security: same response)', async () => {
      await createTestUser({
        username: 'forgotuser',
        email: 'forgot@example.com',
      });

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'forgot@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.error).toBe(false);
    });

    it('should return 200 for non-existing email (timing attack protection)', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexist@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.error).toBe(false);
    });

    it('should return 400 for missing email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
    });
  });
});
