# Getting Started

This guide walks you through setting up authentication and making your first API calls to the INTELLIGENT SHELF ANALYZER.

## Prerequisites

- API client credentials (`clientId` and `clientSecret`) provided by your administrator
- An HTTP client (e.g., cURL, Postman, or any programming language with HTTP support)

## Step 1: Obtain an Access Token

All API calls (except health check) require a Bearer JWT token. Obtain one by calling the authentication endpoint:

```bash
curl -X POST https://<your-deployment>/api/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret"
  }'
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

!!! warning "Token Expiration"
    Access tokens have a limited lifetime. When your token expires, you will receive a `401 Unauthorized` response. Simply request a new token.

## Step 2: Use the Token in API Calls

Include the token in the `Authorization` header of all subsequent requests:

```bash
curl -X POST https://<your-deployment>/api/v1/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "id": "retailer-001",
    "name": "My Retail Store",
    "webhook_url": "https://my-store.com/webhook",
    "country_iso_name": "USA"
  }'
```

## Step 3: Follow the Integration Workflow

The APIs must be called in a specific order due to data dependencies. See the [Workflow Overview](workflows/overview.md) for the complete integration sequence:

1. **Register your organization** (tenant)
2. **Add your product catalog**
3. **Upload product reference images**
4. **Define your shelf layouts** (planograms)
5. **Analyze shelf photos**
6. **Retrieve results**

## Health Check

Verify the service is running:

```bash
curl https://<your-deployment>/api/v1/health
```

**Response (healthy):**

```json
{
  "status": "ok"
}
```

## Error Handling

All errors follow a consistent JSON format:

```json
{
  "error": "Error type",
  "detail": "Human-readable error description"
}
```

| HTTP Status | Meaning |
|-------------|---------|
| `200` | Success |
| `201` | Resource created |
| `400` | Bad request (invalid input) |
| `401` | Unauthorized (missing or invalid token) |
| `404` | Resource not found |
| `409` | Conflict (duplicate resource) |
| `422` | Validation error (invalid field values) |
| `500` | Internal server error |
| `503` | Service unavailable |
