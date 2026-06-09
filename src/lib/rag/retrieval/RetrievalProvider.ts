export interface RetrievalProvider {

  retrieve(
    query: string,
    topK: number
  ): Promise<any[]>;
}