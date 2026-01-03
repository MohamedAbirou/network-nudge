# Network Nudge - Developer Quick Reference

**Print this page and check off as you complete each task**

---

## 🚀 Phase 1: Critical Path (This Week)

### LinkedIn API Integration
- [ ] Run `supabase functions deploy linkedin-exchange-token`
- [ ] Test OAuth flow with dev LinkedIn app
- [ ] Verify tokens stored in `user_credentials` table
- [ ] Add LinkedIn connect button to Settings page
- [ ] Test token refresh on expiry
- [ ] Verify rate limiting tracking in DB

### Security & Privacy
- [ ] Deploy database migrations:
  ```bash
  supabase migration up
  ```
- [ ] Verify new tables created:
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name LIKE '%audit%';
  ```
- [ ] Add CAPTCHA library: `npm install @marsidev/react-turnstile`
- [ ] Integrate CAPTCHA in Signup form
- [ ] Add input validation with Zod
- [ ] Test data deletion endpoint

### Testing Setup
- [ ] Install test dependencies:
  ```bash
  npm install --save-dev jest ts-jest @testing-library/react vitest
  ```
- [ ] Run tests: `npm run test`
- [ ] Verify coverage report
- [ ] Setup Cypress: `npm install --save-dev cypress`

### Environment Configuration
- [ ] Create `.env.local` with all dev variables
- [ ] Add Stripe test keys
- [ ] Add LinkedIn dev app credentials
- [ ] Verify all env vars present: `npm run verify-env`

---

## 📱 Phase 2: Professional Features (Week 2-3)

### Team Plan Database
- [ ] Run team schema migration
- [ ] Verify RLS policies created:
  ```sql
  SELECT schemaname, tablename, policyname 
  FROM pg_policies WHERE tablename LIKE 'team%';
  ```
- [ ] Test team helper functions in psql

### Landing Page Integration
- [ ] Update `Router.tsx` to show LandingPage at `/`
- [ ] Test landing page renders correctly
- [ ] Connect email signup form to provider
- [ ] Add Google Analytics tracking
- [ ] Test mobile responsiveness

### Team Features UI
- [ ] Create `TeamSettings.tsx` component
- [ ] Build team member list view
- [ ] Implement invite modal
- [ ] Create role management UI
- [ ] Add team switching in navigation

### Production Environment
- [ ] Create Vercel project (staging)
- [ ] Add environment variables to Vercel
- [ ] Configure GitHub auto-deploy
- [ ] Test staging deployment
- [ ] Register production domain
- [ ] Setup DNS records

---

## 🔒 Phase 3: Advanced Features (Week 3-4)

### Monitoring Setup
- [ ] Install Sentry: `npm install @sentry/react`
- [ ] Initialize Sentry in `main.tsx`
- [ ] Create error boundary component
- [ ] Setup Healthchecks.io account
- [ ] Create health check endpoint
- [ ] Configure uptime alerts

### Performance Optimization
- [ ] Add Redis instance (Upstash)
- [ ] Implement caching service
- [ ] Setup email queue (Bull)
- [ ] Optimize slow queries
- [ ] Configure CDN

### Analytics & Documentation
- [ ] Implement WebSocket subscription
- [ ] Create analytics dashboard
- [ ] Write Help Center articles
- [ ] Create video tutorials
- [ ] Build FAQ section

---

## ✅ Pre-Launch Checklist

### Code Quality
- [ ] Run all tests: `npm run test -- --coverage`
- [ ] Coverage above 70%: `npm run test -- --coverage`
- [ ] No lint errors: `npm run lint`
- [ ] Security audit clean: `npm audit`
- [ ] E2E tests passing: `npm run cypress:run`

### Security
- [ ] HTTPS enabled on all environments
- [ ] Security headers configured
- [ ] CAPTCHA working on signup
- [ ] RLS policies tested
- [ ] Tokens encrypted in DB
- [ ] No secrets in code/env files

### Performance
- [ ] Page load <1s (Core Web Vitals)
- [ ] API response <200ms (P95)
- [ ] Database queries optimized
- [ ] Images compressed & lazy-loaded
- [ ] JS/CSS minified

### Documentation
- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] API docs completed
- [ ] Help Center accessible
- [ ] Video tutorials created

### LinkedIn Compliance
- [ ] Privacy Policy links LinkedIn disclaimers ✓
- [ ] Terms mention read-only nature ✓
- [ ] "Not affiliated with LinkedIn" displayed
- [ ] Data handling documented ✓
- [ ] User consent captured ✓

---

## 🛠️ Useful Commands

### Development
```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Test prod build locally
npm run lint             # Check code quality
npm run type-check       # TypeScript validation
```

### Testing
```bash
npm run test             # Run all tests
npm run test -- --watch  # Watch mode
npm run test -- --coverage  # Coverage report
npm run cypress:open     # Interactive E2E tests
npm run cypress:run      # Headless E2E tests
```

### Database
```bash
supabase start           # Start local Supabase
supabase migration up    # Run migrations
supabase migration new   # Create new migration
supabase push            # Push to remote
```

### Environment
```bash
npm run verify-env       # Check all env vars
npm run build            # Verify build works
npm run preview          # Test production build
```

---

## 📋 Important File Locations

| What | Where | Status |
|------|-------|--------|
| LinkedIn API | `src/lib/linkedin.ts` | ✅ Complete |
| OAuth Callback | `src/pages/LinkedInCallback.tsx` | ✅ Complete |
| Settings UI | `src/pages/EnhancedSettings.tsx` | ✅ Complete |
| Landing Page | `src/pages/LandingPage.tsx` | ✅ Complete |
| Team Schema | `supabase/migrations/20260103_add_team_plan_schema.sql` | ✅ Complete |
| Security Schema | `supabase/migrations/20260103_add_linkedin_security.sql` | ✅ Complete |
| OAuth Tests | `src/__tests__/lib/linkedin.test.ts` | ✅ Complete |
| Env Guide | `ENVIRONMENT_SETUP.md` | ✅ Complete |
| Privacy Policy | `PRIVACY_POLICY.md` | ✅ Complete |
| Terms of Service | `TERMS_OF_SERVICE.md` | ✅ Complete |
| Implementation Guide | `IMPLEMENTATION_GUIDE.md` | ✅ Complete |
| LinkedIn Checklist | `LINKEDIN_APPROVAL_CHECKLIST.md` | ✅ Complete |
| Roadmap | `PRODUCTION_ROADMAP.md` | ✅ Complete |

---

## 🔑 Key Environment Variables

```bash
# Frontend (Vite)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_LINKEDIN_CLIENT_ID=
VITE_STRIPE_PUBLIC_KEY=
VITE_SENTRY_DSN=
VITE_API_URL=

