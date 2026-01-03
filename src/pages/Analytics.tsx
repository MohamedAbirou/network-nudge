import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { supabase, NetworkMetrics } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, Users, MessageCircle, Target, ArrowUp, ArrowDown } from 'lucide-react';

export const Analytics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<NetworkMetrics | null>(null);
  const [stats, setStats] = useState({
    totalConnections: 0,
    weeklyEngagements: 0,
    responseRate: 0,
    networkHealthScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{ week: string; engagements: number; responses: number }[]>([]);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    setLoading(true);

    const { data: connections } = await supabase
      .from('connections')
      .select('*')
      .eq('user_id', user?.id);

    const { data: engagements } = await supabase
      .from('engagements')
      .select('*')
      .eq('user_id', user?.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const { data: allEngagements } = await supabase
      .from('engagements')
      .select('*')
      .eq('user_id', user?.id);

    const totalConnections = connections?.length || 0;
    const weeklyEngagements = engagements?.length || 0;
    const responsesReceived = allEngagements?.filter((e) => e.response_received).length || 0;
    const totalEngagements = allEngagements?.length || 0;
    const responseRate = totalEngagements > 0 ? (responsesReceived / totalEngagements) * 100 : 0;

    const networkHealthScore = calculateNetworkHealth(
      totalConnections,
      weeklyEngagements,
      responseRate
    );

    setStats({
      totalConnections,
      weeklyEngagements,
      responseRate,
      networkHealthScore,
    });

    const { data: metricsData } = await supabase
      .from('network_metrics')
      .select('*')
      .eq('user_id', user?.id)
      .order('period_start', { ascending: false })
      .limit(8);

    if (metricsData && metricsData.length > 0) {
      const chartData = metricsData.reverse().map((m) => ({
        week: new Date(m.period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        engagements: m.engagements_sent,
        responses: m.responses_received,
      }));
      setChartData(chartData);
    } else {
      setChartData([
        { week: 'Week 1', engagements: 3, responses: 1 },
        { week: 'Week 2', engagements: 5, responses: 2 },
        { week: 'Week 3', engagements: 4, responses: 3 },
        { week: 'Week 4', engagements: 7, responses: 4 },
      ]);
    }

    setLoading(false);
  };

  const calculateNetworkHealth = (
    connections: number,
    engagements: number,
    responseRate: number
  ): number => {
    const connectionScore = Math.min((connections / 100) * 40, 40);
    const engagementScore = Math.min((engagements / 10) * 30, 30);
    const responseScore = (responseRate / 100) * 30;
    return Math.round(connectionScore + engagementScore + responseScore);
  };

  const getHealthColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (score: number) => {
    if (score >= 70) return 'bg-green-100';
    if (score >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Track your network health and engagement metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Network Health</span>
            <Target className={`w-5 h-5 ${getHealthColor(stats.networkHealthScore)}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${getHealthColor(stats.networkHealthScore)}`}>
              {stats.networkHealthScore}
            </span>
            <span className="text-sm text-gray-500">/ 100</span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  stats.networkHealthScore >= 70
                    ? 'bg-green-600'
                    : stats.networkHealthScore >= 40
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
                }`}
                style={{ width: `${stats.networkHealthScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Connections</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats.totalConnections}</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
            <span>Active network size</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Weekly Engagements</span>
            <MessageCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats.weeklyEngagements}</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
            <ArrowUp className="w-4 h-4" />
            <span>Last 7 days</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Response Rate</span>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {stats.responseRate.toFixed(0)}%
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
            <span>Engagement quality</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Engagement Trend</h2>
        <div className="space-y-4">
          {chartData.map((data, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{data.week}</span>
                <span className="text-gray-500">
                  {data.engagements} sent, {data.responses} responded
                </span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${(data.engagements / 10) * 100}%` }}
                  ></div>
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-green-600 h-full rounded-full"
                    style={{ width: `${(data.responses / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-gray-600">Engagements Sent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span className="text-gray-600">Responses Received</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Insights & Tips</h2>
        <div className="space-y-4">
          {stats.networkHealthScore < 40 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-1">Network Health Needs Attention</h3>
              <p className="text-sm text-red-700">
                Your network health score is low. Try engaging with more connections this week to
                improve your score.
              </p>
            </div>
          )}
          {stats.responseRate < 30 && stats.weeklyEngagements > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-1">Low Response Rate</h3>
              <p className="text-sm text-yellow-700">
                Your response rate is below average. Try personalizing your messages more and
                engaging with posts that are relevant to your interests.
              </p>
            </div>
          )}
          {stats.networkHealthScore >= 70 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-1">Great Job!</h3>
              <p className="text-sm text-green-700">
                Your network health is excellent! Keep up the consistent engagement to maintain
                strong professional relationships.
              </p>
            </div>
          )}
          {stats.totalConnections < 50 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-1">Grow Your Network</h3>
              <p className="text-sm text-blue-700">
                Consider connecting with more professionals in your industry to expand your reach
                and opportunities.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
