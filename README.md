# Chat.inja.online 🤖

A modern AI chat application built with Next.js, featuring multiple authentication methods and support for 6+ AI providers. Users can either sign in with OAuth (GitHub/Google) or bring their own API keys from their preferred AI provider.

## ✨ Features

### 🔑 Dual Authentication System

- **OAuth Authentication**: Quick sign-in with GitHub or Google
- **Bring Your Own API Key (BYOK)**: Use your own API keys from any supported provider
- **Secure Storage**: API keys encrypted with AES-256-GCM encryption

### 🤖 AI Provider Support

- **OpenAI** - GPT-3.5, GPT-4, and more
- **Anthropic** - Claude 3 models
- **Google AI** - Gemini Pro and variants
- **Mistral AI** - Mistral models
- **Cohere** - Command models
- **OpenRouter** - Access to 200+ models from multiple providers

### 💬 Chat Features

- **Real-time streaming** responses
- **Multiple conversations** with persistent history
- **Modern UI** with dark/light theme support
- **Responsive design** for desktop and mobile
- **Smart chat titles** auto-generated from conversations

### 🛠️ Technical Stack

- **Framework**: Next.js 15 with App Router
- **AI SDK**: Vercel AI SDK for streaming responses
- **Authentication**: NextAuth.js v4
- **Database**: Drizzle ORM with SQLite (D1 compatible)
- **UI**: Tailwind CSS + shadcn/ui components
- **Deployment**: Cloudflare Pages ready

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- At least one AI provider API key (optional for OAuth users)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/chat.inja.online.git
   cd chat.inja.online
   ```

2. **Install dependencies**

   ```bash
   bun install
   # or npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Configure the following variables:

   ```env
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here

   # OAuth Providers (optional)
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # API Key Encryption
   ENCRYPTION_KEY=your-32-character-encryption-key

   # Default AI Provider for OAuth users (optional)
   OPENAI_API_KEY=your-openai-api-key
   ```

4. **Set up the database**

   ```bash
   bun run db:generate
   bun run db:migrate
   ```

5. **Start the development server**

   ```bash
   bun run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### OAuth Setup

#### GitHub OAuth

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App with:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. Copy Client ID and Client Secret to your `.env.local`

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials with:
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Client Secret to your `.env.local`

### AI Provider API Keys

Users can get API keys from:

- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com/)
- **Google AI**: [ai.google.dev](https://ai.google.dev/)
- **Mistral AI**: [console.mistral.ai](https://console.mistral.ai/)
- **Cohere**: [dashboard.cohere.ai](https://dashboard.cohere.ai/)
- **OpenRouter**: [openrouter.ai](https://openrouter.ai/) (Access to 200+ models)

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # Authentication endpoints
│   │   └── chat/           # Chat API with AI providers
│   ├── auth/signin/        # Sign-in page
│   └── page.tsx           # Main chat interface
├── components/
│   ├── ui/                # shadcn/ui components
│   └── chat-app.tsx       # Main chat component
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   └── api-auth.ts        # API key authentication utilities
├── db/
│   └── drizzle/           # Database schema and utilities
└── providers/             # React context providers
```

## 🛡️ Security

- **API Key Encryption**: All API keys are encrypted using AES-256-GCM before storage
- **HTTP-Only Cookies**: Session data stored in secure, HTTP-only cookies
- **CSRF Protection**: NextAuth.js provides built-in CSRF protection
- **API Key Validation**: Real-time validation against provider APIs
- **Secure Defaults**: Production-ready security settings

## 🚀 Deployment

### Cloudflare Pages

1. **Build the application**

   ```bash
   bun run build
   ```

2. **Deploy to Cloudflare Pages**

   ```bash
   bun run deploy
   ```

3. **Configure environment variables** in Cloudflare Pages dashboard

### Vercel

1. **Connect your repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy** automatically on push to main branch

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vercel AI SDK](https://sdk.vercel.ai/) for AI integration
- [NextAuth.js](https://next-auth.js.org/) for authentication
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Drizzle ORM](https://orm.drizzle.team/) for database management

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/chat.inja.online/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/chat.inja.online/discussions)

---

Made with ❤️ using Next.js and the Vercel AI SDK
