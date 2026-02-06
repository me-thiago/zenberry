# 🚀 Dooor Backend Platform

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**A scalable, enterprise-grade backend platform built with NestJS, featuring AI-powered chat systems, comprehensive workspace management, and modular architecture designed for extensibility and maintainability.**

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🤖 AI Provider System](#-ai-provider-system)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Environment Variables](#️-environment-variables)
- [🔧 Running the Application](#-running-the-application)
- [📚 API Documentation](#-api-documentation)
- [🧪 Testing](#-testing)
- [🐳 Docker Deployment](#-docker-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### Core Capabilities
- **🏢 Workspace Management:** Complete multi-tenant workspace system with role-based access control
- **👥 User Management:** Authentication, authorization, and comprehensive user profiles
- **💬 AI-Powered Chat:** Real-time chat system with multiple AI provider support
- **🎁 Airdrop System:** Automated airdrop distribution and management
- **🔌 External Integrations:** Google, Discord, Twitter, and audio processing integrations

### Technical Excellence
- **🧠 Unified AI System:** Support for Gemini, Anthropic, OpenAI, GPT-OSS, and Perplexity with intelligent fallbacks
- **⚡ Real-time Communication:** WebSocket support for instant messaging and notifications
- **📊 Queue Management:** BullMQ-powered job processing with Redis backend
- **🔄 Task Scheduling:** Cron jobs and automated task execution
- **🗄️ Database Excellence:** Prisma ORM with PostgreSQL for robust data management
- **📖 Auto-Documentation:** Comprehensive Swagger API documentation
- **🔍 Observability:** Structured logging and monitoring capabilities

### Development & Deployment
- **🐳 Containerized:** Docker-ready for seamless deployment
- **🔧 Modular Design:** Feature-based modules for scalability and maintainability
- **🛡️ Security First:** JWT authentication, input validation, and security best practices
- **🧪 Testing Ready:** Comprehensive testing setup with Jest
- **📈 Performance Optimized:** Caching strategies and query optimization

---

## 🏗️ Architecture

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | NestJS | Main application framework with dependency injection |
| **Language** | TypeScript | Type-safe development with modern JavaScript features |
| **Database** | PostgreSQL + Prisma | Robust data persistence with type-safe ORM |
| **Cache & Queues** | Redis + BullMQ | High-performance caching and job processing |
| **AI Integration** | Multiple Providers | Unified AI system with provider abstraction |
| **Real-time** | WebSockets | Instant communication and live updates |
| **Documentation** | Swagger/OpenAPI | Auto-generated API documentation |

### Design Principles

- **🏛️ Clean Architecture:** Separation of concerns with clear layer boundaries
- **🔌 Dependency Injection:** Loosely coupled components for testability
- **📦 Modular Structure:** Feature-based organization for scalability
- **🛡️ Security by Design:** Authentication, authorization, and input validation
- **🚀 Performance First:** Optimized queries, caching, and async processing

---

## 🤖 AI Provider System

The platform features a sophisticated AI provider management system that abstracts multiple AI services behind a unified interface.

### Architecture Overview

```typescript
AIManagerService
├── Provider Management
│   ├── Gemini (Primary)
│   ├── Anthropic (Claude)
│   ├── OpenAI (GPT)
│   ├── GPT-OSS (Local)
│   └── Perplexity (Research)
├── Intelligent Fallbacks
├── Streaming Support
└── Health Monitoring
```

### Key Features

#### 🔄 **Unified Interface**
- Single `AIManagerService` managing all providers
- Consistent API across different AI models
- Automatic provider selection and fallback

#### 🎯 **Provider Support**
- **Gemini**: Primary provider with advanced multimodal capabilities
- **Anthropic**: Claude models for complex reasoning
- **OpenAI**: GPT models for general conversations
- **GPT-OSS**: Local deployment support
- **Perplexity**: Research-focused AI with web access

#### ⚡ **Real-time Streaming**
- Server-Sent Events (SSE) for live AI responses
- Chunked response processing
- Graceful error handling with fallback systems

#### 🔧 **LangChain Integration**
- Preserved as backup system
- Advanced agent capabilities
- Tool integration support

#### 🛡️ **Reliability Features**
- Health checks for all providers
- Automatic failover mechanisms
- Error tracking and recovery
- Token usage monitoring

### Usage Example

```typescript
// Primary usage through AI Manager
const response = await aiManager.streamCompletion('gemini', {
  model: 'gemini-2.5-flash',
  messages: conversationHistory,
  temperature: 0.7,
  maxTokens: 4000
});

// Automatic fallback handling
for await (const chunk of response) {
  if (chunk.type === 'text-delta') {
    // Stream chunk to client
  } else if (chunk.type === 'error') {
    // Automatic fallback to LangChain
  }
}
```

---

## 📁 Project Structure

```
src/
├── 📁 modules/              # Feature modules
│   ├── 🔐 auth/            # Authentication & authorization
│   ├── 💬 chats/           # AI-powered chat system
│   ├── 👥 users/           # User management
│   ├── 🏢 workspace/       # Multi-tenant workspaces
│   ├── 🎁 airdrops/        # Airdrop management
│   ├── 🔌 integrations/    # External service integrations
│   └── 📊 tools/           # Utility tools and helpers
├── 📁 providers/           # External service providers
│   ├── 🤖 ai/             # AI provider system
│   ├── 📧 email/          # Email service providers
│   ├── 🗄️ cache/          # Cache providers
│   └── ☁️ bucket/         # Storage providers
├── 📁 infra/              # Infrastructure concerns
│   ├── 🗃️ database/       # Prisma configuration
│   ├── 🔄 queues/         # Queue management
│   ├── ⏰ cron/           # Scheduled tasks
│   └── 📝 events/         # Event handling
├── 📁 common/             # Shared utilities
│   ├── 🔧 utils/          # Helper functions
│   ├── ✅ validators/     # Custom validators
│   ├── 🌐 http/           # HTTP utilities
│   └── 🔑 env/            # Environment configuration
└── 📄 main.ts             # Application entry point
```

### Module Descriptions

#### Core Business Modules
- **👥 Users**: User registration, profiles, and account management
- **🔐 Auth**: JWT-based authentication with Google OAuth integration
- **🏢 Workspace**: Multi-tenant workspace system with role-based permissions
- **💬 Chats**: Real-time AI chat with streaming responses and conversation history
- **🎁 Airdrops**: Automated distribution system with task scheduling

#### Infrastructure Modules
- **🤖 AI Providers**: Unified AI system with multiple provider support
- **📧 Email**: Multi-provider email system (Resend, etc.)
- **🗄️ Cache**: Redis-based caching with multiple strategies
- **☁️ Storage**: Cloud storage abstraction (GCS, S3, etc.)

#### Support Modules
- **🔌 Integrations**: External API integrations (Discord, Twitter, Audio)
- **📊 Tools**: Utility functions and helper services
- **📝 Logging**: Centralized application logging
- **🔄 Queues**: Background job processing with BullMQ

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v13 or higher)
- **Redis** (v6 or higher)

### Quick Start

1. **Clone the repository**
```bash
   git clone <repository-url>
   cd dooor-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
```bash
   npx prisma migrate dev
   npx prisma db seed
```

5. **Start the application**
```bash
npm run start:dev
```

The application will be available at `http://localhost:3000`

---

## ⚙️ Environment Variables

### Core Configuration

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dooor"

# Redis
REDIS_URL="redis://localhost:6379"

# Application
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secure-jwt-secret
```

### AI Provider Configuration

```env
# Gemini (Primary)
GEMINI_API_KEY=your-gemini-api-key

# Anthropic
ANTHROPIC_API_KEY=your-anthropic-api-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# GPT-OSS (Local deployment)
VLLM_BASE_URL=http://localhost:8000
VLLM_API_KEY=your-local-api-key
VLLM_MODEL=openai/gpt-oss-120b

# Perplexity
PERPLEXITY_API_KEY=your-perplexity-api-key
```

### Service Providers

```env
# Email
EMAIL_DRIVER=resend
RESEND_API_KEY=your-resend-api-key

# Storage
STORAGE_DRIVER=gcs
GCS_PROJECT_ID=your-gcs-project
GCS_BUCKET_NAME=your-bucket-name

# Cache
CACHE_DRIVER=redis
```

### External Integrations

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Discord
DISCORD_BOT_TOKEN=your-discord-bot-token

# Twitter
TWITTER_BEARER_TOKEN=your-twitter-bearer-token
```

---

## 🔧 Running the Application

### Development Mode

```bash
# Watch mode with hot reload
npm run start:dev

# Debug mode
npm run start:debug

# Fast compilation with SWC
npm run start:swc
```

### Production Mode

```bash
# Build the application
npm run build

# Start in production
npm run start:prod
```

### Development Tools

```bash
# Database operations
npm run db:migrate    # Run database migrations
npm run db:seed      # Seed the database
npm run db:studio    # Open Prisma Studio

# Code quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # Check TypeScript types
```

---

## 📚 API Documentation

### Swagger Documentation

Once the application is running, access the interactive API documentation:

- **Local**: `http://localhost:3000/api-docs`
- **Swagger UI**: Complete API exploration with request/response examples
- **JSON Schema**: `http://localhost:3000/api-docs-json`

### API Features

- **🔐 Authentication**: JWT-based with Swagger auth integration
- **📊 Request Examples**: Real-world request/response samples
- **🏷️ Organized Endpoints**: Grouped by feature modules
- **🔍 Search & Filter**: Easy endpoint discovery
- **🧪 Try It Out**: Direct API testing from documentation

### Key Endpoint Categories

#### Authentication & Users
- `POST /auth/google` - Google OAuth login
- `GET /users/profile` - User profile management
- `PATCH /users/profile` - Update user information

#### Workspace Management
- `POST /workspaces` - Create workspace
- `GET /workspaces/{id}/members` - Manage members
- `PATCH /workspaces/{id}/roles` - Role assignment

#### AI Chat System
- `POST /chats/{workspaceId}` - Create chat
- `POST /chats/{workspaceId}/{chatId}/messages` - Send message
- `POST /chats/{workspaceId}/{chatId}/stream` - Stream AI response

#### Airdrop Management
- `POST /airdrops` - Create airdrop campaign
- `GET /airdrops/{id}/participants` - Manage participants
- `POST /airdrops/{id}/distribute` - Execute distribution

---

## 🧪 Testing

### Test Suite

The application includes comprehensive testing with Jest:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

### Test Categories

#### Unit Tests
- **Service Logic**: Business logic validation
- **Utility Functions**: Helper function testing
- **Data Transformation**: Input/output validation

#### Integration Tests
- **API Endpoints**: Request/response validation
- **Database Operations**: Prisma query testing
- **External Services**: Provider integration testing

#### End-to-End Tests
- **User Workflows**: Complete feature testing
- **Authentication Flows**: Login/logout scenarios
- **Chat Interactions**: AI conversation testing

### Test Configuration

```json
{
  "testEnvironment": "node",
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

---

## 🐳 Docker Deployment

### Docker Compose Setup

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: dooor
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### Deployment Commands

```bash
# Build and start services
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma migrate deploy

# View logs
docker-compose logs -f app

# Scale the application
docker-compose up -d --scale app=3
```

### Production Considerations

- **🔒 Environment Security**: Use Docker secrets for sensitive data
- **📊 Monitoring**: Integrate with monitoring solutions
- **🔄 Load Balancing**: Configure nginx or similar for scaling
- **💾 Data Persistence**: Ensure database and Redis data persistence
- **🔧 Health Checks**: Configure application health endpoints

---

## 🤝 Contributing

We welcome contributions to the Dooor Backend Platform! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow coding standards**: Run `npm run lint` and `npm run format`
4. **Write tests**: Ensure new features are properly tested
5. **Update documentation**: Keep README and API docs current
6. **Submit a pull request**: Provide clear description of changes

### Code Standards

- **📝 Clean Code**: Follow SOLID principles and clean code practices
- **🏷️ TypeScript**: Use strict typing, avoid `any` type
- **📖 Documentation**: Document complex logic with JSDoc comments
- **🧪 Testing**: Write unit tests for new features
- **🔍 Linting**: Follow ESLint and Prettier configurations

### Commit Convention

We use conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation updates
- `refactor:` Code refactoring
- `test:` Test additions or updates

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🏗️ Project Status

**Current Version**: v1.0.0  
**Status**: Active Development  
**Last Updated**: September 2025

### Roadmap

- ✅ **Phase 1**: Core platform and AI integration
- 🔄 **Phase 2**: Advanced AI features and integrations
- 📋 **Phase 3**: Analytics and reporting dashboard
- 🚀 **Phase 4**: Mobile API and webhook system

---

<div align="center">

**Built with ❤️ by the Dooor Team**

[🌐 Website](https://dooor.ai) • [📧 Support](mailto:support@dooor.ai) • [📱 Twitter](https://twitter.com/dooor)

</div>