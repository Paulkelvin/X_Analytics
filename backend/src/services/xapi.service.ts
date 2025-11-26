import axios from 'axios';
import crypto from 'crypto';

export class XAPIService {
  private clientId: string;
  private clientSecret: string;
  private callbackUrl: string;

  constructor() {
    this.clientId = process.env.X_API_CLIENT_ID || '';
    this.clientSecret = process.env.X_API_CLIENT_SECRET || '';
    this.callbackUrl = process.env.X_API_CALLBACK_URL || '';
  }

  // Generate OAuth 2.0 authorization URL
  generateAuthUrl(state: string, codeVerifier?: string): string {
    const verifier = codeVerifier || this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(verifier);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      scope: 'tweet.read users.read follows.read follows.write offline.access',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async getAccessToken(code: string, codeVerifier: string): Promise<any> {
    try {
      const response = await axios.post(
        'https://api.twitter.com/2/oauth2/token',
        new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          client_id: this.clientId,
          redirect_uri: this.callbackUrl,
          code_verifier: codeVerifier,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Get access token error:', error.response?.data || error.message);
      throw new Error('Failed to get access token');
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken: string): Promise<any> {
    try {
      const response = await axios.post(
        'https://api.twitter.com/2/oauth2/token',
        new URLSearchParams({
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
          client_id: this.clientId,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Refresh token error:', error.response?.data || error.message);
      throw new Error('Failed to refresh access token');
    }
  }

  // Get authenticated user's profile
  async getUserProfile(accessToken: string): Promise<any> {
    try {
      const response = await axios.get('https://api.twitter.com/2/users/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          'user.fields': 'id,name,username,profile_image_url,description,location,public_metrics,verified',
        },
      });

      return response.data.data;
    } catch (error: any) {
      console.error('Get user profile error:', error.response?.data || error.message);
      throw new Error('Failed to get user profile');
    }
  }

  // Get user's followers
  async getFollowers(userId: string, accessToken: string, paginationToken?: string): Promise<any> {
    try {
      const response = await axios.get(`https://api.twitter.com/2/users/${userId}/followers`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          'user.fields': 'id,name,username,profile_image_url,description,location,created_at,public_metrics,verified',
          max_results: 1000,
          pagination_token: paginationToken,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Get followers error:', error.response?.data || error.message);
      throw new Error('Failed to get followers');
    }
  }

  // Get user's following
  async getFollowing(userId: string, accessToken: string, paginationToken?: string): Promise<any> {
    try {
      const response = await axios.get(`https://api.twitter.com/2/users/${userId}/following`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          'user.fields': 'id,name,username,profile_image_url,description,location,created_at,public_metrics,verified',
          max_results: 1000,
          pagination_token: paginationToken,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Get following error:', error.response?.data || error.message);
      throw new Error('Failed to get following');
    }
  }

  // Get user's tweets
  async getUserTweets(userId: string, accessToken: string, maxResults: number = 10): Promise<any> {
    try {
      const response = await axios.get(`https://api.twitter.com/2/users/${userId}/tweets`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          'tweet.fields': 'created_at,public_metrics',
          max_results: maxResults,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Get user tweets error:', error.response?.data || error.message);
      return null; // Return null if user has no tweets or error
    }
  }

  // Unfollow user
  async unfollowUser(sourceUserId: string, targetUserId: string, accessToken: string): Promise<boolean> {
    try {
      await axios.delete(`https://api.twitter.com/2/users/${sourceUserId}/following/${targetUserId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return true;
    } catch (error: any) {
      console.error('Unfollow user error:', error.response?.data || error.message);
      throw new Error('Failed to unfollow user');
    }
  }

  // Helper: Generate code verifier for PKCE
  private generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  // Helper: Generate code challenge from verifier
  private generateCodeChallenge(verifier: string): string {
    return crypto.createHash('sha256').update(verifier).digest('base64url');
  }
}

export default new XAPIService();
