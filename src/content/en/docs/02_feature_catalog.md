# Feature Catalog
---
## Feature: Authentication
**Purpose**: Secure all API access using OAuth 2.0 client credentials and JWT tokens.
**How it works**: Client posts `clientId` and `clientSecret` to `/api/v1/auth/token`. The server validates credentials against hashed secrets in the `oauth_client` table and returns an HS256 JWT. All protected endpoints require a `Bearer <token>` header.
**Endpoint**: `POST /api/v1/auth/token`
**Auth required**: No
**Token expiry**: Configured per deployment
**Permissions**: N/A (token issuance is credential-based)
**Questions answered**:
- How do I get an access token?
- What credentials do I need?
- Why am I getting 401 Unauthorized?
---
## Feature: Tenant Management
**Purpose**: Create and maintain retailer entities. Each tenant is fully isolated.
**Endpoints**:
- `POST /api/v1/tenants` — Create tenant (auto-creates a default store)
- `PATCH /api/v1/tenants/{id}` — Update tenant metadata
- `GET /api/v1/tenants/{id}/products` — List products linked to a tenant
**Auth required**: JWT
**Notes**: Tenant creation automatically creates a default store. Each tenant has isolated products, planograms, and capture data.
**Questions answered**:
- How do I onboard a new retailer?
- How do I update tenant information?
- What products are registered under a tenant?
---
## Feature: Product Catalog
**Purpose**: Load and maintain a searchable master product catalog per tenant.
**Endpoints**:
- `POST /api/v1/productdata` — Upsert products
- `POST /api/v1/productimage` — Register product image (generates embeddings and rotated variants)
- `POST /api/v1/productsearch` — Search for similar products by product ID or uploaded image
- `GET /api/v1/tenants/{tenant_id}/products/{product_id}/alternativeProducts` — Get near-match alternatives for a product from a capture
**Auth required**: JWT
**How product image registration works**: Original image is stored; configured rotated variants are generated. Each image is embedded (via Embedding Service) and stored as a `product_embedding` row with a 256-dimension vector in PostgreSQL/pgvector.
**How search works**: For search by product ID, the existing embedding is retrieved and cosine similarity search is run. For search by image, the image is first sent to the Embedding Service, then similarity search runs.
**Questions answered**:
- How do I register products?
- How do I add product images?
- How does product search work?
- What are alternative products?
---
## Feature: Planogram Management
**Purpose**: Register and retrieve expected shelf layouts for compliance comparison.
**Endpoints**:
- `POST /api/v1/planogramdata` — Register planogram from JSON
- `POST /api/v1/planogramdata/from-file` — Register planogram from PSA file
- `GET /api/v1/planogramdata/{planogram_id}` — Retrieve planogram
**Auth required**: JWT
**Data hierarchy stored**: Planogram → Segment → Fixture → Position → Product
**PSA support**: PSA files are parsed, validated, and upserted into the same hierarchy as JSON.
**Notes**: Fixture type `11` receives special processing during JSON registration.
**Questions answered**:
- How do I load a planogram?
- Can I import from a PSA file?
- How do I retrieve an existing planogram?
---
## Feature: Shelf Analysis (Synchronous)
**Purpose**: Submit a shelf image and receive an analysis result immediately.
**Endpoint**: `POST /api/v1/synccaptureupload`
**Auth required**: JWT
**Pipeline**:
1. Validate JWT, image quality, and image size
2. Load tenant products, planogram, fixtures, positions from DB
3. Send image to Detection Service → bounding boxes returned
4. Send crops to Embedding Service → feature vectors returned
5. Run cosine similarity search on `product_embedding`
6. Run OCR/LLM refinement for unrecognized items
7. Run compliance and position numbering
8. Return analysis result to client
9. Persist image/results/crops to Azure Blob Storage (async background)
10. Write `capture_analysis` record to DB
**Result includes**: Detected products with positions, compliance status, alternative products for uncertain matches, price data if applicable.
**Questions answered**:
- How do I analyze a shelf image?
- What does the analysis result contain?
- How long does synchronous analysis take?
---
## Feature: Shelf Analysis (Asynchronous)
**Purpose**: Submit a shelf image for non-blocking analysis with webhook callback.
**Endpoint**: `POST /api/v1/captureupload`
**Auth required**: JWT
**Pipeline**:
1. Validate JWT, entities, and image
2. Upload shelf image to Azure Blob Storage
3. Start Temporal `ShelfAnalysisWorkflow`
4. Return `202 Accepted` with workflow ID to client
5. Temporal orchestrates: Detection Worker → Embedding Worker → Post-processing → Webhook notification
**Webhook**: Result is delivered to the tenant's registered `webhook_url` when complete.
**Questions answered**:
- How does async shelf analysis work?
- How do I receive results via webhook?
- How do I check analysis status?
- What is the workflow ID used for?
---
## Feature: Price Capture Analysis
**Purpose**: Extract price tag information from shelf images using Azure Vision OCR.
**Endpoints**:
- `POST /api/v1/synccaptureuploadprice` — Synchronous price extraction
- `POST /api/v1/captureuploadprice` — Asynchronous price extraction with webhook
**Auth required**: JWT
**Pipeline**: Azure Computer Vision OCR extraction → price parsing → coordinate post-processing → optional async webhook callback
**Output**: Price values with coordinates mapped to shelf positions.
**Questions answered**:
- How do I extract price tags from shelf images?
- Is price analysis sync or async?
- What format are price results returned in?
---
## Feature: Capture Analysis Retrieval
**Purpose**: Retrieve previously stored shelf analysis results, images, and crops.
**Endpoints**:
- `GET /api/v1/tenants/{tenant_id}/captureAnalysis/{capture_id}` — Get analysis metadata and result
- `GET /api/v1/tenants/{tenant_id}/captureAnalysis/{capture_id}/products` — List cropped product images
- `GET /api/v1/tenants/{tenant_id}/captureAnalysis/{capture_id}/products/{product_id}` — Get one crop
**Auth required**: JWT
**Storage**: Results, annotated images, crops, and alternative-product JSON are stored in Azure Blob Storage. `capture_analysis` DB record holds blob URLs for retrieval.
**Questions answered**:
- How do I retrieve a previous analysis?
- How do I get individual product crop images?
- Where are analysis results stored?
---
## Feature: Planogram Generator
**Purpose**: Automatically generate a planogram PSA file from a shelf image.
**Endpoint**: `POST /api/v1/planogramgenerator`
**Auth required**: JWT
**Pipeline**: Marker detection → perspective warp → fixture estimation → PSA generation
**Output**: PSA file representing the shelf layout detected in the image.
**Questions answered**:
- Can ISA generate a planogram from a photo?
- What format is the generated planogram output?
---
## Feature: Vector Inspection (Admin)
**Purpose**: Inspect stored product embeddings for debugging and verification.
**Endpoint**: `GET /api/v1/tenants/{id}/points`
**Auth required**: JWT
**Output**: Payloads and optionally raw vectors from `product_embedding` rows.
**Questions answered**:
- How do I verify that product embeddings are stored correctly?
- What vectors does a product have?
---
## Feature: Embedding Service
**Purpose**: Generate 256-dimension feature vectors from product/shelf images for similarity search.
**Endpoints**:
- `POST /embedding` — Generate embeddings from base64 image
- `POST /embedding/url` — Generate embeddings from blob URL
**Runtime**: OpenVINO. Model loaded from local files or Azure Blob Storage at startup.
**Notes**: Internal service — not directly called by API clients. Called by `planogram` API and Temporal workers.
---
## Feature: Detection Service
**Purpose**: Detect product bounding boxes in shelf images.
**Endpoints**:
- `POST /detection` — Detect from base64 image
- `POST /detection/url` — Detect from blob URL
**Runtime**: ONNX Runtime. Model loaded from local or Azure-backed storage.
**Notes**: Internal service — not directly called by API clients.
