"use client";
import { useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { useRecipes } from "@/hooks/useRecipes";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Plus, Search } from "lucide-react";

export default function RecipesPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useRecipes({ search: search || undefined });

  return (
    <>
      <TopBar
        title="Recipes"
        actions={
          <Link href="/recipes/new">
            <Button size="sm">
              <Plus size={16} className="mr-1" /> Add
            </Button>
          </Link>
        }
      />
      <PageWrapper>
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {data?.items.map((r) => <RecipeCard key={r.id} recipe={r} />)}
            {data?.items.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm mb-4">No recipes yet</p>
                <Link href="/recipes/new">
                  <Button>Add your first recipe</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </PageWrapper>
    </>
  );
}
