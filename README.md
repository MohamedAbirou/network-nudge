# NetWork Nudge

A SaaS platform that helps professionals maintain warm networks through AI-powered engagement suggestions. NetWork Nudge analyzes your LinkedIn connections' activities and provides personalized nudges to keep your professional relationships strong.

## Features

- **Authentication**: Email/password and Google OAuth support
- **LinkedIn Integration**: Connect your LinkedIn account (demo mode with mock data)
- **Smart Nudges**: AI-generated engagement suggestions based on connection activities
- **Analytics Dashboard**: Track network health, response rates, and engagement metrics
- **Customizable Notifications**: Daily/weekly email nudges
- **Subscription Plans**: Freemium model with Individual and Team tiers
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Backend**: Supabase Edge Functions (Deno)
- **Icons**: Lucide React

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- A Supabase account

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd network-nudge
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project dashboard:
1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings > API
4. Copy the Project URL and anon/public key

### 4. Database Setup

The database schema has already been created via migrations. If you need to verify or re-apply:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Check the "Migrations" section to see applied migrations

### 5. Configure Google OAuth (Optional)

To enable Google sign-in:

1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Google provider
3. Follow the instructions to set up Google OAuth credentials
4. Add your OAuth credentials

### 6. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage Guide

### Getting Started

1. **Sign Up**: Create an account using email/password or Google OAuth
2. **Connect LinkedIn**: Go to Settings and click "Connect LinkedIn" (demo mode uses mock data)
3. **Generate Test Data**: In Settings, use "Generate Test Data" to create sample connections and nudges
4. **View Nudges**: Return to Dashboard to see your personalized engagement suggestions
5. **Take Action**: Review suggestions, edit them if needed, and mark as done when you engage
6. **Track Progress**: Visit Analytics to see your network health score and engagement metrics

### Features Overview

#### Dashboard
- View pending nudges with AI-generated suggestions
- Edit suggestions before using them
- Mark nudges as completed or dismiss them
- Copy suggestions to clipboard

#### Analytics
- Network health score (0-100)
- Total connections count
- Weekly engagement metrics
- Response rate tracking
- Engagement trend charts
- Personalized insights and recommendations

#### Settings
- Update profile information
- Connect/disconnect LinkedIn
- Configure email notifications
- Set notification frequency (daily/weekly/bi-weekly)
- Generate test data for demo purposes
- Manage subscription plan

### Subscription Plans

#### Free
- 5 nudges per week
- Basic analytics
- Email notifications

#### Individual ($9/month)
- Unlimited nudges
- Advanced analytics
- Priority support
- Custom nudge templates

#### Team ($29/month per user)
- Everything in Individual
- Team dashboards
- CRM integration
- API access

## Supabase Edge Functions

The platform includes three Edge Functions:

### 1. generate-nudges
Analyzes connections and creates personalized engagement suggestions.

**Endpoint**: `/functions/v1/generate-nudges`
**Method**: POST
**Body**: `{ "userId": "user-uuid" }`

### 2. send-nudge-emails
Sends email notifications to users based on their preferences.

**Endpoint**: `/functions/v1/send-nudge-emails`
**Method**: POST

### 3. stripe-checkout
Handles subscription upgrades and checkout sessions.

**Endpoint**: `/functions/v1/stripe-checkout`
**Method**: POST
**Body**: `{ "userId": "user-uuid", "planType": "individual|team" }`

## Important Notes

### LinkedIn API Limitations

LinkedIn has significant API restrictions. Most apps cannot access connection posts/activities without LinkedIn partnership. This demo uses mock data to demonstrate functionality. For production use with real LinkedIn data, you would need:

1. Apply for LinkedIn partnership
2. Get approved for required API scopes
3. Implement OAuth 2.0 flow
4. Replace mock data with real API calls

### AI Integration

The current implementation uses predefined templates for suggestions. To integrate OpenAI for real AI-generated nudges:

1. Add `VITE_OPENAI_API_KEY` to your `.env` file
2. Update the `generate-nudges` Edge Function to call OpenAI API
3. Pass connection activity data to GPT-4 for personalized suggestions

### Stripe Integration

The Stripe integration is currently in demo mode. To enable real payments:

1. Create a Stripe account
2. Add `VITE_STRIPE_PUBLISHABLE_KEY` to `.env`
3. Add `STRIPE_SECRET_KEY` to Supabase Edge Functions secrets
4. Update the `stripe-checkout` function with real Stripe SDK
5. Set up webhook handlers for subscription events

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with sidebar
│   ├── Link.tsx        # Custom navigation link
│   └── Router.tsx      # Simple client-side router
├── contexts/
│   └── AuthContext.tsx # Authentication context
├── lib/
│   ├── api.ts          # API utilities
│   └── supabase.ts     # Supabase client and types
├── pages/
│   ├── Analytics.tsx   # Analytics dashboard
│   ├── Dashboard.tsx   # Main nudge feed
│   ├── Login.tsx       # Login page
│   ├── Settings.tsx    # Settings and preferences
│   └── Signup.tsx      # Signup page
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles

supabase/
└── functions/          # Edge Functions
    ├── generate-nudges/
    ├── send-nudge-emails/
    └── stripe-checkout/
```

## Database Schema

### Tables

- **user_profiles**: Extended user information
- **subscriptions**: User subscription data
- **connections**: LinkedIn connections
- **nudges**: Generated engagement suggestions
- **engagements**: Tracked user engagements
- **network_metrics**: Aggregated analytics data

All tables have Row Level Security (RLS) enabled with policies ensuring users can only access their own data.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## Deployment

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Add environment variables in Vercel dashboard
4. Deploy: `vercel --prod`

### Deploy to Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Run `netlify init`
3. Add environment variables in Netlify dashboard
4. Deploy: `netlify deploy --prod`

## Security Considerations

- All sensitive data is encrypted
- Row Level Security (RLS) enforced on all tables
- JWT-based authentication
- HTTPS only in production
- No auto-posting to LinkedIn (users act manually)
- GDPR-compliant data handling

## Future Enhancements

- Real LinkedIn API integration (requires partnership)
- OpenAI integration for smarter suggestions
- Slack/Teams notifications
- CRM integrations (Salesforce, HubSpot)
- Mobile app (React Native)
- Team collaboration features
- Advanced analytics and reporting
- Browser extension for quick nudges
- Calendar integration for scheduling

## Support

For issues or questions:
1. Check this README
2. Review Supabase documentation
3. Check the Edge Functions logs in Supabase dashboard

## License

MIT License - feel free to use this project as a template for your own SaaS applications.

---

Built with React, TypeScript, Supabase, and Tailwind CSS.
