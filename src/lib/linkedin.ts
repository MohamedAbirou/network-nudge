/**
 * LinkedIn API Client
 * Handles OAuth 2.0 flows, token management, and API calls
 * Supports: connections, profile updates, activities
 */

import { supabase } from './supabase';

const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID || '';
const LINKEDIN_CLIENT_SECRET = import.meta.env.VITE_LINKEDIN_CLIENT_SECRET || ''; // Server-side only
const LINKEDIN_REDIRECT_URI = `${window.location.origin}/auth/linkedin/callback`;
const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';

export interface LinkedInTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  token_type: string;
}

export interface LinkedInUser {
  id: string;
  firstName: {
    localized: { en_US: string };
  };
  lastName: {
    localized: { en_US: string };
  };
  profilePicture?: {
    displayImage?: string;
  };
}

export interface LinkedInConnection {
  id: string;
  firstName: string;
  lastName: string;
  headline?: string;
  pictureUrl?: string;
  profileUrl?: string;
}

export interface LinkedInActivity {
  id: string;
  type: 'POST' | 'JOB_CHANGE' | 'EDUCATION' | 'ANNIVERSARY' | 'BIRTHDAY';
  timestamp: number;
  description: string;
  actor: string;
  content?: string;
}

export interface LinkedInActivityResponse {
  elements: Array<{
    id: string;
    activity: {
      activityType: string;
      timestamp: number;
      description?: string;
    };
    actor?: {
      firstName?: { localized: { en_US: string } };
      lastName?: { localized: { en_US: string } };
    };
  }>;
}

/**
 * Generate LinkedIn OAuth authorization URL
 */
export function getLinkedInAuthUrl(): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: LINKEDIN_REDIRECT_URI,
    scope: 'openid profile email',
    state: generateStateToken(),
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 * Should be called on backend to protect client secret
 */
export async function exchangeCodeForToken(code: string): Promise<LinkedInTokens> {
  if (!LINKEDIN_CLIENT_SECRET) {
    throw new Error('LinkedIn client secret not configured');
  }

  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET,
      redirect_uri: LINKEDIN_REDIRECT_URI,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`LinkedIn token exchange failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
    token_type: data.token_type,
  };
}

/**
 * Refresh access token using refresh token
 * Call this before the access token expires
 */
export async function refreshLinkedInToken(refreshToken: string): Promise<LinkedInTokens> {
  if (!LINKEDIN_CLIENT_SECRET) {
    throw new Error('LinkedIn client secret not configured');
  }

  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`LinkedIn token refresh failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken, // Use old token if not provided
    expires_at: Date.now() + data.expires_in * 1000,
    token_type: data.token_type,
  };
}

/**
 * Get user's current profile information
 */
export async function getLinkedInProfile(accessToken: string): Promise<LinkedInUser> {
  const response = await makeLinkedInRequest('/me', accessToken);
  return response;
}

/**
 * Get user's 1st-degree connections (paginated)
 * Rate limit: 100 calls/day per user for some endpoints
 */
export async function getLinkedInConnections(
  accessToken: string,
  start: number = 0,
  count: number = 50
): Promise<LinkedInConnection[]> {
  try {
    const response = await makeLinkedInRequest(
      `/relationships/connections?start=${start}&count=${count}&projection=(id,firstName,lastName,headline,profilePicture(displayImage),publicProfileUrl)`,
      accessToken
    );

    return (response.elements || []).map((conn: any) => ({
      id: conn.id,
      firstName: conn.firstName?.localized?.en_US || '',
      lastName: conn.lastName?.localized?.en_US || '',
      headline: conn.headline?.localized?.en_US,
      pictureUrl: conn.profilePicture?.displayImage,
      profileUrl: conn.publicProfileUrl,
    }));
  } catch (error) {
    console.error('Failed to fetch connections:', error);
    return [];
  }
}

/**
 * Get user's recent activities (posts, job changes, etc.)
 */
export async function getLinkedInActivities(
  accessToken: string,
  start: number = 0,
  count: number = 50
): Promise<LinkedInActivity[]> {
  try {
    const response = await makeLinkedInRequest(
      `/activities?start=${start}&count=${count}`,
      accessToken
    );

    return (response.elements || []).map((activity: any) => {
      const actor = activity.actor
        ? `${activity.actor.firstName?.localized?.en_US || ''} ${activity.actor.lastName?.localized?.en_US || ''}`
        : 'Unknown';

      return {
        id: activity.id,
        type: mapActivityType(activity.activity?.activityType),
        timestamp: activity.activity?.timestamp || Date.now(),
        description: activity.activity?.description || '',
        actor,
        content: activity.activity?.content,
      };
    });
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    return [];
  }
}

