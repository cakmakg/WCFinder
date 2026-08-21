require('./helpers/dbSetup');
const request = require('supertest');

// ---------------------------------------------------------------------------
// Gateway mock'lari
//
// Stripe ve PayPal istemcileri config katmaninda lazy olusturuluyor; testlerde
// o iki fabrika mock'lanarak hicbir ag cagrisi yapilmaz. PayPal SDK'nin kendisi
// (request nesneleri) gercek kalir, yalnizca client.execute mock'lanir.
// ---------------------------------------------------------------------------
const mockStripe = {
  paymentIntents: { create: jest.fn(), retrieve: jest.fn() },
  refunds: { create: jest.fn() },
  webhooks: { constructEvent: jest.fn() },
};
const mockPayPalClient = { execute: jest.fn() };
const mockSendMail = jest.fn();

jest.mock('../config/stripe', () => jest.fn(() => mockStripe));
jest.mock('../config/paypal', () => jest.fn(() => mockPayPalClient));
jest.mock('../helper/sendMail', () => mockSendMail);

const {
  createApp,
  createTestUser,
  createTestAdmin,
  createTestOwner,
  createTestBusiness,
  createTestToilet,
  authHeader,
} = require('./helpers/testHelpers');

const Payment = require('../models/payment');
const Usage = require('../models/usage');
const Business = require('../models/business');

const app = createApp();

// Booking sabitleri: 2 kisi x 0.75 EUR servis ucreti = 1.50 platform, 2.00 isletme
const TOTAL_AMOUNT = 3.5;
const PERSON_COUNT = 2;
const EXPECTED_PLATFORM_FEE = 1.5;
const EXPECTED_BUSINESS_FEE = 2.0;
// Usage.basePrice KISI BASI tutulur (Usage pre-save: basePrice*personCount + serviceFee)
const EXPECTED_BASE_PRICE_PER_PERSON = 1.0;
const START_TIME = '2026-09-01T10:00:00.000Z';

let user;
let otherUser;
let admin;
let owner;
let business;
let toilet;

function bookingPayload() {
  return {
    businessId: business._id.toString(),
    toiletId: toilet._id.toString(),
    personCount: PERSON_COUNT,
    startTime: START_TIME,
    genderPreference: 'unisex',
    totalAmount: TOTAL_AMOUNT,
  };
}

function stripeIntent(overrides = {}) {
  return {
    id: 'pi_test_123',
    client_secret: 'pi_test_123_secret_abc',
    status: 'requires_payment_method',
    amount: Math.round(TOTAL_AMOUNT * 100),
    currency: 'eur',
    metadata: {},
    ...overrides,
  };
}

/** Stripe odemesini "create" adimindan gecirip pending payment dondurur. */
async function createStripePayment() {
  mockStripe.paymentIntents.create.mockResolvedValue(stripeIntent());

  const res = await request(app)
    .post('/api/payments/stripe/create')
    .set('Authorization', authHeader(user))
    .send({ bookingData: bookingPayload() });

  expect(res.status).toBe(201);
  return Payment.findById(res.body.result.paymentId);
}

/** Ham govde ile webhook POST'u (Stripe imza dogrulamasi ham byte ister). */
function postWebhook(rawBody) {
  return request(app)
    .post('/api/payments/webhook/stripe')
    .set('Content-Type', 'application/json')
    .set('stripe-signature', 't=1700000000,v1=dummysignature')
    .send(rawBody);
}

function succeededEvent(paymentIntentId) {
  return {
    id: 'evt_test_1',
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: paymentIntentId,
        amount: Math.round(TOTAL_AMOUNT * 100),
        currency: 'eur',
        metadata: {},
      },
    },
  };
}

beforeEach(async () => {
  jest.clearAllMocks();
  mockSendMail.mockResolvedValue(true);

  user = await createTestUser();
  otherUser = await createTestUser({
    username: 'otheruser',
    email: 'other@example.com',
  });
  admin = await createTestAdmin();
  owner = await createTestOwner();
  business = await createTestBusiness(owner._id);
  toilet = await createTestToilet(business._id);
});

