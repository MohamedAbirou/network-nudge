# Network Nudge - LinkedIn API Approval Checklist

**Status**: Pre-Approval  
**Target**: Partner API Access (Connections, Profile Updates, Activities)  
**Timeline**: Q1 2026

---

## 1. Data Handling & Privacy ✓

### Required Implementations

- [ ] **Explicit User Consent**
  - [ ] Show data processing consent during signup
  - [ ] Checkbox: "I agree to Network Nudge storing my LinkedIn data"
  - [ ] Link to Privacy Policy (DONE: `PRIVACY_POLICY.md`)
  - [ ] Store consent timestamp in `user_consents` table
  - [ ] Require re-consent if privacy policy changes

- [ ] **Data Minimization**
  - [ ] Only request OAuth scopes: `openid profile email` (plus LinkedIn API scopes)
  - [ ] Don't request: `w_member_social` (no posting)
  - [ ] Don't request: `w_member_messaging` (no messaging)
  - [ ] Document all scopes in Privacy Policy

- [ ] **Data Deletion (Right to Erasure)**
  - [ ] Create `DELETE /api/user/data` endpoint
  - [ ] Deletes: account, connections, activities, tokens
  - [ ] Execution time: within 30 days of request
  - [ ] Logs deletion for compliance audit
  - [ ] Return confirmation email

- [ ] **Data Retention Policy**
  - [ ] Connections data: 24 months (deleted if no activity)
  - [ ] Activities: 12 months
  - [ ] Tokens: Deleted on account deletion or revocation
  - [ ] Audit logs: 12 months
  - [ ] Document in Privacy Policy ✓

- [ ] **Audit Logging**
  - [ ] All data access logged: user_id, timestamp, action
  - [ ] Audit logs table created (see migration)
  - [ ] Admin dashboard to view audit logs
  - [ ] Cannot be modified by users (database triggers)

### Compliance Certifications

- [ ] **GDPR Compliance**
  - [ ] DPA (Data Processing Agreement) with Supabase
  - [ ] Privacy Policy addresses all GDPR rights
  - [ ] Data portability export feature
  - [ ] Breach notification plan (notify users within 72 hours)

- [ ] **CCPA Compliance**
  - [ ] Data deletion endpoint (California consumers)
  - [ ] Opt-out mechanism for data sharing
  - [ ] Privacy policy discloses data sharing
  - [ ] Verify Stripe and other vendors are CCPA-compliant

---

## 2. Security Requirements ✓

### Token Security

- [x] **OAuth 2.0 Implementation** (DONE: `src/lib/linkedin.ts`)
  - [x] Authorization code flow (not implicit)
  - [x] State parameter for CSRF protection
  - [x] PKCE for mobile apps (if applicable)

- [ ] **Token Storage**
  - [ ] Encrypt tokens at rest (Supabase encryption)
  - [ ] Use Supabase's pgsodium extension for encryption
  - [ ] Tokens never logged or exposed in errors
  - [ ] Secrets stored in `.env.local`, never committed

- [ ] **Token Rotation**
  - [ ] Auto-refresh 5 minutes before expiry
  - [ ] Revoke old tokens on logout
  - [ ] Implement rotation schedule (monthly key rotation)

- [ ] **Rate Limiting on Tokens**
  - [ ] Max 3 failed auth attempts = 15-minute lockout
  - [ ] Email notification on suspicious activity
  - [ ] Track token usage per user (daily/monthly limits)

### API Security

- [ ] **Input Validation**
  - [ ] Validate all nudge customization inputs
  - [ ] Sanitize HTML to prevent XSS
  - [ ] Max length limits (headline, message, etc.)
  - [ ] No SQL injection (use parameterized queries)
  - [ ] Schema validation with Zod/Joi

- [ ] **HTTPS & TLS**
  - [ ] HTTPS only (enforce in production)
  - [ ] TLS 1.2+ required
  - [ ] HSTS headers (Strict-Transport-Security)
  - [ ] Certificate pinning (optional, for mobile)

