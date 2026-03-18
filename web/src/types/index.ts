export interface Recipe {
  id: string;
  name: string;
  type: "link" | "manual";
  sourceUrl?: string;
  description?: string;
  servings?: number;
  prepTimeMins?: number;
  cookTimeMins?: number;
  ingredients?: IngredientItem[];
  steps?: StepItem[];
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IngredientItem {
  name: string;
  quantity?: string;
  unit?: string;
}

export interface StepItem {
  order: number;
  instruction: string;
}

export interface MealPlanWeek {
  id: string;
  weekStartDate: string;
  notes?: string;
  slots: MealPlanSlot[];
}

export interface MealPlanSlot {
  id: string;
  mealPlanWeekId: string;
  dayOfWeek: number;
  mealType: "breakfast" | "lunch" | "dinner";
  recipeId?: string;
  recipeName?: string;
  recipeType?: string;
  customLabel?: string;
  notes?: string;
}

export interface GroceryList {
  id: string;
  name: string;
  itemCount: number;
  updatedAt: string;
}

export interface GroceryItem {
  id: string;
  groceryListId: string;
  name: string;
  quantity?: string;
  category?: string;
  isChecked: boolean;
  sortOrder: number;
  updatedAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
