import {GEMINI_API_KEY} from '@env';
import {CookResult, DietMode, Recipe} from '../types';

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const COOK_PROMPT = `You are a friendly home cook. Look at this fridge photo (or ingredient list) and invent exactly 3 simple recipes.

Rules:
- Only use foods you can actually see or that were listed. Do not invent steak, shrimp, or fancy pantry items.
- Salt, pepper, oil, water, and rice/bread already listed are OK.
- Recipes must be easy. 4–6 short steps. Home kitchen only.
- If the photo is not food, set "seen" to [] and still return 3 snack-from-nothing ideas with honest titles.
- Return JSON only:
{
  "seen": ["tomato", "egg"],
  "recipes": [
    {
      "emoji": "🍳",
      "title": "",
      "minutes": 15,
      "difficulty": "easy",
      "why": "one line why this fits the fridge",
      "ingredients": ["2 eggs"],
      "steps": ["step"]
    }
  ]
}
"recipes" must contain exactly 3 items.`;

type GeminiResponse = {
  error?: {message?: string};
  candidates?: Array<{content?: {parts?: Array<{text?: string}>}}>;
};

export const getGeminiApiKey = () => (GEMINI_API_KEY ?? '').trim();

function dietLine(mode: DietMode) {
  if (mode === 'veg') {
    return 'Constraint: vegetarian only. No meat or fish.';
  }
  if (mode === 'quick') {
    return 'Constraint: every recipe 15 minutes or less.';
  }
  return 'Constraint: everyday home cooking.';
}

export function parseCookJson(raw: string): CookResult {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced ? fenced[1] : trimmed).trim();
  const parsed = JSON.parse(body) as Partial<CookResult>;

  const recipes = (Array.isArray(parsed.recipes) ? parsed.recipes : [])
    .slice(0, 3)
    .map((item): Recipe => {
      const row = item ?? {};
      return {
        emoji: String(row.emoji || '🍽️'),
        title: String(row.title ?? 'Untitled'),
        minutes: Math.max(5, Math.min(60, Number(row.minutes) || 15)),
        difficulty: row.difficulty === 'medium' ? 'medium' : 'easy',
        why: String(row.why ?? ''),
        ingredients: Array.isArray(row.ingredients)
          ? row.ingredients.map(String).slice(0, 8)
          : [],
        steps: Array.isArray(row.steps) ? row.steps.map(String).slice(0, 6) : [],
      };
    });

  return {
    seen: Array.isArray(parsed.seen) ? parsed.seen.map(String) : [],
    recipes,
  };
}

export async function cookFromFridge(input: {
  mode: DietMode;
  imageBase64?: string;
  mimeType?: string;
  ingredientText?: string;
}): Promise<CookResult> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      'Missing GEMINI_API_KEY. Copy .env.example to .env and paste your Google AI Studio key.',
    );
  }

  const extra = input.ingredientText
    ? `\n\nIngredient list:\n${input.ingredientText}`
    : '';

  const parts: Array<Record<string, unknown>> = [
    {text: `${COOK_PROMPT}\n${dietLine(input.mode)}${extra}`},
  ];

  if (input.imageBase64) {
    parts.push({
      inline_data: {
        mime_type: input.mimeType || 'image/jpeg',
        data: input.imageBase64,
      },
    });
  }

  const response = await fetch(
    `${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        contents: [{parts}],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
      }),
    },
  );

  const json = (await response.json()) as GeminiResponse;
  if (!response.ok || json.error) {
    throw new Error(
      json.error?.message || `Gemini request failed (${response.status}).`,
    );
  }

  const text = json.candidates?.[0]?.content?.parts
    ?.map(part => part.text ?? '')
    .join('')
    .trim();

  if (!text) {
    throw new Error('Gemini returned an empty response.');
  }

  try {
    return parseCookJson(text);
  } catch {
    throw new Error('Gemini returned JSON that could not be parsed.');
  }
}
