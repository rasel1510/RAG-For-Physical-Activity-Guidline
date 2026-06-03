const BASE_URL = 'https://openrouter.ai/api/v1';

/**
 * Get embedding for a single text string.
 */
export async function getEmbedding(text) {
  const response = await fetch(`${BASE_URL}/embeddings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Physical Activity RAG',
    },
    body: JSON.stringify({
      model: process.env.EMBEDDING_MODEL || 'baai/bge-base-en-v1.5',
      input: text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Embedding API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  // OpenRouter sometimes wraps errors in 200 responses
  if (data.error) {
    throw new Error(`Embedding API error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  return data.data[0].embedding;
}

/**
 * Get embeddings for multiple texts in a single batch request.
 */
export async function getEmbeddings(texts) {
  const response = await fetch(`${BASE_URL}/embeddings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Physical Activity RAG',
    },
    body: JSON.stringify({
      model: process.env.EMBEDDING_MODEL || 'baai/bge-base-en-v1.5',
      input: texts,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Embedding API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

/**
 * Get a chat completion from OpenRouter.
 */
export async function getChatCompletion(messages, options = {}) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Physical Activity RAG',
    },
    body: JSON.stringify({
      model: process.env.CHAT_MODEL || 'google/gemini-2.0-flash-001',
      messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 1500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Chat API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
