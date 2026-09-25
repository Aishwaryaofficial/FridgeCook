import {parseCookJson} from '../src/api/gemini';

test('strips markdown fences from Gemini JSON', () => {
  const raw = `\`\`\`json
{"seen":["egg"],"recipes":[{"emoji":"🍳","title":"Egg toast","minutes":10,"difficulty":"easy","why":"eggs","ingredients":["2 eggs"],"steps":["Cook"]}]}
\`\`\``;
  const result = parseCookJson(raw);
  expect(result.seen).toEqual(['egg']);
  expect(result.recipes[0].title).toBe('Egg toast');
});

test('keeps only 3 recipes', () => {
  const recipes = Array.from({length: 5}, (_, i) => ({
    emoji: '🍽️',
    title: `R${i}`,
    minutes: 10,
    difficulty: 'easy',
    why: '',
    ingredients: [],
    steps: [],
  }));
  const result = parseCookJson(JSON.stringify({seen: [], recipes}));
  expect(result.recipes).toHaveLength(3);
});
