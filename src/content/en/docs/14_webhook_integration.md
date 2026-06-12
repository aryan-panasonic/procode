# Webhook Integration Guide
## What is a Webhook in ISA?
When you submit an async capture (`POST /api/v1/captureupload` or `POST /api/v1/captureuploadprice`), ISA processes the shelf image in the background and POSTs the result to your `webhookUrl` when processing completes.
## Registering a Webhook URL
The `webhookUrl` is submitted per capture request — there is no global webhook configuration. Each capture independently specifies where to deliver the result.
```json
{
  "tenantId": "...",
  "storeId": "...",
  "planogramId": "...",
  "image": "...",
  "webhookUrl": "https://your-system.example.com/isa-webhook"
}
```
## Webhook Requirements
| Requirement | Detail |
|-------------|--------|
| Accessibility | Must be publicly reachable from ISA (no localhost, no private IPs) |
| Method | ISA sends `HTTP POST` |
| Expected response | Your endpoint must return `2xx` |
| TLS | HTTPS strongly recommended for production |
| Latency | Respond quickly — do not perform heavy processing synchronously in the handler |
## Webhook Payload
The webhook POST body contains the same result structure as a synchronous capture response:
```json
{
  "captureId": "string",
  "tenantId": "string",
  "workflowId": "string",
  "detections": [
    {
      "productId": "string",
      "productName": "string",
      "position": {
        "segmentId": "string",
        "fixtureId": "string",
        "positionId": "string"
      },
      "confidence": 0.95,
      "boundingBox": { "x": 0, "y": 0, "width": 100, "height": 100 }
    }
  ],
  "compliance": [
    {
      "positionId": "string",
      "expectedProductId": "string",
      "detectedProductId": "string",
      "compliant": true
    }
  ],
  "alternatives": [...]
}
```
For price captures, payload contains:
```json
{
  "captureId": "string",
  "tenantId": "string",
  "prices": [
    {
      "value": "12.99",
      "currency": "THB",
      "boundingBox": { "x": 0, "y": 0, "width": 50, "height": 20 }
    }
  ]
}
```
## Implementing a Webhook Handler
**Recommended pattern**:
1. Receive the POST
2. Return `200 OK` immediately
3. Queue the payload for async processing (message queue, worker, background task)
4. Process the analysis result out-of-band
This prevents webhook delivery timeouts and ensures ISA does not treat a delayed response as a failure.
**Example (Python/Flask)**:
```python
@app.route('/isa-webhook', methods=['POST'])
def isa_webhook():
    payload = request.json
    queue.enqueue(process_capture_result, payload)
    return '', 200
```
## Idempotency
Design your webhook handler to be idempotent. Use `captureId` as a deduplication key:
- ISA may retry delivery if your endpoint returns a non-2xx response
- Processing the same `captureId` twice should not create duplicate records in your system
## Retry Behavior
- **Product async** (Temporal-backed): Temporal retries the webhook notification activity on failure. Retry count and interval are governed by Temporal activity retry policy.
- **Price async** (background thread): No durable retry. If the pod restarts or the webhook call fails, the delivery is lost. Re-submit the price capture if no webhook is received within the expected window.
## Debugging Webhook Delivery
| Problem | Check |
|---------|-------|
| Webhook not received | Is `webhookUrl` publicly accessible? Does it return `2xx`? |
| Received but with wrong data | Log raw payload and check `captureId` matches your submission |
| Received multiple times | Implement idempotency using `captureId` |
| Intermittent delivery | Check your endpoint's uptime and response time; Temporal will retry on transient failures |
## Webhook Security Recommendations
- Validate that the incoming POST originates from ISA (consider IP allowlisting or a shared secret in a custom header if supported by your ISA deployment)
- Use HTTPS to prevent payload interception
- Log all incoming webhook payloads with timestamps for audit and debugging
