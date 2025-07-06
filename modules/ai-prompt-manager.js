// ai-prompt-manager.js
// AI Prompt Management Module (ES6)

export class AIPromptManager {
    constructor(config = {}) {
        this.storageKey = config.storageKey || 'ai_prompts';
        this.namespace = config.namespace || 'default';
        this.templates = {};
        this.variables = {};
        
        // Load saved prompts on initialization
        this.loadPrompts();
    }
    
    // Default prompt templates
    static DEFAULT_TEMPLATES = {
        blog: {
            system: `You are an expert blog writer who creates engaging, informative, and SEO-optimized content. You understand how to craft compelling narratives that educate and inspire readers while maintaining a conversational yet professional tone.`,
            
            main: `Based on the following topic and keywords, create a comprehensive blog post that:

1. Starts with an attention-grabbing hook that immediately draws readers in
2. Uses a conversational tone while maintaining authority and expertise
3. Includes practical examples, actionable tips, and real-world applications
4. Incorporates clear calls-to-action throughout and at the end
5. Is optimized for engagement and SEO without keyword stuffing
6. Provides genuine value that readers will want to share and bookmark

Topic: {title}
Keywords: {keywords}
Additional Context: {topic}

Create a blog post that's between 800-1200 words, structured with clear headings and subheadings. Focus on delivering value that will resonate with our target audience.

Format your response as:
TITLE: [SEO-optimized title]
CONTENT: [Full blog post in HTML format with proper headings]
META_DESCRIPTION: [150-160 character meta description]
FEATURED_IMAGE_SUGGESTION: [Description of ideal featured image]`,
            
            audience: `Our target audience consists of entrepreneurs, small business owners, and professionals aged 25-45 who are looking to grow their business and improve their skills. They value practical, actionable content that saves them time and helps them achieve their goals.`
        },
        
        instagram: {
            system: `You are an expert Instagram content creator who specializes in transforming blog content into engaging, authentic Instagram posts. You understand Instagram's culture, best practices, and how to create content that stops the scroll and drives engagement.`,
            
            main: `Based on the following blog content, create an engaging Instagram caption that:

1. Starts with a powerful hook that grabs attention
2. Delivers value in a conversational, authentic tone
3. Includes a clear call-to-action (question, prompt, or action)
4. Uses relevant emojis strategically (not excessively)
5. Is optimized for Instagram's algorithm (encourages comments, saves, and shares)
6. Matches the voice and style of our target audience

Blog Content:
{blogContent}

Topic: {topic}
Keywords: {keywords}

Create a caption that feels native to Instagram, not like a blog post summary. Focus on one key insight or takeaway that will resonate with our audience. The caption should be between 125-150 words for optimal engagement.

Format your response as:
CAPTION: [Your caption here]
HASHTAGS: [5-10 highly relevant hashtags]
CTA: [Specific call-to-action for comments]`,
            
            audience: `Our target audience consists of entrepreneurs, content creators, and professionals aged 25-45 who are looking to grow their online presence and business. They value authentic, actionable content and appreciate both inspiration and practical tips.`
        },
        
        twitter: {
            system: `You are an expert Twitter content creator who knows how to craft viral, engaging tweets that drive conversation and shares. You understand Twitter's fast-paced nature and character limitations.`,
            
            main: `Transform this content into a Twitter thread that:

1. Starts with a hook tweet that makes people want to read more
2. Breaks down complex ideas into digestible tweets
3. Uses relevant hashtags and mentions strategically
4. Encourages retweets and replies
5. Provides value in every tweet

Content: {content}
Keywords: {keywords}

Create a thread of 3-5 tweets maximum. Format as:
TWEET_1: [Hook tweet]
TWEET_2: [Follow-up]
...
HASHTAGS: [2-3 relevant hashtags]`,
            
            audience: `Tech-savvy professionals and entrepreneurs who appreciate concise, valuable insights and actionable tips.`
        },
        
        linkedin: {
            system: `You are a LinkedIn content strategist who creates professional, thought-leadership content that builds authority and drives meaningful business connections.`,
            
            main: `Create a LinkedIn post from this content that:

1. Establishes thought leadership
2. Provides professional insights
3. Encourages meaningful discussion
4. Maintains a professional yet personable tone
5. Includes a compelling call-to-action

Content: {content}
Topic: {topic}
Keywords: {keywords}

Format as:
POST: [LinkedIn post content]
HASHTAGS: [3-5 professional hashtags]`,
            
            audience: `Business professionals, executives, and decision-makers looking for industry insights and professional development.`
        }
    };
    
    // Load prompts from storage
    loadPrompts() {
        try {
            const stored = localStorage.getItem(this.getStorageKey());
            if (stored) {
                const data = JSON.parse(stored);
                this.templates = data.templates || {};
                this.variables = data.variables || {};
                return true;
            }
        } catch (error) {
            console.error('Error loading prompts:', error);
        }
        return false;
    }
    
