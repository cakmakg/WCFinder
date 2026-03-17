#!/bin/bash
# ============================================================================
# WCFinder — Production Readiness Test Runner
# ============================================================================
set -e
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'
REPORT_FILE="PRODUCTION_TEST_REPORT.md"
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0
SKIP_COUNT=0
log_header() {
  echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}${CYAN}  $1${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}
log_pass() {
  echo -e "  ${GREEN}✅ PASS${NC} — $1"
  PASS_COUNT=$((PASS_COUNT + 1))
  echo "- ✅ **PASS** — $1" >> "$REPORT_FILE"
}
log_fail() {
  echo -e "  ${RED}❌ FAIL${NC} — $1"
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "- ❌ **FAIL** — $1" >> "$REPORT_FILE"
}
log_warn() {
  echo -e "  ${YELLOW}⚠️  WARN${NC} — $1"
  WARN_COUNT=$((WARN_COUNT + 1))
  echo "- ⚠️ **WARN** — $1" >> "$REPORT_FILE"
}
log_skip() {
  echo -e "  ${YELLOW}⏭️  SKIP${NC} — $1"
  SKIP_COUNT=$((SKIP_COUNT + 1))
  echo "- ⏭️ **SKIP** — $1" >> "$REPORT_FILE"
}
log_info() {
  echo -e "  ${CYAN}ℹ️${NC}  $1"
}
section_start() {
  echo "" >> "$REPORT_FILE"
  echo "## $1" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
}
cat > "$REPORT_FILE" << 'EOF'
# 🚻 WCFinder — Production Readiness Test Report
**Tarih:** REPORT_DATE
**Proje:** WCFinder (CLIENT + SERVER + MOBILE)
---
EOF
sed -i "s/REPORT_DATE/$(date '+%Y-%m-%d %H:%M:%S')/" "$REPORT_FILE"
echo -e "${BOLD}${CYAN}"
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║   🚻 WCFinder — Production Readiness Test Suite     ║"
echo "  ║   $(date '+%Y-%m-%d %H:%M:%S')                              ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"
# ============================================================================
# 1. PROJE YAPISI
# ============================================================================
log_header "1. PROJE YAPISI KONTROLÜ"
section_start "1. Proje Yapısı Kontrolü"
if [ -d "CLIENT" ] && [ -d "SERVER" ] && [ -d "MOBILE" ]; then
  log_pass "CLIENT, SERVER, MOBILE dizinleri mevcut"
else
  log_fail "Eksik dizin(ler) — CLIENT, SERVER veya MOBILE bulunamadı"
fi
for dir in CLIENT SERVER MOBILE; do
  if [ -f "$dir/package.json" ]; then
    log_pass "$dir/package.json mevcut"
  else
    log_fail "$dir/package.json bulunamadı"
  fi
done
if [ -d "CLIENT/node_modules" ] && [ -d "SERVER/node_modules" ] && [ -d "MOBILE/node_modules" ]; then
  log_pass "Tüm node_modules yüklü"
else
  log_warn "Bazı node_modules eksik — npm install çalıştır"
