"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import type { GroceryList, GroceryItem } from "@/types";

export function useGroceryLists() {
  return useQuery({
    queryKey: ["grocery", "lists"],
    queryFn: () => api.get<GroceryList[]>("/grocery/lists"),
  });
}

export function useGroceryItems(listId: string) {
  return useQuery({
    queryKey: ["grocery", "items", listId],
    queryFn: () => api.get<GroceryItem[]>(`/grocery/lists/${listId}/items`),
    enabled: !!listId,
  });
}

export function useAddGroceryItem(listId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; quantity?: string; category?: string }) =>
      api.post<GroceryItem>(`/grocery/lists/${listId}/items`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grocery", "items", listId] }),
  });
}

export function usePatchGroceryItem(listId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; quantity?: string; category?: string; isChecked?: boolean; sortOrder?: number }) =>
      api.patch<GroceryItem>(`/grocery/items/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grocery", "items", listId] }),
  });
}

export function useDeleteGroceryItem(listId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/grocery/items/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grocery", "items", listId] }),
  });
}

export function useReorderGroceryItems(listId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: { id: string; sortOrder: number }[]) =>
      api.post("/grocery/items/reorder", { items }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grocery", "items", listId] }),
  });
}

export function useClearCheckedItems(listId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(`/grocery/lists/${listId}/items/checked`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grocery", "items", listId] }),
  });
}
