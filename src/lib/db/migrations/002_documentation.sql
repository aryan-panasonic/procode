CREATE TABLE doc_versions (
    id UUID PRIMARY KEY,
    version_name VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    published_at TIMESTAMP NULL
);

CREATE INDEX idx_doc_versions_name ON doc_versions(version_name);
CREATE INDEX idx_doc_versions_status ON doc_versions(status);

CREATE TABLE doc_pages (
    id UUID PRIMARY KEY,
    version_id UUID NOT NULL REFERENCES doc_versions(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    visibility VARCHAR(20) NOT NULL,
    content_md TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_doc_pages_version_id ON doc_pages(version_id);
CREATE INDEX idx_doc_pages_visibility ON doc_pages(visibility);
CREATE INDEX idx_doc_pages_slug ON doc_pages(slug);
CREATE UNIQUE INDEX uniq_doc_pages_version_slug ON doc_pages(version_id, slug);

CREATE TABLE doc_page_revisions (
    id UUID PRIMARY KEY,
    page_id UUID NOT NULL REFERENCES doc_pages(id),
    content_md TEXT NOT NULL,
    edited_by VARCHAR(255),
    change_note TEXT,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_doc_page_revisions_page_id ON doc_page_revisions(page_id);
CREATE INDEX idx_doc_page_revisions_created_at ON doc_page_revisions(created_at);
