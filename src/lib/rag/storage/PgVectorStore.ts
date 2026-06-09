import { pool } from "@/lib/db/postgres";

export interface RetrievedChunk {
  id: string;
  title: string | null;
  source: string;
  content: string;
  metadata: Record<string, unknown>;
  score: number;
  chunkIndex: number;
}

interface SearchRow {
  id: string;
  chunk_index: number;
  content: string;
  metadata: Record<string, unknown> | null;
  title: string | null;
  source: string;
  score: number | string;
}

export class PgVectorStore {
  private toVectorLiteral(embedding: number[]): string {
    return `[${embedding.join(",")}]`;
  }

  async createOrGetDocument(input: {
    sourcePath: string;
    title?: string | null;
    language?: string | null;
  }): Promise<string> {
    const existing = await pool.query<{ id: string }>(
      `
      SELECT id
      FROM documents
      WHERE source_path = $1
      LIMIT 1
      `,
      [input.sourcePath]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0].id;
    }

    const inserted = await pool.query<{ id: string }>(
      `
      INSERT INTO documents (
        source_path,
        title,
        language
      )
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      [
        input.sourcePath,
        input.title ?? null,
        input.language ?? null,
      ]
    );

    return inserted.rows[0].id;
  }

  async deleteDocumentChunks(
    documentId: string
  ): Promise<void> {
    await pool.query(
      `
      DELETE FROM chunks
      WHERE document_id = $1
      `,
      [documentId]
    );
  }

  async insertChunk(
    documentId: string,
    chunkIndex: number,
    content: string,
    embedding: number[],
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    const vector =
      this.toVectorLiteral(embedding);

    await pool.query(
      `
      INSERT INTO chunks (
        document_id,
        chunk_index,
        content,
        embedding,
        metadata
      )
      VALUES (
        $1,
        $2,
        $3,
        $4::vector,
        $5::jsonb
      )
      `,
      [
        documentId,
        chunkIndex,
        content,
        vector,
        JSON.stringify(metadata),
      ]
    );
  }

  async search(
    embedding: number[],
    limit: number = 5
  ): Promise<RetrievedChunk[]> {
    const vector =
      this.toVectorLiteral(embedding);

    const result =
      await pool.query<SearchRow>(
        `
        SELECT
          c.id,
          c.chunk_index,
          c.content,
          c.metadata,
          d.title,
          d.source_path AS source,
          1 - (
            c.embedding <=> $1::vector
          ) AS score
        FROM chunks c
        INNER JOIN documents d
          ON d.id = c.document_id
        ORDER BY
          c.embedding <=> $1::vector
        LIMIT $2
        `,
        [vector, limit]
      );

    return result.rows.map(
      (row: SearchRow): RetrievedChunk => ({
        id: row.id,
        title: row.title,
        source: row.source,
        content: row.content,
        metadata: row.metadata ?? {},
        score: Number(row.score),
        chunkIndex: row.chunk_index,
      })
    );
  }

  async countChunks(): Promise<number> {
    const result =
      await pool.query<{
        count: string;
      }>(
        `
        SELECT COUNT(*) AS count
        FROM chunks
        `
      );

    return Number(
      result.rows[0].count
    );
  }

  async healthCheck(): Promise<boolean> {
    try {
      await pool.query(
        "SELECT 1"
      );

      return true;
    } catch (error) {
      console.error(
        "Database health check failed:",
        error
      );

      return false;
    }
  }
}