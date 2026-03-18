"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import type { User } from "@/types";

export function useAuth() {
  return useQuery({
    queryKey: ["auth"],
    queryFn: () => api.get<User>("/auth/me"),
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
    },
  });
}

