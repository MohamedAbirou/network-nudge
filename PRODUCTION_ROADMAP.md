# Network Nudge - Production Readiness Roadmap

**Status**: MVP → Production-Ready SaaS  
**Target Launch Date**: Q1 2026  
**LinkedIn API Approval**: Pending full implementation

---

## Phase 1: Critical Path (Weeks 1-2)
Must complete before accepting real users.

### 1. Real LinkedIn API Integration
**Current State**: Demo mode with mock data  
**Target State**: OAuth 2.0, token management, API endpoints  

- [ ] **LinkedIn OAuth 2.0 Implementation**
  - Set up auth code flow with `authorization_code` grant
  - Token refresh mechanism (LinkedIn tokens expire in 60 days)
  - Store refresh tokens encrypted in `user_credentials` table
  - Handle 401/403 errors gracefully with token re-auth flow

- [ ] **API Endpoints to Implement**
  - `GET /v2/me` - User profile (name, headline, profile picture)
  - `GET /v2/connections` - 1st degree connections (paginated, rate-limited to 100 calls/day)
  - `GET /v2/organizationalAcHow` - Company changes, job changes
  - `GET /v2/activities` - Recent posts, share activity
  - Add CSV import fallback for manual LinkedIn exports

- [ ] **Rate Limiting & Error Handling**
  - Queue LinkedIn API calls (implement job queue via Supabase or Bull)
  - Respect 100 calls/day limit per endpoint per user
  - Handle 429 (throttling) with exponential backoff
  - Cache connection data for 24h to reduce API calls

- [ ] **Token Security**
  - Encrypt stored refresh tokens with `libsodium` or AWS KMS
  - Never expose tokens in client-side code
  - Validate token permissions on server-side only

### 2. Security & Compliance Hardening
**Current State**: RLS enabled but incomplete privacy/logging  
**Target State**: GDPR/CCPA compliant, encrypted, audited

- [ ] **Data Privacy**
  - [ ] Add explicit opt-in for LinkedIn token storage during signup
  - [ ] Create privacy policy page (include data retention, deletion rights)
  - [ ] Implement data deletion endpoint (delete user + all activities on request)
  - [ ] Add audit log table: `CREATE TABLE audit_logs (id uuid, user_id uuid, action text, timestamp)`
  - [ ] Log all data access: nudge views, analytics reads, exports

- [ ] **Input Validation & XSS Prevention**
  - [ ] Add CAPTCHA to signup form (Cloudflare Turnstile or hCaptcha)
  - [ ] Validate/sanitize nudge customization inputs (length limits, no scripts)
  - [ ] Add CSP headers to prevent XSS attacks
  - [ ] Validate all API inputs server-side (zod/joi schemas)

- [ ] **Token/Credential Security**
  - [ ] Encrypt LinkedIn tokens at rest (use pgsodium if on Supabase)
  - [ ] Remove test tokens from `.env` files, use Vault
  - [ ] Add rate limiting on login/signup (prevent brute force)
  - [ ] Implement password reset with 24h expiry links

- [ ] **Monitoring & Alerting**
  - [ ] Integrate Sentry for error tracking
  - [ ] Add uptime monitoring (Healthchecks.io, Pingdom)
  - [ ] Email alerts for: failed nudge generations, API quota exceeded, failed payments

### 3. Testing Infrastructure
**Current State**: No automated tests  
**Target State**: Unit + integration + E2E coverage for critical paths

- [ ] **Unit Tests (Jest)**
  - Auth service (login, signup, token refresh)
  - Nudge generation logic
  - Analytics calculations

- [ ] **Integration Tests**
  - Database queries with real schema
  - Email sending (mocked)
  - Stripe webhook handling

- [ ] **E2E Tests (Cypress)**
  - Full user flow: signup → connect LinkedIn → generate nudges
  - Settings updates and dashboard functionality

---

## Phase 2: Professional Features (Weeks 2-3)
High-value additions that unlock revenue and scalability.

