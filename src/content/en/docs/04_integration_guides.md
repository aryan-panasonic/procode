# End-to-End Integration Guides
---
## Guide 1: Full Onboarding Flow (New Tenant)
**Goal**: Get a new retailer set up and ready to analyze shelves.
**Steps**:
1. Obtain OAuth client credentials from your ISA platform administrator
2. Call `POST /api/v1/auth/token` with `clientId` and `clientSecret` → receive JWT
3. Call `POST /api/v1/tenants` with tenant name and country → tenant + default store created
4. Call `POST /api/v1/productdata` to upsert your product catalog
5. For each product, call `POST /api/v1/productimage` to register at least one reference image
6. Wait for embedding generation to complete (synchronous per call)
7. Call `POST /api/v1/planogramdata` (JSON) or `POST /api/v1/planogramdata/from-file` (PSA) to register the shelf layout
8. Submit a test shelf image via `POST /api/v1/synccaptureupload` to verify setup
9. Review the analysis result for recognized products, positions, and compliance status
---
## Guide 2: Authenticate and Get a Token
**Goal**: Obtain a JWT for use in all subsequent API calls.
**Request**:
```
POST /api/v1/auth/token
Content-Type: application/json

{
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret"
}
```
**Response**: Returns a JWT token.
**Usage**: Include in all subsequent requests as:
```
Authorization: Bearer <token>
```
**Notes**:
- Tokens expire — re-authenticate when you receive `401 Unauthorized`
- Secrets are hashed server-side; keep your `clientSecret` secure
---
## Guide 3: Register Products and Images
**Goal**: Build the visual product index for a tenant.
**Step 1 — Upsert product data**:
```
POST /api/v1/productdata
Authorization: Bearer <token>
```
- Accepts batch product records
- ISA splits incoming products into insert, update, or link-only paths automatically
- Include `tenantId`, product identifiers, and metadata fields
**Step 2 — Register product images**:
```
POST /api/v1/productimage
Authorization: Bearer <token>
```
- Submit one image per call
- ISA generates rotated variants, embeds each, and stores in `product_embedding`
- Registration is synchronous — the embedding is stored before the call returns
**Notes**:
- At least one image per product is required before that product can be recognized in shelf analysis
- More images (including rotated variants or different angles) improve recognition accuracy
---
## Guide 4: Register a Planogram
**Goal**: Load the expected shelf layout to enable compliance analysis.
**Option A — JSON**:
```
POST /api/v1/planogramdata
Authorization: Bearer <token>
```
- Provide planogram hierarchy: planogram → segments → fixtures → positions
- Each position links to a product ID
- Fixture type `11` receives special processing
**Option B — PSA file**:
```
POST /api/v1/planogramdata/from-file
Authorization: Bearer <token>
Content-Type: multipart/form-data
```
- Upload a PSA file directly
- ISA parses, validates, and upserts the same internal hierarchy
**Retrieve planogram**:
```
GET /api/v1/planogramdata/{planogram_id}
Authorization: Bearer <token>
```
---
## Guide 5: Synchronous Shelf Analysis
**Goal**: Submit a shelf image and immediately receive analysis results.
**Request**:
```
POST /api/v1/synccaptureupload
Authorization: Bearer <token>
```
- Include: `tenantId`, `storeId`, `planogramId`, shelf image (base64 or multipart)
**Response**: Returns a full analysis result including:
- Detected products with shelf positions
- Planogram compliance status per position
- Alternative near-match products for uncertain detections
- Capture ID for later retrieval
**Notes**:
- Best for low-latency integrations or testing
- Background tasks (blob storage, crop persistence) run after the response is returned
- Response time depends on shelf image complexity and number of products
---
## Guide 6: Asynchronous Shelf Analysis with Webhook
**Goal**: Submit a shelf image for non-blocking processing and receive results via webhook.
**Step 1 — Submit**:
```
POST /api/v1/captureupload
Authorization: Bearer <token>
```
- Include: `tenantId`, `storeId`, `planogramId`, shelf image, `webhookUrl`
- Response: `202 Accepted` with `workflowId`
**Step 2 — ISA processes in background**:
- Image uploaded to Azure Blob Storage
- Temporal workflow started: detection → embedding → post-processing
- Result delivered to your `webhookUrl` via HTTP POST when complete
**Step 3 — Receive webhook**:
- Your endpoint receives a POST with the full analysis result
- Same structure as synchronous response
**Notes**:
- Use async for production integrations where response latency is unacceptable
- Ensure your `webhookUrl` is publicly accessible and returns `2xx`
- Temporal ensures reliable delivery even under infrastructure failures
---
## Guide 7: Price Capture Analysis
**Goal**: Extract price tag information from a shelf image.
**Synchronous**:
```
POST /api/v1/synccaptureuploadprice
Authorization: Bearer <token>
```
**Asynchronous** (webhook):
```
POST /api/v1/captureuploadprice
Authorization: Bearer <token>
```
- Same async pattern as shelf analysis: `202 Accepted` → webhook delivery
**Output**: Price values with bounding box coordinates mapped to shelf positions.
---
## Guide 8: Retrieve Past Capture Results
**Goal**: Access stored analysis results and crop images after a capture.
**Get analysis result**:
```
GET /api/v1/tenants/{tenant_id}/captureAnalysis/{capture_id}
Authorization: Bearer <token>
```
**List product crops**:
```
GET /api/v1/tenants/{tenant_id}/captureAnalysis/{capture_id}/products
Authorization: Bearer <token>
```
**Get a single crop**:
```
GET /api/v1/tenants/{tenant_id}/captureAnalysis/{capture_id}/products/{product_id}
Authorization: Bearer <token>
```
**Notes**:
- Results and crops are stored in Azure Blob Storage; ISA proxies or returns URLs
- Retrieval is available for all captured shelf images, both sync and async
---
## Guide 9: Generate a Planogram from a Shelf Image
**Goal**: Automatically create a planogram from a real shelf photograph.
**Request**:
```
POST /api/v1/planogramgenerator
Authorization: Bearer <token>
```
- Provide shelf image
- ISA runs: marker detection → perspective warp → fixture estimation → PSA generation
**Output**: PSA file representing the detected shelf layout.
**Notes**:
- The generated PSA can be imported back into ISA via `POST /api/v1/planogramdata/from-file`
- Accuracy depends on image quality and shelf marker visibility
