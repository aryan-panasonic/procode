CREATE TABLE doc_rag_index_entries (
    id UUID PRIMARY KEY,
    version_id UUID NOT NULL REFERENCES doc_versions(id),
    page_id UUID NOT NULL REFERENCES doc_pages(id),
    visibility VARCHAR(20) NOT NULL,
    indexed_at TIMESTAMP NOT NULL,
    indexed_by VARCHAR(255),
    embedding_model VARCHAR(100),
    active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_doc_rag_index_entries_version_id ON doc_rag_index_entries(version_id);
CREATE INDEX idx_doc_rag_index_entries_page_id ON doc_rag_index_entries(page_id);
CREATE INDEX idx_doc_rag_index_entries_active ON doc_rag_index_entries(active);
