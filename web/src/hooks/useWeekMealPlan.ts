"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import type { MealPlanWeek, MealPlanSlot } from "@/types";

export function useWeekMealPlan(weekStartDate: string) {
  return useQuery({
    queryKey: ["mealplan", weekStartDate],
    queryFn: async () => {
      try {
        return await api.get<MealPlanWeek>(`/mealplan/week/${weekStartDate}`);
      } catch (e: any) {
        if (e.status === 404) return null;
        throw e;
      }
    },
    enabled: !!weekStartDate,
  });
}

export function useUpsertSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      weekStartDate: string; dayOfWeek: number; mealType: string;
      recipeId?: string; customLabel?: string; notes?: string;
    }) => api.post<MealPlanSlot>("/mealplan/slots", data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["mealplan"] });
    },
  });
}

export function useDeleteSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/mealplan/slots/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mealplan"] }),
  });
}