### 4. Team Plan Features & Multi-User Sharing
**Current State**: Single-user only  
**Target State**: Team collaboration with roles and shared resources

- [ ] **User Roles & Permissions**
  - Create `user_roles` table: `owner | admin | member`
  - Add RLS policies for each role
  - Only admins can manage team members

- [ ] **Team Invites & Management**
  - Create team invite endpoint with email links
  - Auto-create team on first signup
  - Invite flow with role selection

- [ ] **Shared Dashboards**
  - Shared analytics view for team
  - CSV export of all team's engagements

- [ ] **Stripe Integration for Teams**
  - Update billing to use Stripe customer objects for teams
  - Add team-level subscription (vs. user)
  - Implement seat-based pricing ($29 base + $10/seat)

### 5. Marketing Landing Page
**Current State**: None  
**Target State**: Conversion-focused homepage

- [ ] **Hero Section**
  - Headline: "Never Miss a Chance to Reconnect"
  - Subheading: Focus on nudging users about right moments
  - CTA: "Get Started Free" button

- [ ] **Features Section**
  - Real connection tracking
  - AI-powered timing suggestions
  - Team collaboration
  - Mobile-friendly design

- [ ] **Pricing Section**
  - Free: 5 nudges/month
  - Pro: $9/month (unlimited, analytics)
  - Team: $29/month + $10/seat

- [ ] **Trust Signals**
  - Logo (create simple lockup)
  - "LinkedIn API Certified" badge (after approval)
  - Customer testimonials (collect during beta)

- [ ] **SEO & Legal**
  - Add canonical tags, meta descriptions
  - Link to privacy policy, ToS, refund policy

### 6. Production Environment Setup
**Current State**: Demo with test API keys  
**Target State**: Staging + production environments

- [ ] **Environment Configuration**
  - Create `.env.production` with live LinkedIn + Stripe keys
  - Set `VITE_API_URL` to production backend
  - Database replication for HA
  - CDN for static assets

- [ ] **Stripe Migration**
  - Switch from test to live keys
  - Enable webhook signing verification
  - Test subscription lifecycle: create → renew → cancel

- [ ] **Database Backups & Recovery**
  - Enable automated daily backups (Supabase: managed)
  - Test restore procedures monthly
  - PITR (Point-in-Time Recovery) enabled

- [ ] **CI/CD Pipeline**
  - GitHub Actions for automated testing on PR
  - Staging deploy on merge to `develop`
  - Manual approval for production deploys
  - Automated rollback on failed health checks

---

## Phase 3: Advanced Features (Weeks 3-4)
Performance, analytics depth, and polish.

### 7. Performance Optimizations
**Current State**: No caching, single DB, unoptimized queries  
**Target State**: Sub-1s page loads, handle 10K+ users

- [ ] **Database Optimization**
  - Add indexes on `user_id`, `activity_timestamp`, `connection_name`
  - Implement materialized views for analytics (refresh hourly)
  - Read replicas for analytics queries

- [ ] **Caching Layer**
  - Redis for: user connections (TTL 24h), nudge suggestions (TTL 1h)
  - Cache invalidation on API syncs

- [ ] **API Response Optimization**
  - Pagination for activities (default 50, max 200)
  - GraphQL or `?fields=id,name,date` to limit payload
  - Gzip compression, minified JS/CSS

- [ ] **Email Queue Optimization**
  - Move email sends to async job queue (Bull or Temporal)
  - Batch emails hourly to reduce SendGrid API calls
  - Implement unsubscribe links, bounce handling

### 8. Analytics Depth & Real-Time Updates
**Current State**: Basic metrics, static views  
**Target State**: Real-time metrics, actionable insights

- [ ] **Enhanced Metrics**
  - Add "health score" calculation (based on real data, not mocked)
  - Response rate tracking with timestamps
  - Engagement trends (weekly/monthly)
  - A/B test: nudge frequency vs. response rate

