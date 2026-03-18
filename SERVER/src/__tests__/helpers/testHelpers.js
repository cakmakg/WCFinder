const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../models/user');
const Business = require('../../models/business');
const Toilet = require('../../models/toilet');
const passwordEncrypt = require('../../helper/passwordEncrypt');

/**
 * Create a minimal Express app for testing (no rate limiting, no env validation)
 */
function createApp() {
  const app = express();

  require('express-async-errors');

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Input validation & sanitization
  const { validateAndSanitize } = require('../../middleware/validation');
  app.use(validateAndSanitize);

  // Query handler (res.getModelList, res.getModelListDetails)
  const queryHandler = require('../../middleware/queryHandler');
  app.use(queryHandler);

  // Authentication middleware
  const authentication = require('../../middleware/authentication');
  app.use(authentication);

  // API routes
  const routes = require('../../routes');
  app.use('/api', routes);

  // Error handler
  const errorHandler = require('../../middleware/errorHnadler');
  app.use(errorHandler);

  return app;
}

/**
 * Create a test user in the database
 */
async function createTestUser(overrides = {}) {
  const defaults = {
    username: 'testuser',
    email: 'test@example.com',
    password: passwordEncrypt('Test1234'),
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    isActive: true,
  };
  return User.create({ ...defaults, ...overrides });
}

/**
 * Create a test admin user
 */
async function createTestAdmin(overrides = {}) {
  return createTestUser({
    username: 'admin',
    email: 'admin@wcfinder.com',
    role: 'admin',
    ...overrides,
  });
}

/**
 * Create a test owner user
 */
async function createTestOwner(overrides = {}) {
  return createTestUser({
    username: 'owner',
    email: 'owner@example.com',
    role: 'owner',
    ...overrides,
  });
}

/**
 * Create a test business
 */
async function createTestBusiness(ownerId, overrides = {}) {
  const defaults = {
    owner: ownerId,
    businessName: 'Test Cafe',
    businessType: 'Cafe',
    address: {
      street: 'Teststraße 1',
      city: 'Berlin',
      postalCode: '10115',
      country: 'Deutschland',
    },
    location: {
      type: 'Point',
      coordinates: [13.405, 52.52],
    },
    approvalStatus: 'approved',
  };
  return Business.create({ ...defaults, ...overrides });
}

/**
 * Create a test toilet
 */
async function createTestToilet(businessId, overrides = {}) {
  const defaults = {
    business: businessId,
    name: 'WC 1',
    fee: 1.0,
    status: 'available',
  };
  return Toilet.create({ ...defaults, ...overrides });
}

/**
 * Generate a JWT Bearer token for a user
 */
function getAuthToken(user) {
  const payload = {
    _id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
  return jwt.sign(payload, process.env.ACCESS_KEY, { expiresIn: '1h' });
}

/**
 * Get Authorization header value
 */
function authHeader(user) {
  return `Bearer ${getAuthToken(user)}`;
}

module.exports = {
  createApp,
  createTestUser,
  createTestAdmin,
  createTestOwner,
  createTestBusiness,
  createTestToilet,
  getAuthToken,
  authHeader,
  passwordEncrypt,
};
