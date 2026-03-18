"use client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { RecipeDetail } from "@/components/recipes/RecipeDetail";
import { useRecipe, useDeleteRecipe } from "@/hooks/useRecipes";
import { Button } from "@/components/ui/Button";
import { Edit, Trash2, ExternalLink } from "lucide-react";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: recipe, isLoading } = useRecipe(id);
  const deleteRecipe = useDeleteRecipe();

  const handleDelete = async () => {
    if (confirm("Delete this recipe?")) {
      await deleteRecipe.mutateAsync(id);
      router.push("/recipes");
    }
  };

  if (isLoading) return (
    <>
      <TopBar title="Recipe" />
      <PageWrapper>
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </PageWrapper>
    </>
  );

  if (!recipe) return (
    <>
      <TopBar title="Recipe" />
      <PageWrapper><p className="text-gray-500">Recipe not found.</p></PageWrapper>
    </>
  );

  return (
    <>
      <TopBar
        title={recipe.name}
        actions={
          <div className="flex gap-1">
            <Link href={`/recipes/${id}/edit`}>
              <Button variant="ghost" size="sm"><Edit size={16} /></Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500">
              <Trash2 size={16} />
            </Button>
          </div>
        }
      />
      <PageWrapper>
        <RecipeDetail recipe={recipe} />
      </PageWrapper>
    </>
  );
}
