# WCFinder Security Audit Report
**Date:** 2026-03-17
**Auditor:** Claude Code
**Status:** ⚠️ CRITICAL VULNERABILITIES FOUND

---

## Executive Summary

Overall security posture: **GOOD** with **critical dependency vulnerabilities** requiring immediate action.

**Key Findings:**
- ✅ Core security implementation: **EXCELLENT** (encryption, auth, validation, rate limiting, CORS)
- ⚠️ Dependency vulnerabilities: **CRITICAL** (jsPDF, React Router, Axios)
- ✅ Hardcoded secrets: **NONE** (all env-based)
- ✅ Payment security: **SECURE** (webhook verification, server-side intents)
- ✅ Input sanitization: **COMPREHENSIVE** (XSS, NoSQL injection protected)

---

## 1. Critical Vulnerabilities (Fix Immediately)

### 1.1 CLIENT: jsPDF v4.1.0 and below - CRITICAL
**Severity:** CRITICAL
**Package:** jsPDF 4.1.0 and jsPDF-autotable (depends on vulnerable jsPDF)
**Vulnerabilities:** 8 critical issues

| ID | Type | Impact | CWE |
|---|---|---|---|
| GHSA-f8cm-6447-x5h2 | Local File Inclusion / Path Traversal | Read arbitrary files from server | CWE-22 |
| GHSA-pqxr-3g65-p328 | PDF Injection / RCE | Execute arbitrary code via PDF | CWE-94 |
| GHSA-95fx-jjr5-f39c | DoS via Unvalidated BMP | Crash app with malicious image | CWE-400 |
| GHSA-vm32-vv63-w422 | XMP Metadata Injection | Spoof PDF metadata | CWE-434 |
| GHSA-cjw8-79x6-5cj4 | Race Condition in addJS | Shared state exploit | CWE-362 |
| GHSA-9vjf-qc39-jprp | PDF Object Injection | Unsanitized input in addJS | CWE-20 |
| GHSA-67pg-wm7f-q7fj | DoS via Malicious GIF | Image dimension overflow | CWE-190 |
| GHSA-p5xg-68wr-hm3m | PDF Injection in RadioButton | AcroForm RCE | CWE-94 |

**Current Usage:** PDF generation in admin reports (monthly reports, invoices)

**Action Required:**
```bash
cd CLIENT
npm audit fix --force  # Upgrades jsPDF to 4.2.0+
```

**Test After Upgrade:**
- [ ] Monthly reports still generate correctly
- [ ] Invoice PDFs render without corruption
- [ ] Charts/tables in PDFs display properly

---

### 1.2 CLIENT: React Router v7.0-7.12 - CRITICAL
**Severity:** CRITICAL
**Package:** react-router & react-router-dom
**Vulnerabilities:** 5 critical issues

| ID | Type | Impact | Risk Level |
|---|---|---|---|
| GHSA-h5cw-625j-3rxh | CSRF in Action/Server Action | Unauthorized state changes | HIGH |
| GHSA-2w69-qvjg-hvjx | XSS via Open Redirects | Session hijacking | HIGH |
| GHSA-8v8x-cx79-35w7 | SSR XSS in ScrollRestoration | Server-side injection | HIGH |
| GHSA-9jcx-v3wj-wh4m | Unexpected external redirect | Open redirect attack | MEDIUM |
| GHSA-3cgp-3xvw-98x8 | Generic XSS Vulnerability | DOM injection | HIGH |

**Impact:** Authentication bypass, session hijacking, data theft

**Action Required:**
```bash
cd CLIENT
npm audit fix  # Updates react-router-dom to patched version
npm test       # Verify routing still works
```

**Critical Routes to Verify:**
- [ ] `/login` - redirection handling
- [ ] `/api/auth/logout` - CSRF protection
- [ ] Protected route access control
- [ ] Admin panel redirects

---

## 2. High-Priority Vulnerabilities (1-2 weeks)

### 2.1 Axios - All Projects - DoS via __proto__
**Severity:** HIGH
**Affected:** SERVER, CLIENT, MOBILE
**CWE:** CWE-1025 (Prototype Pollution)

```javascript
// Vulnerable pattern (fixed in newer axios)
axios.create({ baseURL: userInput }); // __proto__ in baseURL can pollute
```

**Fix:**
```bash
# SERVER
cd SERVER && npm audit fix

# CLIENT
cd CLIENT && npm audit fix

# MOBILE
cd MOBILE && npm audit fix
```