/**
 * Get profile updates (job changes, anniversaries, etc.)
 */
export async function getLinkedInProfileUpdates(
  accessToken: string,
  start: number = 0,
  count: number = 50
): Promise<LinkedInActivity[]> {
  try {
    const response = await makeLinkedInRequest(
      `/profileUpdates?start=${start}&count=${count}`,
      accessToken
    );

    return (response.elements || []).map((update: any) => ({
      id: update.id,
      type: mapActivityType(update.actor?.firstName ? 'JOB_CHANGE' : 'ANNIVERSARY'),
      timestamp: update.timestamp || Date.now(),
      description: update.description || '',
      actor: update.actor?.firstName || 'Unknown',
      content: update.content,
    }));
  } catch (error) {
    console.error('Failed to fetch profile updates:', error);
    return [];
  }
}

/**
 * Make a rate-limited LinkedIn API request
 * Handles token expiration and retries
 */
async function makeLinkedInRequest(endpoint: string, accessToken: string, retries = 1): Promise<any> {
  // Check if token will expire in next 5 minutes
  const { data: user } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');

  const { data: credentials } = await supabase
    .from('user_credentials')
    .select('linkedin_tokens')
    .eq('user_id', user.id)
    .single();

  if (credentials?.linkedin_tokens?.expires_at && credentials.linkedin_tokens.expires_at < Date.now() + 300000) {
    // Token expiring soon, refresh it
    const newTokens = await refreshLinkedInToken(credentials.linkedin_tokens.refresh_token);
    await updateLinkedInTokens(user.id, newTokens);
    return makeLinkedInRequest(endpoint, newTokens.access_token, retries);
  }

  const response = await fetch(`${LINKEDIN_API_BASE}${endpoint}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  // Handle rate limiting (429)
  if (response.status === 429 && retries > 0) {
    const retryAfter = parseInt(response.headers.get('X-Linkedin-Ratelimit-Reset') || '60') * 1000;
    console.warn(`Rate limited. Retrying after ${retryAfter}ms`);
    await sleep(retryAfter);
    return makeLinkedInRequest(endpoint, accessToken, retries - 1);
  }

  // Handle token expired (401)
  if (response.status === 401) {
    if (credentials?.linkedin_tokens?.refresh_token) {
      const newTokens = await refreshLinkedInToken(credentials.linkedin_tokens.refresh_token);
      await updateLinkedInTokens(user.id, newTokens);
      return makeLinkedInRequest(endpoint, newTokens.access_token, retries);
    }
    throw new Error('LinkedIn token expired. Please reconnect your account.');
  }

  if (!response.ok) {
    throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Store encrypted LinkedIn tokens in database
 */
export async function updateLinkedInTokens(userId: string, tokens: LinkedInTokens): Promise<void> {
  const { error } = await supabase
    .from('user_credentials')
    .upsert(
      {
        user_id: userId,
        linkedin_tokens: tokens, // Will be encrypted at rest by Supabase
        updated_at: new Date(),
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    throw new Error(`Failed to store LinkedIn tokens: ${error.message}`);
  }
}

/**
 * Get stored LinkedIn tokens for user
 */
export async function getLinkedInTokens(userId: string): Promise<LinkedInTokens | null> {
  const { data, error } = await supabase
    .from('user_credentials')
    .select('linkedin_tokens')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.linkedin_tokens;
}

/**
 * Revoke LinkedIn access (disconnect account)
 */
export async function revokeLinkedInAccess(userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_credentials')
    .update({ linkedin_tokens: null })
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to revoke LinkedIn access: ${error.message}`);
  }
}

/**
 * Helper functions
 */

function generateStateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function mapActivityType(linkedInType: string): LinkedInActivity['type'] {
  const typeMap: Record<string, LinkedInActivity['type']> = {
    'SHARE.CREATE': 'POST',
    'ARTICLE.CREATE': 'POST',
    'PROFILE.CHANGE': 'JOB_CHANGE',
    'JOB_CHANGE': 'JOB_CHANGE',
    'EDUCATION_CHANGE': 'EDUCATION',
    'WORK_ANNIVERSARY': 'ANNIVERSARY',
  };

  return typeMap[linkedInType] || 'POST';
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
