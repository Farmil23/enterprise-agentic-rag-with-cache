# Enterprise Agentic RAG SaaS 🚀

An advanced, highly scalable, multi-tenant Retrieval-Augmented Generation (RAG) system built with **FastAPI**, **LangGraph**, and **React**. This project implements an agentic orchestration layer to intelligently handle user queries, ensuring high performance, accurate retrieval, and secure tenant data isolation.

## 🌟 Key Features

*   **Multi-Tenant Architecture**: Robust session management and memory isolation. Every user/tenant has their own dedicated memory namespace (`thread_id` tied to `tenant_id`).
*   **Agentic Orchestration (LangGraph)**:
    *   **🛡️ Guardrail**: Rapidly intercepts static/casual greetings to bypass the AI and save tokens, while blocking unsafe/PII data requests.
    *   **🧠 Contextualizer**: Analyzes previous chat history to rewrite ambiguous follow-up questions into highly precise, standalone search queries.
    *   **⚡ Cache Engine**: Implements Qdrant-based vector caching to instantly return previously answered complex technical queries.
    *   **🗺️ Intent Planner**: Intelligently decides whether to perform a conversational response (using memory) or to dive deep into a vector search.
*   **High-Performance Asynchronous Backend**: Built on FastAPI, decoupled from blocking synchronous background tasks (like billing/usage logging) to ensure near-instantaneous API response times and zero ASGI event-loop deadlocks.
*   **Modern SaaS Frontend**: A responsive, premium Glassmorphism-styled React frontend with dynamic micro-animations and tenant-based authentication routing.

## 🏗️ Architecture Overview

The backend uses a state-machine workflow (DAG) powered by **LangGraph**. The workflow dynamically routes user queries through specialized nodes:

1.  **User Input** is evaluated by the `Guardrail`.
2.  If safe and complex, the `Contextualizer` refines the query using memory.
3.  The `Cache Checker` searches Qdrant for similar past queries.
4.  If no cache is hit, the `Planner` routes the query to either a standard LLM response or the `Retriever` (Vector Search).
5.  The `Responder` synthesizes the final answer using Groq (Llama 3 70B).
6.  The result is asynchronously saved back by the `Cache Saver` without corrupting memory states.

## 🛠️ Technology Stack

*   **Backend Framework**: FastAPI (Python)
*   **AI Orchestration**: LangGraph, LangChain
*   **LLMs**: Groq (Llama 3), OpenAI (Embeddings)
*   **Vector Database**: Qdrant Cloud
*   **Relational Database**: PostgreSQL (Aiven) for usage logging & checkpointer memory.
*   **Frontend**: React.js + Vite + Vanilla CSS (Glassmorphism)
*   **Observability**: Logfire by Pydantic

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Farmil23/enterprise-agentic-rag-with-cache.git
cd enterprise-agentic-rag-with-cache
```

### 2. Environment Variables
Create a `.env` file in the root directory and add your API keys:
```env
# AI Models
OPENAI_API_KEY=your_openai_key
GROQ_API_KEY=your_groq_key

# Vector DB
QDRANT_URL=your_qdrant_cluster_url
QDRANT_API_KEY=your_qdrant_key

# Relational DB
POSTGRES_URL=your_postgres_connection_string

# Observability
LOGFIRE_TOKEN=your_logfire_token
```

### 3. Run the Backend
Start the FastAPI server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Run the Frontend
Navigate to the frontend directory and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```

## 📈 Roadmap & Future Improvements
*   Implement full JWT-based authentication for the frontend.
*   Deploy backend to a serverless platform (e.g., Render/Railway).
*   Create an admin dashboard for cross-tenant usage analytics and billing metrics.

## 📜 License
This project is proprietary and built for demonstration purposes as part of the Enterprise RAG initiative.
