# WCFinder - Dağıtım Rehberi (Deployment)

**Versiyon**: 1.0  
**Tarih**: Eylül 2025

---

## 1. Dağıtım Ortamları

### 1.1 Ortam Konfigürasyonu

| Ortam | URL | Database | Server |
|-------|-----|----------|--------|
| **Development** | localhost:3000 | MongoDB Local | Local |
| **Staging** | staging.wcfinder.de | MongoDB Atlas (Test) | Heroku Staging |
| **Production** | wcfinder.de | MongoDB Atlas (Prod) | Heroku Pro |

### 1.2 Ortam Değişkenleri

**Development (.env.development)**
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxx
NODE_ENV=development
```

**Staging (.env.staging)**
```
REACT_APP_API_URL=https://api-staging.wcfinder.de
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxx
NODE_ENV=staging
```

**Production (.env.production)**
```
REACT_APP_API_URL=https://api.wcfinder.de
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_xxx
NODE_ENV=production
```

---

## 2. Gereksinimler

### 2.1 Yazılım Gereksinimleri

```bash
# Frontend
- Node.js 16+ (https://nodejs.org/)
- npm 8+ veya yarn 3+
- Git 2.30+

# Backend
- Node.js 16+
- Docker 20+
- Docker Compose 2+

# Diğer
- MongoDB Atlas Account
- Stripe Account
- SendGrid Account (Email)
- GitHub Account
- Heroku Account (veya AWS)
```

### 2.2 Donanım Gereksinimleri

```
Development:
- RAM: 8GB minimum
- Storage: 10GB free
- CPU: 2 cores

Production:
- RAM: 4GB per container
- Storage: 50GB
- CPU: 2+ cores
```

---

## 3. Lokal Kurulum (Development)

### 3.1 Repository Klonlama

```bash
# Repository klonla
git clone https://github.com/wcfinder/wcfinder.git
cd wcfinder

# Klasörleri oluştur
mkdir -p /data/db  # MongoDB lokal veri
```

### 3.2 Backend Kurulumu

```bash
cd SERVER

# Bağımlılıkları yükle
npm install

# .env dosyası oluştur
cp .env.example .env

# Aşağıdaki değerleri düzenle:
# PORT=8000
# MONGODB_URI=mongodb://localhost:27017/wcfinder
# JWT_SECRET=your_secret_key
# STRIPE_SECRET_KEY=sk_test_xxx

# Server başlat
npm run dev
```

### 3.3 Frontend Kurulumu

```bash
cd CLIENT

# Bağımlılıkları yükle
npm install

# .env dosyası oluştur
cp .env.example .env.local

# Development server başlat
npm start
```

### 3.4 MongoDB Lokal Setup

```bash
# MongoDB Community Edition yükle
# macOS:
brew install mongodb-community

# Windows:
# https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/

# MongoDB başlat
mongod --dbpath /data/db

# MongoDB Compass ile kontrol et
# https://www.mongodb.com/products/compass
```

### 3.5 İlk Veri (Seed Data)

```bash
cd SERVER

# Seed script çalıştır
node scripts/seed.js

# Çıktı:
# ✅ 10 businesses created
# ✅ 10 toilets created
# ✅ Database initialized
```

---

## 4. Docker ile Kurulum

### 4.1 Docker Kurulması

```bash
# macOS
brew install docker

# Windows
# https://docs.docker.com/desktop/install/windows-install/

# Docker version kontrol
docker --version
docker-compose --version
```

### 4.2 Docker Compose

**docker-compose.yml**
```yaml
version: '3.9'

services:
  mongodb:
    image: mongo:5.0
    container_name: wcfinder-db
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: wcfinder
    volumes:
      - mongo_data:/data/db
    networks:
      - wcfinder-network

  redis:
    image: redis:7-alpine
    container_name: wcfinder-cache
    ports:
      - "6379:6379"
    networks:
      - wcfinder-network

  backend:
    build: ./SERVER
    container_name: wcfinder-backend
    ports:
      - "8000:8000"
    environment:
      NODE_ENV: development
      MONGODB_URI: mongodb://mongodb:27017/wcfinder
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
    depends_on:
      - mongodb
      - redis
    networks:
      - wcfinder-network
    volumes:
      - ./SERVER:/app
      - /app/node_modules

  frontend:
    build: ./CLIENT
    container_name: wcfinder-frontend
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:8000
      REACT_APP_STRIPE_PUBLIC_KEY: ${REACT_APP_STRIPE_PUBLIC_KEY}
    depends_on:
      - backend
    networks:
      - wcfinder-network

  nginx:
    image: nginx:alpine
    container_name: wcfinder-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - wcfinder-network

volumes:
  mongo_data:

networks:
  wcfinder-network:
    driver: bridge
```

### 4.3 Docker Başlat

```bash
# Tüm containerları başlat
docker-compose up -d

# Logları göster
docker-compose logs -f

# Kontrol et
docker-compose ps

# Services test
curl http://localhost:3000  # Frontend
curl http://localhost:8000  # Backend
```

### 4.4 Docker Durdur/Sil

```bash
# Containerları durdur
docker-compose down

# Tüm dataları sil (dikkat!)
docker-compose down -v
```

---

## 5. Staging Dağıtımı (Heroku)

### 5.1 Heroku Kurulması

```bash
# Heroku CLI yükle
# https://devcenter.heroku.com/articles/heroku-cli

# Heroku'ya giriş yap
heroku login

# App oluştur
heroku create wcfinder-staging

# Git remote ekle
heroku git:remote -a wcfinder-staging
```

### 5.2 Ortam Değişkenlerini Ayarla

```bash
# Backend secrets
heroku config:set \
  MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/wcfinder-staging \
  JWT_SECRET=your_staging_secret \
  STRIPE_SECRET_KEY=sk_test_xxx \
  NODE_ENV=staging

# Frontend secrets
heroku config:set \
  REACT_APP_API_URL=https://wcfinder-staging-api.herokuapp.com \
  REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxx
```

### 5.3 Dağıtım

```bash
# Backend dağıt
cd SERVER
git push heroku main

# Frontend dağıt
cd ../CLIENT
git push heroku main

# Durum kontrol
heroku ps

# Logları göster
heroku logs --tail
```

---

## 6. Production Dağıtımı (AWS/Heroku)

### 6.1 Production URL Ayarları

```bash
# Domain bağla
heroku domains:add wcfinder.de
heroku domains:add api.wcfinder.de

# SSL Sertifikası (otomatik)
heroku certs:auto:enable

# DNS güncellemeleri yapılandırma sağlayıcısında yap
```

### 6.2 Production Secrets

```bash
# Stripe live keys
heroku config:set \
  STRIPE_SECRET_KEY=sk_live_xxx \
  STRIPE_PUBLIC_KEY=pk_live_xxx \
  NODE_ENV=production

# Database production
heroku config:set \
  MONGODB_URI=mongodb+srv://prod-user:prod-pass@prod-cluster.mongodb.net/wcfinder

# Email production
heroku config:set \
  SENDGRID_API_KEY=SG.xxx
```

### 6.3 Production Deployment

```bash
# Main branch'dan dağıt
git checkout main
git push heroku main

# Durum kontrol
heroku ps -a wcfinder-prod

# Health check
curl https://wcfinder.de/health
```

---

## 7. CI/CD Pipeline (GitHub Actions)

### 7.1 GitHub Actions Workflow

**.github/workflows/deploy.yml**
```yaml
name: Deploy

on:
  push:
    branches: [ main, staging ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: |
          cd CLIENT && npm ci
          cd ../SERVER && npm ci
      
      - name: Run linter
        run: |
          cd CLIENT && npm run lint
          cd ../SERVER && npm run lint
      
      - name: Run tests
        run: |
          cd CLIENT && npm test
          cd ../SERVER && npm test

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Heroku (Staging)
        env:
          HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
        run: |
          git push https://heroku:$HEROKU_API_KEY@git.heroku.com/wcfinder-staging.git main

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Heroku (Production)
        env:
          HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
        run: |
          git push https://heroku:$HEROKU_API_KEY@git.heroku.com/wcfinder-prod.git main
```

---

## 8. Database Backup & Recovery

### 8.1 MongoDB Atlas Backup

```bash
# Otomatik backup etkinleştir
# MongoDB Atlas Console → Backup → Enable Continuous Backups

# Manual backup
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/wcfinder" \
  --out /backups/wcfinder-$(date +%Y%m%d)

# Restore
mongorestore --uri "mongodb+srv://user:pass@cluster.mongodb.net/wcfinder" \
  /backups/wcfinder-20250922
```

### 8.2 Backup Schedule

```
Daily: 02:00 UTC (Automated)
Weekly: Full backup (Archived)
Retention: 30 days
```

---

## 9. Monitoring & Logging

### 9.1 Heroku Monitoring

```bash
# Metrics göster
heroku metrics

# Performance monitoring
heroku addons:create papertrail
heroku addons:open papertrail

# Error tracking
heroku addons:create sentry:free
```

### 9.2 Application Monitoring

```javascript
// New Relic Setup
npm install newrelic

// server.js içinde
require('newrelic');
```

---

## 10. Troubleshooting

### 10.1 Yaygın Sorunlar

```bash
# Problem: Database connection timeout
# Çözüm: MongoDB Atlas IP whitelist kontrol et
# https://account.mongodb.com/account/login

# Problem: CORS errors
# Çözüm: Frontend URL'sini backend CORS whitelist'ine ekle

# Problem: Stripe webhook not received
# Çözüm: Webhook signing secret kontrol et

# Problem: Out of memory
# Çözüm: Dyno type upgrade (Heroku)
heroku dyno:type premium -a wcfinder-prod
```

### 10.2 Logs Kontrol

```bash
# Heroku logs
heroku logs --tail -a wcfinder-prod

# Docker logs
docker logs wcfinder-backend
docker logs wcfinder-frontend

# MongoDB Atlas logs
# Console → Logs → View Logs
```

---

## 11. Rollback Prosedürü

### 11.1 Production Rollback

```bash
# Son sürüme geri dön
heroku releases -a wcfinder-prod

# Belirli version'a rollback
heroku releases:rollback v42 -a wcfinder-prod

# Verify
heroku ps -a wcfinder-prod
```

### 11.2 Database Rollback

```bash
# Point-in-time restore
# MongoDB Atlas Console → Backup → Restore

# Backup tarihini seç ve restore et
```

---

## 12. Security Checklist

```
☐ HTTPS/SSL enabled
☐ Environment variables secured (not in code)
☐ Database credentials rotated
☐ API keys regenerated
☐ CORS properly configured
☐ Rate limiting enabled
☐ GDPR compliance verified
☐ Security headers set (HSTS, CSP, etc.)
☐ Dependencies updated
☐ Code reviewed before deployment
☐ Backup tested
☐ Monitoring alerts configured
```

---

## 13. Deployment Checklist

```
Pre-Deployment:
☐ Tüm testler geçti
☐ Code review approved
☐ Staging'de test edildi
☐ Database migration ready
☐ Backup alındı

Deployment:
☐ Tüm env variables set
☐ Health checks pass
☐ API endpoints responding
☐ Database connected
☐ External services OK

Post-Deployment:
☐ Smoke tests passed
☐ Monitoring alerts active
☐ Logs checked
☐ Performance OK
☐ Users notified
```

---

## 14. Referanslar

- [Heroku Deployment](https://devcenter.heroku.com/)
- [Docker Docs](https://docs.docker.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [GitHub Actions](https://github.com/features/actions)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

---

**Son Güncelleme**: Aralık 2024