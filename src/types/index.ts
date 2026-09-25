export type DietMode = 'any' | 'veg' | 'quick';

export type Recipe = {
  emoji: string;
  title: string;
  minutes: number;
  difficulty: 'easy' | 'medium';
  why: string;
  ingredients: string[];
  steps: string[];
};

export type CookResult = {
  seen: string[];
  recipes: Recipe[];
};

export type FridgePhoto = {
  uri: string;
  base64?: string;
  mimeType: string;
};

export type RootStackParamList = {
  Home: undefined;
  Result: {result: CookResult};
};
