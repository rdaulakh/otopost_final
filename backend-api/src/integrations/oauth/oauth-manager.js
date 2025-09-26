const crypto = require('crypto');
const { logger } = require('../../utils/logger');
const { encrypt, decrypt } = require('../../utils/encryption');
const { redisClient } = require('../../config/redis');

class OAuthManager {
    constructor() {
        this.providers = new Map();
        this.setupProviders();
    }

    /**
     * Setup OAuth providers for all platforms
     */
    setupProviders() {
        // Social Media Platforms
        this.providers.set('facebook', {
            authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
            tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
            scopes: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list', 'instagram_basic', 'instagram_content_publish'],
            responseType: 'code',
            grantType: 'authorization_code'
        });

        this.providers.set('instagram', {
            authUrl: 'https://api.instagram.com/oauth/authorize',
            tokenUrl: 'https://api.instagram.com/oauth/access_token',
            scopes: ['user_profile', 'user_media'],
            responseType: 'code',
            grantType: 'authorization_code'
        });

        this.providers.set('twitter', {
            authUrl: 'https://twitter.com/i/oauth2/authorize',
            tokenUrl: 'https://api.twitter.com/2/oauth2/token',
            scopes: ['tweet.read', 'tweet.write', 'users.read', 'follows.read', 'follows.write'],
            responseType: 'code',
            grantType: 'authorization_code',
            codeChallengeMethod: 'S256'
        });

        this.providers.set('linkedin', {
            authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
            tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
            scopes: ['r_liteprofile', 'r_emailaddress', 'w_member_social', 'r_organization_social', 'w_organization_social'],
            responseType: 'code',
            grantType: 'authorization_code'
        });

        this.providers.set('tiktok', {
            authUrl: 'https://www.tiktok.com/auth/authorize/',
            tokenUrl: 'https://open-api.tiktok.com/oauth/access_token/',
            scopes: ['user.info.basic', 'video.list', 'video.upload'],
            responseType: 'code',
            grantType: 'authorization_code'
        });

        this.providers.set('youtube', {
            authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenUrl: 'https://oauth2.googleapis.com/token',
            scopes: ['https://www.googleapis.com/auth/youtube', 'https://www.googleapis.com/auth/youtube.upload'],
            responseType: 'code',
            grantType: 'authorization_code'
        });

        this.providers.set('pinterest', {
            authUrl: 'https://www.pinterest.com/oauth/',
            tokenUrl: 'https://api.pinterest.com/v5/oauth/token',
            scopes: ['ads:read', 'boards:read', 'boards:write', 'pins:read', 'pins:write'],
            responseType: 'code',
            grantType: 'authorization_code'
        });
    }

