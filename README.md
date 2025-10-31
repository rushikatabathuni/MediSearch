# MediSearch

AI-powered medical literature search engine combining **semantic search**, **keyword matching**, and **multi-agent validation** over 40K+ research papers.
## Live At: [MediSearch](https://medi-search-peach.vercel.app/)

---

##  Tech Stack

**Backend:** FastAPI (async, Swagger docs, Pydantic)
**Frontend:** Next.js 16, TypeScript, TailwindCSS, shadcn/ui
**Database:** MongoDB Atlas (user data) + ChromaDB (embeddings)

---

##  AI & Search System

* **PubMedBERT** → biomedical embeddings (768-dim)
* **Groq Llama 3.1 (8B)** → fast answer synthesis
* **Hybrid Search:** BM25 + Dense Vector + Reciprocal Rank Fusion
* **Re-ranking:** Top 20 from each → fuse → top 10 final

---

##  Multi-Agent Validation

| Agent                  | Role               | Evaluates             |
| ---------------------- | ------------------ | --------------------- |
| Clinical Expert        | Medical accuracy   | Relevance, safety     |
| Statistical Validator  | Research rigor     | Methodology, stats    |
| Contradiction Detector | Source consistency | Conflicts & agreement |

**Final Confidence:** 0.4×Clinical + 0.3×Statistical + 0.3×Contradiction

---

##  Data & Vector Store

**Sources:** PubMed (20K), MEDLINE (15K), ClinicalTrials.gov (5.8K)
**Total:** ~41K papers → ~160K chunks (768-dim vectors)

**Vector DB:** ChromaDB (HNSW, SQLite backend)

---

##  Auth & Security

* JWT-based auth (HS256)
* bcrypt hashing
* CORS control
* Token expiry (30 mins)

---

##  API Routes

```
POST /api/v1/medical/search
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/history
```

---

##  Frontend

* React Context for global auth state
* React Hooks (useState, useEffect, useMemo)
* Markdown rendering (react-markdown)

---

##  Deployment

* **Backend:** Docker + HuggingFace Spaces
* **Frontend:** Vercel (Next.js native)

---

##  Performance

* <2s average latency
* 99% uptime target
* Cached embeddings & async operations

---

##  Key Algorithms

* BM25, TF-IDF, Cosine Similarity, HNSW
* RRF (fusion of rankings)
* Recursive text chunking (1000 chars, 200 overlap)

---

##  Core Concepts

* **RAG:** Retrieval + LLM generation
* **Embeddings:** Dense semantic vectors
* **MeSH Terms:** Standardized medical taxonomy
* **Zero-shot:** Domain-general LLM answering

---

**MediSearch** — Fast, verified, and explainable medical insights powered by AI.
