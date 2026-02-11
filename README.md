<div align="center">
<pre>
██████╗ ██████╗ ███████╗    ██████╗  █████╗  ██████╗ 
██╔══██╗██╔══██╗██╔════╝    ██╔══██╗██╔══██╗██╔════╝ 
██████╔╝██║  ██║█████╗      ██████╔╝███████║██║  ███╗
██╔═══╝ ██║  ██║██╔══╝      ██╔══██╗██╔══██║██║   ██║
██║     ██████╔╝██║         ██║  ██║██║  ██║╚██████╔╝
╚═╝     ╚═════╝ ╚═╝         ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ 
-----------------------------------------------------
Document Searching App with Advanced RAG
</pre>

### Frontend
[![Next.js](https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

### Backend
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

### Vector Database & Search
[![Pinecone](https://img.shields.io/badge/Pinecone-000000?style=flat&logo=pinecone&logoColor=white)](https://www.pinecone.io/)
[![Cohere](https://img.shields.io/badge/Cohere-39594D?style=flat&logo=cohere&logoColor=white)](https://cohere.ai/)

### Database, Auth and Storage
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

### Document Processing
[![PyMuPDF](https://img.shields.io/badge/PyMuPDF-FF6347?style=flat&logo=adobe-acrobat-reader&logoColor=white)](https://pymupdf.readthedocs.io/)

</div>

## Description

A sophisticated RAG (Retrieval-Augmented Generation) application for semantic document search and question-answering. This system combines dense vector search, sparse BM25 search, and advanced reranking techniques to provide highly accurate document retrieval from PDF files.

**Planning Document** - This project is currently in development.

## Architecture Overview

### Search Pipeline
1. **Dense Vector Search** - Pinecone semantic search using dense embeddings
2. **Sparse Vector Search (BM25)** - Keyword-based search using Pinecone's sparse vectors
3. **Custom RRF Reranking** - Reciprocal Rank Fusion to combine results from both search methods
4. **Cohere Reranker** - Final reranking layer using Cohere's reranking model for optimal results

### Storage & Processing
- **Vector Database**: Pinecone (dense + sparse vectors, metadata storage)
- **Relational Database**: Supabase PostgreSQL (auth, chat history, PDF metadata)
- **File Storage**: Supabase Storage (PDF files)
- **Document Processing**: PyMuPDF for chunking, text extraction, and bounding box coordinates

## Features

### Core Functionality
- **Hybrid Search**: Combines semantic (dense) and keyword (BM25/sparse) search for optimal retrieval
- **Advanced Reranking**: Two-stage reranking (Custom RRF → Cohere) for precision
- **PDF Processing**: Automatic chunking with bounding box extraction for visual context
- **Precise Highlighting**: AI extracts exact text snippets used in answers via structured schema, then performs reverse lookup using PyMuPDF's `page.search_for()` for pixel-perfect highlighting
- **User Authentication**: Secure auth via Supabase
- **Chat History**: Persistent conversation storage per user
- **Multi-tenant**: User-scoped document access via `user_id` metadata

### Show Reasoning
- **Debug Mode**: Visualize search pipeline results at each stage
  - Raw semantic search results
  - Raw BM25 search results
  - Post-RRF results
  - Final reranked results
- **Transparency**: Inspect scoring and ranking at each step
- **Citation Tracking**: View exact text snippets the AI used to generate each answer

### Highlighting Pipeline
1. **AI Response**: LLM returns answer with structured schema containing exact text snippets used
2. **Reverse Lookup**: Backend uses PyMuPDF's `page.search_for()` to locate exact coordinates
3. **Frontend Display**: Highlights precise text regions in PDF viewer
4. **Fallback**: Uses chunk bounding boxes when exact text match isn't found

### Metadata Schema
Each document chunk stored in Pinecone includes:
```json
{
  "user_id": "string",
  "text": "string",
  "bounding_box": {"x": 0, "y": 0, "width": 0, "height": 0},
  "title": "string",
  "page_num": "integer",
  "file_id": "UUID",
  "chunk_index": "integer"
}
```

## Tech Stack

### Frontend (Next.js)
- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: TailwindCSS

### Backend (Python)
- **Framework**: FastAPI
- **Document Processing**: PyMuPDF (fitz)
  - Chunking with bounding box extraction
  - Reverse text lookup via `page.search_for()`
  - Precise coordinate retrieval for highlighting
- **Vector Operations**: Pinecone SDK
- **Reranking**: Cohere API
- **Embeddings**: (TBD - OpenAI/Cohere/HuggingFace)
- **LLM Response**: Structured output schema for exact citation extraction

### Infrastructure
- **Vector DB**: Pinecone (Serverless)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth
