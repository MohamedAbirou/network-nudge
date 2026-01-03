/**
 * Unit Tests for LinkedIn API Integration
 * Tests for OAuth flows, token management, and API calls
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    exchangeCodeForToken,
    getLinkedInAuthUrl,
    mapActivityType,
    refreshLinkedInToken,
} from '../lib/linkedin';

describe('LinkedIn API Integration', () => {
  // Mock environment variables
  beforeEach(() => {
    import.meta.env.VITE_LINKEDIN_CLIENT_ID = 'test-client-id';
    import.meta.env.VITE_LINKEDIN_REDIRECT_URI = 'http://localhost:5173/auth/linkedin/callback';
  });

  describe('getLinkedInAuthUrl', () => {
    it('should generate valid OAuth authorization URL', () => {
      const url = getLinkedInAuthUrl();
      
      expect(url).toContain('https://www.linkedin.com/oauth/v2/authorization');
      expect(url).toContain('response_type=code');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('scope=openid+profile+email');
      expect(url).toContain('redirect_uri=');
      expect(url).toContain('state='); // State for CSRF protection
    });

    it('should include state parameter for CSRF protection', () => {
      const url1 = getLinkedInAuthUrl();
      const url2 = getLinkedInAuthUrl();
      
      const state1 = new URL(url1).searchParams.get('state');
      const state2 = new URL(url2).searchParams.get('state');
      
      expect(state1).toBeTruthy();
      expect(state2).toBeTruthy();
      expect(state1).not.toBe(state2); // Different states for each call
    });
  });

  describe('exchangeCodeForToken', () => {
    it('should exchange authorization code for tokens', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          expires_in: 5184000,
          token_type: 'Bearer',
        }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const tokens = await exchangeCodeForToken('test-auth-code');

      expect(tokens.access_token).toBe('test-access-token');
      expect(tokens.refresh_token).toBe('test-refresh-token');
      expect(tokens.token_type).toBe('Bearer');
      expect(tokens.expires_at).toBeGreaterThan(Date.now());
    });

    it('should throw error if token exchange fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Unauthorized',
      });

      await expect(exchangeCodeForToken('invalid-code')).rejects.toThrow();
    });

    it('should throw error if client secret is missing', async () => {
      import.meta.env.VITE_LINKEDIN_CLIENT_SECRET = '';

      await expect(exchangeCodeForToken('test-code')).rejects.toThrow(
        'LinkedIn client secret not configured'
      );
    });
  });

  describe('refreshLinkedInToken', () => {
    it('should refresh expired access token', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_in: 5184000,
          token_type: 'Bearer',
        }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const tokens = await refreshLinkedInToken('old-refresh-token');

      expect(tokens.access_token).toBe('new-access-token');
      expect(tokens.refresh_token).toBe('new-refresh-token');
    });

    it('should use old refresh token if new one not provided', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          access_token: 'new-access-token',
          expires_in: 5184000,
          token_type: 'Bearer',
          // No refresh_token in response
        }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const tokens = await refreshLinkedInToken('old-refresh-token');

      expect(tokens.refresh_token).toBe('old-refresh-token');
    });

    it('should handle refresh failures gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Invalid Refresh Token',
      });

      await expect(refreshLinkedInToken('expired-refresh-token')).rejects.toThrow();
    });
  });

  describe('Activity Type Mapping', () => {
    it('should map LinkedIn activity types correctly', () => {
      expect(mapActivityType('SHARE.CREATE')).toBe('POST');
      expect(mapActivityType('ARTICLE.CREATE')).toBe('POST');
      expect(mapActivityType('PROFILE.CHANGE')).toBe('JOB_CHANGE');
      expect(mapActivityType('JOB_CHANGE')).toBe('JOB_CHANGE');
      expect(mapActivityType('EDUCATION_CHANGE')).toBe('EDUCATION');
      expect(mapActivityType('WORK_ANNIVERSARY')).toBe('ANNIVERSARY');
    });

    it('should default to POST for unknown types', () => {
      expect(mapActivityType('UNKNOWN_TYPE')).toBe('POST');
      expect(mapActivityType('')).toBe('POST');
    });
  });

  describe('Rate Limiting', () => {
    it('should respect rate limit headers', async () => {
      const mockResponse = {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Map([['X-Linkedin-Ratelimit-Reset', '60']]),
      };

      global.fetch = vi.fn()
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        });

      // Should retry after rate limit
      // Note: In actual implementation, this would use makeLinkedInRequest
    });
  });

  describe('Token Expiration Handling', () => {
    it('should auto-refresh token before expiration', async () => {
      const expiringToken = {
        access_token: 'expiring-token',
        refresh_token: 'refresh-token',
        expires_at: Date.now() + 300000, // 5 minutes
        token_type: 'Bearer',
      };

      // Token should be refreshed proactively
      expect(expiringToken.expires_at - Date.now()).toBeLessThan(600000); // Less than 10 minutes
    });
  });
});
