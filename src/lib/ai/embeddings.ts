import 'server-only';

import { getOpenAI, hasOpenAIKey } from '@/lib/ai/openai-client';

const EMBED_MODEL = process.env.OPENAI_EMBEDDING_MODEL?.trim() || 'text-embedding-3-small';

/**
 * Create a text embedding vector (OpenAI-compatible API).
 * Returns null if no API key or request fails.
 */
export async function embedText(text: string): Promise<number[] | null> {
  if (!hasOpenAIKey()) return null;
  try {
    const openai = getOpenAI();
    const res = await openai.embeddings.create({
      model: EMBED_MODEL,
      input: text.slice(0, 8000),
    });
    const v = res.data[0]?.embedding;
    return v ?? null;
  } catch (e) {
    console.warn('[embeddings] failed', e);
    return null;
  }
}

/** Deterministic pseudo-embedding for dev when API unavailable (64-dim, not semantic). */
export function fallbackEmbeddingFromText(text: string, dims = 64): number[] {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return Array.from({ length: dims }, (_, i) => Math.sin((h + i) * 0.01) * 0.02);
}

export async function embedTextOrFallback(text: string): Promise<number[]> {
  const v = await embedText(text);
  if (v?.length) return v;
  return fallbackEmbeddingFromText(text);
}
