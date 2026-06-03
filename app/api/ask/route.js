import { NextResponse } from 'next/server';
import { getEmbedding, getChatCompletion } from '@/lib/openrouter';
import { search } from '@/lib/vectorStore';

const SYSTEM_PROMPT = `You are **ActiveGuide AI**, an expert assistant on the Physical Activity Guidelines for Americans, 2nd edition (2018), published by the U.S. Department of Health and Human Services.

Your role is to answer questions accurately based ONLY on the provided context passages.

Rules:
1. Answer based ONLY on the provided context. Never fabricate information.
2. Cite your sources using **[Page X]** format after relevant statements.
3. If the context doesn't contain enough information, say so clearly and suggest what the user might look for.
4. Be helpful, concise, and well-structured.
5. Use bullet points, numbered lists, and bold text for clarity.
6. When discussing activity amounts, always specify durations, frequencies, and intensity levels.
7. If multiple age groups are relevant, organize your answer by age group.`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide a question.' },
        { status: 400 }
      );
    }

    const trimmedQuestion = question.trim();

    // Clean and truncate query to stay within embedding model's 512-token limit
    const queryForEmbedding = trimmedQuestion
      .replace(/\.{3,}/g, '...')
      .replace(/_{3,}/g, '___')
      .replace(/-{3,}/g, '---')
      .slice(0, 1000);

    // 1. Embed the user's question
    const queryEmbedding = await getEmbedding(queryForEmbedding);

    // 2. Search for the most relevant chunks
    const results = search(queryEmbedding, 5);

    // 3. Build context from retrieved chunks
    const context = results
      .map(
        (r, i) =>
          `--- Context Passage ${i + 1} [Source: ${r.source}, Page ${r.page}] ---\n${r.chunk}`
      )
      .join('\n\n');

    // 4. Generate the answer via chat completion
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Here are relevant passages from the Physical Activity Guidelines for Americans:\n\n${context}\n\n---\n\nUser Question: ${trimmedQuestion}\n\nPlease provide a comprehensive, well-cited answer based on the passages above.`,
      },
    ];

    const answer = await getChatCompletion(messages);

    // 5. Return the answer with source metadata
    return NextResponse.json({
      answer,
      sources: results.map((r) => ({
        source: r.source,
        page: r.page,
        chunk: r.chunk,
        score: Math.round(r.score * 1000) / 1000,
      })),
    });
  } catch (error) {
    console.error('❌ /api/ask error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