    // Save prompts to storage
    savePrompts() {
        try {
            const data = {
                templates: this.templates,
                variables: this.variables,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(this.getStorageKey(), JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving prompts:', error);
            return false;
        }
    }
    
    // Get storage key with namespace
    getStorageKey() {
        return `${this.storageKey}_${this.namespace}`;
    }
    
    // Get a specific template
    getTemplate(platform, type = 'main') {
        // Check custom templates first
        if (this.templates[platform] && this.templates[platform][type]) {
            return this.templates[platform][type];
        }
        
        // Fall back to defaults
        if (AIPromptManager.DEFAULT_TEMPLATES[platform] && AIPromptManager.DEFAULT_TEMPLATES[platform][type]) {
            return AIPromptManager.DEFAULT_TEMPLATES[platform][type];
        }
        
        return null;
    }
    
    // Set a custom template
    setTemplate(platform, type, template) {
        if (!this.templates[platform]) {
            this.templates[platform] = {};
        }
        this.templates[platform][type] = template;
        this.savePrompts();
    }
    
    // Get all prompts for a platform
    getPrompts(platform) {
        const custom = this.templates[platform] || {};
        const defaults = AIPromptManager.DEFAULT_TEMPLATES[platform] || {};
        
        return {
            system: custom.system || defaults.system || '',
            main: custom.main || defaults.main || '',
            audience: custom.audience || defaults.audience || ''
        };
    }
    
    // Set all prompts for a platform
    setPrompts(platform, prompts) {
        this.templates[platform] = prompts;
        this.savePrompts();
    }
    
    // Reset to default prompts
    resetToDefaults(platform = null) {
        if (platform) {
            delete this.templates[platform];
        } else {
            this.templates = {};
        }
        this.savePrompts();
    }
    
    // Process template with variables
    processTemplate(template, variables = {}) {
        let processed = template;
        
        // Merge provided variables with stored variables
        const allVars = { ...this.variables, ...variables };
        
        // Replace variables in template
        for (const [key, value] of Object.entries(allVars)) {
            const regex = new RegExp(`\\{${key}\\}`, 'g');
            processed = processed.replace(regex, value || '');
        }
        
        // Handle conditional sections
        processed = this.processConditionals(processed, allVars);
        
        return processed;
    }
    
    // Process conditional sections in template
    processConditionals(template, variables) {
        // Pattern: {{#if variable}}content{{/if}}
        const conditionalRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
        
        return template.replace(conditionalRegex, (match, varName, content) => {
            return variables[varName] ? content : '';
        });
    }
    
    // Set global variables
    setVariables(variables) {
        this.variables = { ...this.variables, ...variables };
        this.savePrompts();
    }
    
    // Get all variables
    getVariables() {
        return { ...this.variables };
    }
    
    // Validate prompt structure
    validatePrompt(prompt) {
        const issues = [];
        
        // Check for unclosed variables
        const openBraces = (prompt.match(/\{/g) || []).length;
        const closeBraces = (prompt.match(/\}/g) || []).length;
        if (openBraces !== closeBraces) {
            issues.push('Unclosed variable brackets detected');
        }
        
        // Check for required sections in formatted prompts
        if (prompt.includes('Format') || prompt.includes('FORMAT')) {
            const sections = prompt.match(/^[A-Z_]+:/gm) || [];
            if (sections.length === 0) {
                issues.push('Format sections specified but none found');
            }
        }
        
        // Check prompt length
        if (prompt.length < 50) {
            issues.push('Prompt seems too short to be effective');
        }
        
        if (prompt.length > 10000) {
            issues.push('Prompt is very long and may exceed token limits');
        }
        
        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
    
    // Generate prompt preview
    generatePreview(platform, sampleData = {}) {
        const prompts = this.getPrompts(platform);
        const defaultSampleData = {
            title: 'Sample Blog Post Title',
            topic: 'Digital Marketing Strategies',
            keywords: 'SEO, content marketing, social media',
            blogContent: 'This is a sample blog post content that would be transformed...',
            content: 'Sample content for transformation...'
        };
        
        const data = { ...defaultSampleData, ...sampleData };
        
        return {
            system: this.processTemplate(prompts.system, data),
            main: this.processTemplate(prompts.main, data),
            audience: this.processTemplate(prompts.audience, data)
        };
    }
    
    // Export prompts for backup
    exportPrompts() {
        return {
            templates: this.templates,
            variables: this.variables,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }
    
    // Import prompts from backup
    importPrompts(data, overwrite = false) {
        if (!data.templates) {
            throw new Error('Invalid import data: missing templates');
        }
        
        if (overwrite) {
            this.templates = data.templates;
            this.variables = data.variables || {};
        } else {
            // Merge with existing
            for (const [platform, prompts] of Object.entries(data.templates)) {
                if (!this.templates[platform]) {
                    this.templates[platform] = prompts;
                } else {
                    this.templates[platform] = { ...this.templates[platform], ...prompts };
                }
            }
            this.variables = { ...this.variables, ...(data.variables || {}) };
        }
        
        this.savePrompts();
        return true;
    }
    
    // Get prompt statistics
    getStatistics() {
        const stats = {
            platforms: Object.keys(this.templates),
            customPrompts: 0,
            totalPrompts: 0,
            variables: Object.keys(this.variables).length
        };
        
        for (const [platform, prompts] of Object.entries(this.templates)) {
            stats.customPrompts += Object.keys(prompts).length;
        }
        
        for (const [platform, prompts] of Object.entries(AIPromptManager.DEFAULT_TEMPLATES)) {
            stats.totalPrompts += Object.keys(prompts).length;
        }
        
        return stats;
    }
}

// Prompt builder helper class
export class PromptBuilder {
    constructor() {
        this.sections = [];
        this.variables = new Set();
    }
    
    // Add a section to the prompt
    addSection(content, options = {}) {
        this.sections.push({
            content,
            numbered: options.numbered || false,
            title: options.title || null
        });
        
        // Extract variables
        const varMatches = content.match(/\{(\w+)\}/g) || [];
        varMatches.forEach(match => {
            this.variables.add(match.slice(1, -1));
        });
        
        return this;
    }
    
    // Add numbered list items
    addNumberedList(items) {
        const content = items.map((item, index) => `${index + 1}. ${item}`).join('\n');
        return this.addSection(content, { numbered: true });
    }
    
    // Add format instructions
    addFormat(formats) {
        const content = 'Format your response as:\n' + 
                       formats.map(f => `${f.name}: ${f.description}`).join('\n');
        return this.addSection(content);
    }
    
    // Add conditional section
    addConditional(variable, content) {
        const conditionalContent = `{{#if ${variable}}}${content}{{/if}}`;
        return this.addSection(conditionalContent);
    }
    
    // Build the final prompt
    build() {
        const prompt = this.sections.map(section => {
            if (section.title) {
                return `### ${section.title}\n${section.content}`;
            }
            return section.content;
        }).join('\n\n');
        
        return {
            prompt,
            variables: Array.from(this.variables)
        };
    }
    
    // Reset builder
    reset() {
        this.sections = [];
        this.variables = new Set();
        return this;
    }
}

// Prompt testing utilities
export class PromptTester {
    constructor(aiManager) {
        this.aiManager = aiManager;
        this.testResults = [];
    }
    
    // Test a prompt with sample data
    async testPrompt(prompt, testData, options = {}) {
        const startTime = Date.now();
        
        try {
            const result = await this.aiManager.generateContent(
                prompt.system || '',
                prompt.main,
                options
            );
            
            const endTime = Date.now();
            
            const testResult = {
                success: true,
                duration: endTime - startTime,
                outputLength: result.content.length,
                output: result.content,
                model: result.model,
                usage: result.usage,
                timestamp: new Date().toISOString()
            };
            
            this.testResults.push(testResult);
            return testResult;
            
        } catch (error) {
            const endTime = Date.now();
            
            const testResult = {
                success: false,
                duration: endTime - startTime,
                error: error.message,
                timestamp: new Date().toISOString()
            };
            
            this.testResults.push(testResult);
            return testResult;
        }
    }
    
    // Run multiple tests
    async runTestSuite(prompts, testCases) {
        const results = [];
        
        for (const testCase of testCases) {
            const prompt = {
                system: prompts.system,
                main: this.processTemplate(prompts.main, testCase.data)
            };
            
            const result = await this.testPrompt(prompt, testCase.data, testCase.options);
            results.push({
                ...result,
                testName: testCase.name,
                testData: testCase.data
            });
        }
        
        return results;
    }
    
    // Analyze test results
    analyzeResults() {
        if (this.testResults.length === 0) {
            return { error: 'No test results available' };
        }
        
        const successful = this.testResults.filter(r => r.success);
        const failed = this.testResults.filter(r => !r.success);
        
        const analysis = {
            totalTests: this.testResults.length,
            successful: successful.length,
            failed: failed.length,
            successRate: (successful.length / this.testResults.length) * 100,
            averageDuration: successful.reduce((sum, r) => sum + r.duration, 0) / successful.length || 0,
            averageOutputLength: successful.reduce((sum, r) => sum + r.outputLength, 0) / successful.length || 0,
            errors: failed.map(r => r.error),
            lastTest: this.testResults[this.testResults.length - 1].timestamp
        };
        
        return analysis;
    }
    
    // Clear test results
    clearResults() {
        this.testResults = [];
    }
    
    // Process template helper
    processTemplate(template, data) {
        let processed = template;
        for (const [key, value] of Object.entries(data)) {
            const regex = new RegExp(`\\{${key}\\}`, 'g');
            processed = processed.replace(regex, value || '');
        }
        return processed;
    }
}