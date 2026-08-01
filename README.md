# Hanka Enterprise Agentic RAG SaaS 🚀

An advanced, highly scalable, multi-tenant Retrieval-Augmented Generation (RAG) system engineered for enterprise environments. Built with **FastAPI**, **LangGraph**, and **React**, this platform implements an intelligent agentic orchestration layer designed to handle complex user queries, ensuring high performance, accurate data retrieval, and strictly isolated multi-tenant workspaces.

---

## 🌟 Platform Highlights

### 1. Robust Multi-Tenant Architecture
Designed from the ground up for B2B SaaS deployment, ensuring absolute data isolation and organizational hierarchy:
*   **Role-Based Access Control (RBAC)**: Supports three distinct tiers:
    *   **Super Admin**: Global oversight, tenant creation, and system-wide log monitoring.
    *   **Tenant Admin**: Isolated dashboard for managing tenant-specific users, document ingestion, and analytics.
    *   **User**: End-users who interact with the AI assistant restricted to their tenant's knowledge base.
*   **Isolated Vector Spaces**: Qdrant collections are logically separated by `tenant_id` to prevent data spillage.
*   **Threaded Memory Allocation**: Session state and conversational memory are strictly tied to a specific user and tenant `thread_id` backed by Aiven PostgreSQL.

### 2. Intelligent Agentic Orchestration (LangGraph)
Unlike linear RAG pipelines, Hanka utilizes a state-machine Directed Acyclic Graph (DAG) for dynamic, autonomous decision-making. 
*   **🛡️ Guardrail**: Rapidly intercepts casual greetings (to bypass expensive AI compute) and strictly blocks unsafe or non-compliant prompts (PII violations, toxic content) before they reach the core system.
*   **🧠 Contextualizer**: Analyzes previous chat history to autonomously rewrite ambiguous follow-up questions into highly precise, standalone vector search queries.
*   **⚡ Semantic Cache Engine**: Implements Qdrant-based vector caching. If a complex technical query has been asked and verified before, the system retrieves the cached response instantly, saving token costs and reducing latency by >90%.
*   **🗺️ Intent Planner**: A deterministic router that decides whether a query requires a conversational response (using memory alone) or a deep vector search via the Retriever.
*   **💡 Structured Output**: Natively generates highly detailed Markdown responses alongside contextually aware follow-up questions (`suggested_questions`) using Pydantic schemas, enabling an engaging, conversational UI/UX.

### 3. Premium Glassmorphism Frontend
A responsive, high-end React frontend built with Vite. It features dynamic micro-animations, a modern dark-mode aesthetic, and custom multi-tenant management dashboards out-of-the-box.

---

## 🏗️ System Architecture

### Agentic Workflow Diagram (LangGraph)

The core brain of the backend operates using the following state-machine architecture:

```mermaid
graph TD
    A[User Input] --> B{Guardrail Node}
    
    B -- "Unsafe/Greeting" --> Z[Fast Response / Block]
    B -- "Safe & Substantive" --> C[Contextualizer Node]
    
    C --> D[Cache Checker Node]
    
    D -- "Cache Hit (Similar Query Found)" --> Z
    D -- "Cache Miss" --> E{Intent Planner Node}
    
    E -- "Needs Context" --> F[Retriever Node (Vector Search)]
    E -- "Conversational" --> G[Responder Node]
    
    F --> G
    
    G --> H[Cache Saver Node]
    H --> Z
    
    style B fill:#3b82f6,stroke:#1e3a8a,color:#fff
    style C fill:#10b981,stroke:#064e3b,color:#fff
    style D fill:#f59e0b,stroke:#78350f,color:#fff
    style E fill:#8b5cf6,stroke:#4c1d95,color:#fff
    style F fill:#ef4444,stroke:#7f1d1d,color:#fff
    style G fill:#ec4899,stroke:#831843,color:#fff
    style Z fill:#1f2937,stroke:#111827,color:#fff
```

