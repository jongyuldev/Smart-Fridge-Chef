export interface Ingredient {
  name: string;
  amount: string;
  isMissing: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prepTimeMinutes: number;
  calories: number;
  ingredients: Ingredient[];
  steps: string[];
  tags: string[];
}

export interface AnalysisResult {
  identifiedIngredients: string[];
  recipes: Recipe[];
}

export enum DietaryFilter {
  None = 'None',
  Vegetarian = 'Vegetarian',
  Vegan = 'Vegan',
  Keto = 'Keto',
  GlutenFree = 'Gluten-Free',
  Paleo = 'Paleo'
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  checked: boolean;
}

export interface PantryItem {
  id: string;
  name: string;
}