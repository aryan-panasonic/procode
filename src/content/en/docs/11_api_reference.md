# Complete API Reference
Base URL: `https://<your-isa-host>/api/v1`
All protected endpoints require: `Authorization: Bearer <jwt>`
---
## Authentication
### POST /api/v1/auth/token
Obtain a JWT access token.
**Auth**: None
**Request body**:
```json
{
  "clientId": "string",
  "clientSecret": "string"
}
```
**Response**:
```json
{
  "token": "string"
}
```
---
## Tenant
### POST /api/v1/tenants
Create a new tenant. Auto-creates a default store.
**Auth**: JWT
**Request body**:
```json
{
  "tenantId": "string",
  "name": "string",
  "countryCode": "string"
}
```
### PATCH /api/v1/tenants/{id}
Update tenant metadata.
**Auth**: JWT
**Path param**: `id` — tenant ID
**Request body**: Fields to update (name, metadata fields)
### GET /api/v1/tenants/{id}/products
List all products linked to a tenant.
**Auth**: JWT
**Path param**: `id` — tenant ID
---
## Product
### POST /api/v1/productdata
Upsert products into a tenant's catalog. Handles insert, update, and link-only paths automatically.
**Auth**: JWT
**Request body**:
```json
{
  "tenantId": "string",
  "products": [
    {
      "productId": "string",
      "name": "string",
      "barcode": "string"
    }
  ]
}
```
### POST /api/v1/productimage
Register a reference image for a product. Generates rotated variants, embeds all, and stores as `product_embedding` rows.
**Auth**: JWT
**Request body** (multipart or JSON with base64):
```json
{
  "tenantId": "string",
  "productId": "string",
  "image": "<base64-encoded image>"
}
```
### POST /api/v1/productsearch
Search for similar products by product ID or uploaded image.
**Auth**: JWT
**Request body**:
```json
{
  "tenantId": "string",
  "productId": "string"
}
```
Or by image:
```json
{
  "tenantId": "string",
  "image": "<base64-encoded image>"
}
```
**Response**: Ranked list of similar products with similarity scores.
### GET /api/v1/tenants/{tenant_id}/products/{product_id}/alternativeProducts
Retrieve near-match alternative products for a specific product from a past capture.
**Auth**: JWT
**Path params**: `tenant_id`, `product_id`
**Query params**: `captureId` — the capture to retrieve alternatives from
---
## Planogram
### POST /api/v1/planogramdata
Register a planogram from JSON hierarchy.
**Auth**: JWT
**Request body**:
```json
{
  "tenantId": "string",
  "storeId": "string",
  "planogramId": "string",
  "segments": [
    {
      "segmentId": "string",
      "fixtures": [
        {
          "fixtureId": "string",
          "fixtureType": 1,
          "positions": [
            {
              "positionId": "string",
              "productId": "string"
            }
          ]
        }
      ]
    }
  ]
}
```
**Note**: `fixtureType: 11` receives special post-processing.
### POST /api/v1/planogramdata/from-file
Register a planogram from a PSA file.
**Auth**: JWT
**Request**: `multipart/form-data` with `tenantId`, `storeId`, and PSA file upload.
### GET /api/v1/planogramdata/{planogram_id}
Retrieve a stored planogram with its full segment/fixture/position hierarchy.
**Auth**: JWT
**Path param**: `planogram_id`
---
## Capture / Shelf Analysis
### POST /api/v1/synccaptureupload
Submit a shelf image for immediate synchronous analysis.
**Auth**: JWT
**Request body**:
```json
{
  "tenantId": "string",
  "storeId": "string",
  "planogramId": "string",
  "image": "<base64-encoded image>"
}
```
**Response**:
```json
{
  "captureId": "string",
  "detections": [...],
  "compliance": [...],
  "alternatives": [...]
}
```
**Status**: `200 OK`
### POST /api/v1/captureupload
Submit a shelf image for asynchronous analysis. Result delivered via webhook.
**Auth**: JWT
**Request body**:
```json
{
  "tenantId": "string",
  "storeId": "string",
  "planogramId": "string",
  "image": "<base64-encoded image>",
  "webhookUrl": "https://your-endpoint.com/webhook"
}
```
**Response**:
```json
{
  "workflowId": "string"
}
```
**Status**: `202 Accepted`
### POST /api/v1/capture-upload/post-processing
Internal worker-facing endpoint. Called by Temporal workers to convert raw detection/embedding results into business results.
**Auth**: JWT
**Note**: Not intended for direct client use.
---
## Price Capture
### POST /api/v1/synccaptureuploadprice
Synchronous price tag extraction from a shelf image.
**Auth**: JWT
**Request body**: Same structure as sync capture, without `planogramId` requirement.
**Response**: Price values with bounding box coordinates.
**Status**: `200 OK`
### POST /api/v1/captureuploadprice
Asynchronous price tag extraction. Result delivered via webhook.
**Auth**: JWT
**Request body**: Same as async capture with `webhookUrl`.
**Status**: `202 Accepted`
---
## Capture Analysis Retrieval
### GET /api/v1/tenants/{tenant_id}/captureAnalysis/{capture_id}
Retrieve the stored result for a past capture.
**Auth**: JWT
**Path params**: `tenant_id`, `capture_id`
### GET /api/v1/tenants/{tenant_id}/captureAnalysis/{capture_id}/products
List all cropped product images for a capture.
**Auth**: JWT
### GET /api/v1/tenants/{tenant_id}/captureAnalysis/{capture_id}/products/{product_id}
Retrieve the crop image for a specific detected product in a capture.
**Auth**: JWT
---
## Planogram Generator
### POST /api/v1/planogramgenerator
Generate a PSA planogram file from a shelf image.
**Auth**: JWT
**Request body**:
```json
{
  "tenantId": "string",
  "image": "<base64-encoded image>"
}
```
**Response**: PSA file content or download URL.
---
## Admin / Debug
### GET /api/v1/tenants/{id}/points
Inspect stored `product_embedding` rows for a tenant. Returns payloads and optionally raw vectors.
**Auth**: JWT
**Path param**: `id` — tenant ID
**Query param**: `includeVectors=true` to include raw vector data
---
## Health
### GET /health
Liveness check for all services (planogram, embedding, detection).
**Auth**: None
**Response**: `200 OK` when healthy
---
## Internal Service Endpoints (Not for direct client use)
### Embedding Service
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/embedding` | Generate embeddings from base64 image |
| POST | `/embedding/url` | Generate embeddings from blob URL |
| GET | `/health` | Health check |
### Detection Service
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/detection` | Detect bounding boxes from base64 image |
| POST | `/detection/url` | Detect bounding boxes from blob URL |
| GET | `/health` | Health check |
