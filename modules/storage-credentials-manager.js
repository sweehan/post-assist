// storage-credentials-manager.js
// Shared Storage and Credentials Management Module (ES6)

export class StorageManager {
    constructor(config = {}) {
        this.namespace = config.namespace || 'app';
        this.encryption = config.encryption || false; // For future implementation
        this.credentialKeys = config.credentialKeys || [];
    }
    
    // Generate storage key with namespace
    getKey(key) {
        return `${this.namespace}_${key}`;
    }
    
    // Save data to localStorage
    save(key, data) {
        try {
            const storageKey = this.getKey(key);
            const dataStr = JSON.stringify(data);
            localStorage.setItem(storageKey, dataStr);
            return true;
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            return false;
        }
    }
    
    // Load data from localStorage
    load(key, defaultValue = null) {
        try {
            const storageKey = this.getKey(key);
            const dataStr = localStorage.getItem(storageKey);
            if (!dataStr) return defaultValue;
            return JSON.parse(dataStr);
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return defaultValue;
        }
    }
    
    // Remove data from localStorage
    remove(key) {
        try {
            const storageKey = this.getKey(key);
            localStorage.removeItem(storageKey);
            return true;
        } catch (error) {
            console.error(`Error removing ${key}:`, error);
            return false;
        }
    }
    
    // Check if key exists
    exists(key) {
        const storageKey = this.getKey(key);
        return localStorage.getItem(storageKey) !== null;
    }
    
    // Clear all data with namespace
    clearAll() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.namespace + '_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }
    
    // Get all keys in namespace
    getAllKeys() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.namespace + '_')) {
                keys.push(key.substring(this.namespace.length + 1));
            }
        }
        return keys;
    }
    
    // Batch operations
    saveBatch(items) {
        const results = {};
        for (const [key, value] of Object.entries(items)) {
            results[key] = this.save(key, value);
        }
        return results;
    }
    
    loadBatch(keys) {
        const results = {};
        for (const key of keys) {
            results[key] = this.load(key);
        }
        return results;
    }
}

export class CredentialsManager extends StorageManager {
    constructor(config = {}) {
        super(config);
        this.credentialTypes = {
            google: ['clientId', 'clientSecret', 'spreadsheetId', 'accessToken', 'refreshToken', 'tokenExpiry'],
            wordpress: ['url', 'username', 'password'],
            ai: ['provider', 'apiKey', 'proxyUrl', 'model'],
            content: ['hashtags', 'templates', 'defaults']
        };
    }
    
    // Save credentials for a specific service
    saveCredentials(service, credentials) {
        // Filter out sensitive data if needed
        const filtered = this.filterCredentials(service, credentials);
        return this.save(`credentials_${service}`, filtered);
    }
    
    // Load credentials for a specific service
    loadCredentials(service) {
        return this.load(`credentials_${service}`, {});
    }
    
    // Update specific credential fields
    updateCredentials(service, updates) {
        const current = this.loadCredentials(service);
        const updated = { ...current, ...updates };
        return this.saveCredentials(service, updated);
    }
    
    // Check if credentials exist for a service
    hasCredentials(service) {
        const creds = this.loadCredentials(service);
        return creds && Object.keys(creds).length > 0;
    }
    
    // Validate credentials for a service
    validateCredentials(service, credentials = null) {
        const creds = credentials || this.loadCredentials(service);
        const requiredFields = this.getRequiredFields(service);
        
        const missing = [];
        for (const field of requiredFields) {
            if (!creds[field]) {
                missing.push(field);
            }
        }
        
        return {
            valid: missing.length === 0,
            missing: missing,
            hasPartial: Object.keys(creds).length > 0 && missing.length > 0
        };
    }
    
    // Get required fields for a service
    getRequiredFields(service) {
        const requirements = {
            google: ['clientId', 'spreadsheetId'],
            wordpress: ['url', 'username', 'password'],
            ai: ['provider', 'apiKey'],
            content: []
        };
        return requirements[service] || [];
    }
    
    // Clear credentials for a service
    clearCredentials(service) {
        return this.remove(`credentials_${service}`);
    }
    
    // Filter out sensitive data based on service
    filterCredentials(service, credentials) {
        // In a real implementation, you might want to encrypt sensitive data
        // For now, we'll just return as-is
        return credentials;
    }
    