**Expected Changes:** `axios ^1.6.0+`

---

### 2.2 Lodash - All Projects - Prototype Pollution
**Severity:** HIGH
**Affected:** SERVER, CLIENT, MOBILE
**Vulnerability:** `_.unset()` and `_.omit()` can bypass access controls

**Example Attack:**
```javascript
// Could pollute Object.prototype
_.unset(obj, 'constructor.prototype.isAdmin');
```

**Fix:** Same as axios above (npm audit fix handles this)

---

### 2.3 SERVER: Multer - File Upload DoS
**Severity:** HIGH
**Package:** multer <=2.1.0
**Vulnerabilities:** 3 DoS vectors

1. **Incomplete Cleanup:** Temporary files not cleaned after error
2. **Resource Exhaustion:** Unbounded memory for file uploads
3. **Uncontrolled Recursion:** Nested multipart handling causes stack overflow

**Current Implementation Check:**
```bash
cd SERVER && grep -n "multer\|upload\|file" src/routes/*.js | head -10
```

**Recommended Fix:**
1. Upgrade multer: `npm audit fix`
2. Add file size limits in middleware
3. Add request timeout for uploads
4. Implement temp file cleanup on errors

**Example Secure Implementation:**
```javascript
const multer = require('multer');

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
    parts: 10
  },
  fileFilter: (req, file, cb) => {
    // Whitelist only allowed MIME types
    if (!['application/pdf', 'image/jpeg'].includes(file.mimetype)) {
      cb(new Error('Invalid file type'));
    } else {
      cb(null, true);
    }
  }
});

// Add timeout
app.post('/upload', (req, res, next) => {
  req.setTimeout(30000); // 30 second timeout
  next();
}, upload.single('file'));
```

---

### 2.4 Minimatch - All Projects - ReDoS
**Severity:** HIGH
**Affected:** SERVER, CLIENT, MOBILE (build tools)
**CWE:** CWE-1333 (Regular Expression Denial of Service)

**Affected Functions:**
- `matchOne()` - multiple non-adjacent GLOBSTAR segments
- Extglob patterns `*()` - nested patterns cause exponential backtracking

**Impact:** Build process DoS with malicious glob patterns

**Fix:** `npm audit fix` (updates to minimatch ^3.1.4+)

---

### 2.5 Nodemailer - EMAIL SERVICE - DoS
**Severity:** HIGH
**Package:** nodemailer <=7.0.10
**Vulnerability:** Recursive calls in addressparser cause stack overflow

**Current Usage:** Email notifications (password reset, booking confirmation)

**Fix:**
```bash
cd SERVER && npm audit fix
# Ensures nodemailer >=7.0.11
```

**Testing:**
```bash
# Test email sending with malformed addresses
curl -X POST http://localhost:8000/api/emails/test \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test"}'
```

---

## 3. Moderate Vulnerabilities (1 month)

### 3.1 Query String (qs) - SERVER - DoS
**Severity:** MODERATE
**Vulnerability:** arrayLimit bypass allows memory exhaustion

**Impact:** API DoS via crafted query strings
```
GET /api/users?[0]=a&[1000000]=b&... // Memory exhaustion
```

**Fix:** `npm audit fix` (qs >=6.14.2+)

---

### 3.2 AJV - Validation Library - ReDoS
**Severity:** MODERATE
**Vulnerability:** ReDoS when using `$data` option in JSON schemas

**Fix:** `npm audit fix`

---

### 3.3 Flatted - Serialization - DoS
**Severity:** MODERATE
**Vulnerability:** Unbounded recursion in parse() revive phase

**Fix:** `npm audit fix`

---

### 3.4 DOMPurify - CLIENT - XSS
**Severity:** MODERATE
**Package:** dompurify >=3.1.3
**Note:** Only affects if HTML content is manually sanitized; framework auto-escapes

**Fix:** `npm audit fix`

---

### 3.5 XLSX - CLIENT - Prototype Pollution & ReDoS
**Severity:** HIGH (but no fix available)
**Package:** xlsx *
**Issue:** No fix available from npm; package is unmaintained

**Workarounds:**
1. Use alternative library: `exceljs` or `fast-xlsx`
2. Isolate in Web Worker to prevent DoS propagation
3. Add input validation for Excel files

**Current Usage:** Admin report export to Excel

**Recommendation:**
```bash
# Replace xlsx with exceljs
npm uninstall xlsx
npm install exceljs
```

---

## 4. Audit Fixes Summary

