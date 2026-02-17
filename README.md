# 🛡️ Secure LLM Gateway

> Production-ready FastAPI-based Secure LLM Gateway for safe, scalable, and observable LLM access in enterprise environments.

---

## 📌 Overview

Secure LLM Gateway is a middleware layer built to safely expose Large Language Models (LLMs) in production systems.

Instead of directly calling LLM providers (OpenAI, Anthropic, etc.), applications interact with this gateway which enforces:

- 🔐 Authentication & Authorization  
- 🛡 Prompt Injection Protection  
- ⚡ Rate Limiting  
- 📚 Retrieval-Augmented Generation (RAG)  
- 🔄 Multi-Model Routing  
- 📊 Observability & Cost Tracking  

This project demonstrates real-world GenAI backend architecture patterns used in production systems.

---

## 🚨 Why This Exists

Direct LLM API exposure introduces serious risks:

- Prompt injection attacks
- Data exfiltration
- Token abuse and cost spikes
- Lack of governance
- No request monitoring
- No model control layer

This gateway acts as a **security and control plane** between clients and LLM providers.

---

# 🏗️ System Architecture

```
                ┌─────────────┐
                │   Client    │
                └──────┬──────┘
                       │
                       ▼
               ┌───────────────┐
               │ JWT Auth Layer│
               └──────┬────────┘
                      │
                      ▼
               ┌───────────────┐
               │ Rate Limiter  │
               └──────┬────────┘
                      │
                      ▼
               ┌───────────────┐
               │ Prompt Guards │
               └──────┬────────┘
                      │
                      ▼
               ┌───────────────┐
               │   RAG Layer   │
               └──────┬────────┘
                      │
                      ▼
               ┌───────────────┐
               │ Model Router  │
               └──────┬────────┘
                      │
                      ▼
          ┌─────────────────────────┐
          │ LLM Provider (OpenAI /  │
          │ Anthropic / Local LLM)  │
          └─────────────────────────┘
```

---

# 🔐 Security Layer

## 1️⃣ Authentication & Authorization

- JWT validation
- Role-based access control
- API key verification
- User identity extraction

Prevents unauthorized LLM access.

---

## 2️⃣ Prompt Guardrails

Basic protections against:

- Prompt injection attacks
- Jailbreak attempts
- Malicious instruction overrides
- Data exfiltration prompts

Implemented using:

- Regex-based filters
- Keyword blocklist
- Token length validation
- Input schema enforcement

---

## 3️⃣ Rate Limiting

Prevents:

- API abuse
- Denial-of-service
- Excessive token usage

Supports:

- Per-user rate limits
- Configurable limits
- Redis-backed distributed rate limiting (optional)

---

# 📚 RAG (Retrieval-Augmented Generation)

Optional retrieval pipeline to reduce hallucination and improve factual grounding.

### Features

- Embedding-based similarity search
- FAISS vector store (or pluggable backend)
- Top-K retrieval
- Metadata filtering
- Context trimming to fit token window
- Re-ranking support (optional)

### Why RAG?

- Improves factual accuracy
- Reduces hallucination
- Enables domain-specific AI
- Provides context-aware responses

---

# 🔄 Model Routing Layer

Supports dynamic routing between:

- OpenAI
- Anthropic
- Local/self-hosted models

Routing can be configured based on:

- User tier (free vs premium)
- Cost optimization
- Fallback strategies
- Model availability
- Request type

---

# 📊 Observability & Monitoring

Each request logs:

- Request ID
- User ID
- Model used
- Latency
- Token usage (estimated)
- Cost estimation
- Timestamp

Enables:

- Cost tracking
- Performance monitoring
- Usage analytics
- Debugging
- Abuse detection

---

# 🧠 Concurrency & Scalability

Built using:

- FastAPI (async support)
- Non-blocking request handling
- Stateless architecture
- Horizontal scalability ready
- Docker-compatible

Supports concurrent multi-user LLM workloads.

---

# 🛠️ Tech Stack

- Python 3.10+
- FastAPI
- Pydantic
- FAISS (optional)
- Redis (optional)
- Docker
- OpenAI SDK
- Anthropic SDK

---

# 📁 Project Structure

```
secure-llm-gateway/
│
├── app/
│   ├── main.py
│   ├── config.py
│   │
│   ├── api/
│   │   ├── routes.py
│   │   └── dependencies.py
│   │
│   ├── core/
│   │   ├── auth.py
│   │   ├── rate_limiter.py
│   │   ├── guardrails.py
│   │   └── logging.py
│   │
│   ├── llm/
│   │   ├── router.py
│   │   ├── providers.py
│   │   └── prompt_sanitizer.py
│   │
│   ├── rag/
│   │   ├── retriever.py
│   │   ├── reranker.py
│   │   └── context_builder.py
│   │
│   └── schemas/
│       ├── request.py
│       └── response.py
│
├── tests/
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

Clear separation of concerns:

- API Layer
- Security Layer
- LLM Routing Layer
- Retrieval Layer
- Observability Layer

---

# ▶️ Running Locally

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/secure-llm-gateway.git
cd secure-llm-gateway
```

## 2️⃣ Create `.env` File

```
OPENAI_API_KEY=your_api_key
ANTHROPIC_API_KEY=your_key
JWT_SECRET=your_secret
```

## 3️⃣ Run with Docker

```bash
docker-compose up --build
```

Or run manually:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

# 📌 Example API Call

```
POST /v1/chat
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "model": "gpt-4",
  "prompt": "Explain vector databases in simple terms.",
  "use_rag": true
}
```

---

# 🎯 Use Cases

- Enterprise AI systems
- Secure internal AI assistants
- Production RAG systems
- SaaS AI platforms
- Multi-tenant AI infrastructure
- Agent-based systems

---

# 🔮 Future Improvements

- Multi-tenant isolation
- Streaming responses
- LLM fallback mechanism
- Advanced semantic injection detection
- OpenTelemetry tracing
- Kubernetes deployment
- Cost dashboard
- Prompt caching

---

# 📄 License

MIT License

---

# 👨‍💻 Author

Built as a production-style GenAI backend system focusing on:

- Security
- Scalability
- Reliability
- Observability
- Clean architecture design
