import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, planType } = await req.json();

    if (!userId || !planType) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const prices: { [key: string]: number } = {
      individual: 9,
      team: 29,
    };

    const price = prices[planType];

    if (!price) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan type' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const mockCheckoutSession = {
      id: `cs_${Date.now()}`,
      url: `https://checkout.stripe.com/pay/cs_test_${Date.now()}`,
      customer: `cus_${Date.now()}`,
      subscription: `sub_${Date.now()}`,
    };

    console.log('Mock Stripe checkout session created:', mockCheckoutSession);

    const nudgesLimit = planType === 'individual' ? 999999 : 999999;

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        plan_type: planType,
        status: 'active',
        nudges_limit: nudgesLimit,
        stripe_customer_id: mockCheckoutSession.customer,
        stripe_subscription_id: mockCheckoutSession.subscription,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        sessionId: mockCheckoutSession.id,
        url: mockCheckoutSession.url,
        message: 'Mock checkout session created (Stripe integration requires API key)',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