    /**
     * Generate OAuth authorization URL
     */
    async generateAuthUrl(platform, organizationId, userId, redirectUri, additionalParams = {}) {
        try {
            const provider = this.providers.get(platform.toLowerCase());
            if (!provider) {
                throw new Error(`Unsupported OAuth provider: ${platform}`);
            }

            // Generate state parameter for security
            const state = this.generateState(organizationId, userId, platform);
            
            // Store state in Redis for verification (expires in 10 minutes)
            await redisClient.setex(`oauth_state:${state}`, 600, JSON.stringify({
                organizationId,
                userId,
                platform,
                timestamp: Date.now()
            }));

            // Build authorization URL
            const params = new URLSearchParams({
                client_id: this.getClientId(platform),
                redirect_uri: redirectUri,
                response_type: provider.responseType,
                scope: provider.scopes.join(' '),
                state: state,
                ...additionalParams
            });

            // Add PKCE for Twitter
            if (platform.toLowerCase() === 'twitter') {
                const { codeVerifier, codeChallenge } = this.generatePKCE();
                params.append('code_challenge', codeChallenge);
                params.append('code_challenge_method', provider.codeChallengeMethod);
                
                // Store code verifier for token exchange
                await redisClient.setex(`oauth_verifier:${state}`, 600, codeVerifier);
            }

            const authUrl = `${provider.authUrl}?${params.toString()}`;

            logger.info('OAuth authorization URL generated:', {
                platform: platform,
                organizationId: organizationId,
                userId: userId,
                state: state
            });

            return {
                success: true,
                authUrl: authUrl,
                state: state,
                expiresIn: 600 // 10 minutes
            };
        } catch (error) {
            logger.error('Generate OAuth URL error:', {
                platform: platform,
                error: error.message
            });

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Exchange authorization code for access token
     */
    async exchangeCodeForToken(platform, code, state, redirectUri) {
        try {
            // Verify state parameter
            const stateData = await this.verifyState(state);
            if (!stateData) {
                throw new Error('Invalid or expired state parameter');
            }

            const provider = this.providers.get(platform.toLowerCase());
            if (!provider) {
                throw new Error(`Unsupported OAuth provider: ${platform}`);
            }

            // Prepare token exchange parameters
            const params = {
                client_id: this.getClientId(platform),
                client_secret: this.getClientSecret(platform),
                code: code,
                redirect_uri: redirectUri,
                grant_type: provider.grantType
            };

            // Add PKCE code verifier for Twitter
            if (platform.toLowerCase() === 'twitter') {
                const codeVerifier = await redisClient.get(`oauth_verifier:${state}`);
                if (!codeVerifier) {
                    throw new Error('Code verifier not found or expired');
                }
                params.code_verifier = codeVerifier;
                delete params.client_secret; // Twitter OAuth 2.0 with PKCE doesn't use client secret
            }

            // Exchange code for token
            const response = await this.makeTokenRequest(provider.tokenUrl, params, platform);
            
            if (!response.success) {
                throw new Error(response.error || 'Token exchange failed');
            }

            // Encrypt and store tokens
            const tokenData = {
                accessToken: encrypt(response.data.access_token),
                refreshToken: response.data.refresh_token ? encrypt(response.data.refresh_token) : null,
                expiresIn: response.data.expires_in,
                expiresAt: response.data.expires_in ? new Date(Date.now() + (response.data.expires_in * 1000)) : null,
                scope: response.data.scope,
                tokenType: response.data.token_type || 'Bearer',
                platform: platform,
                organizationId: stateData.organizationId,
                userId: stateData.userId,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Clean up temporary data
            await redisClient.del(`oauth_state:${state}`);
            await redisClient.del(`oauth_verifier:${state}`);

            logger.info('OAuth token exchange successful:', {
                platform: platform,
                organizationId: stateData.organizationId,
                userId: stateData.userId,
                hasRefreshToken: !!tokenData.refreshToken
            });

            return {
                success: true,
                tokenData: tokenData,
                organizationId: stateData.organizationId,
                userId: stateData.userId
            };
        } catch (error) {
            logger.error('OAuth token exchange error:', {
                platform: platform,
                error: error.message
            });

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken(platform, refreshToken, organizationId, userId) {
        try {
            const provider = this.providers.get(platform.toLowerCase());
            if (!provider) {
                throw new Error(`Unsupported OAuth provider: ${platform}`);
            }

            const decryptedRefreshToken = decrypt(refreshToken);
            
            const params = {
                client_id: this.getClientId(platform),
                client_secret: this.getClientSecret(platform),
                refresh_token: decryptedRefreshToken,
                grant_type: 'refresh_token'
            };

            const response = await this.makeTokenRequest(provider.tokenUrl, params, platform);
            
            if (!response.success) {
                throw new Error(response.error || 'Token refresh failed');
            }

            const tokenData = {
                accessToken: encrypt(response.data.access_token),
                refreshToken: response.data.refresh_token ? encrypt(response.data.refresh_token) : refreshToken,
                expiresIn: response.data.expires_in,
                expiresAt: response.data.expires_in ? new Date(Date.now() + (response.data.expires_in * 1000)) : null,
                scope: response.data.scope,
                tokenType: response.data.token_type || 'Bearer',
                platform: platform,
                organizationId: organizationId,
                userId: userId,
                updatedAt: new Date()
            };

            logger.info('OAuth token refresh successful:', {
                platform: platform,
                organizationId: organizationId,
                userId: userId
            });

            return {
                success: true,
                tokenData: tokenData
            };
        } catch (error) {
            logger.error('OAuth token refresh error:', {
                platform: platform,
                organizationId: organizationId,
                error: error.message
            });

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Revoke access token
     */
    async revokeToken(platform, accessToken, organizationId, userId) {
        try {
            const decryptedToken = decrypt(accessToken);
            let revokeUrl;
            let params = {};

            // Platform-specific revocation endpoints
            switch (platform.toLowerCase()) {
                case 'facebook':
                case 'instagram':
                    revokeUrl = `https://graph.facebook.com/me/permissions?access_token=${decryptedToken}`;
                    break;
                case 'twitter':
                    revokeUrl = 'https://api.twitter.com/2/oauth2/revoke';
                    params = {
                        token: decryptedToken,
                        client_id: this.getClientId(platform)
                    };
                    break;
                case 'linkedin':
                    revokeUrl = 'https://www.linkedin.com/oauth/v2/revoke';
                    params = {
                        token: decryptedToken,
                        client_id: this.getClientId(platform),
                        client_secret: this.getClientSecret(platform)
                    };
                    break;
                case 'youtube':
                    revokeUrl = `https://oauth2.googleapis.com/revoke?token=${decryptedToken}`;
                    break;
                default:
                    // For platforms without revocation endpoint, just return success
                    logger.info('Token revocation not supported for platform:', platform);
                    return { success: true, message: 'Token marked as revoked locally' };
            }

            // Make revocation request
            const response = await this.makeRevokeRequest(revokeUrl, params, platform);

            logger.info('OAuth token revocation successful:', {
                platform: platform,
                organizationId: organizationId,
                userId: userId
            });

            return {
                success: true,
                message: 'Token revoked successfully'
            };
        } catch (error) {
            logger.error('OAuth token revocation error:', {
                platform: platform,
                organizationId: organizationId,
                error: error.message
            });

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Validate access token
     */
    async validateToken(platform, accessToken) {
        try {
            const decryptedToken = decrypt(accessToken);
            let validationUrl;
            let headers = {};

            // Platform-specific validation endpoints
            switch (platform.toLowerCase()) {
                case 'facebook':
                case 'instagram':
                    validationUrl = `https://graph.facebook.com/me?access_token=${decryptedToken}`;
                    break;
                case 'twitter':
                    validationUrl = 'https://api.twitter.com/2/users/me';
                    headers['Authorization'] = `Bearer ${decryptedToken}`;
                    break;
                case 'linkedin':
                    validationUrl = 'https://api.linkedin.com/v2/me';
                    headers['Authorization'] = `Bearer ${decryptedToken}`;
                    break;
                case 'youtube':
                    validationUrl = 'https://www.googleapis.com/oauth2/v1/tokeninfo';
                    headers['Authorization'] = `Bearer ${decryptedToken}`;
                    break;
                default:
                    throw new Error(`Token validation not implemented for platform: ${platform}`);
            }

            const response = await this.makeValidationRequest(validationUrl, headers, platform);

            return {
                success: response.success,
                valid: response.success,
                data: response.data,
                error: response.error
            };
        } catch (error) {
            logger.error('OAuth token validation error:', {
                platform: platform,
                error: error.message
            });

            return {
                success: false,
                valid: false,
                error: error.message
            };
        }
    }

    /**
     * Generate secure state parameter
     */
    generateState(organizationId, userId, platform) {
        const data = `${organizationId}:${userId}:${platform}:${Date.now()}`;
        return crypto.createHash('sha256').update(data + process.env.JWT_SECRET).digest('hex');
    }

    /**
     * Verify state parameter
     */
    async verifyState(state) {
        try {
            const stateData = await redisClient.get(`oauth_state:${state}`);
            if (!stateData) {
                return null;
            }

            const data = JSON.parse(stateData);
            
            // Check if state is not too old (10 minutes max)
            if (Date.now() - data.timestamp > 600000) {
                await redisClient.del(`oauth_state:${state}`);
                return null;
            }

            return data;
        } catch (error) {
            logger.error('State verification error:', error.message);
            return null;
        }
    }

    /**
     * Generate PKCE code verifier and challenge for Twitter
     */
    generatePKCE() {
        const codeVerifier = crypto.randomBytes(32).toString('base64url');
        const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
        
        return {
            codeVerifier,
            codeChallenge
        };
    }

    /**
     * Get client ID for platform
     */
    getClientId(platform) {
        const envKey = `${platform.toUpperCase()}_CLIENT_ID`;
        return process.env[envKey];
    }

    /**
     * Get client secret for platform
     */
    getClientSecret(platform) {
        const envKey = `${platform.toUpperCase()}_CLIENT_SECRET`;
        return process.env[envKey];
    }

    /**
     * Make token exchange request
     */
    async makeTokenRequest(url, params, platform) {
        try {
            const fetch = require('node-fetch');
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: new URLSearchParams(params)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error_description || data.error || 'Token request failed');
            }

            return {
                success: true,
                data: data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Make token revocation request
     */
    async makeRevokeRequest(url, params, platform) {
        try {
            const fetch = require('node-fetch');
            
            let options = {
                method: platform.toLowerCase() === 'facebook' ? 'DELETE' : 'POST',
                headers: {
                    'Accept': 'application/json'
                }
            };

            if (Object.keys(params).length > 0) {
                options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                options.body = new URLSearchParams(params);
            }

            const response = await fetch(url, options);
            
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error_description || data.error || 'Token revocation failed');
            }

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Make token validation request
     */
    async makeValidationRequest(url, headers, platform) {
        try {
            const fetch = require('node-fetch');
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    ...headers
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error_description || data.error || 'Token validation failed');
            }

            return {
                success: true,
                data: data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get OAuth connection status for organization
     */
    async getConnectionStatus(organizationId) {
        try {
            const platforms = Array.from(this.providers.keys());
            const status = {};

            for (const platform of platforms) {
                // This would typically query the database for stored tokens
                // For now, return a placeholder structure
                status[platform] = {
                    connected: false,
                    connectedAt: null,
                    expiresAt: null,
                    hasRefreshToken: false,
                    scopes: this.providers.get(platform).scopes
                };
            }

            return {
                success: true,
                organizationId: organizationId,
                connections: status
            };
        } catch (error) {
            logger.error('Get connection status error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new OAuthManager();

