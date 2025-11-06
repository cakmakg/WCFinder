# WCFinder - Test Planı (QA Plan)

**Versiyon**: 1.0  
**Tarih**: Eylül 2025

---

## 1. Test Stratejisi

### 1.1 Test Seviyeleri

```
┌──────────────────────────────────────┐
│      END-TO-END TESTS (E2E)          │
│  Selenium, Cypress, Playwright       │
│  Coverage: 70%                       │
└──────────────────────────────────────┘
           ↑
┌──────────────────────────────────────┐
│    INTEGRATION TESTS                 │
│  Jest, Supertest, MongoDB Memory     │
│  Coverage: 80%                       │
└──────────────────────────────────────┘
           ↑
┌──────────────────────────────────────┐
│    UNIT TESTS                        │
│  Jest, Vitest, React Testing Library │
│  Coverage: 85%                       │
└──────────────────────────────────────┘
           ↑
┌──────────────────────────────────────┐
│      COMPONENT TESTS                 │
│  React Testing Library, Storybook    │
│  Coverage: 90%                       │
└──────────────────────────────────────┘
```

### 1.2 Test Türleri

| Test Türü | Araçlar | Süre | Sıklık |
|-----------|---------|------|--------|
| **Unit** | Jest, Vitest | 5 min | Her commit |
| **Component** | RTL, Storybook | 10 min | Her commit |
| **Integration** | Supertest, Jest | 15 min | Her push |
| **E2E** | Cypress, Playwright | 30 min | Pre-release |
| **Performance** | Lighthouse, WebPageTest | 20 min | Haftalık |
| **Security** | OWASP, Sonarqube | 30 min | Haftalık |
| **Load** | JMeter, K6 | 40 min | Ayda bir |
| **UAT** | Manual | 2 saat | Release öncesi |

---

## 2. Unit Tests

### 2.1 Frontend Unit Tests

```javascript
// __tests__/services/businessService.test.js
import axios from 'axios';
import * as businessService from '../../services/businessService';

jest.mock('axios');

describe('businessService', () => {
  
  describe('getBusinesses', () => {
    it('should fetch all businesses', async () => {
      const mockData = [
        { _id: 1, businessName: 'Café' },
        { _id: 2, businessName: 'Restaurant' }
      ];
      
      axios.get.mockResolvedValue({ data: mockData });
      
      const result = await businessService.getBusinesses();
      
      expect(result).toEqual(mockData);
      expect(axios.get).toHaveBeenCalledWith('/business');
    });

    it('should handle error', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));
      
      await expect(businessService.getBusinesses())
        .rejects.toThrow('Network error');
    });
  });

  describe('getBusinessById', () => {
    it('should fetch business by ID', async () => {
      const id = '123';
      axios.get.mockResolvedValue({ 
        data: { _id: id, businessName: 'Café' } 
      });
      
      const result = await businessService.getBusinessById(id);
      
      expect(result._id).toBe(id);
      expect(axios.get).toHaveBeenCalledWith(`/business/${id}`);
    });
  });
});
```

### 2.2 Backend Unit Tests

```javascript
// __tests__/controllers/toiletController.test.js
import { list, read, create } from '../../controllers/toilet';
import Toilet from '../../models/toilet';

jest.mock('../../models/toilet');

describe('Toilet Controller', () => {
  
  describe('list', () => {
    it('should return list of toilets', async () => {
      const mockToilets = [
        { _id: 1, name: 'WC 1' },
        { _id: 2, name: 'WC 2' }
      ];
      
      Toilet.find.mockResolvedValue(mockToilets);
      
      const req = {};
      const res = {
        getModelList: jest.fn().mockResolvedValue(mockToilets),
        getModelListDetails: jest.fn().mockResolvedValue({}),
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      
      await list(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create new toilet', async () => {
      const toiletData = {
        business: '123',
        name: 'WC 1',
        fee: 0.5
      };
      
      Toilet.create.mockResolvedValue(toiletData);
      
      const req = { body: toiletData };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      
      await create(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalled();
    });
  });
});
```

### 2.3 Test Coverage Hedefleri

```
Frontend:
├── Services: 90%+
├── Hooks: 85%+
├── Utils: 95%+
└── Reducers: 90%+

Backend:
├── Controllers: 85%+
├── Models: 80%+
├── Routes: 75%+
└── Middleware: 90%+

Overall: 85%+
```

---

## 3. Component Tests

### 3.1 React Component Tests

