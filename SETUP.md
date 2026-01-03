# Quick Setup Guide

Follow these steps to get NetWork Nudge running locally.

## Step 1: Supabase Project Setup

1. Go to https://app.supabase.com
2. Create a new project (or use an existing one)
3. Wait for the project to be provisioned (takes ~2 minutes)

## Step 2: Get Your Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Configure Environment Variables

1. Create a `.env` file in the project root
2. Add your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Database Setup

The database migrations have already been applied! To verify:

1. Go to your Supabase dashboard
2. Click **Table Editor** in the sidebar
3. You should see these tables:
   - user_profiles
   - subscriptions
   - connections
   - nudges
   - engagements
   - network_metrics

If tables are missing, check the **SQL Editor** > **Migrations** tab.

## Step 5: Edge Functions Setup

The following Edge Functions are already deployed:
- `generate-nudges` - Creates personalized engagement suggestions
- `send-nudge-emails` - Sends email notifications
- `stripe-checkout` - Handles subscription upgrades

To verify:
1. Go to **Edge Functions** in your Supabase dashboard
2. You should see all three functions listed

## Step 6: Install Dependencies

```bash
npm install
```

## Step 7: Run the App

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Step 8: Test the Platform

1. **Sign up** for a new account
2. Go to **Settings**
3. Click **Connect LinkedIn** (demo mode, no real OAuth)
4. Click **Generate Test Data** to create sample connections and nudges
5. Return to **Dashboard** to see your nudges
6. Try editing suggestions, marking as done, or dismissing them
7. Check **Analytics** to see your network health metrics

## Optional: Enable Google OAuth

1. In Supabase dashboard, go to **Authentication** > **Providers**
2. Enable **Google**
3. Follow the instructions to set up Google OAuth
4. Add your OAuth credentials
5. Add authorized redirect URLs:
   - `http://localhost:5173` (for development)
   - Your production URL (when deployed)

## Optional: Add OpenAI Integration

To enable real AI-generated suggestions:

1. Get an OpenAI API key from https://platform.openai.com
2. Add to your `.env` file:
```env
VITE_OPENAI_API_KEY=sk-...
```
3. Update the `generate-nudges` Edge Function to use OpenAI API

## Optional: Enable Stripe Payments

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe dashboard
3. Add to `.env`:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```
4. Add to Supabase Edge Functions secrets:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
```
5. Update the `stripe-checkout` function with real Stripe SDK

## Troubleshooting

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Database Connection Issues
- Verify your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check if your Supabase project is active
- Try restarting the dev server

### Edge Function Errors
- Check the function logs in Supabase dashboard
- Verify the function is deployed
- Check that environment variables are set

### Authentication Issues
- Clear browser storage
- Try incognito mode
- Check Supabase Auth logs in dashboard

## Next Steps

Once everything is running:

1. **Customize the Design**: Edit Tailwind classes in components
2. **Add More Features**: Check README.md for enhancement ideas
3. **Deploy**: Use Vercel or Netlify (instructions in README.md)
4. **LinkedIn Integration**: Apply for LinkedIn partnership for real API access
5. **AI Enhancement**: Integrate OpenAI for smarter suggestions

## Support

- Check the main README.md for detailed documentation
- Review Supabase docs: https://supabase.com/docs
- Check Edge Function logs for debugging

Happy networking!
