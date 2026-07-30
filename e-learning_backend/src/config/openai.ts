import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

/** True when OPENAI_API_KEY is set — Marii/Luna will use AI instead of template fallback. */
export function isOpenAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

const useLocalOllama = process.env.OPENAI_USE_LOCAL === 'true';

export const openai: OpenAI | null = isOpenAiConfigured()
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      ...(useLocalOllama && {
        baseURL: process.env.OPENAI_BASE_URL || 'http://localhost:11434/v1',
      }),
    })
  : null;

export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
