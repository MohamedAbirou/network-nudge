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

    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: connections, error: connError } = await supabase
      .from('connections')
      .select('*')
      .eq('user_id', userId)
      .order('last_activity_date', { ascending: false })
      .limit(5);

    if (connError) throw connError;

    if (!connections || connections.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No connections found', nudgesCreated: 0 }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    const nudgesLimit = subscription?.nudges_limit || 5;

    const { data: existingNudges } = await supabase
      .from('nudges')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const existingCount = existingNudges?.length || 0;
    const nudgesToCreate = Math.min(nudgesLimit - existingCount, connections.length);

    if (nudgesToCreate <= 0) {
      return new Response(
        JSON.stringify({ message: 'Nudge limit reached', nudgesCreated: 0 }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let nudgesCreated = 0;

    for (let i = 0; i < nudgesToCreate; i++) {
      const connection = connections[i];
      const suggestions = generateSuggestions(connection.last_activity_type, connection.name);

      const { error: insertError } = await supabase.from('nudges').insert({
        user_id: userId,
        connection_id: connection.id,
        type: connection.last_activity_type || 'general',
        activity_description: connection.last_activity_content,
        suggestions,
        status: 'pending',
        scheduled_for: new Date().toISOString(),
      });

      if (!insertError) {
        nudgesCreated++;
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Nudges generated successfully',
        nudgesCreated,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating nudges:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateSuggestions(activityType: string, name: string): string[] {
  const firstName = name.split(' ')[0];

  const suggestionTemplates: { [key: string]: string[] } = {
    post: [
      `Great insights, ${firstName}! This really resonates with my experience in the field.`,
      `Thanks for sharing this! Would love to hear more about your perspective on this topic.`,
      `This is exactly what I've been thinking about lately. Let's catch up soon to discuss!`,
    ],
    job_change: [
      `Congratulations on the new role, ${firstName}! Well deserved and exciting times ahead!`,
      `Exciting move! Wishing you all the best in your new position. Let's celebrate soon!`,
      `Great to see you taking this next step in your career! Very well deserved.`,
    ],
    anniversary: [
      `Congratulations on this milestone, ${firstName}! Your dedication is truly inspiring.`,
      `What an achievement! Time flies when you're making an impact.`,
      `Wow, that's impressive! Congrats on this milestone, ${firstName}!`,
    ],
    general: [
      `Hey ${firstName}, hope you're doing well! It's been a while since we last connected.`,
      `Hi ${firstName}, just wanted to check in and see how things are going on your end!`,
      `${firstName}, let's catch up soon! Would love to hear what you've been working on.`,
    ],
  };

  return suggestionTemplates[activityType] || suggestionTemplates.general;
}