- [ ] **CORS Configuration**
  - [ ] Restrict origins to `networknudge.com` only
  - [ ] No `Access-Control-Allow-Origin: *`
  - [ ] Whitelist external APIs (Stripe, SendGrid)

- [ ] **Authentication & Authorization**
  - [ ] JWT tokens (Supabase Auth)
  - [ ] Row-Level Security (RLS) on all tables
  - [ ] Verify user owns connection/activity before access
  - [ ] API keys never exposed in frontend code

### Application Security

- [ ] **CAPTCHA on Signup**
  - [ ] Integrate Cloudflare Turnstile or hCaptcha
  - [ ] Prevents bot signups
  - [ ] No account takeover attacks

- [ ] **Security Headers**
  - [ ] Content-Security-Policy (CSP)
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-Frame-Options: DENY
  - [ ] Referrer-Policy: strict-origin

- [ ] **Dependency Security**
  - [ ] Run `npm audit` regularly
  - [ ] Update dependencies monthly
  - [ ] Use npm security advisories
  - [ ] GitHub dependabot enabled

- [ ] **Code Review & Testing**
  - [ ] All code reviewed before merge
  - [ ] Unit tests for auth (80%+ coverage)
  - [ ] Security scanning (OWASP ZAP, Burp)
  - [ ] Penetration testing (annually)

---

## 3. API Usage & Rate Limiting ✓

### LinkedIn API Endpoints

- [ ] **Authorized Endpoints**
  - [ ] `GET /v2/me` (User profile)
  - [ ] `GET /v2/connections` (1st-degree connections)
  - [ ] `GET /v2/profileUpdates` (Job changes, anniversaries)
  - [ ] `GET /v2/activities` (Posts, shares)

- [ ] **Rate Limit Compliance**
  - [ ] Respect LinkedIn's rate limits (100 calls/day for some endpoints)
  - [ ] Track API usage per user in `linkedin_api_usage` table
  - [ ] Implement exponential backoff for 429 errors
  - [ ] Cache data (24h for connections) to reduce calls
  - [ ] Document limits in API docs for users

- [ ] **Error Handling**
  - [ ] 401 (Unauthorized): Prompt re-authentication
  - [ ] 403 (Forbidden): Inform user of permission issue
  - [ ] 429 (Rate Limited): Show message, retry later
  - [ ] 500+ errors: Graceful fallback, log for debugging

### API Monitoring

- [ ] **Usage Tracking**
  - [ ] Dashboard showing API calls per user
  - [ ] Alert if user approaches daily limit
  - [ ] Monthly report of total API usage
  - [ ] Predictive scaling (forecast growth)

- [ ] **Fallback Options**
  - [ ] CSV import from LinkedIn's export feature
  - [ ] Manual connection entry for new users
  - [ ] Scheduled syncs (reduce real-time API calls)

---

## 4. Brand & Legal Compliance ✓

### LinkedIn Brand Guidelines