- [ ] **Real-Time Updates**
  - WebSocket subscription for activity feeds
  - Live notification badges
  - Push notifications on key events (birthday approaching, job change)

- [ ] **Export Features**
  - CSV export of engagements (for CRM integration)
  - Scheduled email reports (daily/weekly digest)

### 9. Documentation & Support
**Current State**: README only  
**Target State**: Full user + developer docs, help center

- [ ] **User-Facing Docs**
  - [ ] Onboarding guide (video + interactive walkthrough)
  - [ ] FAQ page (15-20 common questions)
  - [ ] Help center with search (Intercom or self-hosted)
  - [ ] In-app tooltips for new users
  - [ ] Video tutorials for key features

- [ ] **Developer Docs**
  - [ ] API documentation (OpenAPI/Swagger)
  - [ ] OAuth setup guide for third-party integrations
  - [ ] Database schema documentation
  - [ ] Local development setup guide

- [ ] **Legal & Compliance**
  - [ ] Privacy Policy (GDPR, CCPA, data retention)
  - [ ] Terms of Service (usage restrictions, disclaimers)
  - [ ] Refund Policy (30-day money-back guarantee suggested)
  - [ ] LinkedIn API usage disclaimer (clarify app doesn't post/message for you)

---

## LinkedIn API Approval Requirements
**Target**: Approval for Partner Tier access (connections, profile updates, activity)

### LinkedIn Compliance Checklist
- [ ] **API Usage**
  - Only pull data, never post/message without explicit user action
  - Display LinkedIn logo and brand correctly (linked-in.com/legal/branding)
  - Add disclaimer: "This app is not affiliated with LinkedIn"

- [ ] **Data Handling**
  - Encrypt LinkedIn tokens at rest
  - Delete user data within 30 days of account deletion
  - Provide data download/export to users
  - Implement usage dashboard showing API calls

- [ ] **Security**
  - Pass LinkedIn's security audit (Burp scan, OAuth validation)
  - Implement HTTPS everywhere
  - No hardcoded secrets

- [ ] **Terms & Privacy**
  - Explicitly state app pulls LinkedIn data (with consent)
  - Clarify app doesn't send messages or posts on behalf of users
  - Link to LinkedIn's Developer Agreement

- [ ] **Approval Application**
  - Submit via LinkedIn developers portal with:
    - App description (500 chars)
    - Marketing materials / landing page
    - Privacy policy URL
    - Support contact (email + response time SLA)
    - API usage forecast (e.g., 1M connections/month)

---

## Success Metrics
- [ ] All critical tests passing (100% coverage on auth, nudges)
- [ ] Page load time < 1s (Core Web Vitals: CLS, FID, LCP)
- [ ] Zero security vulnerabilities (OWASP top 10 cleared)
- [ ] LinkedIn API approval granted
- [ ] 100+ beta users with 50%+ activation rate
- [ ] NPS score > 40
- [ ] Uptime > 99.5%

---

## Timeline
- **Jan 3-10**: Phases 1 (critical), start Phase 2
- **Jan 11-17**: Complete Phase 2, begin Phase 3
- **Jan 18-24**: Finish Phase 3, polish & bug fixes
- **Jan 25-31**: Beta launch, gather feedback
- **Feb 1**: General availability

---

## Budget Considerations
- **Sentry**: $29/month (error tracking)
- **Healthchecks.io**: $5/month (uptime monitoring)
- **SendGrid**: $5-20/month (email sending)
- **Redis (Upstash)**: $10/month (caching)
- **AWS KMS** (token encryption): $1/month
- **Cloudflare Turnstile**: Free (CAPTCHA)

**Total monthly ops**: ~$50/month

---

## Next Steps
1. Start Phase 1 immediately (OAuth, security, testing)
2. Parallel Path: Design landing page in Figma
3. Week 2: Submit LinkedIn API approval application
4. Week 3: Beta testing with 20-50 users
5. Week 4: GA launch
