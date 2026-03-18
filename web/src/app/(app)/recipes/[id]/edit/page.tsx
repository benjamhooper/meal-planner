"use client";
import { useParams, useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { useRecipe, useUpdateRecipe } from "@/hooks/useRecipes";
import type { Recipe } from "@/types";

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: recipe, isLoading } = useRecipe(id);
  const updateRecipe = useUpdateRecipe(id);

  const handleSubmit = async (data: Partial<Recipe>) => {
    await updateRecipe.mutateAsync(data);
    router.push(`/recipes/${id}`);
  };

  if (isLoading || !recipe) return (
    <>
      <TopBar title="Edit Recipe" />
      <PageWrapper>
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </PageWrapper>
    </>
  );

  return (
    <>
      <TopBar title="Edit Recipe" />
      <PageWrapper>
        <RecipeForm initialData={recipe} onSubmit={handleSubmit} isLoading={updateRecipe.isPending} />
      </PageWrapper>
    </>
  );
}
