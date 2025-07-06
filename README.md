# AgentPost - AI-Powered Content Automation Suite

AgentPost is a modular, AI-powered content automation system that transforms ideas into blog posts and social media content. Built with a modern ES6 architecture, it features two main applications sharing common components for maximum efficiency and maintainability.

## 🚀 Overview

AgentPost consists of two powerful agents working together:

1. **Blog Agent** - Transforms topics into fully-formatted, SEO-optimized blog posts
2. **Instagram Agent** - Converts blog content into engaging Instagram captions with hashtags and image suggestions

Both agents are built on a shared ES6 module system, promoting code reuse and consistent functionality across the platform.

## 🏗️ Architecture

### Modular ES6 Design

```
agent-post/
├── index.html                    # Main dashboard
├── apps/
│   ├── blog-agent.html          # Blog content generator
│   └── instagram-agent.html     # Instagram caption creator
└── modules/
    ├── oauth-token-manager.js    # OAuth 2.0 authentication
    ├── ai-api-manager.js         # AI provider integration
    ├── ai-prompt-manager.js      # Prompt template management
    ├── storage-credentials-manager.js  # Secure credential storage
    └── shared-ui-components.js   # Reusable UI components
```

### Key Features

- **Modern ES6 Modules**: Clean, maintainable code architecture
- **OAuth 2.0 Authentication**: Secure Google Sheets integration with automatic token refresh
- **Multi-AI Support**: Works with Claude API and OpenAI
- **Responsive Design**: Works on desktop and mobile devices
- **Local Storage**: Secure credential and data persistence
- **Real-time Logging**: Track all operations and debug issues

## 📋 Prerequisites

Before setting up AgentPost, ensure you have:

