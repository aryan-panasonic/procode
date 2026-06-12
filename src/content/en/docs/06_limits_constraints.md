# Limits & Constraints
## Image Requirements
| Constraint | Detail |
|------------|--------|
| Accepted formats | Standard image formats (JPEG, PNG recommended) |
| Minimum quality | Image quality and resolution are validated before processing |
| Minimum size | Image must meet minimum size thresholds (checked at capture upload) |
| Encoding | base64 or multipart upload depending on endpoint |
## Product Embedding
| Constraint | Detail |
|------------|--------|
| Vector dimensions | 256 per image embedding |
| OCR/text vector dimensions | Separate vector stored alongside image embedding |
| Rotated variants | Generated automatically from original image at registration |
| Minimum images per product | 1 reference image required before product can be recognized in analysis |
## Planogram
| Constraint | Detail |
|------------|--------|
| Supported input formats | JSON hierarchy or PSA file |
| Fixture type special handling | Fixture type `11` receives special post-processing |
| Hierarchy | Planogram → Segment → Fixture → Position |
## Analysis
| Constraint | Detail |
|------------|--------|
| Sync vs async | Sync recommended for testing; async recommended for production at scale |
| Webhook requirement (async) | `webhookUrl` must be publicly accessible and return `2xx` |
| Post-processing (sync) | Blob storage and crop persistence are background tasks; they do not block the response |
| Background thread risk | Price async and some blob upload tasks use background threads; results may be lost on process crash |
## Internal Service Communication
| Constraint | Detail |
|------------|--------|
| Embedding and Detection | Internal `ClusterIP` services; not reachable directly from outside the cluster |
| Timeout risk | Some service-to-service HTTP calls in sync paths do not have explicit timeouts configured |
## Data & Storage
| Constraint | Detail |
|------------|--------|
| Vector store | Vectors stored in PostgreSQL via pgvector (not a separate vector DB) |
| Blob storage | Azure Blob Storage used for shelf images, results, crops, and ML models |
| No Redis/cache | No distributed cache; model state is in-process memory |
| Tenant isolation | All data fully isolated per tenant; no cross-tenant queries |
## AI / Recognition
| Constraint | Detail |
|------------|--------|
| OCR-assisted matching | OCR text is embedded and combined with image similarity for improved recognition |
| LLM refinement | Unknown products may be sent to Azure OpenAI for name extraction and fuzzy matching; adds latency |
| Recognition accuracy | Depends on quality and quantity of registered product images |
| Price OCR | Azure Computer Vision only; accuracy depends on image quality and price tag legibility |
## Planogram Generator
| Constraint | Detail |
|------------|--------|
| Marker requirement | Shelf markers must be visible in the image for accurate perspective warp |
| Output format | PSA file only |
## Known Platform Limitations
- Images embedded inside documents are not indexed
- Audio and video inputs are not supported
- No built-in retry UI for failed async webhooks (must re-submit capture)
- Scope-based access control is not enforced at route level (JWT scopes exist but are not checked)
- Price async captures use background threads, not Temporal; results may be lost on pod restart
- Detection service is legacy-style (single `app.py`) and harder to extend than other services
