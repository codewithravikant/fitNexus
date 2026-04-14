import OpenAI from 'openai';

/** OpenRouter uses the OpenAI-compatible API at this base URL. */
const OPENROUTER_DEFAULT_BASE = 'https://openrouter.ai/api/v1';

let client: OpenAI | null = null;

function trimEnv(name: string): string | undefined {
  const v = process.env[name];
  const t = v?.trim();
  return t || undefined;
}

/**
 * Resolves LLM config from env. Supports:
 * - OpenRouter (primary): `OPENROUTER_API_KEY` + optional `OPENROUTER_MODEL` (defaults base URL to OpenRouter)
 * - OpenAI: `OPENAI_API_KEY` (+ optional `OPENAI_BASE_URL`, `OPENAI_MODEL`)
 * - OpenRouter with `OPENAI_API_KEY` + `OPENAI_BASE_URL` (common alias pattern)
 */
export function getResolvedLlmConfig(): { apiKey: string; baseURL: string | undefined; model: string } {
  const openAiKey = trimEnv('OPENAI_API_KEY');
  const openRouterKey = trimEnv('OPENROUTER_API_KEY');
  const explicitBase = trimEnv('OPENAI_BASE_URL');

  const apiKey = openRouterKey || openAiKey || '';
  const usingDedicatedOpenRouterKey = !!openRouterKey;
  const baseURL =
    explicitBase || (usingDedicatedOpenRouterKey ? OPENROUTER_DEFAULT_BASE : undefined);

  const model =
    trimEnv('OPENROUTER_MODEL') ||
    trimEnv('OPENAI_MODEL') ||
    'google/gemma-2-9b-it:free';

  return { apiKey, baseURL, model };
}

/** Model id for chat completions (OpenAI or OpenRouter, depending on env). */
export const MODEL = getResolvedLlmConfig().model;

export function hasOpenAIKey(): boolean {
  return !!getResolvedLlmConfig().apiKey;
}

export function getOpenAI(): OpenAI {
  const { apiKey, baseURL } = getResolvedLlmConfig();
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY or OPENAI_API_KEY is not configured');
  }
  if (!client) {
    client = new OpenAI({
      apiKey,
      baseURL,
    });
  }
  return client;
}