    // Get all configured services
    getConfiguredServices() {
        const services = [];
        const allKeys = this.getAllKeys();
        
        for (const key of allKeys) {
            if (key.startsWith('credentials_')) {
                const service = key.substring('credentials_'.length);
                const validation = this.validateCredentials(service);
                services.push({
                    name: service,
                    configured: validation.valid,
                    partial: validation.hasPartial
                });
            }
        }
        
        return services;
    }
    
    // Export all credentials (for backup)
    exportCredentials(includeTokens = false) {
        const allKeys = this.getAllKeys();
        const credentials = {};
        
        for (const key of allKeys) {
            if (key.startsWith('credentials_')) {
                const service = key.substring('credentials_'.length);
                const creds = this.loadCredentials(service);
                
                // Optionally exclude tokens
                if (!includeTokens && creds) {
                    delete creds.accessToken;
                    delete creds.refreshToken;
                    delete creds.tokenExpiry;
                }
                
                credentials[service] = creds;
            }
        }
        
        return credentials;
    }
    
    // Import credentials (from backup)
    importCredentials(credentials, overwrite = false) {
        const results = {};
        
        for (const [service, creds] of Object.entries(credentials)) {
            if (overwrite || !this.hasCredentials(service)) {
                results[service] = this.saveCredentials(service, creds);
            } else {
                results[service] = false; // Skipped
            }
        }
        
        return results;
    }
}

export class PostsManager extends StorageManager {
    constructor(config = {}) {
        super(config);
        this.postsKey = 'generated_posts';
        this.maxPosts = config.maxPosts || 1000;
    }
    
    // Save a new post
    savePost(post) {
        const posts = this.getAllPosts();
        
        // Add timestamp and ID if not present
        if (!post.id) {
            post.id = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        if (!post.timestamp) {
            post.timestamp = new Date().toISOString();
        }
        
        posts.unshift(post); // Add to beginning
        
        // Limit number of posts
        if (posts.length > this.maxPosts) {
            posts.splice(this.maxPosts);
        }
        
        return this.save(this.postsKey, posts);
    }
    
    // Get all posts
    getAllPosts() {
        return this.load(this.postsKey, []);
    }
    
    // Get posts by criteria
    getPostsByFilter(filter) {
        const posts = this.getAllPosts();
        
        return posts.filter(post => {
            if (filter.source && post.source !== filter.source) return false;
            if (filter.platform && post.platform !== filter.platform) return false;
            if (filter.status && post.status !== filter.status) return false;
            if (filter.dateFrom && new Date(post.timestamp) < new Date(filter.dateFrom)) return false;
            if (filter.dateTo && new Date(post.timestamp) > new Date(filter.dateTo)) return false;
            return true;
        });
    }
    
    // Update a post
    updatePost(postId, updates) {
        const posts = this.getAllPosts();
        const index = posts.findIndex(p => p.id === postId);
        
        if (index !== -1) {
            posts[index] = { ...posts[index], ...updates, lastModified: new Date().toISOString() };
            return this.save(this.postsKey, posts);
        }
        
        return false;
    }
    
    // Delete a post
    deletePost(postId) {
        const posts = this.getAllPosts();
        const filtered = posts.filter(p => p.id !== postId);
        
        if (filtered.length < posts.length) {
            return this.save(this.postsKey, filtered);
        }
        
        return false;
    }
    
    // Clear all posts
    clearAllPosts() {
        return this.save(this.postsKey, []);
    }
    
    // Get posts statistics
    getStatistics() {
        const posts = this.getAllPosts();
        const stats = {
            total: posts.length,
            bySource: {},
            byPlatform: {},
            byStatus: {},
            lastGenerated: null
        };
        
        posts.forEach(post => {
            // By source
            const source = post.source || 'unknown';
            stats.bySource[source] = (stats.bySource[source] || 0) + 1;
            
            // By platform
            const platform = post.platform || 'unknown';
            stats.byPlatform[platform] = (stats.byPlatform[platform] || 0) + 1;
            
            // By status
            const status = post.status || 'draft';
            stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
        });
        
        // Last generated
        if (posts.length > 0) {
            stats.lastGenerated = posts[0].timestamp;
        }
        
        return stats;
    }
}