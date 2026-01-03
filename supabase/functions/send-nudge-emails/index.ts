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

    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('notification_email', true);

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users with email notifications enabled' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let emailsSent = 0;

    for (const profile of profiles) {
      const shouldSend = await shouldSendEmail(profile);

      if (!shouldSend) continue;

      const { data: nudges } = await supabase
        .from('nudges')
        .select(`
          *,
          connection:connections(*)
        `)
        .eq('user_id', profile.id)
        .eq('status', 'pending')
        .is('sent_at', null)
        .limit(5);

      if (!nudges || nudges.length === 0) continue;

      const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);

      if (!authUser?.user?.email) continue;

      const emailContent = generateEmailContent(nudges, profile);

      console.log(`Would send email to: ${authUser.user.email}`);
      console.log(`Email content:`, emailContent);

      const nudgeIds = nudges.map((n) => n.id);
      await supabase
        .from('nudges')
        .update({ sent_at: new Date().toISOString() })
        .in('id', nudgeIds);

      emailsSent++;
    }

    return new Response(
      JSON.stringify({
        message: 'Email notifications processed',
        emailsSent,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error sending emails:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function shouldSendEmail(profile: any): Promise<boolean> {
  const now = new Date();
  const dayOfWeek = now.getDay();

  if (profile.notification_frequency === 'daily') {
    return true;
  }

  if (profile.notification_frequency === 'weekly') {
    return dayOfWeek === 1;
  }

  if (profile.notification_frequency === 'biweekly') {
    const weekNumber = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
    return dayOfWeek === 1 && weekNumber % 2 === 0;
  }

  return false;
}

function generateEmailContent(nudges: any[], profile: any): string {
  const nudgesList = nudges
    .map(
      (nudge, idx) => `
    ${idx + 1}. ${nudge.connection.name} - ${nudge.activity_description}
       Suggestion: ${nudge.suggestions[0]}
  `
    )
    .join('\n');

  return `
    Hi ${profile.full_name || 'there'},

    You have ${nudges.length} new engagement suggestions for your network:

    ${nudgesList}

    Log in to NetWork Nudge to view all suggestions and take action:
    ${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}

    Best regards,
    The NetWork Nudge Team
  `;
}