- [ ] **Logo & Branding**
  - [ ] Display LinkedIn logo correctly (see LinkedIn's brand guidelines)
  - [ ] "LinkedIn" not trademarked in app name
  - [ ] "Powered by LinkedIn API" or similar disclaimer
  - [ ] Don't claim affiliation with LinkedIn

- [ ] **Terms & Disclaimers**
  - [ ] Privacy Policy mentions LinkedIn integration (DONE)
  - [ ] Terms of Service clarify app is read-only (DONE)
  - [ ] No misleading claims about posting/messaging
  - [ ] Disclaimer: "Not affiliated with LinkedIn"

- [ ] **Terms of Service** (DONE: `TERMS_OF_SERVICE.md`)
  - [ ] Users must accept ToS before signup
  - [ ] Section 2.2: Clarifies app limitations
  - [ ] Section 15.1: LinkedIn disclaimer
  - [ ] Users certify they own LinkedIn accounts

### App Store Compliance

- [ ] **Web App**
  - [ ] Privacy policy linked from signup
  - [ ] Terms accessible before creating account
  - [ ] Clear account deletion process
  - [ ] Support contact information

- [ ] **Mobile App** (if applicable)
  - [ ] Comply with Apple App Store guidelines
  - [ ] Google Play Store privacy policies
  - [ ] OAuth consent shown in-app
  - [ ] Offline functionality (graceful degradation)

---

## 5. Documentation & Transparency

### User-Facing Documentation

- [ ] **Privacy Policy** (DONE: `PRIVACY_POLICY.md`)
  - [ ] Clear explanation of data collection
  - [ ] User rights (access, delete, export)
  - [ ] Data retention schedule
  - [ ] LinkedIn-specific terms

- [ ] **Terms of Service** (DONE: `TERMS_OF_SERVICE.md`)
  - [ ] API read-only nature
  - [ ] LinkedIn compliance section
  - [ ] Dispute resolution
  - [ ] Data handling guarantees

- [ ] **Help Center / FAQ**
  - [ ] "How is my data protected?"
  - [ ] "Is Network Nudge affiliated with LinkedIn?"
  - [ ] "Can you post on LinkedIn for me?" (NO)
  - [ ] "What if I disconnect LinkedIn?"
  - [ ] GDPR/CCPA rights explanation

- [ ] **In-App Tooltips**
  - [ ] Onboarding tour for new users
  - [ ] Explain each permission request
  - [ ] Show data being collected
  - [ ] Highlight privacy controls

### Developer Documentation

- [ ] **API Documentation**
  - [ ] OpenAPI/Swagger spec
  - [ ] OAuth flow diagram
  - [ ] Error handling guide
  - [ ] Rate limiting details
  - [ ] Code examples (Node.js, Python, etc.)

- [ ] **Security Policy**
  - [ ] Responsible disclosure process
  - [ ] Email: security@networknudge.com
  - [ ] Bounty program (optional)
  - [ ] Response SLA (24-48 hours)

- [ ] **Integration Guide**
  - [ ] How to use Network Nudge API
  - [ ] LinkedIn data sync flow
  - [ ] Webhook examples
  - [ ] Best practices

---

## 6. LinkedIn API Approval Application

### Submission Checklist

- [ ] **Application Form**
  - [ ] App name: Network Nudge
  - [ ] App description (500 chars): "Helps professionals reconnect with their network at the right moments by tracking LinkedIn connections and activities."
  - [ ] App URL: https://networknudge.com
  - [ ] Logo (512x512 transparent PNG)
  - [ ] Support contact: support@networknudge.com

- [ ] **Required Attachments**
  - [ ] Screenshots showing app interface
  - [ ] Privacy Policy URL
  - [ ] Terms of Service URL
  - [ ] Data handling documentation
  - [ ] Security audit results (OWASP ZAP)
  - [ ] LinkedIn brand compliance checklist

- [ ] **API Endpoints Requested**
  - [ ] `GET /v2/me` (User profile)
  - [ ] `GET /v2/connections` (Connections list)
  - [ ] `GET /v2/profileUpdates` (Profile changes)
  - [ ] `GET /v2/activities` (Activity feed)

- [ ] **Usage Forecast**
  - [ ] Estimated connections: 1 million
  - [ ] Estimated API calls: 5 million/month
  - [ ] Peak usage: Mornings (business hours)
  - [ ] Data retention: 12-24 months

- [ ] **Compliance Attestations**
  - [ ] Acknowledge LinkedIn's API Terms
  - [ ] Certify data security practices
  - [ ] Confirm no unauthorized data sharing
  - [ ] Agree to annual audits

### Post-Approval Requirements

- [ ] **Maintain Compliance**
  - [ ] Annual security audit
  - [ ] Monthly API usage reports
  - [ ] Quarterly data handling reviews
  - [ ] Immediate notification of breaches

- [ ] **User Support**
  - [ ] Response time: 24 hours for support
  - [ ] Support email: support@networknudge.com
  - [ ] Help center with LinkedIn-specific FAQs
  - [ ] Status page for API issues

- [ ] **Monitoring & Alerting**
  - [ ] API usage dashboard
  - [ ] Rate limit tracking
  - [ ] Error rate monitoring (alert if >1%)
  - [ ] User feedback loop

---

## 7. Testing & QA

### Security Testing

- [ ] **Penetration Testing**
  - [ ] OWASP ZAP scanning (automated)
  - [ ] Burp Suite manual testing
  - [ ] Third-party security audit
  - [ ] Fix vulnerabilities before approval

- [ ] **Authentication Testing**
  - [ ] Valid OAuth flow
  - [ ] Invalid credentials rejected
  - [ ] Token expiration handled
  - [ ] CSRF protection verified
  - [ ] Session fixation prevented

- [ ] **Data Access Testing**
  - [ ] Users can only see own data
  - [ ] RLS policies enforced
  - [ ] Connection data isolated
  - [ ] Audit logs immutable

### Functional Testing

- [ ] **OAuth Flow**
  - [ ] Redirect to LinkedIn succeeds
  - [ ] Authorization code received
  - [ ] Token exchanged correctly
  - [ ] Callback handles errors (user denies access)

- [ ] **Data Sync**
  - [ ] Connections fetched correctly
  - [ ] Activities synced on schedule
  - [ ] Rate limits respected
  - [ ] Failed syncs retried with backoff

- [ ] **API Error Handling**
  - [ ] 401 errors trigger re-auth
  - [ ] 429 errors retry gracefully
  - [ ] Network errors shown to user
  - [ ] Timeout prevents hanging

### End-to-End Testing

- [ ] **Full User Journey** (Cypress)
  - [ ] Signup → Connect LinkedIn → See connections → Get nudges
  - [ ] Login with existing account
  - [ ] Disconnect LinkedIn
  - [ ] Delete account
  - [ ] Export data

- [ ] **Cross-Browser Testing**
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Edge (latest)
  - [ ] Mobile Safari (iOS)
  - [ ] Chrome Mobile (Android)

---

## 8. Launch Checklist

### Pre-Launch

- [ ] All above sections completed
- [ ] Security audit passed
- [ ] LinkedIn approval granted
- [ ] Legal review completed
- [ ] Documentation published
- [ ] Support team trained
- [ ] Monitoring configured
- [ ] Backup system tested

### Launch Day

- [ ] Production environment verified
- [ ] Database migrations run
- [ ] Edge functions deployed
- [ ] SSL certificate valid
- [ ] DNS updated
- [ ] Monitoring alerts active
- [ ] Incident response plan ready
- [ ] Support team on-call

### Post-Launch

- [ ] Monitor error rates (target: <0.1%)
- [ ] Check API usage metrics
- [ ] Gather user feedback
- [ ] Fix critical bugs immediately
- [ ] Weekly status meetings
- [ ] Monthly analytics review

---

## 9. Success Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| LinkedIn API approval | Granted | Week 3 |
| Zero security vulnerabilities | 0 | Launch |
| API uptime | 99.5% | Launch |
| Data access latency | <500ms | Launch |
| Auth success rate | 99%+ | Ongoing |
| User support response time | <24 hours | Ongoing |
| Security audit completion | 100% | Monthly |

---

## 10. Timeline

**Week 1-2**: Security hardening & testing  
**Week 2-3**: Documentation & LinkedIn approval application  
**Week 3-4**: Beta testing with 20-50 users  
**Week 4**: Final polish & bug fixes  
**Week 5**: General availability launch  

---

## Contact & Support

- **LinkedIn Partner Support**: [Apply here](https://business.linkedin.com/talent-solutions/talent-hub/recruitment-software-certification-program)
- **Security Issues**: security@networknudge.com
- **Support**: support@networknudge.com
- **Legal**: legal@networknudge.com

---

*Last Updated: January 3, 2026*
