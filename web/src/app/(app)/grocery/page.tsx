"use client";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { GroceryList } from "@/components/grocery/GroceryList";
import { useGroceryLists } from "@/hooks/useGroceryList";

export default function GroceryPage() {
  const { data: lists, isLoading } = useGroceryLists();
  const defaultList = lists?.[0];

  if (isLoading) {
    return (
      <>
        <TopBar title="Grocery List" />
        <PageWrapper>
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </PageWrapper>
      </>
    );
  }

  return (
    <>
      <TopBar title="Grocery List" />
      <PageWrapper>
        {defaultList ? <GroceryList listId={defaultList.id} /> : <p className="text-gray-500 text-sm">No list found.</p>}
      </PageWrapper>
    </>
  );
}