fi
# ============================================================================
# 2. DEPENDENCY SECURITY AUDIT
# ============================================================================
log_header "2. DEPENDENCY SECURITY AUDIT"
section_start "2. Dependency Security Audit"
for dir in CLIENT SERVER MOBILE; do
  log_info "$dir dependency audit..."
  if [ -f "$dir/package-lock.json" ] || [ -f "$dir/yarn.lock" ]; then
    AUDIT_OUTPUT=$(cd "$dir" && npm audit --json 2>/dev/null || true)
    CRITICAL=$(echo "$AUDIT_OUTPUT" | grep -o '"critical":[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
    HIGH=$(echo "$AUDIT_OUTPUT" | grep -o '"high":[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
    MODERATE=$(echo "$AUDIT_OUTPUT" | grep -o '"moderate":[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")
    if [ "$CRITICAL" -gt 0 ] 2>/dev/null; then
      log_fail "$dir: $CRITICAL critical vulnerability bulundu"
    elif [ "$HIGH" -gt 0 ] 2>/dev/null; then
      log_warn "$dir: $HIGH high severity vulnerability — düzeltilmeli"
    elif [ "$MODERATE" -gt 0 ] 2>/dev/null; then
      log_warn "$dir: $MODERATE moderate vulnerability"
    else
      log_pass "$dir: Kritik vulnerability yok"
    fi
  else
    log_skip "$dir: lock dosyası bulunamadı"
  fi
done
# ============================================================================
# 3. ENVIRONMENT VARIABLE KONTROLÜ
# ============================================================================
log_header "3. ENVIRONMENT VARIABLE KONTROLÜ"
section_start "3. Environment Variable Kontrolü"
if [ -f "SERVER/.env" ]; then
  log_pass "SERVER/.env mevcut"
  REQUIRED_SERVER_VARS=("PORT" "MONGODB" "JWT_SECRET" "ACCESS_KEY" "REFRESH_KEY" "SECRET_KEY" "STRIPE_SECRET_KEY" "PAYPAL_CLIENT_ID")
  for var in "${REQUIRED_SERVER_VARS[@]}"; do
    if grep -q "^${var}=" SERVER/.env 2>/dev/null; then
      VALUE=$(grep "^${var}=" SERVER/.env | cut -d'=' -f2-)
      if [ -z "$VALUE" ] || [ "$VALUE" = '""' ] || [ "$VALUE" = "''" ]; then
        log_warn "SERVER: $var tanımlı ama boş"
      else
        log_pass "SERVER: $var tanımlı"
      fi
    else
      log_warn "SERVER: $var bulunamadı (.env'de)"
    fi
  done
else
  log_fail "SERVER/.env dosyası bulunamadı"
fi
if [ -f "CLIENT/.env" ]; then
  log_pass "CLIENT/.env mevcut"
  if grep -q "VITE_BASE_URL" CLIENT/.env; then
    log_pass "CLIENT: VITE_BASE_URL tanımlı"
  else
    log_fail "CLIENT: VITE_BASE_URL bulunamadı"
  fi
else
  log_warn "CLIENT/.env dosyası bulunamadı"
fi
# ============================================================================
# 4. HARDCODED SECRETS TARAMASI
# ============================================================================
log_header "4. HARDCODED SECRETS TARAMASI"
section_start "4. Hardcoded Secrets Taraması"
log_info "Kaynak kodda hardcoded secret taranıyor..."
SECRET_PATTERNS='(password|secret|api_key|apikey|token|private_key|stripe_secret|paypal_secret)\s*[:=]\s*["\x27][^"\x27]{8,}'
FOUND_SECRETS=0
for dir in CLIENT/src SERVER/src MOBILE/src; do
  if [ -d "$dir" ]; then
    MATCHES=$(grep -rniE "$SECRET_PATTERNS" "$dir" \
      --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" \
      --exclude-dir=node_modules --exclude-dir=__tests__ --exclude-dir=test 2>/dev/null | \
      grep -v "process\.env" | grep -v "import\.meta\.env" | grep -v "VITE_" || true)
    if [ -n "$MATCHES" ]; then
      log_fail "$dir içinde potansiyel hardcoded secret bulundu"
      FOUND_SECRETS=$((FOUND_SECRETS + 1))
    fi
  fi
done
if [ "$FOUND_SECRETS" -eq 0 ]; then
  log_pass "Hardcoded secret bulunamadı"
fi
if [ -f ".gitignore" ]; then
  if grep -q "\.env" .gitignore; then
    log_pass ".gitignore'da .env tanımlı"
  else
    log_fail ".gitignore'da .env yok — secret'lar git'e pushlanabilir!"
  fi
fi
# ============================================================================
# 5. SERVER TESTLERI
# ============================================================================
log_header "5. SERVER TESTLERI (Jest + Supertest)"
section_start "5. Server Testleri"
if [ -d "SERVER" ] && [ -f "SERVER/package.json" ]; then
  if grep -q '"test"' SERVER/package.json; then
    log_info "Server testleri çalıştırılıyor..."
    cd SERVER
    TEST_OUTPUT=$(npm test -- --forceExit --detectOpenHandles 2>&1 || true)
    cd ..
    if echo "$TEST_OUTPUT" | grep -q "Tests:.*passed"; then
      PASSED=$(echo "$TEST_OUTPUT" | grep "Tests:" | grep -oP '\d+ passed' | grep -oP '\d+' || echo "0")
      FAILED=$(echo "$TEST_OUTPUT" | grep "Tests:" | grep -oP '\d+ failed' | grep -oP '\d+' || echo "0")
      if [ "$FAILED" = "0" ] || [ -z "$FAILED" ]; then
        log_pass "Server testleri geçti — $PASSED test passed"
      else
        log_fail "Server testleri: $FAILED test başarısız, $PASSED geçti"
      fi
    else
      log_fail "Server testleri çalıştırılamadı"
    fi
    log_info "Server test coverage kontrol ediliyor..."
    cd SERVER
    COV_OUTPUT=$(npm run test:coverage -- --forceExit --detectOpenHandles 2>&1 || true)
    cd ..
    if echo "$COV_OUTPUT" | grep -q "Stmts"; then
      log_pass "Server coverage raporu oluşturuldu"
      COV_SUMMARY=$(echo "$COV_OUTPUT" | grep "All files" | head -1 || echo "")
      log_info "Coverage: $COV_SUMMARY"
    else
      log_warn "Server coverage raporu oluşturulamadı"
    fi
  else
    log_skip "SERVER package.json'da test script'i bulunamadı"
  fi
else
  log_skip "SERVER dizini bulunamadı"
fi
# ============================================================================
# 6. CLIENT TESTLERI
# ============================================================================
log_header "6. CLIENT TESTLERI (Vitest)"
section_start "6. Client Testleri"
if [ -d "CLIENT" ] && [ -f "CLIENT/package.json" ]; then
  if grep -q '"test"' CLIENT/package.json; then
    log_info "Client testleri çalıştırılıyor..."
    cd CLIENT
    TEST_OUTPUT=$(npm test -- --run 2>&1 || true)
    cd ..
    if echo "$TEST_OUTPUT" | grep -q "passed"; then
      PASSED=$(echo "$TEST_OUTPUT" | grep -oP '\d+ passed' | grep -oP '\d+' | head -1 || echo "0")
      FAILED=$(echo "$TEST_OUTPUT" | grep -oP '\d+ failed' | grep -oP '\d+' | head -1 || echo "0")
      if [ "$FAILED" = "0" ] || [ -z "$FAILED" ]; then
        log_pass "Client testleri geçti — $PASSED test passed"
      else
        log_fail "Client testleri: $FAILED test başarısız"
      fi
    else
      log_fail "Client testleri çalıştırılamadı"
    fi
  else
    log_skip "CLIENT package.json'da test script'i bulunamadı"
  fi
else
  log_skip "CLIENT dizini bulunamadı"
fi
# ============================================================================
# 7. MOBILE TESTLERI
# ============================================================================
log_header "7. MOBILE TESTLERI (Jest + jest-expo)"
section_start "7. Mobile Testleri"
if [ -d "MOBILE" ] && [ -f "MOBILE/package.json" ]; then
  if grep -q '"test"' MOBILE/package.json; then
    log_info "Mobile testleri çalıştırılıyor..."
    cd MOBILE
    TEST_OUTPUT=$(npm test -- --forceExit --watchAll=false 2>&1 || true)
    cd ..
    if echo "$TEST_OUTPUT" | grep -q "Tests:.*passed"; then
      PASSED=$(echo "$TEST_OUTPUT" | grep "Tests:" | grep -oP '\d+ passed' | grep -oP '\d+' || echo "0")
      FAILED=$(echo "$TEST_OUTPUT" | grep "Tests:" | grep -oP '\d+ failed' | grep -oP '\d+' || echo "0")
      if [ "$FAILED" = "0" ] || [ -z "$FAILED" ]; then
        log_pass "Mobile testleri geçti — $PASSED test passed"
      else
        log_fail "Mobile testleri: $FAILED test başarısız"
      fi
    else
      log_fail "Mobile testleri çalıştırılamadı"
    fi
  else
    log_skip "MOBILE package.json'da test script'i bulunamadı"
  fi
else
  log_skip "MOBILE dizini bulunamadı"
fi
# ============================================================================
# 8. CLIENT BUILD KONTROLÜ
# ============================================================================
log_header "8. CLIENT BUILD KONTROLÜ"
section_start "8. Client Build Kontrolü"
if [ -d "CLIENT" ]; then
  log_info "Client production build deneniyor..."
  cd CLIENT
  BUILD_OUTPUT=$(npm run build 2>&1 || true)
  cd ..
  if [ -d "CLIENT/dist" ]; then
    log_pass "Client build başarılı — dist/ oluşturuldu"
    DIST_SIZE=$(du -sh CLIENT/dist | awk '{print $1}')
    log_info "Bundle size: $DIST_SIZE"
    echo "  - Bundle size: $DIST_SIZE" >> "$REPORT_FILE"
    if [ -d "CLIENT/dist/assets" ]; then
      LARGE_FILES=$(find CLIENT/dist/assets -name "*.js" -size +500k 2>/dev/null || true)
      if [ -n "$LARGE_FILES" ]; then
        log_warn "500KB üstü JS dosyaları bulundu — code splitting düşün"
      else
        log_pass "Tüm JS chunk'ları 500KB altında"
      fi
    fi
  else
    log_fail "Client build başarısız"
  fi
fi
# ============================================================================
# 9. LINTING
# ============================================================================
log_header "9. LINTING KONTROLÜ"
section_start "9. Linting Kontrolü"
if [ -d "CLIENT" ] && grep -q '"lint"' CLIENT/package.json 2>/dev/null; then
  log_info "Client lint çalıştırılıyor..."
  cd CLIENT
  LINT_OUTPUT=$(npm run lint 2>&1 || true)
  cd ..
  LINT_ERRORS=$(echo "$LINT_OUTPUT" | grep -c " error " 2>/dev/null || echo "0")
  if [ "$LINT_ERRORS" -eq 0 ] 2>/dev/null; then
    log_pass "Client lint hatasız"
  else
    log_warn "Client lint: ~$LINT_ERRORS error"
  fi
else
  log_skip "Client lint script'i bulunamadı"
fi
# ============================================================================
# 10. SECURITY MIDDLEWARE
# ============================================================================
log_header "10. SECURITY MIDDLEWARE KONTROLÜ"
section_start "10. Security Middleware Kontrolü"
if [ -d "SERVER/src" ]; then
  if grep -rq "helmet" SERVER/package.json 2>/dev/null; then
    log_pass "Helmet dependency mevcut"
  else
    log_fail "Helmet bulunamadı — HTTP security headers eksik"
  fi
  if grep -rq "helmet" SERVER/src/ SERVER/index.js 2>/dev/null; then
    log_pass "Helmet middleware aktif"
  else
    log_warn "Helmet kullanımı kontrol edilmeli"
  fi
  if grep -rq "rate-limit\|rateLimit\|express-rate-limit" SERVER/package.json 2>/dev/null; then
    log_pass "Rate limiting dependency mevcut"
  else
    log_fail "Rate limiting bulunamadı — brute force koruması eksik"
  fi
  if grep -rq "cors" SERVER/package.json 2>/dev/null; then
    log_pass "CORS dependency mevcut"
  else
    log_warn "CORS paketi bulunamadı"
  fi
  if [ -f "SERVER/src/middleware/validation.js" ]; then
    log_pass "Input validation middleware mevcut"
  else
    log_warn "Centralized validation middleware bulunamadı"
  fi
  if [ -f "SERVER/src/middleware/errorHnadler.js" ]; then
    log_pass "Error handler middleware mevcut"
  else
    log_warn "Error handler middleware bulunamadı"
  fi
fi
# ============================================================================
# 11. PAYMENT SECURITY
# ============================================================================
log_header "11. PAYMENT SECURITY KONTROLÜ"
section_start "11. Payment Security Kontrolü"
if [ -d "SERVER/src" ]; then
  if grep -rq "constructEvent\|webhook.*signature\|stripe.*webhook" SERVER/src/ 2>/dev/null; then
    log_pass "Stripe webhook signature verification bulundu"
  else
    log_warn "Stripe webhook signature verification kontrol edilmeli"
  fi
  if grep -rq "sk_test_\|pk_test_" SERVER/src/ 2>/dev/null; then
    log_fail "Kaynak kodda Stripe TEST key'leri hardcoded — env variable kullan"
  else
    log_pass "Stripe key'leri hardcoded değil"
  fi
  if grep -rq "paypal\|PayPal" SERVER/src/ 2>/dev/null; then
    log_pass "PayPal entegrasyonu mevcut"
  fi
fi
# ============================================================================
# 12. MOBILE SECURITY
# ============================================================================
log_header "12. MOBILE SECURITY KONTROLÜ"
section_start "12. Mobile Security Kontrolü"
if [ -d "MOBILE/src" ]; then
  if grep -rq "SecureStore\|expo-secure-store" MOBILE/src/ 2>/dev/null; then
    log_pass "Mobile: expo-secure-store kullanılıyor"
  else
    log_warn "Mobile: Token storage kontrol edilmeli"
  fi
  if grep -rq "AsyncStorage.*token\|token.*AsyncStorage" MOBILE/src/ 2>/dev/null; then
    log_fail "Mobile: Token'lar AsyncStorage'da saklanıyor — SecureStore kullan!"
  else
    log_pass "Mobile: Token'lar AsyncStorage'da saklanmıyor"
  fi
  CONSOLE_LOGS=$(grep -rn "console\.\(log\|debug\|info\)" MOBILE/src/ \
    --include="*.ts" --include="*.tsx" 2>/dev/null | \
    grep -v "__DEV__" | grep -v "logger" | grep -v "__tests__" | wc -l || echo "0")
  if [ "$CONSOLE_LOGS" -gt 0 ] 2>/dev/null; then
    log_warn "Mobile: $CONSOLE_LOGS unguarded console.log bulundu — __DEV__ ile wrap et"
  else
    log_pass "Mobile: console.log'lar düzgün guard edilmiş"
  fi
fi
# ============================================================================
# 13. DATABASE MODEL KONTROLÜ
# ============================================================================
log_header "13. DATABASE MODEL KONTROLÜ"
section_start "13. Database Model Kontrolü"
if [ -d "SERVER/src" ]; then
  MODEL_COUNT=$(find SERVER/src -name "*.js" -path "*/model*" 2>/dev/null | wc -l)
  log_info "$MODEL_COUNT model dosyası bulundu"
  INDEX_COUNT=$(grep -rn "\.index\|index:\s*true\|unique:\s*true" SERVER/src/ \
    --include="*.js" 2>/dev/null | grep -v node_modules | wc -l || echo "0")
  log_info "$INDEX_COUNT index tanımı bulundu"
  if [ "$INDEX_COUNT" -gt 0 ] 2>/dev/null; then
    log_pass "Database index'leri tanımlı"
  else
    log_warn "Database index'leri kontrol edilmeli"
  fi
fi
# ============================================================================
# 14. TYPESCRIPT (MOBILE)
# ============================================================================
log_header "14. TYPESCRIPT KONTROL (MOBILE)"
section_start "14. TypeScript Kontrol"
if [ -f "MOBILE/tsconfig.json" ]; then
  log_info "Mobile TypeScript kontrolü..."
  cd MOBILE
  TSC_OUTPUT=$(npx tsc --noEmit 2>&1 || true)
  cd ..
  TSC_ERRORS=$(echo "$TSC_OUTPUT" | grep -c "error TS" 2>/dev/null || echo "0")
  if [ "$TSC_ERRORS" -eq 0 ] 2>/dev/null; then
    log_pass "Mobile: TypeScript hata yok"
  else
    log_warn "Mobile: $TSC_ERRORS TypeScript hatası bulundu"
  fi
else
  log_skip "MOBILE/tsconfig.json bulunamadı"
fi
# ============================================================================
# 15. PRODUCTION CONFIG
# ============================================================================
log_header "15. PRODUCTION CONFIG KONTROLÜ"
section_start "15. Production Config Kontrolü"
if [ -f "CLIENT/vercel.json" ] || [ -f "vercel.json" ]; then
  log_pass "Vercel config mevcut"
else
  log_info "vercel.json bulunamadı — Vercel dashboard'dan yapılandırılabilir"
fi
if [ -f "render.yaml" ] || [ -f "SERVER/render.yaml" ]; then
  log_pass "Render config mevcut"
else
  log_info "render.yaml bulunamadı — Render dashboard'dan yapılandırılabilir"
fi
if grep -q '"start"' SERVER/package.json 2>/dev/null; then
  log_pass "Server: start script tanımlı"
else
  log_fail "Server: start script bulunamadı — deployment'ta sorun olur"
fi
if grep -rq "NODE_ENV\|process\.env\.NODE_ENV" SERVER/src/ SERVER/index.js 2>/dev/null; then
  log_pass "Server: NODE_ENV kullanılıyor"
else
  log_warn "Server: NODE_ENV referansı bulunamadı"
fi
# ============================================================================
# ÖZET
# ============================================================================
log_header "ÖZET RAPOR"
TOTAL=$((PASS_COUNT + FAIL_COUNT + WARN_COUNT + SKIP_COUNT))
echo ""
echo -e "  ${GREEN}✅ Passed:   $PASS_COUNT${NC}"
echo -e "  ${RED}❌ Failed:   $FAIL_COUNT${NC}"
echo -e "  ${YELLOW}⚠️  Warnings: $WARN_COUNT${NC}"
echo -e "  ${YELLOW}⏭️  Skipped:  $SKIP_COUNT${NC}"
echo -e "  ${BOLD}📊 Toplam:   $TOTAL kontrol${NC}"
echo ""
if [ "$FAIL_COUNT" -eq 0 ]; then
  echo -e "  ${GREEN}${BOLD}🎉 Production'a geçiş için kritik blocker yok!${NC}"
  echo -e "  ${YELLOW}Warning'ları düzeltmek önerilir ama zorunlu değil.${NC}"
else
  echo -e "  ${RED}${BOLD}🚫 $FAIL_COUNT kritik sorun düzeltilmeden production'a geçme!${NC}"
fi
cat >> "$REPORT_FILE" << EOF
---
## Özet
| Durum | Sayı |
|-------|------|
| ✅ Passed | $PASS_COUNT |
| ❌ Failed | $FAIL_COUNT |
| ⚠️ Warning | $WARN_COUNT |
| ⏭️ Skipped | $SKIP_COUNT |
| **Toplam** | **$TOTAL** |
---
### Sonraki Adımlar
1. **❌ FAIL** olan tüm maddeleri düzelt
2. **⚠️ WARN** maddelerini gözden geçir
3. Manuel olarak Stripe/PayPal test payment flow'unu end-to-end dene
4. Staging ortamında deploy et ve smoke test yap
5. Production deploy
*Bu rapor \`production-test-runner.sh\` tarafından otomatik oluşturulmuştur.*
EOF
echo ""
echo -e "  ${CYAN}📄 Detaylı rapor: ${BOLD}$REPORT_FILE${NC}"
echo ""
