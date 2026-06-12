# Error Catalog
## HTTP Status Code Reference
| Status Code | Meaning | Common Causes |
|-------------|---------|---------------|
| 200 OK | Success | Request processed successfully |
| 202 Accepted | Async accepted | Async capture or price upload started; result delivered via webhook |
| 400 Bad Request | Invalid input | Missing required fields, malformed JSON, unsupported image format, failed image quality validation |
| 401 Unauthorized | Auth failed | Missing or expired JWT, invalid `clientId`/`clientSecret` |
| 403 Forbidden | Access denied | Accessing another tenant's data, insufficient permissions |
| 404 Not Found | Resource missing | `tenantId`, `planogramId`, `captureId`, or `productId` does not exist |
| 422 Unprocessable Entity | Validation error | Data fails business-rule validation (e.g., invalid planogram structure, PSA parse error) |
| 500 Internal Server Error | Server error | Unexpected failure in processing pipeline |
| 503 Service Unavailable | Dependency down | Embedding Service, Detection Service, Azure Blob, or Azure Vision unavailable |
---
## Authentication Errors
| Scenario | Likely Cause | Resolution |
|----------|-------------|-----------|
| `401` on any endpoint | JWT expired or missing | Re-authenticate: `POST /api/v1/auth/token` and use the new token |
| `401` on `/api/v1/auth/token` | Invalid `clientId` or `clientSecret` | Verify credentials with your platform administrator |
| Token appears valid but still `401` | Token was issued for a different environment | Ensure you're using the correct API base URL |
---
## Product & Catalog Errors
| Scenario | Likely Cause | Resolution |
|----------|-------------|-----------|
| Product not recognized in analysis | Product has no registered image | Call `POST /api/v1/productimage` for the product |
| Product image registration fails | Unsupported image format or corrupt file | Verify image is a valid JPEG/PNG; re-encode and retry |
| Product upsert returns partial failure | Some products failed validation | Check per-product error details in response; fix and re-submit failed items |
| Similar product search returns no results | No embeddings exist for this tenant | Register product images before searching |
---
## Planogram Errors
| Scenario | Likely Cause | Resolution |
|----------|-------------|-----------|
| PSA import fails with parse error | Malformed or unsupported PSA file version | Validate PSA file structure; check for unsupported fields |
| Planogram retrieval returns `404` | `planogramId` does not exist or belongs to another tenant | Confirm `planogramId` and `tenantId` are correct |
| Planogram JSON fails validation | Missing required hierarchy fields | Ensure all levels (planogram, segment, fixture, position) are included |
---
## Capture / Analysis Errors
| Scenario | Likely Cause | Resolution |
|----------|-------------|-----------|
| Analysis returns no detections | Image quality too low or shelf markers missing | Use a higher resolution, well-lit image; ensure shelf is clearly visible |
| Analysis returns `400` | Image failed quality or size validation | Check image resolution, brightness, and encoding |
| Products detected but not recognized | Products not registered or no images registered | Register all expected products with reference images before analysis |
| Compliance always shows non-compliant | Wrong `planogramId` submitted | Verify the submitted `planogramId` matches the shelf being analyzed |
| Async webhook never received | `webhookUrl` unreachable or returning non-2xx | Confirm webhook endpoint is publicly accessible and returns `200` |
| Async returns `202` but webhook never fires | Temporal workflow failed | Check Temporal worker logs; re-submit the capture |
| Crop images return `404` | Blob storage persistence not yet complete | Wait and retry; background blob tasks run after the sync response |
---
## Price Capture Errors
| Scenario | Likely Cause | Resolution |
|----------|-------------|-----------|
| Price extraction returns empty results | Price tags not legible in image | Use higher resolution image; ensure price tags are clearly visible and unobstructed |
| Azure Vision error | Azure Computer Vision quota exceeded or service unavailable | Check Azure subscription limits; retry after delay |
| Async price webhook never received | Background thread lost on process restart | Re-submit the price capture; price async does not use durable Temporal workflows |
---
## Planogram Generator Errors
| Scenario | Likely Cause | Resolution |
|----------|-------------|-----------|
| Generated PSA is empty or incorrect | Shelf markers not detected | Ensure physical shelf markers are visible and correctly placed in the image |
| Perspective warp failure | Image angle too extreme | Capture image from a more head-on angle |
---
## Internal Service Errors
| Scenario | Likely Cause | Resolution |
|----------|-------------|-----------|
| `503` on capture endpoints | Detection or Embedding Service is down | Check service health via `/health` endpoints; alert infrastructure team |
| Embedding timeout | No explicit timeout in some code paths | Monitor service response times; consider retry logic in client |
| Blob upload failure | Azure Blob Storage credentials or connectivity issue | Check Azure Workload Identity configuration and network policies |
