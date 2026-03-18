"use client";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { useCreateRecipe } from "@/hooks/useRecipes";
import type { Recipe } from "@/types";

export default function NewRecipePage() {
  const router = useRouter();
  const createRecipe = useCreateRecipe();

  const handleSubmit = async (data: Partial<Recipe>) => {
    await createRecipe.mutateAsync(data);
    router.push("/recipes");
  };

  return (
    <>
      <TopBar title="New Recipe" />
      <PageWrapper>
        <RecipeForm onSubmit={handleSubmit} isLoading={createRecipe.isPending} />
      </PageWrapper>
    </>
  );
}
