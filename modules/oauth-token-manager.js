// oauth-token-manager.js
// Shared OAuth and Token Management Module (ES6)

export class OAuthTokenManager {
    constructor(config = {}) {
        this.clientId = config.clientId || null;
        this.clientSecret = config.clientSecret || null;
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
        this.storageKey = config.storageKey || 'oauth_tokens';
        this.scope = config.scope || 'https://www.googleapis.com/auth/spreadsheets';
        this.tokenRefreshCallback = config.onTokenRefresh || null;
        this.tokenExpiryCallback = config.onTokenExpiry || null;
        
        // Auto-refresh setup
        this.refreshInterval = null;
        this.startTokenExpiryCheck();
    }
    
    // Initialize from localStorage
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.clientId = data.clientId || this.clientId;
                this.clientSecret = data.clientSecret || this.clientSecret;
                this.accessToken = data.accessToken || null;
                this.refreshToken = data.refreshToken || null;
                this.tokenExpiry = data.tokenExpiry || null;
                return true;
            }
        } catch (error) {
            console.error('Error loading OAuth data from storage:', error);
        }
        return false;
    }
    
    // Save to localStorage
    saveToStorage() {
        try {
            const data = {
                clientId: this.clientId,
                clientSecret: this.clientSecret,
                accessToken: this.accessToken,
                refreshToken: this.refreshToken,
                tokenExpiry: this.tokenExpiry
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving OAuth data to storage:', error);
            return false;
        }
    }
    
    // Start OAuth flow
    authenticate(redirectUri = null) {
        if (!this.clientId) {
            throw new Error('Client ID is required for authentication');
        }
        
        const actualRedirectUri = redirectUri || window.location.origin + window.location.pathname;
        
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${this.clientId}` +
            `&redirect_uri=${encodeURIComponent(actualRedirectUri)}` +
            `&response_type=code` +
            `&scope=${encodeURIComponent(this.scope)}` +
            `&access_type=offline` +
            `&prompt=consent`;
        
        window.location.href = authUrl;
    }
    
    // Check for OAuth code in URL and exchange for tokens
    async handleAuthCallback(redirectUri = null) {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
            return false;
        }
        
        try {
            await this.exchangeCodeForTokens(code, redirectUri);
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return true;
        } catch (error) {
            console.error('Error handling auth callback:', error);
            throw error;
        }
    }
    
    // Exchange authorization code for tokens
    async exchangeCodeForTokens(code, redirectUri = null) {
        if (!this.clientId || !this.clientSecret) {
            throw new Error('Client ID and Client Secret are required for token exchange');
        }
        
        const actualRedirectUri = redirectUri || window.location.origin + window.location.pathname;
        
        try {
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    code: code,
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    redirect_uri: actualRedirectUri,
                    grant_type: 'authorization_code'
                })
            });
            
            const data = await response.json();
            
            if (data.access_token) {
                this.accessToken = data.access_token;
                this.refreshToken = data.refresh_token;
                this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000)).toISOString();
                this.saveToStorage();
                
                if (this.tokenRefreshCallback) {
                    this.tokenRefreshCallback(this.accessToken, this.tokenExpiry);
                }
                
                return {
                    accessToken: this.accessToken,
                    refreshToken: this.refreshToken,
                    tokenExpiry: this.tokenExpiry
                };
            } else {
                throw new Error(data.error || 'Failed to get tokens');
            }
        } catch (error) {
            console.error('Token exchange error:', error);
            throw error;
        }
    }
    
    // Refresh access token
    async refreshAccessToken() {
        if (!this.refreshToken || !this.clientId || !this.clientSecret) {
            throw new Error('Cannot refresh token: missing required credentials');
        }
        
        try {
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    refresh_token: this.refreshToken,
                    grant_type: 'refresh_token'
                })
            });
            
            const data = await response.json();
            
            if (data.access_token) {
                this.accessToken = data.access_token;
                this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000)).toISOString();
                this.saveToStorage();
                
                if (this.tokenRefreshCallback) {
                    this.tokenRefreshCallback(this.accessToken, this.tokenExpiry);
                }
                
                return this.accessToken;
            } else {
                throw new Error(data.error || 'Failed to refresh token');
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            throw error;
        }
    }
    
    // Check token expiry
    checkTokenExpiry() {
        if (!this.tokenExpiry || !this.refreshToken) return null;
        
        const now = new Date().getTime();
        const expiry = new Date(this.tokenExpiry).getTime();
        const timeLeft = expiry - now;
        
        // Auto-refresh if less than 5 minutes left
        if (timeLeft < 5 * 60 * 1000 && timeLeft > 0) {
            this.refreshAccessToken().catch(error => {
                console.error('Auto-refresh failed:', error);
                if (this.tokenExpiryCallback) {
                    this.tokenExpiryCallback(error);
                }
            });
        }
        
        return {
            expired: timeLeft <= 0,
            timeLeft: timeLeft,
            minutesLeft: Math.floor(timeLeft / 60000)
        };
    }
    
    // Start automatic token expiry checking
    startTokenExpiryCheck(intervalMs = 60000) {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        this.refreshInterval = setInterval(() => {
            this.checkTokenExpiry();
        }, intervalMs);
    }
    
    // Stop automatic token expiry checking
    stopTokenExpiryCheck() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
    
    // Update credentials
    updateCredentials(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.saveToStorage();
    }
    
    // Get current token status
    getStatus() {
        const expiryInfo = this.checkTokenExpiry();
        
        return {
            hasAccessToken: !!this.accessToken,
            hasRefreshToken: !!this.refreshToken,
            isAuthenticated: !!this.accessToken && (!expiryInfo || !expiryInfo.expired),
            canAutoRefresh: !!this.refreshToken && !!this.clientSecret,
            tokenExpiry: this.tokenExpiry,
            expiryInfo: expiryInfo
        };
    }
    
    // Clear all tokens
    clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
        this.saveToStorage();
    }
    
    // Get headers for API requests
    getAuthHeaders() {
        if (!this.accessToken) {
            throw new Error('No access token available');
        }
        
        return {
            'Authorization': 'Bearer ' + this.accessToken
        };
    }
    
    // Make authenticated request with auto-retry on 401
    async makeAuthenticatedRequest(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    ...this.getAuthHeaders()
                }
            });
            
            if (response.status === 401 && this.refreshToken) {
                // Try to refresh token and retry
                await this.refreshAccessToken();
                
                return fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        ...this.getAuthHeaders()
                    }
                });
            }
            
            return response;
        } catch (error) {
            console.error('Authenticated request error:', error);
            throw error;
        }
    }
}