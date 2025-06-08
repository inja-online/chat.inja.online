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
- **Database**: Drizzle ORM with SQLite (local) / Cloudflare D1 (production)
- **UI**: Tailwind CSS + shadcn/ui components
- **Deployment**: Cloudflare Pages compatible

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
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env.local
   ```

4. **Configure environment** (see [Environment Configuration](#-environment-configuration) below)

5. **Set up the database**

   ```bash
   # Generate database schema
   bun run db:generate

   # Apply migrations to local SQLite database
   bun run db:migrate:local
   ```

6. **Start the development server**

   ```bash
   bun run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ⚙️ Environment Configuration

### 🏠 Local Development (.env.local)

Create a `.env.local` file with the following configuration:

```env
# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"

# Database (Local SQLite - automatically created)
DATABASE_URL="file:./local.db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-development-secret-key-min-32-chars"

# OAuth Providers (Required for OAuth login)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cloudflare D1 (Not used in development, but required by env validation)
CLOUDFLARE_DATABASE_ID="placeholder-for-dev"
CLOUDFLARE_ACCOUNT_ID="placeholder-for-dev"
CLOUDFLARE_API_TOKEN="placeholder-for-dev"
```

### 🚀 Production Deployment

#### Cloudflare Pages Environment Variables

Set these in your Cloudflare Pages dashboard:

```env
# Application URL
NEXT_PUBLIC_APP_URL="https://your-domain.pages.dev"

# Node Environment
NODE_ENV="production"

# Database URL (same as Cloudflare D1 connection)
DATABASE_URL="https://api.cloudflare.com/client/v4/accounts/ACCOUNT_ID/d1/database/DATABASE_ID"

# NextAuth Configuration
NEXTAUTH_URL="https://your-domain.pages.dev"
NEXTAUTH_SECRET="your-production-secret-key-min-32-chars"

# OAuth Providers
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cloudflare D1 Database
CLOUDFLARE_DATABASE_ID="your-d1-database-id"
CLOUDFLARE_ACCOUNT_ID="your-cloudflare-account-id"
CLOUDFLARE_API_TOKEN="your-cloudflare-api-token"
```

#### Vercel Environment Variables

If deploying to Vercel, use these environment variables:

```env
# Application URL
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"

# Node Environment
NODE_ENV="production"

# Database (Use your preferred database)
DATABASE_URL="your-production-database-url"

# NextAuth Configuration
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-production-secret-key-min-32-chars"

# OAuth Providers
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# For Vercel, you might not need Cloudflare D1 variables
CLOUDFLARE_DATABASE_ID="not-used"
CLOUDFLARE_ACCOUNT_ID="not-used"
CLOUDFLARE_API_TOKEN="not-used"
```

## 🔧 Database Setup

### Local Development

The app uses a simple SQLite database (`local.db`) for local development:

```bash
# Generate migrations from schema
bun run db:generate

# Apply migrations to local database
bun run db:migrate:local

# Open database studio for local development
bun run db:studio:local
```

### Production (Cloudflare D1)

For production deployment on Cloudflare Pages:

1. **Create a D1 database**

   ```bash
   wrangler d1 create chat-inja-db
   ```

2. **Update `wrangler.toml`** with your database ID

3. **Apply migrations to production**

   ```bash
   bun run db:migrate
   ```

4. **Open production database studio**
   ```bash
   bun run db:studio
   ```

## 🔑 OAuth Setup

### GitHub OAuth

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App with:
   - **Homepage URL**: `http://localhost:3000` (dev) or your production URL
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github` (dev) or `https://your-domain.com/api/auth/callback/github` (prod)
3. Copy Client ID and Client Secret to your environment variables

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials with:
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://your-domain.com/api/auth/callback/google` (production)
5. Copy Client ID and Client Secret to your environment variables

## 🎯 Available Scripts

### Development

```bash
bun run dev              # Start Next.js development server
bun run dev:wrangler     # Start with Wrangler for Cloudflare compatibility
```

### Database Management

```bash
bun run db:generate      # Generate migrations from schema
bun run db:migrate:local # Apply migrations to local SQLite
bun run db:migrate       # Apply migrations to production D1
bun run db:studio:local  # Open local database studio
bun run db:studio        # Open production database studio
```

### Build & Deploy

```bash
bun run build           # Build for production
bun run start           # Start production server
bun run deploy          # Deploy to Cloudflare Pages
```

### Code Quality

```bash
bun run lint            # Check code with Biome
bun run lint:fix        # Fix code issues with Biome
bun run format          # Format code with Biome
```

## 💡 AI Provider API Keys

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

## 🚀 Deployment Options

### Cloudflare Pages (Recommended)

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

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json bun.lock ./
RUN npm install -g bun && bun install
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", "start"]
```

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