```javascript
// __tests__/components/BusinessCard.test.jsx
import { render, screen } from '@testing-library/react';
import BusinessCard from '../../components/business/BusinessCard';

describe('BusinessCard Component', () => {
  
  it('should render business information', () => {
    const mockBusiness = {
      _id: 1,
      businessName: 'Café Köhler',
      businessType: 'Cafe',
      address: { street: 'Main St', city: 'Bonn' }
    };
    
    render(<BusinessCard business={mockBusiness} />);
    
    expect(screen.getByText('Café Köhler')).toBeInTheDocument();
    expect(screen.getByText('Cafe')).toBeInTheDocument();
  });

  it('should handle click event', () => {
    const handleClick = jest.fn();
    const mockBusiness = { _id: 1, businessName: 'Test' };
    
    render(
      <BusinessCard 
        business={mockBusiness} 
        onClick={handleClick} 
      />
    );
    
    const card = screen.getByRole('button');
    card.click();
    
    expect(handleClick).toHaveBeenCalledWith(mockBusiness);
  });

  it('should render responsive', () => {
    const mockBusiness = { _id: 1, businessName: 'Test' };
    const { container } = render(<BusinessCard business={mockBusiness} />);
    
    expect(container.firstChild).toHaveClass('card-responsive');
  });
});
```

---

## 4. Integration Tests

### 4.1 Backend Integration Tests

```javascript
// __tests__/integration/business.integration.test.js
import request from 'supertest';
import app from '../../server';
import Business from '../../models/business';
import { connectDB, disconnectDB } from '../../config/database';

describe('Business API Integration', () => {
  
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('POST /business', () => {
    it('should create new business', async () => {
      const newBusiness = {
        owner: '123',
        businessName: 'Test Café',
        businessType: 'Cafe',
        address: {
          street: 'Test St',
          city: 'Bonn',
          postalCode: '53111',
          country: 'Germany'
        },
        location: {
          type: 'Point',
          coordinates: [7.0982, 50.7355]
        }
      };

      const res = await request(app)
        .post('/business')
        .send(newBusiness);

      expect(res.status).toBe(201);
      expect(res.body.result).toHaveProperty('_id');
      expect(res.body.result.businessName).toBe('Test Café');
    });

    it('should return 400 for invalid data', async () => {
      const res = await request(app)
        .post('/business')
        .send({ businessName: 'Test' }); // Missing required fields

      expect(res.status).toBe(400);
    });
  });

  describe('GET /business/:id', () => {
    it('should fetch business by ID', async () => {
      const business = await Business.create({
        owner: '123',
        businessName: 'Test',
        businessType: 'Cafe',
        address: { street: 'Test', city: 'Bonn', postalCode: '53111', country: 'Germany' },
        location: { type: 'Point', coordinates: [7.0982, 50.7355] }
      });

      const res = await request(app)
        .get(`/business/${business._id}`);

      expect(res.status).toBe(200);
      expect(res.body.result._id).toBe(business._id.toString());
    });

    it('should return 404 for non-existent ID', async () => {
      const res = await request(app)
        .get('/business/000000000000000000000000');

      expect(res.status).toBe(404);
    });
  });
});
```

### 4.2 API-Database Integration

```javascript
// Test: Reservation flow
describe('Reservation Flow', () => {
  
  it('should create usage and update toilet status', async () => {
    // 1. Create toilet
    const toilet = await Toilet.create({ ... });
    
    // 2. Create usage
    const usage = await Usage.create({
      toiletId: toilet._id,
      businessId: toilet.business,
      status: 'confirmed'
    });
    
    // 3. Verify toilet status updated
    const updatedToilet = await Toilet.findById(toilet._id);
    expect(updatedToilet.status).toBe('in_use');
    
    // 4. Verify payment created
    const payment = await Payment.findOne({ usageId: usage._id });
    expect(payment.status).toBe('confirmed');
  });
});
```

---

## 5. End-to-End Tests

### 5.1 Cypress E2E Tests

```javascript
// cypress/e2e/booking.cy.js
describe('Booking Flow', () => {
  
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should complete reservation flow', () => {
    // 1. Search for toilet
    cy.contains('Toiletten suchen').click();
    cy.get('[data-testid="search-input"]').type('Cafe');
    cy.get('[data-testid="search-btn"]').click();
    
    // 2. Select toilet
    cy.get('[data-testid="toilet-card"]').first().click();
    cy.url().should('include', '/toilet/');
    
    // 3. Fill reservation form
    cy.get('[data-testid="date-input"]').type('2025-10-01');
    cy.get('[data-testid="gender-select"]').select('male');
    cy.get('[data-testid="person-count"]').select('2');
    
    // 4. Click reserve
    cy.get('[data-testid="reserve-btn"]').click();
    
    // 5. Verify payment page
    cy.url().should('include', '/payment');
    cy.contains('€').should('be.visible');
    
    // 6. Complete payment
    cy.get('[data-testid="card-number"]').type('4242424242424242');
    cy.get('[data-testid="pay-btn"]').click();
    
    // 7. Verify success
    cy.url().should('include', '/bookings');
    cy.contains('Reservierung erfolgreich').should('be.visible');
  });

  it('should show error for invalid inputs', () => {
    cy.get('[data-testid="reserve-btn"]').click();
    cy.contains('Bitte füllen Sie alle Felder aus').should('be.visible');
  });
});
```

### 5.2 Playwright E2E Tests

