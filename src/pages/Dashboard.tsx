import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { supabase, Nudge } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, Sparkles, CheckCircle, X, Edit2, Linkedin } from 'lucide-react';
import { Link } from '../components/Link';

export const Dashboard = () => {
  const { user, profile } = useAuth();
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNudge, setEditingNudge] = useState<string | null>(null);
  const [editedSuggestions, setEditedSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchNudges();
    }
  }, [user]);

  const fetchNudges = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('nudges')
      .select(`
        *,
        connection:connections(*)
      `)
      .eq('user_id', user?.id)
      .in('status', ['pending', 'scheduled'])
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setNudges(data as any);
    }
    setLoading(false);
  };

  const handleActOnNudge = async (nudgeId: string) => {
    await supabase
      .from('nudges')
      .update({ status: 'acted', acted_at: new Date().toISOString() })
      .eq('id', nudgeId);

    const nudge = nudges.find((n) => n.id === nudgeId);
    if (nudge) {
      await supabase.from('engagements').insert({
        user_id: user?.id,
        nudge_id: nudgeId,
        connection_id: nudge.connection_id,
        engagement_type: 'comment',
        response_received: false,
      });

      await supabase
        .from('connections')
        .update({
          engagement_count: (nudge.connection as any).engagement_count + 1,
          last_engagement_date: new Date().toISOString(),
        })
        .eq('id', nudge.connection_id);
    }

    fetchNudges();
  };

  const handleDismissNudge = async (nudgeId: string) => {
    await supabase
      .from('nudges')
      .update({ status: 'dismissed' })
      .eq('id', nudgeId);
    fetchNudges();
  };

  const startEditing = (nudge: Nudge) => {
    setEditingNudge(nudge.id);
    setEditedSuggestions([...nudge.suggestions]);
  };

  const saveEdits = async (nudgeId: string) => {
    await supabase
      .from('nudges')
      .update({ suggestions: editedSuggestions })
      .eq('id', nudgeId);
    setEditingNudge(null);
    fetchNudges();
  };

  const getNudgeTypeColor = (type: string) => {
    switch (type) {
      case 'job_change':
        return 'bg-green-100 text-green-700';
      case 'post_comment':
        return 'bg-blue-100 text-blue-700';
      case 'anniversary':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getNudgeTypeLabel = (type: string) => {
    switch (type) {
      case 'job_change':
        return 'Job Change';
      case 'post_comment':
        return 'Post Comment';
      case 'anniversary':
        return 'Anniversary';
      default:
        return 'General';
    }
  };

  if (!profile?.linkedin_connected) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Linkedin className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Connect Your LinkedIn</h2>
            <p className="text-gray-600 mb-6">
              To start receiving personalized nudges, connect your LinkedIn account. We'll analyze
              your connections' activities and generate engagement suggestions.
            </p>
            <Link
              to="/settings"
              className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Go to Settings
            </Link>
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> LinkedIn API access is limited. This demo uses mock data. In
                production, you would need LinkedIn partnership for full API access.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Nudges</h1>
        <p className="text-gray-600">
          Personalized engagement suggestions to keep your network warm
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : nudges.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No nudges yet</h3>
          <p className="text-gray-600 mb-4">
            We're analyzing your network. Check back soon for personalized engagement suggestions!
          </p>
          <Link
            to="/settings"
            className="inline-block text-blue-600 hover:text-blue-700 font-medium"
          >
            Generate Test Nudges
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {nudges.map((nudge) => (
            <div key={nudge.id} className="bg-white rounded-lg shadow hover:shadow-md transition">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                      {(nudge.connection as any)?.avatar_url ? (
                        <img
                          src={(nudge.connection as any).avatar_url}
                          alt={(nudge.connection as any).name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 font-semibold">
                          {(nudge.connection as any)?.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {(nudge.connection as any)?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {(nudge.connection as any)?.headline}
                      </p>
                      <span
                        className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${getNudgeTypeColor(
                          nudge.type
                        )}`}
                      >
                        {getNudgeTypeLabel(nudge.type)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismissNudge(nudge.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {nudge.activity_description && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{nudge.activity_description}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      Suggested Engagements
                    </h4>
                    {editingNudge !== nudge.id && (
                      <button
                        onClick={() => startEditing(nudge)}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                  </div>

                  {editingNudge === nudge.id ? (
                    <div className="space-y-2">
                      {editedSuggestions.map((suggestion, idx) => (
                        <textarea
                          key={idx}
                          value={suggestion}
                          onChange={(e) => {
                            const newSuggestions = [...editedSuggestions];
                            newSuggestions[idx] = e.target.value;
                            setEditedSuggestions(newSuggestions);
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          rows={2}
                        />
                      ))}
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdits(nudge.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingNudge(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {nudge.suggestions.map((suggestion, idx) => (
                        <li
                          key={idx}
                          className="p-3 bg-blue-50 rounded-lg text-sm text-gray-800 border border-blue-100"
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleActOnNudge(nudge.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark as Done
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(nudge.suggestions[0]);
                      alert('Copied to clipboard!');
                    }}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};
