# Environment Configuration Guide

This document explains how to configure Network Nudge for different environments: development, staging, and production.

---

## Environment Variables

Create the following `.env` files in the project root:

### `.env.development` (Local Development)

```bash
# Supabase
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# LinkedIn (Test/Development App)
VITE_LINKEDIN_CLIENT_ID=YOUR_DEV_CLIENT_ID
# Note: Client secret should NEVER be in frontend code
# LINKEDIN_CLIENT_SECRET=YOUR_SECRET (Backend only)

# Stripe (Test)
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# API URLs
VITE_API_URL=http://localhost:5173
VITE_SUPABASE_FUNCTIONS_URL=http://localhost:54321/functions/v1

# Analytics (Optional)
VITE_SENTRY_DSN=https://...@sentry.io/...
```

### `.env.staging` (Staging Environment)

```bash
# Supabase
VITE_SUPABASE_URL=https://staging.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# LinkedIn (Staging App)
VITE_LINKEDIN_CLIENT_ID=YOUR_STAGING_CLIENT_ID
VITE_LINKEDIN_REDIRECT_URI=https://staging.networknudge.com/auth/linkedin/callback

# Stripe (Test mode with staging keys)
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# API URLs
VITE_API_URL=https://staging.networknudge.com
VITE_SUPABASE_FUNCTIONS_URL=https://staging-api.networknudge.com/functions/v1

# Analytics
VITE_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=staging
```

### `.env.production` (Production)

```bash
# Supabase
VITE_SUPABASE_URL=https://prod.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# LinkedIn (Production App)
VITE_LINKEDIN_CLIENT_ID=YOUR_PROD_CLIENT_ID
VITE_LINKEDIN_REDIRECT_URI=https://networknudge.com/auth/linkedin/callback

# Stripe (Live)
VITE_STRIPE_PUBLIC_KEY=pk_live_...

# API URLs
VITE_API_URL=https://networknudge.com
VITE_SUPABASE_FUNCTIONS_URL=https://api.networknudge.com/functions/v1

# Analytics
VITE_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=production
```

## Backend Environment Variables

Create `.env.local` in the Supabase functions directory:

```bash
# LinkedIn
LINKEDIN_CLIENT_ID=YOUR_CLIENT_ID
LINKEDIN_CLIENT_SECRET=YOUR_CLIENT_SECRET (KEEP SECURE!)
LINKEDIN_REDIRECT_URI=https://networknudge.com/auth/linkedin/callback

# Database
SUPABASE_URL=https://prod.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxx...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
```

---

## How to Use Environment Variables

### In Frontend (Vite)

Variables are accessible via `import.meta.env`:

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
```

### In Backend (Deno/Edge Functions)

Variables are accessed via `Deno.env.get()`:

```typescript
const linkedInSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');
```

---

## Setting Up Environments

### Development (Local)

1. Copy `.env.development` to `.env.local` (Vite's local override)
2. Run `npm run dev`
3. Supabase will run locally via Docker

### Staging (Cloud)

1. Push to `develop` branch (auto-deploys to staging)
2. Set environment variables in Vercel/hosting platform
3. Database points to staging Supabase instance

### Production (Cloud)

1. Push to `main` branch after staging approval
2. Environment variables set in production Vercel project
3. Database points to production Supabase instance
4. Stripe live keys enabled
5. LinkedIn production app credentials

---

## Security Best Practices

✅ **DO**:
- Store secrets in `.env.local` (never commit)
- Use different credentials per environment
- Rotate LinkedIn/Stripe secrets monthly
- Encrypt Supabase backups
- Use RLS policies on all tables

❌ **DON'T**:
- Commit `.env.local` or `.env.production` files
- Store client secrets in frontend code
- Use production keys in development
- Hardcode API URLs
- Share credentials via Slack/email

---

## Environment Variables Checklist

### Before Staging Deploy
- [ ] LinkedIn dev app credentials configured
- [ ] Stripe test keys in place
- [ ] Sentry staging project created
- [ ] Database migrations applied
- [ ] Email provider configured (SendGrid test account)

### Before Production Deploy
- [ ] LinkedIn production approval requested
- [ ] Stripe live keys configured (with webhook secret)
- [ ] SSL certificate installed (auto via hosting platform)
- [ ] CDN configured for static assets
- [ ] Backups enabled and tested
- [ ] Monitoring alerts configured (Sentry, Healthchecks)
- [ ] Rate limiting enabled on API
- [ ] RLS policies verified on all tables

---

## Verifying Environment Variables

Run this check before deploying:

```bash
npm run verify-env
```

This script verifies:
- Required variables are set
- URLs are valid
- Keys are formatted correctly
- Credentials can authenticate

---

## Troubleshooting

**"Environment variable not found"**
- Check `.env.local` or hosting platform settings
- Ensure variable name matches exactly (case-sensitive)
- Verify it's prefixed with `VITE_` for frontend

**"Stripe key rejected"**
- Confirm you're using test keys in staging
- Use live keys in production only
- Don't include the `.env.production` in version control

**"LinkedIn OAuth redirect fails"**
- Verify `VITE_LINKEDIN_REDIRECT_URI` matches app settings at linkedin.com/developers
- For dev: `http://localhost:5173/auth/linkedin/callback`
- For prod: `https://networknudge.com/auth/linkedin/callback`

---

## Further Reading

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase Environment Setup](https://supabase.com/docs/guides/functions/secrets)
- [Stripe API Keys](https://stripe.com/docs/keys)
- [LinkedIn OAuth Documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)
