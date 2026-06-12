# Authentication & Permissions Reference
## Authentication Model
ISA uses OAuth 2.0 client credentials flow. There are no end-user roles (no Admin/Manager/User). All API access is granted to OAuth clients.
| Concept | Detail |
|---------|--------|
| Auth type | OAuth 2.0 Client Credentials |
| Token type | HS256 JWT |
| Token endpoint | `POST /api/v1/auth/token` |
| Protected endpoints | All except `/api/v1/auth/token` and `/health` |
| Token header | `Authorization: Bearer <token>` |
| Secret storage | Hashed before storage in `oauth_client` table |
| Scope enforcement | Scopes are stored in JWT claims but NOT currently enforced at route level |
## Endpoint Auth Requirements
| Endpoint | Auth Required |
|----------|--------------|
| `POST /api/v1/auth/token` | No |
| `GET /health` | No |
| `POST /api/v1/tenants` | JWT |
| `PATCH /api/v1/tenants/{id}` | JWT |
| `GET /api/v1/tenants/{id}/products` | JWT |
| `POST /api/v1/productdata` | JWT |
| `POST /api/v1/productimage` | JWT |
| `POST /api/v1/productsearch` | JWT |
| `GET /api/v1/tenants/{tenant_id}/products/{product_id}/alternativeProducts` | JWT |
| `POST /api/v1/planogramdata` | JWT |
| `POST /api/v1/planogramdata/from-file` | JWT |
| `GET /api/v1/planogramdata/{planogram_id}` | JWT |
| `POST /api/v1/synccaptureupload` | JWT |
| `POST /api/v1/captureupload` | JWT |
| `POST /api/v1/capture-upload/post-processing` | JWT |
| `POST /api/v1/synccaptureuploadprice` | JWT |
| `POST /api/v1/captureuploadprice` | JWT |
| `GET /api/v1/tenants/{tenant_id}/captureAnalysis/{capture_id}` | JWT |
| `GET /api/v1/tenants/{tenant_id}/captureAnalysis/{capture_id}/products` | JWT |
| `GET /api/v1/tenants/{tenant_id}/captureAnalysis/{capture_id}/products/{product_id}` | JWT |
| `GET /api/v1/tenants/{id}/points` | JWT |
| `POST /api/v1/planogramgenerator` | JWT |
## Internal Service Auth
| Service | Auth |
|---------|------|
| Embedding Service | No application-layer auth (internal network boundary only) |
| Detection Service | No application-layer auth (internal network boundary only) |
| Internal Docs | Protected by `oauth2-proxy` via Istio `AuthorizationPolicy` at ingress |
## Tenant Data Isolation
- All data is scoped to a `tenantId`
- API calls that operate on tenant-specific data (captures, products, planograms) require the correct `tenantId` in the request
- There is no cross-tenant data access from the API
## Common Auth Questions
- **Why am I getting 401?**: Token expired or invalid. Re-authenticate via `POST /api/v1/auth/token`.
- **Why am I getting 403?**: Your client may not be authorized for this resource, or you are accessing another tenant's data.
- **Do I need to pass tenantId in every request?**: Yes, for any endpoint that operates on tenant-scoped resources.
- **Are scopes enforced?**: Scopes are embedded in the JWT but route-level scope enforcement is not currently implemented.
