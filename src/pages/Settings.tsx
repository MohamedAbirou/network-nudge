import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Subscription } from '../lib/supabase';
import { generateNudges } from '../lib/api';
import { Linkedin, Bell, User, CreditCard, Sparkles, Check } from 'lucide-react';

export const Settings = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [notificationEmail, setNotificationEmail] = useState(true);
  const [notificationFrequency, setNotificationFrequency] = useState('weekly');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setNotificationEmail(profile.notification_email);
      setNotificationFrequency(profile.notification_frequency);
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (data) {
      setSubscription(data);
    }
  };

  const handleConnectLinkedIn = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await supabase
      .from('user_profiles')
      .update({ linkedin_connected: true })
      .eq('id', user?.id);
    await refreshProfile();
    alert('LinkedIn connected! (Demo mode - no actual OAuth flow)');
    setLoading(false);
  };

  const handleDisconnectLinkedIn = async () => {
    await supabase
      .from('user_profiles')
      .update({ linkedin_connected: false })
      .eq('id', user?.id);
    await refreshProfile();
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    await supabase
      .from('user_profiles')
      .update({
        full_name: fullName,
        notification_email: notificationEmail,
        notification_frequency: notificationFrequency,
      })
      .eq('id', user?.id);
    await refreshProfile();
    setSaving(false);
    alert('Settings saved successfully!');
  };

  const handleGenerateTestData = async () => {
    setLoading(true);

    const mockConnections = [
      {
        name: 'Sarah Johnson',
        headline: 'Product Manager at TechCorp',
        avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
        last_activity_type: 'post',
        last_activity_content: 'Excited to share our new product launch!',
      },
      {
        name: 'Michael Chen',
        headline: 'Software Engineer at StartupXYZ',
        avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
        last_activity_type: 'job_change',
        last_activity_content: 'Started new position as Senior Engineer',
      },
      {
        name: 'Emily Rodriguez',
        headline: 'Marketing Director at GlobalBrand',
        avatar_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
        last_activity_type: 'anniversary',
        last_activity_content: '5 years at GlobalBrand',
      },
      {
        name: 'David Park',
        headline: 'Data Scientist at AI Solutions',
        avatar_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200',
        last_activity_type: 'post',
        last_activity_content: 'New research paper on machine learning published',
      },
    ];

    const { data: existingConnections } = await supabase
      .from('connections')
      .select('name')
      .eq('user_id', user?.id);

    const existingNames = existingConnections?.map((c) => c.name) || [];

    for (const conn of mockConnections) {
      if (!existingNames.includes(conn.name)) {
        await supabase
          .from('connections')
          .insert({
            user_id: user?.id,
            name: conn.name,
            headline: conn.headline,
            avatar_url: conn.avatar_url,
            last_activity_type: conn.last_activity_type,
            last_activity_content: conn.last_activity_content,
            last_activity_date: new Date().toISOString(),
          });
      }
    }

    try {
      await generateNudges(user?.id || '');
      alert('Test data generated! Check your dashboard.');
    } catch (error) {
      console.error('Error generating nudges:', error);
      alert('Test data created, but nudge generation failed. Please try again.');
    }

    setLoading(false);
  };

  const handleUpgrade = async (planType: string) => {
    try {
      setLoading(true);
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: user?.id, planType }),
        }
      );

      const data = await response.json();

      if (data.url) {
        alert(`${data.message}\n\nIn production, you would be redirected to: ${data.url}`);
        await fetchSubscription();
      }

      setLoading(false);
    } catch (error) {
      console.error('Error upgrading:', error);
      alert('Failed to upgrade. Please try again.');
      setLoading(false);
    }
  };

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      features: ['5 nudges per week', 'Basic analytics', 'Email notifications'],
      current: subscription?.plan_type === 'free',
    },
    {
      name: 'Individual',
      price: '$9',
      features: ['Unlimited nudges', 'Advanced analytics', 'Priority support', 'Custom nudge templates'],
      current: subscription?.plan_type === 'individual',
    },
    {
      name: 'Team',
      price: '$29',
      features: ['Everything in Individual', 'Team dashboards', 'CRM integration', 'API access'],
      current: subscription?.plan_type === 'team',
    },
  ];

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <Linkedin className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">LinkedIn Connection</h2>
          </div>

          {profile?.linkedin_connected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium">LinkedIn account connected</span>
              </div>
              <button
                onClick={handleDisconnectLinkedIn}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Disconnect LinkedIn
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                Connect your LinkedIn account to start receiving personalized nudges based on your
                network's activity.
              </p>
              <button
                onClick={handleConnectLinkedIn}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
              >
                <Linkedin className="w-5 h-5" />
                {loading ? 'Connecting...' : 'Connect LinkedIn'}
              </button>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Demo Note:</strong> LinkedIn API has strict access requirements. This demo
                  uses mock data. In production, you would need LinkedIn partnership.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive nudges via email</p>
              </div>
              <button
                onClick={() => setNotificationEmail(!notificationEmail)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  notificationEmail ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    notificationEmail ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Frequency
              </label>
              <select
                value={notificationFrequency}
                onChange={(e) => setNotificationFrequency(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
              </select>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900">Demo Tools</h2>
          </div>

          <p className="text-gray-600 mb-4">
            Generate sample connections and nudges to explore the platform's features.
          </p>

          <button
            onClick={handleGenerateTestData}
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-medium"
          >
            <Sparkles className="w-5 h-5" />
            {loading ? 'Generating...' : 'Generate Test Data'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Subscription</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`border-2 rounded-lg p-6 ${
                  plan.current ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  {plan.price !== '$0' && <span className="text-gray-600">/month</span>}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.current ? (
                  <button
                    disabled
                    className="w-full py-2 px-4 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.name.toLowerCase())}
                    disabled={loading}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
                  >
                    {loading ? 'Processing...' : 'Upgrade'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};
