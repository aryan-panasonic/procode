# Product Overview
## What is ISA?
ISA (Intelligent Shelf Analyzer) is an API-first, multi-tenant retail computer vision platform. It turns shelf photos into structured operational data by comparing actual shelf state against expected shelf layouts (planograms), extracting price-tag information, and supporting automated planogram generation from shelf photos.
## Core Business Flow
1. Create a tenant (retailer)
2. Register products and reference product images
3. Register planogram layouts (JSON or PSA file)
4. Submit shelf images for analysis
5. Retrieve structured product-placement, compliance, price, and capture-analysis results
## What Problems It Solves
- Converts shelf photographs into structured, actionable retail data
- Detects planogram compliance violations automatically
- Extracts price tag information from shelf images via OCR
- Enables automated planogram generation from real shelf imagery
- Reduces manual shelf audit labor for retailers
## Target Users
ISA is a B2B platform targeting:
- **Retailers and retail operations teams**: primary consumers of shelf analysis results
- **System integrators**: connecting ISA to retail management systems via API and webhooks
- **Shelf operations managers**: monitoring compliance across stores
## Major Capabilities
- OAuth client authentication with JWT issuance
- Multi-tenant architecture with per-tenant data isolation
- Product catalog onboarding with visual embedding index
- Product image registration with rotated variant generation
- Similar-product search by product ID or uploaded image
- Planogram registration from JSON or PSA files
- Synchronous shelf analysis (immediate result)
- Asynchronous shelf analysis via Temporal workflows with webhook delivery
- Price-capture OCR pipeline (sync and async)
- Capture-analysis result and cropped-image retrieval
- Alternative-product retrieval for near-match explanation
- Automated planogram generation from shelf images
- AI-assisted product recognition using OCR reranking and LLM refinement
## High-Level Architecture
```
API Client / Retail System
        ↓
  Planogram API (Flask)
  ↙        ↓         ↘
Detection   Embedding   Azure Services
Service     Service     (Blob, OCR, OpenAI)
        ↘        ↙
     PostgreSQL + pgvector
        ↓
  Temporal Orchestration (async flows)
        ↓
  Webhook → Tenant System
```
- `planogram`: central API, business logic, persistence, Azure integration
- `embedding`: image embedding inference (OpenVINO)
- `detection`: object detection inference (ONNX Runtime)
- `orchestration`: Temporal workflows and workers for async shelf analysis
## Deployment
Kubernetes-based (staging/production). Services are containerized, scaled via KEDA, and deployed via GitOps. Secrets managed through Azure Key Vault CSI.