# Backend (Supabase Edge Functions)
LINKEDIN_CLIENT_SECRET=
LINKEDIN_REDIRECT_URI=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SENDGRID_API_KEY=
STRIPE_SECRET_KEY=
```

---

## 🎯 Daily Standup Template

**Date**: _______  
**Sprint**: Phase 1 / Phase 2 / Phase 3

### Completed
- [ ] List tasks done
- [ ] Mark tests/code review

### In Progress
- [ ] Current blockers?
- [ ] Help needed?

### Next
- [ ] Priority for today
- [ ] Dependencies?

### Notes
- [ ] Performance issues?
- [ ] Security concerns?

---

## 🆘 Troubleshooting

### OAuth Flow Not Working
1. Verify `VITE_LINKEDIN_CLIENT_ID` set correctly
2. Check redirect URI matches LinkedIn app settings
3. Look for errors in browser console
4. Check `linkedinExchangeToken` edge function logs

### Database Migration Failed
1. Check migration syntax with: `supabase migration list`
2. View migration status: `SELECT * FROM schema_migrations;`
3. Look at logs: `supabase logs push`
4. Manual fix if needed: SSH to DB

### Tests Failing
1. Check Node version: `node --version` (should be 18+)
2. Clear cache: `rm -rf node_modules/.cache`
3. Reinstall deps: `npm install`
4. Check test file syntax

### Production Build Error
1. Check TypeScript: `npm run type-check`
2. Check imports are correct
3. Ensure env vars set: `npm run verify-env`
4. Try clean build: `rm -rf dist && npm run build`

---

## 📞 Contact

- **Security Issues**: security@networknudge.com
- **Technical Help**: GitHub Issues
- **Team Slack**: #dev-help channel
- **Product Clarification**: Product manager

---

## 📅 Weekly Milestones

**Week 1** (This Week)
- [ ] OAuth integration working
- [ ] All Phase 1 databases migrated
- [ ] Tests > 70% coverage
- [ ] Landing page integrated

**Week 2**
- [ ] Team features UI done
- [ ] Production environment ready
- [ ] CAPTCHA integrated
- [ ] Beta user recruitment starts

**Week 3**
- [ ] Monitoring tools live
- [ ] Performance optimized
- [ ] Documentation complete
- [ ] Security audit passed

**Week 4**
- [ ] Bug fixes & polish
- [ ] Load testing passed
- [ ] Staging approval
- [ ] Ready for launch

**Week 5**
- [ ] Production deployment
- [ ] Monitor metrics
- [ ] Support team training
- [ ] General availability

---

**Print & Post on Your Desk! 📌**

*Last Updated: January 3, 2026*
