import { ExternalLink, Clock, Users, ChefHat } from "lucide-react";
import type { Recipe } from "@/types";

export function RecipeDetail({ recipe }: { recipe: Recipe }) {
  return (
    <div className="flex flex-col gap-4">
      {recipe.type === "link" && recipe.sourceUrl && (
        <a
          href={recipe.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium"
        >
          <ExternalLink size={16} /> Open recipe link
        </a>
      )}
      <div className="flex gap-4">
        {recipe.prepTimeMins && (
          <div className="text-center">
            <p className="text-lg font-semibold">{recipe.prepTimeMins}m</p>
            <p className="text-xs text-gray-400">Prep</p>
          </div>
        )}
        {recipe.cookTimeMins && (
          <div className="text-center">
            <p className="text-lg font-semibold">{recipe.cookTimeMins}m</p>
            <p className="text-xs text-gray-400">Cook</p>
          </div>
        )}
        {recipe.servings && (
          <div className="text-center">
            <p className="text-lg font-semibold">{recipe.servings}</p>
            <p className="text-xs text-gray-400">Servings</p>
          </div>
        )}
      </div>
      {recipe.description && <p className="text-sm text-gray-600">{recipe.description}</p>}
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Ingredients</h3>
          <ul className="flex flex-col gap-1">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="text-sm text-gray-700">
                {ing.quantity && <span className="font-medium">{ing.quantity} {ing.unit} </span>}
                {ing.name}
              </li>
            ))}
          </ul>
        </div>
      )}
      {recipe.steps && recipe.steps.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Steps</h3>
          <ol className="flex flex-col gap-3">
            {recipe.steps.sort((a, b) => a.order - b.order).map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {step.order}
                </span>
                <p className="text-sm text-gray-700 pt-0.5">{step.instruction}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
