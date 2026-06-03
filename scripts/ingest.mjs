import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Resolve paths ──────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// ── Load .env.local ────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local not found. Create it with your OPENROUTER_API_KEY.');
    process.exit(1);
  }
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    process.env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
  }
}

loadEnv();

// ── Config ─────────────────────────────────────────────────────
const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.EMBEDDING_MODEL || 'baai/bge-base-en-v1.5';
const BATCH_SIZE = 10;
const DELAY_MS = 800; // delay between batches to respect rate limits
const MAX_CHARS = 1000; // truncate chunks to stay well under 512-token model limit
const MAX_RETRIES = 3;

if (!API_KEY) {
  console.error('❌ OPENROUTER_API_KEY not set in .env.local');
  process.exit(1);
}

// ── Helpers ────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Clean text to avoid tokenizer bloat from repeated dots (e.g. TOC tables)
 * and ensure it fits within the 512-token context window.
 */
function cleanText(text) {
  let cleaned = text
    .replace(/\.{3,}/g, '...')
    .replace(/_{3,}/g, '___')
    .replace(/-{3,}/g, '---');

  if (cleaned.length <= MAX_CHARS) return cleaned;
  return cleaned.slice(0, MAX_CHARS) + '…';
}

async function embedBatch(texts) {
  const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Physical Activity RAG Ingestion',
    },
    body: JSON.stringify({ model: MODEL, input: texts }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }

  const data = await res.json();

  // Debug: log response structure if unexpected
  if (!data.data || !Array.isArray(data.data)) {
    console.log('\n🔍 Unexpected API response structure:');
    console.log(JSON.stringify(data, null, 2).slice(0, 1000));
    throw new Error(
      `Unexpected response: missing "data" array. Keys: ${Object.keys(data).join(', ')}`
    );
  }

  return data.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   Physical Activity RAG — Chunk Ingestion    ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
  console.log(`📊 Embedding model : ${MODEL}`);
  console.log(`📦 Batch size      : ${BATCH_SIZE}`);
  console.log('');

  // 1. Load chunks
  const chunksPath = path.join(ROOT, 'chunks.jsonl');
  if (!fs.existsSync(chunksPath)) {
    console.error('❌ chunks.jsonl not found in project root.');
    process.exit(1);
  }
  const lines = fs.readFileSync(chunksPath, 'utf-8').trim().split('\n');
  const chunks = lines.map((l) => JSON.parse(l));
  console.log(`📄 Loaded ${chunks.length} chunks from chunks.jsonl`);

  // 2. Ensure data directory
  const dataDir = path.join(ROOT, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // 3. Compute embeddings in batches
  const allEmbeddings = [];
  const totalBatches = Math.ceil(chunks.length / BATCH_SIZE);
  const startTime = Date.now();

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map((c) => cleanText(c.chunk));

    process.stdout.write(`⏳ Batch ${batchNum}/${totalBatches} (${texts.length} chunks)... `);

    let success = false;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const embeddings = await embedBatch(texts);
        allEmbeddings.push(...embeddings);
        console.log(`✅ dim=${embeddings[0].length}`);
        success = true;
        break;
      } catch (err) {
        if (attempt < MAX_RETRIES) {
          console.log(`⚠️ Attempt ${attempt} failed, retrying in 2s...`);
          await sleep(2000);
        } else {
          console.log('❌ FAILED');
          console.error(`   ${err.message}`);
          process.exit(1);
        }
      }
    }

    // Rate-limit delay between batches
    if (i + BATCH_SIZE < chunks.length) {
      await sleep(DELAY_MS);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // 4. Save embeddings
  const outputPath = path.join(dataDir, 'embeddings.json');
  fs.writeFileSync(outputPath, JSON.stringify(allEmbeddings));

  const fileSizeMB = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);

  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log(`💾 Saved: data/embeddings.json (${fileSizeMB} MB)`);
  console.log(`📏 Dimensions: ${allEmbeddings[0].length}`);
  console.log(`📊 Total chunks: ${allEmbeddings.length}`);
  console.log(`⏱️  Time: ${elapsed}s`);
  console.log('✅ Ingestion complete! Run: npm run dev');
  console.log('═══════════════════════════════════════════════');
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
