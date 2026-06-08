# Intelligent Shelf Analyzer API

Welcome to the **Intelligent Shelf Analyzer** documentation. This platform provides APIs for automated shelf analysis, enabling retailers to register product catalogs, define shelf layouts (planograms), and analyze real-world shelf images to detect product placement, compliance, and pricing.

## What Can You Do?

- **Register your organization** and product catalog
- **Upload product reference images** for recognition
- **Define shelf layouts** (planograms) describing expected product placement
- **Analyze shelf photos** to detect which products are on the shelf, their positions, and compliance status
- **Extract price tag data** from shelf images
- **Search for similar products** across your catalog
- **Generate shelf layouts** automatically from photos

## Quick Navigation

| Section | Description |
|---------|-------------|
| [Getting Started](getting-started.md) | Set up authentication and make your first API call |
| [Workflows](workflows/overview.md) | Step-by-step integration guide showing the correct order of operations |
| [API Reference](api/overview.md) | Complete API reference with all endpoints |
| [Changelog](changelog.md) | Version history and breaking changes |

## Base URL

All API endpoints are available under:

```
https://<your-deployment>/api/v1/
```

## Authentication

All endpoints (except the health check) require a **Bearer JWT token**. See the [Authentication Guide](api/overview.md) for details on obtaining and using tokens.
