# Temporal & Async Workflow Reference
## Why Temporal?
Async shelf analysis involves calling multiple external services (Detection, Embedding, post-processing) and delivering results via webhook. Temporal provides durable execution: if a worker crashes mid-workflow, Temporal replays activities from the last checkpoint. This guarantees that captures are not silently lost.
## Workflow: ShelfAnalysisWorkflow
Triggered by `POST /api/v1/captureupload`. Orchestrates end-to-end async shelf analysis.
### Trigger
1. `planogram` API validates the request
2. Shelf image is uploaded to Azure Blob Storage
3. Temporal client starts `ShelfAnalysisWorkflow` with the blob URL and capture metadata
4. API returns `202 Accepted` with `workflowId` to the client
### Workflow Steps (Activity Boundaries)
```
ShelfAnalysisWorkflow
  ├── [Activity] DetectionActivity
  │     └── Detection Worker → POST /detection/url → bounding boxes
  │
  ├── [Activity] EmbeddingActivity
  │     └── Embedding Worker → POST /embedding/url → feature vectors
  │
  ├── [Activity] PostProcessingActivity
  │     └── Workflow Worker → POST /api/v1/capture-upload/post-processing
  │           └── planogram API: similarity search, OCR rerank, compliance, numbering
  │
  └── [Activity] NotificationActivity
        └── Workflow Worker → POST {webhookUrl} → analysis result delivered
```
### Worker Types
| Worker | Task Queue | Responsibilities |
|--------|-----------|-----------------|
| Workflow Worker | workflow queue | Runs the `ShelfAnalysisWorkflow` definition; calls post-processing and webhook |
| Detection Worker | detection queue | Calls Detection Service for bounding box activity |
| Embedding Worker | embedding queue | Calls Embedding Service for feature vector activity |
### Scaling
Workers are deployed as separate Kubernetes Deployments. KEDA `ScaledObject`s scale each worker independently based on Temporal task queue depth and CPU/memory metrics. This means detection-heavy loads scale detection workers without scaling embedding workers.
## What Happens If a Worker Crashes?
Temporal persists workflow state. If a worker crashes mid-activity:
- Temporal retries the activity on a healthy worker
- No data loss for the shelf image (already in Azure Blob Storage)
- The workflow resumes from the last completed activity boundary
- The webhook is eventually delivered when the workflow completes
## Workflow ID
The `workflowId` returned by `POST /api/v1/captureupload` is the Temporal workflow identifier. It can be used to:
- Look up workflow status in the Temporal UI (internal/ops use)
- Correlate async captures with their results in your webhook handler
## Temporal Client Management
ISA uses a `TemporalClientManager` singleton with a persistent event loop. The Temporal client is created once at startup and reused across requests to avoid connection overhead.
## Price Async: NOT on Temporal
`POST /api/v1/captureuploadprice` (async) does NOT use Temporal. It uses a background thread.
- If the `planogram` API pod restarts while processing, the price capture result is lost
- Must re-submit the capture if no webhook is received
- This is a known architectural inconsistency — product async is durable; price async is not
## Async vs Sync Decision Summary
| Aspect | Sync (`/synccaptureupload`) | Async (`/captureupload`) |
|--------|---------------------------|--------------------------|
| Response | Immediate result in body | `202` + `workflowId` |
| Processing | Blocking HTTP pipeline | Temporal workflow |
| Durability | None (in-process) | Durable via Temporal |
| Result delivery | HTTP response | Webhook POST |
| Failure recovery | Client must retry | Temporal retries automatically |
| Scale | Limited by API pod | Independent worker scaling via KEDA |
| Recommended for | Dev/testing | Production |
## Common Async Questions
- **How do I know when async analysis is done?** Your `webhookUrl` will receive a POST with the full result.
- **What if my webhook is down when ISA tries to deliver?** Temporal activity retries will attempt delivery. Ensure your webhook is available. If permanently unreachable, the workflow will eventually exhaust retries and fail.
- **Can I check workflow status without waiting for the webhook?** Not via the public API. Workflow status is visible in the Temporal UI (internal ops access).
- **Does ISA store the result even if the webhook fails?** Yes — `capture_analysis` DB record and Azure Blob artifacts are persisted during post-processing, before the webhook notification activity.
