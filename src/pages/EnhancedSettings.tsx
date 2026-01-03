import { useEffect, useState } from 'react';
import { getLinkedInAuthUrl, getLinkedInTokens, revokeLinkedInAccess } from '../lib/linkedin';
import { supabase } from '../lib/supabase';

/**
 * Enhanced Settings Page
 * Includes LinkedIn connection, privacy consents, and account management
 */
export function EnhancedSettings() {
  const [user, setUser] = useState<any>(null);
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [consents, setConsents] = useState({
    linkedin_data_storage: false,
    marketing_emails: false,
    analytics_tracking: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      // Check LinkedIn connection
      const tokens = await getLinkedInTokens(user.id);
      setLinkedInConnected(!!tokens);

      // Load privacy consents
      const { data: consentData } = await supabase
        .from('user_consents')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (consentData) {
        setConsents({
          linkedin_data_storage: consentData.linkedin_data_storage,
          marketing_emails: consentData.marketing_emails,
          analytics_tracking: consentData.analytics_tracking,
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnectLinkedIn() {
    try {
      // First, ensure user has consented to data storage
      if (!consents.linkedin_data_storage) {
        setMessage({
          type: 'error',
          text: 'Please consent to LinkedIn data storage before connecting',
        });
        return;
      }

      // Redirect to LinkedIn OAuth
      const authUrl = getLinkedInAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to initiate LinkedIn connection:', error);
      setMessage({ type: 'error', text: 'Failed to connect LinkedIn' });
    }
  }

  async function handleDisconnectLinkedIn() {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await revokeLinkedInAccess(user.id);
      setLinkedInConnected(false);
      setMessage({ type: 'success', text: 'LinkedIn account disconnected' });
    } catch (error) {
      console.error('Failed to disconnect LinkedIn:', error);
      setMessage({ type: 'error', text: 'Failed to disconnect LinkedIn' });
    } finally {
      setSaving(false);
    }
  }

  async function handleConsentsChange(key: keyof typeof consents, value: boolean) {
    const updated = { ...consents, [key]: value };
    setConsents(updated);

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_consents')
        .upsert(
          {
            user_id: user.id,
            [key]: value,
            consented_at: new Date(),
            accepted_privacy_version: '1.0',
          },
          { onConflict: 'user_id' }
        );

      if (error) throw error;
      setMessage({ type: 'success', text: 'Preferences saved' });
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences' });
      // Revert
      setConsents(consents);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm('Are you sure? This will permanently delete your account and all data.')) {
      return;
    }

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete user data (audit log the deletion)
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'delete',
          resource_type: 'auth',
          created_at: new Date(),
        });

      // Delete user account
      await supabase.auth.admin.deleteUser(user.id);
      
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to delete account:', error);
      setMessage({ type: 'error', text: 'Failed to delete account' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-8">Loading settings...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {message && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* LinkedIn Connection */}
      <section className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-bold mb-4">LinkedIn Connection</h2>
        <p className="text-gray-600 mb-4">
          {linkedInConnected
            ? 'Your LinkedIn account is connected. We can now sync your connections and activities.'
            : 'Connect your LinkedIn account to enable activity tracking and suggestions.'}
        </p>

        {linkedInConnected ? (
          <button
            onClick={handleDisconnectLinkedIn}
            disabled={saving}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? 'Disconnecting...' : 'Disconnect LinkedIn'}
          </button>
        ) : (
          <button
            onClick={handleConnectLinkedIn}
            disabled={saving || !consents.linkedin_data_storage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Connecting...' : 'Connect LinkedIn'}
          </button>
        )}
      </section>

      {/* Privacy & Consent */}
      <section className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Privacy & Consent</h2>
        <p className="text-sm text-gray-600 mb-4">
          We respect your privacy. Review our <a href="/privacy-policy" className="text-blue-600 underline">privacy policy</a> for more details.
        </p>

        <div className="space-y-4">
          {/* LinkedIn Data Storage */}
          <label className="flex items-center p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-100">
            <input
              type="checkbox"
              checked={consents.linkedin_data_storage}
              onChange={(e) => handleConsentsChange('linkedin_data_storage', e.target.checked)}
              disabled={saving}
              className="w-5 h-5 mr-3"
            />
            <div>
              <p className="font-semibold">LinkedIn Data Storage</p>
              <p className="text-sm text-gray-600">
                Allow us to store your LinkedIn connections and activities to provide personalized suggestions
              </p>
            </div>
          </label>

          {/* Marketing Emails */}
          <label className="flex items-center p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-100">
            <input
              type="checkbox"
              checked={consents.marketing_emails}
              onChange={(e) => handleConsentsChange('marketing_emails', e.target.checked)}
              disabled={saving}
              className="w-5 h-5 mr-3"
            />
            <div>
              <p className="font-semibold">Marketing Emails</p>
              <p className="text-sm text-gray-600">
                Receive updates about new features and exclusive offers
              </p>
            </div>
          </label>

          {/* Analytics Tracking */}
          <label className="flex items-center p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-100">
            <input
              type="checkbox"
              checked={consents.analytics_tracking}
              onChange={(e) => handleConsentsChange('analytics_tracking', e.target.checked)}
              disabled={saving}
              className="w-5 h-5 mr-3"
            />
            <div>
              <p className="font-semibold">Analytics & Performance</p>
              <p className="text-sm text-gray-600">
                Help us improve the app by sending anonymous usage data
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* Data Management */}
      <section className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Data Management</h2>

        <div className="space-y-2">
          <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-gray-100 transition">
            📥 Download my data (GDPR)
          </button>
          <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-gray-100 transition">
            🗑️ Request data deletion (CCPA)
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="p-6 bg-red-50 rounded-lg border-2 border-red-200">
        <h2 className="text-xl font-bold text-red-800 mb-4">Danger Zone</h2>
        <button
          onClick={handleDeleteAccount}
          disabled={saving}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {saving ? 'Deleting...' : 'Delete Account'}
        </button>
      </section>
    </div>
  );
}

export default EnhancedSettings;
