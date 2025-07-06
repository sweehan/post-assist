// ai-api-manager.js
// Shared AI API Module for Claude and OpenAI (ES6)

export class AIAPIManager {
    constructor(config = {}) {
        this.provider = config.provider || 'claude'; // 'claude', 'openai', or 'manual'
        this.apiKey = config.apiKey || null;
        this.proxyUrl = config.proxyUrl || null;
        this.storageKey = config.storageKey || 'ai_api_config';
        this.defaultModel = config.defaultModel || null;
        
        // Load from storage on init
        this.loadFromStorage();
    }
    
    // Load configuration from localStorage
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.provider = data.provider || this.provider;
                this.apiKey = data.apiKey || this.apiKey;
                this.proxyUrl = data.proxyUrl || this.proxyUrl;
                this.defaultModel = data.defaultModel || this.defaultModel;
                return true;
            }
        } catch (error) {
            console.error('Error loading AI config from storage:', error);
        }
        return false;
    }
    
    // Save configuration to localStorage
    saveToStorage() {
        try {
            const data = {
                provider: this.provider,
                apiKey: this.apiKey,
                proxyUrl: this.proxyUrl,
                defaultModel: this.defaultModel
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving AI config to storage:', error);
            return false;
        }
    }
    
    // Update configuration
    updateConfig(config) {
        if (config.provider) this.provider = config.provider;
        if (config.apiKey !== undefined) this.apiKey = config.apiKey;
        if (config.proxyUrl !== undefined) this.proxyUrl = config.proxyUrl;
        if (config.defaultModel !== undefined) this.defaultModel = config.defaultModel;
        this.saveToStorage();
    }
    
    // Generate content using the configured AI provider
    async generateContent(systemPrompt, userPrompt, options = {}) {
        if (this.provider === 'manual') {
            throw new Error('Manual mode selected - AI generation not available');
        }
        
        if (!this.apiKey) {
            throw new Error(`API key not configured for ${this.provider}`);
        }
        
        try {
            if (this.provider === 'claude') {
                return await this.callClaudeAPI(systemPrompt, userPrompt, options);
            } else if (this.provider === 'openai') {
                return await this.callOpenAIAPI(systemPrompt, userPrompt, options);
            } else {
                throw new Error(`Unknown AI provider: ${this.provider}`);
            }
        } catch (error) {
            console.error(`AI API error (${this.provider}):`, error);
            throw error;
        }
    }
    
    // Call Claude API
    async callClaudeAPI(systemPrompt, userPrompt, options = {}) {
        const model = options.model || this.defaultModel || 'claude-3-opus-20240229';
        const maxTokens = options.maxTokens || 1000;
        const temperature = options.temperature || 0.7;
        
        if (!this.proxyUrl) {
            throw new Error('Cloudflare Worker URL not configured for Claude API');
        }
        
        const requestBody = {
            model: model,
            system: systemPrompt,  // System prompt as top-level parameter
            messages: [
                {
                    role: 'user',
                    content: userPrompt
                }
            ],
            max_tokens: maxTokens,
            temperature: temperature
        };
        
        try {
            const response = await fetch(this.proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Claude API error: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            
            if (!data.content || !data.content[0] || !data.content[0].text) {
                throw new Error('Invalid response structure from Claude API');
            }
            
            return {
                content: data.content[0].text,
                usage: data.usage || null,
                model: data.model || model,
                raw: data
            };
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error('Network error - please check:\n1. Cloudflare Worker URL is correct\n2. Worker is deployed and running\n3. CORS headers are configured in the worker');
            }
            throw error;
        }
    }
    
    // Call OpenAI API
    async callOpenAIAPI(systemPrompt, userPrompt, options = {}) {
        const model = options.model || this.defaultModel || 'gpt-4';
        const maxTokens = options.maxTokens || 1000;
        const temperature = options.temperature || 0.7;
        
        const requestBody = {
            model: model,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userPrompt
                }
            ],
            max_tokens: maxTokens,
            temperature: temperature
        };
        
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid response structure from OpenAI API');
            }
            
            return {
                content: data.choices[0].message.content,
                usage: data.usage || null,
                model: data.model || model,
                raw: data
            };
        } catch (error) {
            throw error;
        }
    }
    
    // Parse structured response (for both providers)
    parseStructuredResponse(content, sections) {
        const result = {};
        const lines = content.split('\n');
        let currentSection = '';
        let currentContent = [];
        
        for (const line of lines) {
            let sectionFound = false;
            
            for (const section of sections) {
                if (line.startsWith(section + ':')) {
                    // Save previous section if exists
                    if (currentSection) {
                        result[currentSection] = currentContent.join('\n').trim();
                    }
                    
                    // Start new section
                    currentSection = section;
                    currentContent = [line.substring(section.length + 1).trim()];
                    sectionFound = true;
                    break;
                }
            }
            
            if (!sectionFound && currentSection) {
                currentContent.push(line);
            }
        }
        
        // Save last section
        if (currentSection) {
            result[currentSection] = currentContent.join('\n').trim();
        }
        
        return result;
    }
    
    // Test API connection
    async testConnection() {
        try {
            const response = await this.generateContent(
                'You are a helpful assistant.',
                'Please respond with exactly: "Connection successful"',
                { maxTokens: 50 }
            );
            
            return {
                success: response.content.includes('Connection successful'),
                provider: this.provider,
                model: response.model,
                response: response.content
            };
        } catch (error) {
            return {
                success: false,
                provider: this.provider,
                error: error.message
            };
        }
    }
    
    // Get configuration status
    getStatus() {
        return {
            provider: this.provider,
            isConfigured: this.provider === 'manual' || !!this.apiKey,
            hasApiKey: !!this.apiKey,
            hasProxyUrl: !!this.proxyUrl,
            needsProxy: this.provider === 'claude',
            model: this.defaultModel
        };
    }
    
    // Clear configuration
    clearConfig() {
        this.apiKey = null;
        this.proxyUrl = null;
        this.saveToStorage();
    }
}