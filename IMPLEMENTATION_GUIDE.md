# Network Nudge - Implementation Guide for Developers

**Purpose**: Step-by-step guide for completing Phase 1-3 production enhancements  
**Target Audience**: Backend/frontend developers  
**Timeline**: 4 weeks to production-ready MVP

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Phase 1: Core Production Features (Week 1-2)](#phase-1)
3. [Phase 2: Professional Features (Week 2-3)](#phase-2)
4. [Phase 3: Advanced Features (Week 3-4)](#phase-3)
5. [Deployment & Testing](#deployment)
6. [Post-Launch](#post-launch)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL 14+
- Supabase CLI
- Git

### Project Setup

```bash
# Clone repository
git clone https://github.com/your-org/network-nudge.git
cd network-nudge

# Install dependencies
npm install

# Setup Supabase locally
supabase start

# Create environment file
cp .env.example .env.local

# Run development server
npm run dev
```

### Environment Setup

1. **LinkedIn App Creation**
   - Go to [linkedin.com/developers](https://www.linkedin.com/developers)
   - Create app: "Network Nudge"
   - Add redirect URI: `http://localhost:5173/auth/linkedin/callback`
   - Get Client ID and Secret
   - Add to `.env.local`

2. **Stripe Account**
   - Sign up at [stripe.com](https://stripe.com)
   - Get test keys from dashboard
   - Add to `.env.local`

3. **Supabase Project**
   - Create project at [supabase.com](https://supabase.com)
   - Enable RLS on all tables
   - Copy connection URL and anon key
   - Add to `.env.local`

---

## Phase 1: Core Production Features (Weeks 1-2)

### 1.1 Real LinkedIn API Integration

**Status**: In Progress (Foundational code created)  
**Files**: `src/lib/linkedin.ts`, `supabase/functions/linkedin-exchange-token/index.ts`

#### Tasks

- [x] Create LinkedIn API client (`linkedin.ts`)
- [x] Implement OAuth 2.0 authorization flow
- [x] Token exchange and refresh logic
- [x] Rate limiting framework
- [ ] **TODO**: Deploy edge function
  ```bash
  supabase functions deploy linkedin-exchange-token
  ```

- [ ] **TODO**: Update Router to include callback route
  ```typescript
  // src/components/Router.tsx
  import LinkedInCallback from '../pages/LinkedInCallback';
  
  <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
  ```

- [ ] **TODO**: Add LinkedIn connection button to Settings
  ```typescript
  // src/pages/Settings.tsx
  <button onClick={handleConnectLinkedIn}>
    Connect LinkedIn
  </button>
  ```

#### Testing

```bash
# Test OAuth flow
npm run dev
# Navigate to http://localhost:5173/settings
# Click "Connect LinkedIn"
# Verify redirect to LinkedIn OAuth
# Check token stored in database
```

---

### 1.2 Security & Compliance Enhancements

**Status**: Infrastructure Created  
**Files**: Migrations, EnhancedSettings.tsx, Privacy Policy, Terms of Service

#### Tasks

- [x] Create audit logs table
- [x] Create privacy consent table
- [x] Write comprehensive Privacy Policy
- [x] Write comprehensive Terms of Service

- [ ] **TODO**: Run database migrations
  ```bash
  supabase migration up
  # Or manually run SQL files from supabase/migrations/
  ```

- [ ] **TODO**: Add CAPTCHA to signup form
  ```typescript
  // src/pages/Signup.tsx
  import { Turnstile } from '@marsidev/react-turnstile';
  
  <Turnstile 
    siteKey={import.meta.env.VITE_TURNSTILE_KEY}
    onSuccess={(token) => setCaptchaToken(token)}
  />
  ```

- [ ] **TODO**: Add input validation for nudges
  ```typescript
  // src/lib/validation.ts
  import { z } from 'zod';
  
  const nudgeSchema = z.object({
    message: z.string().max(500),
    connectionId: z.string().uuid(),
  });
  ```

- [ ] **TODO**: Configure security headers (Vite config)
  ```typescript
  // vite.config.ts
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    }
  }
  ```

#### Testing

```bash
# Verify audit logs
SELECT * FROM audit_logs WHERE user_id = '...' LIMIT 10;

# Check privacy consent
SELECT * FROM user_consents WHERE user_id = '...';
```

---

### 1.3 Testing Infrastructure

**Status**: Configuration Created  
**Files**: `jest.config.js`, `src/__tests__/lib/linkedin.test.ts`

#### Tasks

- [ ] **TODO**: Install testing dependencies
  ```bash
  npm install --save-dev jest ts-jest @testing-library/react @testing-library/jest-dom vitest
  ```

- [ ] **TODO**: Setup Jest
  ```bash
  # jest.config.js already created
  npm run test -- --coverage
  ```

- [ ] **TODO**: Create auth tests
  ```bash
  # Create src/__tests__/lib/auth.test.ts
  # Test: signup, login, logout, password reset
  ```

- [ ] **TODO**: Setup Cypress for E2E
  ```bash
  npm install --save-dev cypress
  npx cypress open
  # Record signup → LinkedIn connect → nudge generation flow
  ```

#### Coverage Targets
- Auth: 95%+
- LinkedIn API: 85%+
- Nudge generation: 80%+
- Overall: 70%+

---

## Phase 2: Professional Features (Weeks 2-3)

### 2.1 Team Plan Architecture

**Status**: Schema Created  
**Files**: `supabase/migrations/20260103_add_team_plan_schema.sql`

#### Tasks

- [ ] **TODO**: Run team schema migration
  ```bash
  # Execute SQL migration in Supabase
  ```

- [ ] **TODO**: Create Team service
  ```typescript
  // src/lib/teamService.ts
  export async function createTeam(name: string, userId: string) {
    const { data, error } = await supabase
      .from('teams')
      .insert({
        owner_id: userId,
        name,
        subscription_plan: 'free'
      })
      .select()
      .single();
    return data;
  }
  ```

- [ ] **TODO**: Build team UI components
  ```typescript
  // src/components/TeamSettings.tsx
  // - Team members list
  // - Invite dialog
  // - Role management
  ```

- [ ] **TODO**: Implement invite system
  ```typescript
  // Frontend: Accept invite link
  // Backend: Edge function to create team member
  ```

#### Database Verification

```sql
-- Verify team tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'team%';

-- Test RLS policies
SELECT * FROM teams WHERE owner_id = auth.uid(); -- Should work for owner
```

---

### 2.2 Marketing Landing Page

**Status**: Component Created  
**Files**: `src/pages/LandingPage.tsx`

#### Tasks

- [ ] **TODO**: Update Router to include landing page
  ```typescript
  // src/components/Router.tsx
  import LandingPage from '../pages/LandingPage';
  
  <Route path="/" element={<LandingPage />} />
  ```

- [ ] **TODO**: Update navigation
  - Non-logged-in users see landing page
  - Logged-in users see dashboard

- [ ] **TODO**: Connect waitlist form
  ```typescript
  // Add Mailchimp or SendGrid integration for email list
  ```

- [ ] **TODO**: Add customer testimonials
  - Collect 3-5 testimonials from beta users
  - Add to testimonials section

- [ ] **TODO**: SEO optimization
  ```typescript
  // Add react-helmet for meta tags
  import { Helmet } from 'react-helmet';
  ```

#### Testing

```bash
# Test landing page
npm run dev
# Visit http://localhost:5173
# Check all sections render
# Verify pricing matches backend
```

---

### 2.3 Production Environment Config

**Status**: Configuration Guide Created  
**Files**: `ENVIRONMENT_SETUP.md`

#### Tasks

- [ ] **TODO**: Set up Vercel project
  - Connect GitHub repository
  - Add environment variables from `.env.production`
  - Enable automatic deploys

- [ ] **TODO**: Configure Supabase production instance
  - Create project
  - Run migrations
  - Enable automated backups

- [ ] **TODO**: Setup domain
  - Register `networknudge.com`
  - Configure DNS
  - Enable auto-renewal

- [ ] **TODO**: Configure Stripe for production
  - Switch to live keys
  - Set webhook URL: `https://networknudge.com/api/webhooks/stripe`
  - Test webhook delivery

#### Verification

```bash
# Test production build locally
npm run build
npm run preview

# Check environment variables
npm run verify-env

# Test critical paths
# - Signup with real email
# - Connect LinkedIn (with test app)
# - Create nudge
# - View analytics
```

---

## Phase 3: Advanced Features (Weeks 3-4)

### 3.1 Monitoring & Logging

**Status**: Framework Ready  
**Files**: Configuration files needed

#### Tasks

- [ ] **TODO**: Setup Sentry
  ```bash
  npm install @sentry/react @sentry/tracing
  ```
  ```typescript
  // src/main.tsx
  import * as Sentry from "@sentry/react";
  
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_ENV,
  });
  ```

- [ ] **TODO**: Configure error boundaries
  ```typescript
  // src/components/ErrorBoundary.tsx
  // Catches and reports errors to Sentry
  ```

- [ ] **TODO**: Add performance monitoring
  ```typescript
  // Track page load, navigation, API calls
  ```

- [ ] **TODO**: Setup Healthchecks.io for uptime monitoring
  - Create health check endpoint
  - Configure alerts

#### Metrics Dashboard

- Error rate (target: <0.1%)
- API response time (target: <200ms)
- Uptime (target: 99.5%)
- Database query time (target: <50ms)

---

### 3.2 Performance Optimization

**Status**: Strategy Defined  
**Files**: Configuration needed

#### Tasks

- [ ] **TODO**: Implement Redis caching
  ```bash
  npm install redis ioredis
  ```
  ```typescript
  // Cache: connections (24h TTL), nudges (1h TTL)
  ```

- [ ] **TODO**: Optimize database queries
  - Add missing indexes (done in migration)
  - Implement pagination
  - Use materialized views for analytics

- [ ] **TODO**: Implement email queue
  ```bash
  npm install bullmq
  ```
  ```typescript
  // Queue email sends, batch hourly
  ```

- [ ] **TODO**: Setup CDN for static assets
  - Configure Cloudflare or AWS CloudFront
  - Cache CSS/JS with far-future expires

#### Performance Targets

- Page load: <1s (Core Web Vitals)
- API response: <200ms (P95)
- Email queue: Process within 1 hour
- Cache hit rate: 80%+

---

### 3.3 Analytics & Insights

**Status**: Schema Ready  
**Files**: Analytics queries needed

#### Tasks

- [ ] **TODO**: Create analytics dashboard
  ```typescript
  // src/pages/Analytics.tsx
  // - Real-time metrics (WebSocket)
  // - Network health score
  // - Response rate tracking
  // - Engagement trends
  ```

- [ ] **TODO**: Implement WebSocket for real-time updates
  ```bash
  npm install ws
  ```

- [ ] **TODO**: Create scheduled reports
  ```typescript
  // Daily/weekly email digests
  ```

- [ ] **TODO**: Add A/B testing framework
  - Test nudge frequency vs. response rate
  - Test different message templates

#### Analytics Metrics

- Health score formula: connections / inactivity_days
- Response rate: replied_nudges / total_nudges
- Engagement: actions_taken / nudges_received

---

## Deployment & Testing

### Pre-Production Checklist

```bash
# Run all tests
npm run test -- --coverage

# Run E2E tests
npm run cypress:run

# Security audit
npm audit

# Build for production
npm run build

# Check bundle size
npm run size

# Performance testing
npm run lighthouse
```

### Staging Deployment

```bash
# Push to staging branch
git push origin develop

# Supabase: Apply pending migrations
supabase migration up

# Verify in staging
# - Test full OAuth flow
# - Test team invites
# - Check Stripe webhook
# - Monitor error rate
```

### Production Deployment

```bash
# Merge to main branch (requires PR approval)
git push origin main

# Supabase: Run migrations
# Vercel: Auto-deploys on push
# Monitor: Check Sentry, uptime monitoring

# Post-launch:
# - Gather user feedback
# - Fix critical bugs
# - Monitor performance
```

---

## Post-Launch (Week 5+)

### Immediate Actions (Days 1-3)

- [ ] Monitor error rates (target: <0.1%)
- [ ] Check API usage vs. forecast
- [ ] Gather initial user feedback
- [ ] Fix critical issues immediately
- [ ] Update status page for transparency

### Week 1 Actions

- [ ] Analyze user behavior (analytics)
- [ ] Identify and fix usability issues
- [ ] Optimize top-3 slow queries
- [ ] Improve documentation based on support tickets
- [ ] Release bug-fix hotpatch if needed

### Ongoing (Monthly)

- [ ] Security audit (OWASP ZAP)
- [ ] Dependency updates
- [ ] Database optimization
- [ ] Feature development based on feedback
- [ ] Metrics review (churn, NPS, revenue)

---

## Quick Reference

### Important Files

| File | Purpose | Priority |
|------|---------|----------|
| `src/lib/linkedin.ts` | LinkedIn API client | Critical |
| `src/pages/EnhancedSettings.tsx` | User settings & privacy | High |
| `PRODUCTION_ROADMAP.md` | Implementation timeline | Reference |
| `LINKEDIN_APPROVAL_CHECKLIST.md` | LinkedIn compliance | Critical |
| `PRIVACY_POLICY.md` | Legal & compliance | Critical |
| `TERMS_OF_SERVICE.md` | Legal & compliance | Critical |

### Git Workflow

```bash
# Feature development
git checkout -b feature/my-feature develop

# Commit and push
git commit -m "feat: describe change"
git push origin feature/my-feature

# Create PR on GitHub
# After review, merge to develop
# After staging validation, merge to main
```

### Key Environment Variables

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_LINKEDIN_CLIENT_ID
VITE_STRIPE_PUBLIC_KEY
VITE_SENTRY_DSN
```

### Useful Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests
npm run cypress:open # Run E2E tests
npm run lint         # Check code quality
```

---

## Support & Help

- **Questions**: Open issue on GitHub
- **Security**: Email security@networknudge.com
- **Urgent**: Contact team on Slack

---

*Last Updated: January 3, 2026*
