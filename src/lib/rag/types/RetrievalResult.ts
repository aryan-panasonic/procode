import { RetrievedChunk } from "../storage/PgVectorStore";

export type RetrievalConfidence =
  | "high"
  | "medium"
  | "low";

export type RetrievalAnswerType =
  | "MATCH"
  | "NO_MATCH";

export interface RetrievalResult {
  chunks: RetrievedChunk[];
  averageScore: number;
  maxScore: number;
  confidence: RetrievalConfidence;
  answerType: RetrievalAnswerType;
}