1. **Web Server** or **Local Development Environment**
   - Any HTTP server (e.g., Python's `http.server`, Node.js `http-server`, or VS Code Live Server)
   - ES6 modules require serving files over HTTP/HTTPS

2. **Google Cloud Project** (for Sheets integration)
   - Google Cloud Console access
   - OAuth 2.0 credentials configured

3. **AI API Access** (choose one):
   - Claude API key (via Anthropic or Cloudflare Worker proxy)
   - OpenAI API key

4. **Google Sheets**
   - A Google account
   - A spreadsheet for content management

## 🛠️ Setup Instructions

### Step 1: Clone or Download the Project

```bash
# Clone the repository (if using git)
git clone [repository-url]
cd agent-post

# Or download and extract the ZIP file
```

### Step 2: Set Up Your Web Server

Choose one of the following methods:

**Option A: Python (Recommended)**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Option B: Node.js**
```bash
# Install http-server globally
npm install -g http-server

# Run the server
http-server -p 8000
```

**Option C: VS Code Live Server**
- Install the "Live Server" extension
- Right-click on `index.html`
- Select "Open with Live Server"

### Step 3: Configure Google OAuth 2.0

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Create a New Project** (or select existing)
   - Click "Select a project" → "New Project"
   - Name it (e.g., "AgentPost")
   - Click "Create"

3. **Enable Google Sheets API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure OAuth consent screen:
     - Choose "External" user type
     - Fill in required fields (app name, email)
     - Add your email to test users
   - For Application type, select "Web application"
   - Name it (e.g., "AgentPost Web Client")
   - Add Authorized JavaScript origins:
     ```
     http://localhost:8000
     http://localhost:[your-port]
     ```
   - Add Authorized redirect URIs:
     ```
     http://localhost:8000/apps/blog-agent.html
     http://localhost:8000/apps/instagram-agent.html
     ```
   - Click "Create"
   - **Save your Client ID and Client Secret**

### Step 4: Prepare Your Google Sheet

1. **Create a new Google Sheet** or use existing
2. **Set up the following tabs** (exact names):

   **Blog Tab Structure:**
   | Column | Field | Description |
   |--------|-------|-------------|
   | A | Topic | Main topic/subject |
   | B | Keywords | SEO keywords (comma-separated) |
   | C | Title | Generated blog title |
   | D | Meta Description | SEO meta description |
   | E | Featured Image | Image description |
   | F | URL | Blog post URL |
   | G | Generated Content | Full blog content |
   | H | Image URL | Featured image URL |
   | I | Status | Processing status |

   **Ideas Tab Structure:**
   | Column | Field | Description |
   |--------|-------|-------------|
   | A | Topic | Content topic |
   | B | Keywords | Target keywords |
   | C | Description | Topic details |
   | D | Status | Processing status |

   **Instagram Tab Structure:**
   | Column | Field | Description |
   |--------|-------|-------------|
   | A | Post ID | Unique identifier |
   | B | Title | Post title/topic |
   | C | Caption | Instagram caption |
   | D | Hashtags | Relevant hashtags |
   | E | Image URL | Primary image link |
   | F | Image Alt Text | Image description |
   | G | Link | Secondary image link |
   | H | Schedule Date | When to post |
   | I | Platforms | Target platforms |
   | J | Status | Post status |
   | K | Created Date | Generation date |
   | L | Source | Content source |

3. **Get your Spreadsheet ID**
   - Open your Google Sheet
   - Copy the ID from the URL: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`

### Step 5: Configure AI Provider

**For Claude API:**

1. **Option A: Direct API (if available)**
   - Get your API key from Anthropic
   - No additional setup needed

2. **Option B: Via Cloudflare Worker Proxy**
   - Set up a Cloudflare Worker following [these instructions](https://developers.cloudflare.com/workers/)
   - Deploy the Claude API proxy code
   - Note your Worker URL

**For OpenAI:**
- Get your API key from [OpenAI Platform](https://platform.openai.com/)
- No proxy needed

### Step 6: Initial Setup - Blog Agent

1. **Open AgentPost in your browser**
   ```
   http://localhost:8000
   ```

2. **Click on "Blog Agent"**

3. **Configure Credentials (Credentials Tab)**
   - Enter your Google OAuth Client ID
   - Enter your Client Secret
   - Enter your Spreadsheet ID
   - Click "Save Settings"
   - Click "Connect with Google" and authorize

4. **Configure AI (same tab)**
   - Select your AI provider
   - Enter your API key
   - For Claude: Enter Cloudflare Worker URL if using proxy
   - Click "Save AI Configuration"

5. **Test the Setup**
   - Go to Dashboard tab
   - Click "Test Connections"
   - Verify both Google Sheets and AI show ✅

6. **Generate Your First Blog Post**
   - Add topics to the "Ideas" tab in your Google Sheet
   - Click "Check for New Topics"
   - Select topics to generate
   - Click "Generate Blog Posts"

### Step 7: Initial Setup - Instagram Agent

1. **Click on "Instagram Agent"** from main dashboard

2. **Configure Credentials**
   - Google credentials should auto-populate if set in Blog Agent
   - If not, enter the same OAuth credentials
   - Configure AI settings (can be different from Blog Agent)

3. **Set Default Hashtags**
   - Enter hashtags to include with all posts
   - Example: `#instagram #contentcreator #socialmedia`

4. **Choose Content Source**
   - Select "Blog Tab" to convert blog posts
   - Select "Ideas Tab" to create from topics

5. **Generate Instagram Captions**
   - Click "Check for New Content"
   - Click "Generate Captions"
   - Review generated captions
   - Click "Write to Instagram Tab" to save

## 🎯 Workflow Guide

### Typical Content Creation Flow

1. **Add Topics**
   - Open your Google Sheet
   - Add topics and keywords to the "Ideas" tab

2. **Generate Blog Posts**
   - Open Blog Agent
   - Click "Check for New Topics"
   - Generate blog posts
   - Posts are saved to "Blog" tab with status "Processed"

3. **Create Instagram Content**
   - Open Instagram Agent
   - Select "Blog Tab" as source
   - Generate captions from blog posts
   - Captions include image suggestions with direct links

4. **Export and Use**
   - Copy content from Google Sheets
   - Use generated image links to find visuals
   - Post to your platforms

## 🖼️ Blog Agent Image Functionality

The Blog Agent includes intelligent image suggestion capabilities to enhance your blog posts with relevant visuals.

### How It Works

1. **Automatic Image Suggestions**
   - When generating blog posts, the AI analyzes your content
   - Creates descriptive image suggestions based on the topic and content
   - Stores suggestions in the "Featured Image" column (Column E)

2. **Image URL Generation**
   - The agent can generate direct search URLs for image services
   - Provides pre-configured searches on Unsplash, Pexels, and Pixabay
   - URLs are optimized with relevant keywords from your content

3. **Image Fields in Google Sheet**
   - **Featured Image (Column E)**: Descriptive text of the ideal image
   - **Image URL (Column H)**: Direct link to image or search results

### Using Image Suggestions

1. **After Blog Generation**
   - Check the "Featured Image" column for AI-generated descriptions
   - Use these descriptions to search for appropriate images
   - Copy the Image URL if provided

2. **Manual Image Search**
   - Use the featured image description as a search query
   - Visit image services like:
     - [Unsplash](https://unsplash.com)
     - [Pexels](https://pexels.com)
     - [Pixabay](https://pixabay.com)
   - Search using the suggested terms

3. **Best Practices for Blog Images**
   - Choose high-resolution images (minimum 1200px width)
   - Ensure images are relevant to your content
   - Use royalty-free or properly licensed images
   - Optimize images for web before uploading

### Integration with Instagram Agent

The Blog Agent's image functionality seamlessly integrates with the Instagram Agent:
- Image suggestions transfer when converting blog posts
- Instagram Agent enhances with platform-specific recommendations
- Provides direct search links formatted for social media use

### Instagram Agent Image Functonality

Instagram Agent provides:
- Direct Unsplash search links
- Alternative sources (Pexels, Pixabay)
- Image style recommendations
- Proper dimensions for Instagram

## 🔧 Advanced Features

### Custom AI Prompts

Both agents allow prompt customization:

1. Go to "AI Prompts" tab
2. Edit system, main, or audience prompts
3. Use variables like `{topic}`, `{keywords}`, `{blogContent}`
4. Save and test with preview

### Batch Processing

- Process multiple topics at once
- Progress bars show generation status
- Automatic status updates in sheets

## 🚨 Troubleshooting

### Common Issues and Solutions

**1. "Modules not loading" error**
- Ensure you're serving files via HTTP/HTTPS
- Check browser console for CORS errors
- Verify all module files are present

**2. "Google authentication failed"**
- Check OAuth redirect URIs match exactly
- Ensure you're on the authorized domain
- Try clearing browser cache

**3. "AI API errors"**
- Verify API key is correct
- Check API quota/credits
- For Claude, ensure proxy URL is correct

**4. "Cannot write to sheet"**
- Verify Google Sheets API is enabled
- Check spreadsheet ID is correct
- Ensure authorized user has edit access

**5. "Generated content not appearing"**
- Check the correct tab names in your sheet
- Verify column structure matches documentation
- Look for status updates in the Status column

### Debug Mode

Enable detailed logging:
1. Open browser Developer Console (F12)
2. Check "Activity Logs" tab in each agent
3. Look for error messages and stack traces

## 📝 Best Practices

1. **Regular Backups**
   - Export your Google Sheets regularly
   - Save generated content locally

2. **API Usage**
   - Monitor your API usage and costs
   - Use batch processing efficiently

3. **Content Quality**
   - Review and edit AI-generated content
   - Customize prompts for your brand voice

4. **Security**
   - Never share your API keys
   - Use secure connections (HTTPS) in production
   - Regularly rotate credentials

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify all setup steps were followed
4. Check that your Google Sheet structure matches the documentation

## 📄 License

This project is provided as-is for personal and commercial use. Please respect API terms of service for Google and your chosen AI provider.

---

Built with ❤️ using modern web technologies and AI