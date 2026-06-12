# AI & Recognition Behavior Guide
## How Product Recognition Works
ISA uses a multi-stage AI pipeline to identify products on shelves:
### Stage 1: Object Detection
The Detection Service runs an ONNX model against the shelf image to produce bounding boxes around detected objects. Each bounding box represents a potential product placement on the shelf.
### Stage 2: Image Embedding
Each detected crop (bounding box region) is sent to the Embedding Service, which runs an OpenVINO model to generate a 256-dimension feature vector representing the visual appearance of that product.
### Stage 3: Vector Similarity Search
The feature vector is compared against all registered `product_embedding` rows for the tenant using cosine distance in PostgreSQL/pgvector. The closest matches (top-K) are returned as candidate products.
### Stage 4: OCR-Assisted Reranking
Azure Computer Vision reads visible text (labels, barcodes, brand names) from each crop. That text is embedded using Azure OpenAI text embeddings and combined with the image similarity score to improve recognition confidence. This helps differentiate products that look visually similar but have different text.
### Stage 5: LLM Refinement for Unknown Items
If a detected item still cannot be confidently identified after stages 3 and 4, ISA optionally calls Azure OpenAI to extract a product name from the OCR text using LLM-based reasoning and fuzzy matching against the product catalog.
## What ISA Can and Cannot Do
| Can Do | Cannot Do |
|--------|----------|
| Identify products that have registered reference images | Identify products with no registered images |
| Detect compliance against a registered planogram | Detect compliance without a planogram |
| Extract visible price tags via OCR | Read price tags that are obscured or too small to read |
| Generate a planogram from a shelf image with visible markers | Generate a planogram without shelf markers |
| Recognize products despite minor orientation variation (via rotated image variants) | Reliably recognize severely damaged, obscured, or unlabeled products |
| Provide alternative near-match products for uncertain detections | Guarantee 100% recognition accuracy in all lighting and image conditions |
## How Compliance Works
After products are identified and positioned on the shelf:
1. Each detected product is mapped to its shelf position (segment, fixture, slot)
2. The detected layout is compared against the registered planogram
3. Each position is flagged as compliant (product matches expected product) or non-compliant (wrong product, missing product, or extra product)
4. Compliance results are included in the analysis response and capture-analysis record
## How Citations / Source Attribution Works
Every recognized product in the analysis result is traceable:
- The `product_id` and product metadata of the matched product is returned
- Alternative near-matches (`alternativeProducts`) are also returned with their similarity scores
- Crop images per detected product are stored in Azure Blob Storage and retrievable via the capture-analysis API
## Confidence and Accuracy Limitations
- Recognition accuracy depends directly on the quality and quantity of registered reference images
- Poor lighting, motion blur, or extreme camera angles reduce detection and recognition accuracy
- Products that look visually identical (e.g. same packaging, different size) require OCR text matching to differentiate
- LLM refinement adds latency — it only triggers for items that fail image and OCR matching
- Price OCR accuracy depends on Azure Computer Vision and image legibility; ISA does not guarantee price extraction completeness
## How Embeddings Are Stored and Updated
- Product embeddings are stored in PostgreSQL as `Vector(256)` columns via pgvector
- A separate `product_info_vector` stores OCR-derived text embeddings per product
- Re-registering a product image overwrites the existing embedding
- Deleting a product removes its embeddings and it will no longer appear in search or recognition results
## Performance Characteristics
- Synchronous analysis is blocking: detection → embedding → search → post-processing all happen before the response
- Asynchronous analysis offloads all processing to Temporal workers; the API returns immediately
- Model inference is in-process on both the Embedding and Detection services; models are warmed up at startup
- Thread-pool parallelism is used in OCR/recognition post-processing for higher throughput
