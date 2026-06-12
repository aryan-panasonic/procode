# Troubleshooting Guide
---
## Problem: Cannot authenticate / always getting 401
**Possible Causes**:
- JWT token expired
- Using wrong `clientId` or `clientSecret`
- Using a token issued against a different environment
**Resolution**:
1. Re-call `POST /api/v1/auth/token` with your credentials to get a fresh token
2. Confirm you are hitting the correct API base URL for your environment (dev/UAT/prod)
3. If credentials are rejected, contact your platform administrator to verify `clientId` and `clientSecret`
---
## Problem: Products are not being recognized in shelf analysis
**Possible Causes**:
- Product has no registered reference image
- Product images are low quality or not representative of how products appear on shelf
- Product is not linked to the correct tenant
**Resolution**:
1. Call `GET /api/v1/tenants/{id}/products` to confirm the product is registered
2. Call `POST /api/v1/productimage` to register at least one reference image if missing
3. Call `GET /api/v1/tenants/{id}/points` to inspect whether embeddings exist for the product
4. Add additional reference images from different angles to improve recognition
---
## Problem: Analysis returns detections but compliance is always wrong
**Possible Causes**:
- Wrong `planogramId` submitted with the capture
- Planogram was registered for a different store or layout
- Planogram positions do not match the actual shelf being photographed
**Resolution**:
1. Call `GET /api/v1/planogramdata/{planogram_id}` to verify the planogram content
2. Confirm the `planogramId` matches the shelf being analyzed
3. Re-register the planogram if the expected layout has changed
---
## Problem: Async capture webhook is never received
**Possible Causes**:
- Webhook URL is not publicly accessible
- Webhook endpoint is returning a non-2xx response
- Temporal workflow worker is down or stuck
- Background thread failure (price captures only)
**Resolution**:
1. Verify the `webhookUrl` is accessible from the internet and returns `200` on POST
2. Check Temporal worker logs for workflow errors or stalled activities
3. For price async captures: check API pod logs — price async uses background threads, not Temporal; if the pod restarted during processing, the result is lost and capture must be re-submitted
4. Re-submit the capture if no other recovery is possible
---
## Problem: Shelf analysis returns no detections at all
**Possible Causes**:
- Image quality too low (blurry, dark, or low resolution)
- Image failed validation before reaching the detection pipeline
- Detection Service is down
**Resolution**:
1. Check the response body for validation error messages
2. Verify Detection Service health: `GET /health` on the detection service
3. Re-submit with a higher quality, well-lit, front-facing shelf image
---
## Problem: Price extraction returns empty or incorrect results
**Possible Causes**:
- Price tags are not clearly visible or are obstructed
- Image resolution too low for OCR
- Azure Computer Vision quota exceeded or service unavailable
**Resolution**:
1. Retake the shelf image with higher resolution, ensuring price tags are clearly visible and unobstructed
2. Check Azure Computer Vision service health and subscription quota in the Azure portal
3. Retry after a short delay if Azure service was temporarily unavailable
---
## Problem: Planogram generator output is incorrect or empty
**Possible Causes**:
- Shelf markers not visible or not correctly placed in the image
- Camera angle too extreme for perspective warp
**Resolution**:
1. Ensure physical shelf markers are present and visible in the image
2. Retake image from a more direct, head-on angle
3. Review generated PSA content before importing into ISA
---
## Problem: PSA file import fails
**Possible Causes**:
- PSA file is malformed or uses an unsupported version
- Required fields missing in planogram/product/segment/fixture/position hierarchy
**Resolution**:
1. Validate the PSA file structure against supported format documentation
2. Check the error response body for specific parse or validation failure details
3. Use JSON planogram import as an alternative if PSA cannot be fixed
---
## Problem: Capture crops or results not available after sync analysis
**Possible Causes**:
- Blob storage persistence runs as a background task after the sync response
- Azure Blob Storage connectivity issue
**Resolution**:
1. Wait a few seconds and retry the retrieval — background tasks run after the HTTP response
2. Check Azure Blob Storage connectivity if results remain unavailable after several minutes
3. Verify `capture_analysis` record was created: `GET /api/v1/tenants/{tenant_id}/captureAnalysis/{capture_id}`
---
## Problem: Embedding or detection service is slow or unresponsive
**Possible Causes**:
- Service is starting up and warming up the model (expected at pod start)
- Pod is under resource pressure
- KEDA has not yet scaled up worker replicas under high load
**Resolution**:
1. Check service `GET /health` endpoint for liveness
2. Check pod resource usage in Kubernetes dashboard
3. Review KEDA ScaledObject configuration to ensure queue-depth scaling thresholds are appropriate
4. Allow time for model warmup on fresh pod starts before routing traffic
---
## Problem: New products not appearing in search results
**Possible Causes**:
- Product image registration was not called after product data upsert
- Embedding generation failed silently
**Resolution**:
1. Confirm `POST /api/v1/productimage` was called for the product
2. Check `GET /api/v1/tenants/{id}/points` to verify embedding rows exist
3. If no embeddings found, re-call `POST /api/v1/productimage`
