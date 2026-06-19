-- 004_rag_visibility.sql

-- Step 1: Add the column with a default of 'private' to ensure default-deny
ALTER TABLE documents ADD COLUMN visibility VARCHAR(20) NOT NULL DEFAULT 'private';

-- Step 2: Backfill visibility for existing documentation pages
-- doc_rag_index_entries holds the visibility, and documents.source_path maps to 'doc_pages:<page_id>'
UPDATE documents
SET visibility = r.visibility
FROM doc_rag_index_entries r
WHERE documents.source_path = 'doc_pages:' || r.page_id::text;
