# 🛡 Secure LLM Gateway

A production-grade, secure, resilient, cost-aware LLM orchestration layer built with Node.js + Express.

=====================================================================

🚀 HOW TO SWITCH FROM MOCK (DEVELOPMENT) → PRODUCTION (REAL LLM)

=====================================================================

This project runs in two modes: Development (Mock) and Production (Real LLM).

---------------------------------------------------------------------
✅ DEVELOPMENT MODE (NO API KEYS REQUIRED)
---------------------------------------------------------------------

The system runs fully using:
- Mock LLM provider
- Mock embeddings
- Redis (for rate limiting & caching)

You DO NOT need OpenAI or Anthropic keys.

Your `.env` should contain:

PORT=3000
NODE_ENV=development
GATEWAY_API_KEY=dev-gateway-key
REDIS_URL=redis://default:<password>@<host>:<port>
CACHE_ENABLED=true
RAG_ENABLED=true
USER_MAX_RPM=60
ADMIN_MAX_RPM=300
RATE_LIMIT_WINDOW_MS=60000

Use `"provider": "mock"` in your request body.

Example request:

{
  "prompt": "Explain JWT",
  "provider": "mock"
}

---------------------------------------------------------------------
🚀 PRODUCTION MODE (REAL LLM PROVIDERS)
---------------------------------------------------------------------

To move to production:

1️⃣ Add real provider API key

For OpenAI:
OPENAI_API_KEY=your_openai_key
OPENAI_DEFAULT_MODEL=gpt-4o
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

OR for Anthropic:
ANTHROPIC_API_KEY=your_anthropic_key

2️⃣ Set environment:
NODE_ENV=production

3️⃣ Restart server:
npm run dev

4️⃣ Remove `"provider": "mock"` from request body.

The gateway automatically switches to real providers.
No code changes required.

=====================================================================

📌 WHAT THIS GATEWAY DOES

=====================================================================

This system sits between your application and LLM providers and adds:

- 🔐 Authentication (API Key + JWT)
- ⚡ Distributed Rate Limiting (Redis)
- 🛡 Prompt Injection Guardrails
- 🧠 Hybrid RAG Engine
- 🔁 Circuit Breaker Protection
- ⏱ Global Timeout + Retry Logic
- 💰 Cost Estimation
- 🧮 Token Counting
- 🗄 Redis Response Caching
- 🧪 Full Offline Mock Mode

=====================================================================

🧠 REQUEST FLOW

=====================================================================

Client
  ↓
Authentication
  ↓
Rate Limiting (Redis)
  ↓
Guardrails
  ↓
RAG Engine (Optional)
  ↓
Redis Cache
  ↓
Circuit Breaker + Retry + Timeout
  ↓
Provider (OpenAI / Anthropic / Mock)
  ↓
Response (Cost + Metadata)

=====================================================================

🔥 CORE CAPABILITIES

=====================================================================

🔐 Authentication
- Gateway API Key support
- JWT user support
- Role-based enforcement

⚡ Distributed Rate Limiting
- Redis-backed
- Role-aware limits
- Configurable via `.env`

🧠 Hybrid RAG Engine
- Document chunking
- Embedding generation
- Vector + keyword hybrid similarity
- Configurable alpha/beta weighting
- Mock-compatible

🛡 Guardrails
- Prompt injection detection
- Unsafe pattern blocking

🔁 Resilience
- Circuit breaker per provider
- Automatic retry for transient errors
- Global timeout protection

💰 Cost Estimation
- Model-based token cost calculation

🧮 Token Counting
- GPT tokenizer integration

🗄 Redis Caching
- Response caching
- Configurable TTL
- Cache bypass option

🧪 Mock Mode
- Mock LLM provider
- Mock embeddings
- Full system testable offline

=====================================================================

📦 INSTALLATION

=====================================================================

git clone <your-repo-url>
cd secure-llm-gateway
npm install

=====================================================================

⚙️ ENVIRONMENT SETUP

=====================================================================

Create `.env` file in project root.

Minimum required:

PORT=3000
GATEWAY_API_KEY=dev-gateway-key
REDIS_URL=redis://default:<password>@<host>:<port>

=====================================================================

▶ RUNNING SERVER

=====================================================================

npm run dev

Server runs on:
http://localhost:3000

=====================================================================

🧪 TESTING

=====================================================================

Health Check:
GET /health

Completion:
POST /v1/completion

Headers:
Authorization: Bearer dev-gateway-key
Content-Type: application/json

Body:
{
  "prompt": "Explain JWT",
  "provider": "mock"
}

RAG Example:
{
  "prompt": "What is JWT?",
  "provider": "mock",
  "options": {
    "useRag": true
  }
}

=====================================================================

📂 PROJECT STRUCTURE

=====================================================================

src/
 ├── api/
 ├── gateway/
 ├── providers/
 ├── services/
 ├── utils/
 └── index.js

=====================================================================

📊 ENTERPRISE FEATURE CHECKLIST

=====================================================================

API Key Auth              ✅
JWT Support               ✅
Role-Based Limits         ✅
Redis Rate Limiting       ✅
Guardrails                ✅
Circuit Breaker           ✅
Retry Logic               ✅
Global Timeout            ✅
Cost Estimation           ✅
Token Counting            ✅
Redis Caching             ✅
Hybrid RAG                ✅
Mock Mode                 ✅

=====================================================================

🏗 DESIGNED FOR

=====================================================================

- SaaS AI Platforms
- Multi-tenant LLM Systems
- Enterprise AI Infrastructure
- Secure API Proxying
- Cost-Controlled GenAI Deployments

=====================================================================

🏁 VERSION

=====================================================================

v1.0 – Production-Ready Secure LLM Gateway

=====================================================================

🎯 FINAL NOTE

=====================================================================

This is not a simple LLM wrapper.

This is a secure, resilient, scalable LLM orchestration layer designed for real-world production systems.
