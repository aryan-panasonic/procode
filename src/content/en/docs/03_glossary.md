# Terminology / Glossary
| Term | Definition |
|------|-----------|
| **Tenant** | An isolated retailer or organization instance. All products, planograms, captures, and users belong to a tenant. |
| **Store** | A physical retail location associated with a tenant. Created automatically when a tenant is created. |
| **Product** | A registered product item in a tenant's catalog. Has metadata and one or more reference images. |
| **Product Embedding** | A 256-dimension feature vector representation of a product image. Used for similarity search. |
| **Planogram** | The expected/planned layout of products on a shelf, organized by segment, fixture, and position. |
| **Segment** | A horizontal section of a planogram (e.g., a shelf level). Contains fixtures. |
| **Fixture** | A physical shelf unit within a segment. Contains positions. |
| **Position** | A specific slot within a fixture where a product is expected to be placed. |
| **PSA File** | A proprietary shelf-layout file format used to define planograms. Can be imported directly into ISA. |
| **Capture** | A submitted shelf image submitted for analysis. Identified by a `capture_id`. |
| **Capture Analysis** | The structured result of analyzing a capture: detected products, positions, compliance, and price data. |
| **Compliance** | Whether detected products on a shelf match the expected planogram positions. |
| **Alternative Products** | Products that visually scored as near-matches (but not top matches) during analysis. Used to explain uncertain recognitions. |
| **Similarity Search** | Finding the closest matching product by comparing feature vectors using cosine distance in pgvector. |
| **Cosine Distance** | The mathematical measure used to compare product embeddings. Lower distance = more similar. |
| **Sync Analysis** | Shelf analysis that returns the result immediately in the HTTP response (`/synccaptureupload`). |
| **Async Analysis** | Shelf analysis that returns a `202` immediately, processes via Temporal, and delivers results via webhook (`/captureupload`). |
| **Webhook** | An HTTP callback URL registered by a tenant to receive async analysis results when processing completes. |
| **Temporal** | The workflow orchestration system used to coordinate asynchronous shelf analysis across detection, embedding, and post-processing workers. |
| **Workflow ID** | Identifier returned by async capture endpoints. Can be used to reference the in-progress Temporal workflow. |
| **OAuth Client** | API credentials (`clientId` + `clientSecret`) used to authenticate and receive a JWT. |
| **JWT** | JSON Web Token. Issued after successful authentication. Required in the `Authorization: Bearer` header for protected endpoints. |
| **Embedding Service** | Internal microservice that generates feature vectors from images using an OpenVINO model. |
| **Detection Service** | Internal microservice that detects product bounding boxes in shelf images using an ONNX model. |
| **pgvector** | PostgreSQL extension that stores and queries vector embeddings. Used as ISA's vector store. |
| **OCR** | Optical Character Recognition. Used in price capture and recognition refinement via Azure Computer Vision. |
| **LLM Refinement** | Using Azure OpenAI to extract product names from OCR text for unrecognized items. |
| **Planogram Generator** | Feature that generates a PSA planogram file automatically from a shelf image. |
| **Crop / Cropped Image** | A sub-image cut from the shelf photo containing a single detected product. Stored in blob storage. |
| **Azure Blob Storage** | Microsoft Azure object storage used to store shelf images, analysis results, crops, and ML models. |
| **KEDA** | Kubernetes Event-Driven Autoscaling. Scales ISA workers based on Temporal queue depth and resource usage. |
| **Top-K** | The number of closest product embedding matches retrieved per detected item during similarity search. |