### Commands by Priority

**CRITICAL (Run immediately):**
```bash
# CLIENT - Fix jsPDF + React Router + others
cd CLIENT && npm audit fix --force

# Verify builds
npm run build  # Should complete without errors
npm test       # All tests should pass
```

**HIGH (Run this week):**
```bash
# SERVER
cd SERVER && npm audit fix
npm test  # Verify auth/payment endpoints work

# MOBILE
cd MOBILE && npm audit fix
npm test  # Verify builds and navigation work
```

---

## 5. Security Configuration Audit Results

### ✅ PASSED: Hardcoded Secrets
- No plaintext passwords/keys in code
- No hardcoded JWT secrets
- No API key credentials in source
- All sensitive data from environment variables

**Critical Files Verified:**
- `SERVER/src/config/stripe.js` - ✅ env-based
- `SERVER/src/helper/passwordEncrypt.js` - ✅ no secrets
- `CLIENT/src/services/api.js` - ✅ env-based base URL
- `.gitignore` - ✅ .env files ignored

---

### ✅ PASSED: Rate Limiting

**Configuration:**
```javascript
// Authentication: 5 requests/15 minutes (production)
// Payment: 5-20 requests/minute (dev-friendly)
// General API: 100-200 requests/15 minutes
// skipSuccessfulRequests: true (only failed attempts count)
```

**Verification:**
```bash
# Test rate limiting on auth endpoints
for i in {1..6}; do
  curl -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"wrong"}'
  echo "Attempt $i"
done
# Should get 429 on attempt 6
```

---

### ✅ PASSED: CORS Configuration

**Status:** Environment-based whitelist
**File:** `SERVER/index.js:95-185`

```javascript
// Production: Requires CORS_ORIGIN env var
// Development: localhost:5173, 5174, 5175, 3000
// Credentials: Enabled for cookie-based auth
// Methods: GET, POST, PUT, PATCH, DELETE
// Headers: Content-Type, Authorization, X-Requested-With
```

**Verification:**
```bash
# Test CORS from different origin
curl -X OPTIONS http://localhost:8000/api/users \
  -H "Origin: http://malicious.com" \
  -H "Access-Control-Request-Method: GET"
# Should be blocked (no CORS header in response)
```

---

### ✅ PASSED: Payment Security

**Stripe Webhook Verification:**
- Route: `/payments/webhook/stripe`
- Implementation: `stripe.webhooks.constructEvent()`
- Signature Validation: ✅ Via `STRIPE_WEBHOOK_SECRET`
- Auth Bypass: ✅ Correct (webhooks require signature, not JWT)

**Code Location:** `SERVER/src/controller/payment.js:255-280`

```javascript
// ✅ Proper implementation
event = stripe.webhooks.constructEvent(
  req.body,
  req.headers["stripe-signature"],
  process.env.STRIPE_WEBHOOK_SECRET  // Signature verification
);
```

**Security Measures:**
- ✅ Server-side payment intent creation
- ✅ 3D Secure support
- ✅ ObjectId validation prevents injection
- ✅ User authentication on payment endpoints
- ✅ Payment ownership verification

---

### ✅ PASSED: Input Validation & Sanitization

**XSS Protection:**
```javascript
const escapeHtml = (text) => {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
};
// Applied to all string inputs ✅
```

**NoSQL Injection Protection:**
```javascript
const sanitizeInput = (obj) => {
  // Strips: $gt, $ne, $regex, $eq, $and, $or, $in, etc.
  // Prevents: db.users.find({ username: { $ne: null } })
};
// Applied to all queries ✅
```

**Validation Rules:**
- Email: RFC 5322 format + 254 char limit ✅
- Password: 8+ chars, uppercase, lowercase, number ✅
- ObjectId: 24 hex characters ✅

---

### ✅ PASSED: Mobile Token Security

**Implementation:** `MOBILE/src/utils/secureStorage.ts`

```typescript
// Hardware-backed encryption
await SecureStore.setItemAsync('accessToken', token);    // iOS: Keychain, Android: KeyStore
await SecureStore.getItemAsync('accessToken');           // Encrypted retrieval
```

**Verified:**
- ✅ No tokens in AsyncStorage
- ✅ No tokens in Redux state serialization
- ✅ Tokens cleared on logout
- ✅ Token refresh on 401

---

## 6. Recommendations & Action Items

