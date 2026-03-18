import Link from "next/link";
import { ExternalLink, Clock, Users } from "lucide-react";
import type { Recipe } from "@/types";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="block bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{recipe.name}</h3>
          {recipe.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{recipe.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            {recipe.type === "link" && (
              <span className="flex items-center gap-1 text-xs text-blue-500">
                <ExternalLink size={12} /> Link recipe
              </span>
            )}
            {recipe.prepTimeMins && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={12} /> {recipe.prepTimeMins}m prep
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Users size={12} /> {recipe.servings} servings
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