### High-Level Tech Stack Map

```mermaid
architecture-beta
    group frontend(cloud)[Frontend / Client]
    service ui(internet)[React + Vite] in frontend
    
    group backend(server)[Backend Services]
    service api(server)[FastAPI Server] in backend
    service agent(logic)[LangGraph Agents] in backend
    service auth(disk)[JWT / Client Manager] in backend
    
    group storage(database)[Storage Layer]
    service qdrant(database)[Qdrant Vector DB] in storage
    service pg(database)[PostgreSQL Memory/Users] in storage
    
    ui:R --> L:api
    api:B --> T:agent
    api:R --> L:auth
    agent:R --> L:qdrant
    agent:B --> T:pg
    auth:B --> T:pg
```

---

## 🛠️ Technology Stack Detail

#### **Backend**
*   **FastAPI**: Provides a high-performance, asynchronous web framework for building the API endpoints.
*   **LangGraph & LangChain**: For building the stateful, multi-actor agentic workflow.
*   **Groq (Llama-3-70b-8192)**: The primary LLM for rapid reasoning, planning, and synthesis.
*   **OpenAI (`text-embedding-3-small`)**: For high-dimensional (1536) semantic vector embeddings.

#### **Data Layer**
*   **Qdrant Cloud**: Cloud-native vector database used for semantic search, document retrieval, and semantic caching.
*   **Aiven PostgreSQL**: Relational database used for:
    1. Checkpointer (LangGraph memory states).
    2. User authentication & RBAC schema.
    3. Audit and system logging.

#### **Frontend & UI**
*   **React.js (Vite)**: Lightning-fast frontend build tooling.
*   **Vanilla CSS**: Custom styling prioritizing a premium Glassmorphism aesthetic.
*   **Lucide React**: For scalable, modern iconography.

---

## 🚀 Deployment & Getting Started

### 1. Prerequisites
Ensure you have Python 3.10+, Node.js 18+, and a running instance of Qdrant and PostgreSQL.

### 2. Clone the Repository
```bash
git clone https://github.com/Farmil23/enterprise-agentic-rag-with-cache.git
cd enterprise-agentic-rag-with-cache
```

### 3. Backend Setup

**Install Dependencies:**
```bash
pip install -r requirements.txt
```

**Environment Variables (`.env`):**
Create a `.env` file in the root repository directory:
```env
# --- AI Providers ---
OPENAI_API_KEY=sk-your-openai-key
GROQ_API_KEY=gsk_your-groq-key

# --- Vector Database (Qdrant) ---
QDRANT_URL=https://your-cluster.qdrant.tech
QDRANT_API_KEY=your-qdrant-key

# --- Relational Database (PostgreSQL) ---
POSTGRES_URL=postgresql://user:password@host:port/dbname?sslmode=require

# --- Observability & Telemetry ---
LOGFIRE_TOKEN=your-logfire-token
```

**Run the API Server:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Frontend Setup

Navigate to the `frontend` folder and create its environment file:
```bash
cd frontend
echo "VITE_API_URL=http://localhost:8000" > .env
```
*(Note: Change `VITE_API_URL` to your production URL when deploying).*

**Install and Run:**
```bash
npm install
npm run dev
```

---

## ☁️ Production Deployment

This repository is optimized for immediate PaaS (Platform as a Service) deployment.

*   **Frontend (Vercel / Netlify)**:
    *   Simply connect your repository.
    *   Set the Build Command to `npm run build` and Output Directory to `dist`.
    *   Add `VITE_API_URL` to the deployment environment variables pointing to your backend URL.
*   **Backend (Railway / Render)**:
    *   Deploy using the standard Python environment or Docker.
    *   Ensure the start command is `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
    *   Input all API keys and Database URLs in the service variables.

---

## ⚖️ License
This project is proprietary and built for demonstration purposes as a showcase for high-end Enterprise RAG architectures.
