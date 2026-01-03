import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { updateLinkedInTokens } from '../lib/linkedin';
import { supabase } from '../lib/supabase';

/**
 * LinkedIn OAuth Callback Handler
 * Processes authorization code and exchanges it for access token
 */
export function LinkedInCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    handleCallback();
  }, []);

  async function handleCallback() {
    try {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      // Handle user denying access
      if (error === 'access_denied') {
        setError('LinkedIn access was denied. Please try again.');
        setLoading(false);
        setTimeout(() => navigate('/settings'), 3000);
        return;
      }

      if (!code) {
        throw new Error('No authorization code received from LinkedIn');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Exchange code for token (should be done via backend API to protect client secret)
      // For now, we'll call the backend edge function
      const response = await fetch('/api/linkedin/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange authorization code');
      }

      const tokens = await response.json();

      // Store tokens (encrypted) in database
      await updateLinkedInTokens(user.id, tokens);

      // Update user profile with LinkedIn data
      const { data: { user: userProfile } } = await supabase.auth.getUser();
      if (userProfile) {
        await supabase.auth.updateUser({
          data: { linkedin_connected: true, linkedin_connected_at: new Date() },
        });
      }

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect LinkedIn account';
      setError(message);
      console.error('LinkedIn callback error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Connecting your LinkedIn account...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Failed</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => navigate('/settings')}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
          >
            Return to Settings
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default LinkedInCallback;
