import fs from 'fs';
import path from 'path';

let store = null;

/**
 * Compute cosine similarity between two vectors.
 */
function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Load the vector store (chunks + cached embeddings) into memory.
 * Cached across requests in the same server process.
 */
export function loadStore() {
  if (store) return store;

  // Load chunks
  const chunksPath = path.join(process.cwd(), 'chunks.jsonl');
  if (!fs.existsSync(chunksPath)) {
    throw new Error('chunks.jsonl not found in project root.');
  }
  const chunksData = fs.readFileSync(chunksPath, 'utf-8');
  const chunks = chunksData
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));

  // Load cached embeddings
  const embeddingsPath = path.join(process.cwd(), 'data', 'embeddings.json');
  if (!fs.existsSync(embeddingsPath)) {
    throw new Error(
      'Embeddings cache not found! Run: npm run ingest\n' +
        'This will compute embeddings for all chunks via OpenRouter.'
    );
  }
  const embeddings = JSON.parse(fs.readFileSync(embeddingsPath, 'utf-8'));

  if (chunks.length !== embeddings.length) {
    throw new Error(
      `Chunk/embedding mismatch: ${chunks.length} chunks vs ${embeddings.length} embeddings.\n` +
        'Re-run: npm run ingest'
    );
  }

  store = { chunks, embeddings };
  console.log(`✅ Vector store loaded: ${chunks.length} chunks, dim=${embeddings[0].length}`);
  return store;
}

/**
 * Search the vector store for the top-K most similar chunks to a query embedding.
 */
export function search(queryEmbedding, topK = 5) {
  const { chunks, embeddings } = loadStore();

  const scored = embeddings.map((emb, i) => ({
    index: i,
    score: cosineSimilarity(queryEmbedding, emb),
    source: chunks[i].source,
    page: chunks[i].page,
    chunk: chunks[i].chunk,
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