### Immediate (This Week)
- [ ] Run `npm audit fix` on all three projects
- [ ] Run full test suites after updates
- [ ] Deploy patched versions to staging
- [ ] Perform smoke testing on critical features:
  - [ ] Login/Register flow
  - [ ] Payment processing
  - [ ] PDF generation and download
  - [ ] Mobile app builds and navigation

### Short Term (1-2 Weeks)
- [ ] Replace unmaintained `xlsx` with `exceljs`
- [ ] Add integration tests for payment webhook handling
- [ ] Test rate limiting under load
- [ ] Verify error messages don't leak sensitive info

### Medium Term (1 Month)
- [ ] Implement token blacklisting for logout security
- [ ] Add JWT refresh token rotation
- [ ] Implement Redis-based distributed rate limiting
- [ ] Add CAPTCHA for suspicious login attempts
- [ ] Set up security headers auditing (via OWASP ZAP or similar)

### Long Term (3+ Months)
- [ ] Implement API request signing for third-party integrations
- [ ] Set up security event logging and alerting
- [ ] Implement database encryption at rest (MongoDB)
- [ ] Add intrusion detection system
- [ ] Schedule quarterly security audits

---

## 7. Testing & Verification

### Run Comprehensive Security Tests

```bash
# All projects - npm audit
cd SERVER && npm audit --production
cd CLIENT && npm audit --production
cd MOBILE && npm audit --production

# Run test suites
cd SERVER && npm test
cd CLIENT && npm test
cd MOBILE && npm test

# Build verification
cd SERVER && npm run build:server (if applicable)
cd CLIENT && npm run build
cd MOBILE && npm run build (via EAS)
```

### Manual Security Testing

```bash
# 1. Test rate limiting on auth
for i in {1..6}; do
  curl -s -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"wrong"}' \
    | jq '.message'
done

# 2. Test CORS blocking
curl -s -X OPTIONS http://localhost:8000/api/users \
  -H "Origin: http://malicious.com" \
  -v 2>&1 | grep -i "access-control"

# 3. Test XSS protection
curl -X POST http://localhost:8000/api/business \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"businessName":"<img src=x onerror=alert(1)>"}'

# 4. Test NoSQL injection protection
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":{"$ne":null},"password":{"$gt":""}}'
```

---

## 8. Compliance Status

### OWASP Top 10 2021
- [x] A01: Broken Access Control - ✅ RBAC + auth middleware
- [x] A02: Cryptographic Failures - ✅ PBKDF2 + HTTPS + secure storage
- [x] A03: Injection - ✅ NoSQL + XSS protection
- [x] A04: Insecure Design - ✅ Security by default
- [x] A05: Security Misconfiguration - ✅ Env validation + helmet
- [x] A06: Vulnerable Components - ⚠️ **NEEDS FIXES** (npm audit)
- [x] A07: Authentication Failures - ✅ Rate limiting + JWT
- [x] A08: Data Integrity Failures - ✅ Signature verification
- [x] A09: Logging/Monitoring Gaps - ✅ Structured logging
- [x] A10: SSRF - ✅ No external requests from user input

### PCI DSS (Payment Card Industry)
- ✅ Stripe/PayPal used (no card storage)
- ✅ HTTPS enforced
- ✅ Authentication implemented
- ✅ Data masking in logs
- ⚠️ Database encryption at rest (recommended)

---

## 9. Next Steps

1. **Immediately:** Apply all `npm audit fix` commands
2. **This Week:** Run tests and verify all features work
3. **Next Sprint:** Replace xlsx, implement token blacklisting
4. **Ongoing:** Monthly npm audit reviews

---

## Appendix: Vulnerable Packages Reference

| Package | Current | Risk | Fix |
|---------|---------|------|-----|
| jsPDF | 4.1.0 | CRITICAL | `npm audit fix --force` |
| react-router | 7.x | CRITICAL | `npm audit fix` |
| axios | 1.6.0 | HIGH | `npm audit fix` |
| lodash | 4.17.21 | HIGH | `npm audit fix` |
| multer | 2.1.0 | HIGH | `npm audit fix` |
| minimatch | 3.1.3 | HIGH | `npm audit fix` |
| nodemailer | 7.0.10 | HIGH | `npm audit fix` |
| qs | 6.14.1 | MODERATE | `npm audit fix` |
| xlsx | * | HIGH | `npm uninstall xlsx && npm install exceljs` |

---

**Report Generated:** 2026-03-17
**Next Review:** 2026-06-17 (Quarterly)
**Reviewer:** Claude Code Security Audit
**Status:** Ready for implementation ✅