```javascript
// tests/booking.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Booking Workflow', () => {
  
  test('should book toilet successfully', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Search
    await page.click('text=Toiletten suchen');
    await page.fill('[data-testid="search"]', 'Cafe');
    await page.click('[data-testid="search-btn"]');
    
    // Select toilet
    await page.click('[data-testid="toilet-card"]');
    await expect(page).toHaveURL(/\/toilet\//);
    
    // Fill form
    await page.fill('[data-testid="date"]', '2025-10-01');
    await page.selectOption('[data-testid="gender"]', 'male');
    await page.fill('[data-testid="persons"]', '2');
    
    // Reserve
    await page.click('[data-testid="reserve-btn"]');
    
    // Payment
    await page.fill('[data-testid="card"]', '4242424242424242');
    await page.click('[data-testid="pay"]');
    
    // Verify
    await expect(page).toHaveURL(/\/bookings/);
    await expect(page.locator('text=Erfolgreich')).toBeVisible();
  });
});
```

---

## 6. Performance Testing

### 6.1 Lighthouse Performance

```bash
# Run lighthouse test
npm install -g lighthouse

lighthouse https://wcfinder.de --view

# Expected scores:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 95+
# SEO: 95+
```

### 6.2 Load Testing (K6)

```javascript
// performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 100,           // 100 concurrent users
  duration: '5m',     // 5 minutes
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95th percentile < 500ms
    http_req_failed: ['<0.1']         // Error rate < 0.1%
  }
};

export default function () {
  // Test API endpoints
  let res = http.get('https://api.wcfinder.de/business');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500
  });
  
  sleep(1);
  
  // Test reservation endpoint
  res = http.post('https://api.wcfinder.de/usage', {
    businessId: '123',
    toiletId: '456',
    personCount: 2
  });
  
  check(res, {
    'booking status is 201': (r) => r.status === 201
  });
  
  sleep(1);
}
```

---

## 7. Security Testing

### 7.1 OWASP Top 10 Kontrol

```
☐ Injection attacks (SQL, NoSQL, Command)
☐ Broken Authentication
☐ Sensitive Data Exposure
☐ XML External Entities (XXE)
☐ Broken Access Control
☐ Security Misconfiguration
☐ Cross-Site Scripting (XSS)
☐ Insecure Deserialization
☐ Using Components with Known Vulnerabilities
☐ Insufficient Logging & Monitoring
```

### 7.2 Security Test Cases

```javascript
// Security: SQL/NoSQL Injection
test('should prevent NoSQL injection', async () => {
  const maliciousInput = { $ne: null };
  const res = await request(app)
    .post('/business')
    .send({ owner: maliciousInput });
  
  expect(res.status).toBe(400);
});

// Security: XSS Prevention
test('should sanitize XSS attacks', async () => {
  const xssPayload = '<script>alert("xss")</script>';
  const res = await request(app)
    .post('/review')
    .send({ comment: xssPayload });
  
  // Verify script tags removed
  expect(res.body.comment).not.toContain('<script>');
});

// Security: CSRF Token
test('should require CSRF token', async () => {
  const res = await request(app)
    .post('/business')
    .send({ businessName: 'Test' });
  
  expect(res.status).toBe(403);
});
```

---

## 8. UAT (User Acceptance Testing)

### 8.1 UAT Test Cases

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| UAT-001 | Kullanıcı kaydı ve giriş | Başarıyla giriş yapabilir | ☐ |
| UAT-002 | Tuvaletleri arama | Tuvaletler bulunur | ☐ |
| UAT-003 | Rezervasyon yapma | Ödeme sayfasına yönlendirilir | ☐ |
| UAT-004 | Ödeme işlemi | Ödeme başarılı ve QR alır | ☐ |
| UAT-005 | Değerlendirme yazma | Yorum kaydedilir | ☐ |
| UAT-006 | İşletme yönetimi | İşletme tuvaletleri yönetebilir | ☐ |

---

## 9. Test Automation Setup

### 9.1 Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/**/*.stories.js'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ]
};
```

### 9.2 NPM Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "test:load": "k6 run performance/load-test.js",
    "test:security": "npm audit && sonarqube"
  }
}
```

---

## 10. Test Execution Schedule

```
Daily (CI/CD):
├── Unit Tests: 5 min
├── Component Tests: 10 min
└── Integration Tests: 15 min

Weekly:
├── E2E Tests: 30 min
├── Performance: 20 min
└── Security: 30 min

Monthly:
├── Load Testing: 60 min
├── UAT: 120 min
└── Full Regression: 180 min
```

---

## 11. Test Environment Setup

```bash
# Install testing dependencies
npm install --save-dev \
  jest \
  @testing-library/react \
  @testing-library/jest-dom \
  cypress \
  supertest \
  mongodb-memory-server

# Setup test database
npm install --save-dev mongodb-memory-server

# Run tests
npm test
```

---

**Son Güncelleme**: Eylül 2025