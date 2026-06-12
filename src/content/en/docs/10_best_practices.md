# Best Practices
---
## Product Registration
**Good**:
- Register multiple reference images per product from different angles (front, slight left, slight right)
- Use high-resolution, well-lit reference images on a plain background
- Register images that match how the product actually appears on shelf (facing forward, with visible label)
- Keep product metadata (name, barcode, description) accurate for LLM refinement to work correctly
**Avoid**:
- Registering only one image per product — rotated variants generated from one image may not cover all real-world orientations
- Using blurry, dark, or low-contrast reference images
- Registering product images that show the back or bottom of the packaging
---
## Planogram Setup
**Good**:
- Register the planogram before running any shelf analysis that requires compliance
- Keep planogram positions and product assignments up to date when layouts change
- Use the planogram generator (`/api/v1/planogramgenerator`) to bootstrap a planogram from a real shelf image, then review and correct it before using for compliance
**Avoid**:
- Submitting captures with an outdated `planogramId` — compliance results will be incorrect
- Using the same planogram for stores with different physical shelf layouts
---
## Shelf Image Quality
**Good**:
- Capture images front-on with minimal angle tilt
- Ensure shelves are fully lit and product labels are clearly visible
- Make sure shelf markers are visible if using the planogram generator
- Capture the full shelf in a single image where possible
**Avoid**:
- Blurry images (motion blur from handheld capture)
- Images with heavy glare on price tags or product packaging
- Partial shelf images that crop out positions needed for compliance
- Images taken at extreme angles that distort product proportions
---
## Sync vs Async Analysis
**Use synchronous** (`/api/v1/synccaptureupload`):
- During integration testing and development
- For low-volume, interactive workflows where latency is acceptable
- When you need the result directly in the HTTP response
**Use asynchronous** (`/api/v1/captureupload`):
- For production workloads
- When processing many images concurrently
- When shelf analysis latency would be unacceptable in your application's flow
- Asynchronous analysis is Temporal-backed — it is durable and survives pod restarts
---
## Webhook Integration
**Good**:
- Deploy your webhook endpoint before registering it with ISA
- Return `200 OK` from your webhook endpoint as fast as possible; queue heavy processing
- Log all incoming webhook payloads for debugging
- Implement idempotency in your webhook handler (re-deliveries may occur)
**Avoid**:
- Using localhost or private IPs as `webhookUrl` — they are not reachable from ISA
- Performing slow operations synchronously in the webhook handler — this may cause timeouts
---
## Token Management
**Good**:
- Cache the JWT and reuse it until it expires
- Re-authenticate proactively before expiry rather than waiting for a `401`
- Store `clientSecret` securely (environment variable or secret manager — never in source code)
**Avoid**:
- Re-authenticating on every single API call — this wastes resources and increases latency
- Hard-coding credentials in application code
---
## Tenant and Data Management
**Good**:
- Use one tenant per retailer or isolated business unit
- Keep product catalogs clean — remove deprecated products to prevent false matches in similarity search
- Periodically review capture-analysis results to verify recognition accuracy and update product images as needed
**Avoid**:
- Sharing one tenant across unrelated retailers — there is no data separation within a tenant
- Leaving unindexed or failed product images in the catalog without re-registering them
---
## Performance
**Good**:
- Batch product upserts — `POST /api/v1/productdata` supports batch submission
- Submit async captures for high-volume processing to take advantage of KEDA autoscaling
- Monitor worker pod scaling under load via KEDA metrics
**Avoid**:
- Sending large base64-encoded images when blob URL submission is available (Embedding and Detection `/url` endpoints)
- Submitting many synchronous captures in parallel from a single integration client — this puts backpressure on the sync pipeline