describe('Payments E2E (Stripe/PayPal mock)', () => {
  // ==================== STRIPE: CREATE ====================
  describe('POST /api/payments/stripe/create', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/payments/stripe/create')
        .send({ bookingData: bookingPayload() });

      expect(res.status).toBe(401);
      expect(mockStripe.paymentIntents.create).not.toHaveBeenCalled();
    });

    it('should reject a request without usageId or bookingData', async () => {
      const res = await request(app)
        .post('/api/payments/stripe/create')
        .set('Authorization', authHeader(user))
        .send({});

      expect(res.status).toBe(400);
    });

    it('should create a pending payment with the correct fee split', async () => {
      mockStripe.paymentIntents.create.mockResolvedValue(stripeIntent());

      const res = await request(app)
        .post('/api/payments/stripe/create')
        .set('Authorization', authHeader(user))
        .send({ bookingData: bookingPayload() });

      expect(res.status).toBe(201);
      expect(res.body.result.clientSecret).toBe('pi_test_123_secret_abc');

      // Stripe'a cent cinsinden ve EUR olarak gitmeli
      const intentArgs = mockStripe.paymentIntents.create.mock.calls[0][0];
      expect(intentArgs.amount).toBe(350);
      expect(intentArgs.currency).toBe('eur');

      const payment = await Payment.findById(res.body.result.paymentId);
      expect(payment.status).toBe('pending');
      expect(payment.paymentProvider).toBe('stripe');
      expect(payment.amount).toBe(TOTAL_AMOUNT);
      expect(payment.platformFee).toBe(EXPECTED_PLATFORM_FEE);
      expect(payment.businessFee).toBe(EXPECTED_BUSINESS_FEE);
      expect(payment.paymentIntentId).toBe('pi_test_123');

      // Odeme onaylanmadan usage olusmamali
      expect(await Usage.countDocuments({})).toBe(0);
    });

    it('should reject an amount below the minimum without calling Stripe', async () => {
      const res = await request(app)
        .post('/api/payments/stripe/create')
        .set('Authorization', authHeader(user))
        .send({ bookingData: { ...bookingPayload(), totalAmount: 0.2 } });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(mockStripe.paymentIntents.create).not.toHaveBeenCalled();
      expect(await Payment.countDocuments({})).toBe(0);
    });
  });

  // ==================== STRIPE: CONFIRM ====================
  describe('POST /api/payments/stripe/confirm', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/payments/stripe/confirm')
        .send({ paymentIntentId: 'pi_test_123' });

      expect(res.status).toBe(401);
    });

    it('should mark the payment succeeded, create the usage and credit the business', async () => {
      const payment = await createStripePayment();

      const res = await request(app)
        .post('/api/payments/stripe/confirm')
        .set('Authorization', authHeader(user))
        .send({ paymentIntentId: payment.paymentIntentId });

      expect(res.status).toBe(200);

      const updated = await Payment.findById(payment._id);
      expect(updated.status).toBe('succeeded');
      expect(updated.transactionId).toBe('pi_test_123');
      expect(updated.usageId).toBeTruthy();

      const usage = await Usage.findById(updated.usageId);
      expect(usage.userId.toString()).toBe(user._id.toString());
      expect(usage.businessId.toString()).toBe(business._id.toString());
      expect(usage.toiletId.toString()).toBe(toilet._id.toString());
      expect(usage.personCount).toBe(PERSON_COUNT);
      expect(usage.serviceFee).toBe(EXPECTED_PLATFORM_FEE);
      expect(usage.basePrice).toBe(EXPECTED_BASE_PRICE_PER_PERSON);
      expect(usage.totalFee).toBe(TOTAL_AMOUNT);
      expect(usage.paymentStatus).toBe('paid');
      expect(usage.accessCode).toBeTruthy();

      const updatedBusiness = await Business.findById(business._id);
      expect(updatedBusiness.pendingBalance).toBe(EXPECTED_BUSINESS_FEE);
      expect(updatedBusiness.totalEarnings).toBe(EXPECTED_BUSINESS_FEE);
    });

    it('should send the confirmation email to the booking user', async () => {
      const payment = await createStripePayment();

      await request(app)
        .post('/api/payments/stripe/confirm')
        .set('Authorization', authHeader(user))
        .send({ paymentIntentId: payment.paymentIntentId });

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      const [to, subject, body] = mockSendMail.mock.calls[0];
      expect(to).toBe(user.email);
      expect(subject).toContain('Zahlung');
      expect(body).toContain('Zugangscode');
    });

    it('should not let another user confirm a foreign payment', async () => {
      const payment = await createStripePayment();

      const res = await request(app)
        .post('/api/payments/stripe/confirm')
        .set('Authorization', authHeader(otherUser))
        .send({ paymentIntentId: payment.paymentIntentId });

      expect(res.status).toBeGreaterThanOrEqual(400);

      const unchanged = await Payment.findById(payment._id);
      expect(unchanged.status).toBe('pending');
      expect(await Usage.countDocuments({})).toBe(0);
    });

    it('should be idempotent when confirm is called twice', async () => {
      const payment = await createStripePayment();

      await request(app)
        .post('/api/payments/stripe/confirm')
        .set('Authorization', authHeader(user))
        .send({ paymentIntentId: payment.paymentIntentId });

      const second = await request(app)
        .post('/api/payments/stripe/confirm')
        .set('Authorization', authHeader(user))
        .send({ paymentIntentId: payment.paymentIntentId });

      expect(second.status).toBe(200);
      expect(await Usage.countDocuments({})).toBe(1);

      const updatedBusiness = await Business.findById(business._id);
      expect(updatedBusiness.pendingBalance).toBe(EXPECTED_BUSINESS_FEE);
      expect(updatedBusiness.totalEarnings).toBe(EXPECTED_BUSINESS_FEE);
    });
  });

  // ==================== STRIPE: WEBHOOK ====================
  describe('POST /api/payments/webhook/stripe', () => {
    it('should hand the unparsed raw body to the signature verification', async () => {
      // Regression: express.json() govdeyi parse ederse constructEvent'e Buffer
      // yerine nesne gider ve imza dogrulamasi her zaman basarisiz olur.
      const payment = await createStripePayment();
      const raw = JSON.stringify(succeededEvent(payment.paymentIntentId));
      mockStripe.webhooks.constructEvent.mockReturnValue(
        succeededEvent(payment.paymentIntentId)
      );

      await postWebhook(raw);

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledTimes(1);
      const [payload, signature] =
        mockStripe.webhooks.constructEvent.mock.calls[0];
      expect(Buffer.isBuffer(payload)).toBe(true);
      expect(payload.toString('utf8')).toBe(raw);
      expect(signature).toBe('t=1700000000,v1=dummysignature');
    });

    it('should return 400 when the signature is invalid', async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('No signatures found matching the expected signature');
      });

      const res = await postWebhook(
        JSON.stringify(succeededEvent('pi_test_123'))
      );

      expect(res.status).toBe(400);
      expect(res.text).toContain('Webhook Error');
    });

    it('should complete the payment and create the usage on payment_intent.succeeded', async () => {
      const payment = await createStripePayment();
      const event = succeededEvent(payment.paymentIntentId);
      mockStripe.webhooks.constructEvent.mockReturnValue(event);

      const res = await postWebhook(JSON.stringify(event));

      expect(res.status).toBe(200);
      expect(res.body.received).toBe(true);

      const updated = await Payment.findById(payment._id);
      expect(updated.status).toBe('succeeded');
      expect(updated.usageId).toBeTruthy();

      const updatedBusiness = await Business.findById(business._id);
      expect(updatedBusiness.pendingBalance).toBe(EXPECTED_BUSINESS_FEE);
    });

    it('should stay idempotent when Stripe redelivers the same event', async () => {
      const payment = await createStripePayment();
      const event = succeededEvent(payment.paymentIntentId);
      mockStripe.webhooks.constructEvent.mockReturnValue(event);
      const raw = JSON.stringify(event);

      await postWebhook(raw);
      await postWebhook(raw);

      expect(await Usage.countDocuments({})).toBe(1);

      const updatedBusiness = await Business.findById(business._id);
      expect(updatedBusiness.pendingBalance).toBe(EXPECTED_BUSINESS_FEE);
      expect(updatedBusiness.totalEarnings).toBe(EXPECTED_BUSINESS_FEE);
    });

    it('should not credit the business twice when confirm and webhook both run', async () => {
      // Gercek akis: frontend /stripe/confirm cagirir, Stripe ayrica webhook gonderir.
      const payment = await createStripePayment();
      const event = succeededEvent(payment.paymentIntentId);
      mockStripe.webhooks.constructEvent.mockReturnValue(event);

      await request(app)
        .post('/api/payments/stripe/confirm')
        .set('Authorization', authHeader(user))
        .send({ paymentIntentId: payment.paymentIntentId });

      await postWebhook(JSON.stringify(event));

      expect(await Usage.countDocuments({})).toBe(1);

      const updatedBusiness = await Business.findById(business._id);
      expect(updatedBusiness.pendingBalance).toBe(EXPECTED_BUSINESS_FEE);
      expect(updatedBusiness.totalEarnings).toBe(EXPECTED_BUSINESS_FEE);
    });

    it('should mark the payment failed on payment_intent.payment_failed', async () => {
      const payment = await createStripePayment();
      const event = {
        id: 'evt_test_2',
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: payment.paymentIntentId,
            last_payment_error: { message: 'Your card was declined.' },
          },
        },
      };
      mockStripe.webhooks.constructEvent.mockReturnValue(event);

      const res = await postWebhook(JSON.stringify(event));

      expect(res.status).toBe(200);

      const updated = await Payment.findById(payment._id);
      expect(updated.status).toBe('failed');
      expect(updated.errorMessage).toBe('Your card was declined.');
      expect(await Usage.countDocuments({})).toBe(0);

      const updatedBusiness = await Business.findById(business._id);
      expect(updatedBusiness.pendingBalance).toBe(0);
    });
  });

  // ==================== PAYPAL ====================
  describe('PayPal flow', () => {
    const ORDER_ID = 'PAYPAL_ORDER_1';

    function paypalOrderResponse() {
      return {
        result: {
          id: ORDER_ID,
          status: 'CREATED',
          links: [
            {
              rel: 'approve',
              href:
                'https://www.sandbox.paypal.com/checkoutnow?token=' + ORDER_ID,
            },
          ],
        },
      };
    }

    function paypalCaptureResponse() {
      return {
        result: {
          id: ORDER_ID,
          status: 'COMPLETED',
          purchase_units: [
            {
              payments: {
                captures: [{ id: 'CAPTURE_1', status: 'COMPLETED' }],
              },
            },
          ],
        },
      };
    }

    /** create ve capture isteklerini SDK request path'ine gore ayirir. */
    function mockPayPalRoundtrip() {
      mockPayPalClient.execute.mockImplementation(async (req) => {
        if (req.path && req.path.includes('/capture')) {
          return paypalCaptureResponse();
        }
        return paypalOrderResponse();
      });
    }

    async function createPayPalPayment() {
      mockPayPalRoundtrip();
      const res = await request(app)
        .post('/api/payments/paypal/create')
        .set('Authorization', authHeader(user))
        .send({ bookingData: bookingPayload() });

      expect(res.status).toBe(201);
      return Payment.findById(res.body.result.paymentId);
    }

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/payments/paypal/create')
        .send({ bookingData: bookingPayload() });

      expect(res.status).toBe(401);
      expect(mockPayPalClient.execute).not.toHaveBeenCalled();
    });

    it('should create a pending PayPal payment and return the approve url', async () => {
      mockPayPalRoundtrip();

      const res = await request(app)
        .post('/api/payments/paypal/create')
        .set('Authorization', authHeader(user))
        .send({ bookingData: bookingPayload() });

      expect(res.status).toBe(201);
      expect(res.body.result.orderId).toBe(ORDER_ID);
      expect(res.body.result.approveUrl).toContain('paypal.com');

      const payment = await Payment.findById(res.body.result.paymentId);
      expect(payment.status).toBe('pending');
      expect(payment.paymentProvider).toBe('paypal');
      expect(payment.paypalOrderId).toBe(ORDER_ID);
      expect(payment.platformFee).toBe(EXPECTED_PLATFORM_FEE);
      expect(payment.businessFee).toBe(EXPECTED_BUSINESS_FEE);
      expect(await Usage.countDocuments({})).toBe(0);
    });

    it('should complete the payment and create the usage on capture', async () => {
      const payment = await createPayPalPayment();

      const res = await request(app)
        .post('/api/payments/paypal/capture')
        .set('Authorization', authHeader(user))
        .send({ orderId: payment.paypalOrderId });

      expect(res.status).toBe(200);

      const updated = await Payment.findById(payment._id);
      expect(updated.status).toBe('succeeded');
      expect(updated.transactionId).toBe('CAPTURE_1');
      expect(updated.usageId).toBeTruthy();

      const usage = await Usage.findById(updated.usageId);
      expect(usage.personCount).toBe(PERSON_COUNT);
      expect(usage.serviceFee).toBe(EXPECTED_PLATFORM_FEE);
      expect(usage.paymentStatus).toBe('paid');

      const updatedBusiness = await Business.findById(business._id);
      expect(updatedBusiness.pendingBalance).toBe(EXPECTED_BUSINESS_FEE);
    });

    it('should stay idempotent when capture is called twice', async () => {
      const payment = await createPayPalPayment();

      await request(app)
        .post('/api/payments/paypal/capture')
        .set('Authorization', authHeader(user))
        .send({ orderId: payment.paypalOrderId });

      const second = await request(app)
        .post('/api/payments/paypal/capture')
        .set('Authorization', authHeader(user))
        .send({ orderId: payment.paypalOrderId });

      expect(second.status).toBe(200);
      expect(await Usage.countDocuments({})).toBe(1);

      const updatedBusiness = await Business.findById(business._id);
      expect(updatedBusiness.pendingBalance).toBe(EXPECTED_BUSINESS_FEE);
      expect(updatedBusiness.totalEarnings).toBe(EXPECTED_BUSINESS_FEE);
    });
  });

  // ==================== PAYPAL REDIRECT BRIDGE ====================
  describe('GET /api/payments/paypal/redirect', () => {
    it('should redirect to the app deep link and pass the token through', async () => {
      const res = await request(app)
        .get('/api/payments/paypal/redirect')
        .query({ to: 'wcfinder://payment/success', token: 'ORDER_TOKEN' });

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('wcfinder://payment');
      expect(res.headers.location).toContain('token=ORDER_TOKEN');
    });

    it('should reject an external http target (open redirect)', async () => {
      const res = await request(app)
        .get('/api/payments/paypal/redirect')
        .query({ to: 'https://evil.example.com' });

      expect(res.status).toBe(400);
    });
  });

  // ==================== REFUND ====================
  describe('POST /api/payments/:id/refund', () => {
    async function succeededPayment() {
      const payment = await createStripePayment();
      await request(app)
        .post('/api/payments/stripe/confirm')
        .set('Authorization', authHeader(user))
        .send({ paymentIntentId: payment.paymentIntentId });
      return Payment.findById(payment._id);
    }

    it('should reject a non-admin caller', async () => {
      const payment = await succeededPayment();

      const res = await request(app)
        .post('/api/payments/' + payment._id + '/refund')
        .set('Authorization', authHeader(user))
        .send({ reason: 'Test' });

      expect(res.status).toBe(403);
      expect(mockStripe.refunds.create).not.toHaveBeenCalled();
    });

    it('should refund a succeeded Stripe payment for an admin', async () => {
      const payment = await succeededPayment();
      mockStripe.refunds.create.mockResolvedValue({
        id: 're_test_1',
        status: 'succeeded',
      });

      const res = await request(app)
        .post('/api/payments/' + payment._id + '/refund')
        .set('Authorization', authHeader(admin))
        .send({ reason: 'Kunde hat storniert' });

      expect(res.status).toBe(200);
      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: payment.paymentIntentId,
      });

      const refunded = await Payment.findById(payment._id);
      expect(refunded.status).toBe('refunded');
      expect(refunded.refund.refundId).toBe('re_test_1');
      expect(refunded.refund.refundAmount).toBe(TOTAL_AMOUNT);
      expect(refunded.refund.refundReason).toBe('Kunde hat storniert');
    });

    it('should not refund a payment that never succeeded', async () => {
      const payment = await createStripePayment();

      const res = await request(app)
        .post('/api/payments/' + payment._id + '/refund')
        .set('Authorization', authHeader(admin))
        .send({ reason: 'Test' });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(mockStripe.refunds.create).not.toHaveBeenCalled();

      const unchanged = await Payment.findById(payment._id);
      expect(unchanged.status).toBe('pending');
    });
  });

  // ==================== OKUMA / SAHIPLIK ====================
  describe('Payment read access', () => {
    it('should return only the callers own payments on /my-payments', async () => {
      await createStripePayment();
      await Payment.create({
        userId: otherUser._id,
        businessId: business._id,
        amount: 2.5,
        platformFee: 0.75,
        businessFee: 1.75,
        currency: 'EUR',
        status: 'succeeded',
        paymentMethod: 'paypal',
        paymentProvider: 'paypal',
      });

      const res = await request(app)
        .get('/api/payments/my-payments')
        .set('Authorization', authHeader(user));

      expect(res.status).toBe(200);
      expect(res.body.result).toHaveLength(1);
      expect(res.body.result[0].userId._id).toBe(user._id.toString());
    });

    it('should not let a user read a foreign payment by id', async () => {
      const payment = await createStripePayment();

      const res = await request(app)
        .get('/api/payments/' + payment._id)
        .set('Authorization', authHeader(otherUser));

      expect(res.status).toBe(403);
    });

    it('should let an admin read any payment', async () => {
      const payment = await createStripePayment();

      const res = await request(app)
        .get('/api/payments/' + payment._id)
        .set('Authorization', authHeader(admin));

      expect(res.status).toBe(200);
      expect(res.body.result._id).toBe(payment._id.toString());
    });

    it('should reject the admin payment list for a normal user', async () => {
      const res = await request(app)
        .get('/api/payments')
        .set('Authorization', authHeader(user));

      expect(res.status).toBe(403);
    });
  });
});
