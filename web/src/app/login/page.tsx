"use client";
import { useState } from "react";
import { useLogin } from "@/hooks/useAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UtensilsCrossed } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const login = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
            <UtensilsCrossed size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Family Meal Planner</h1>
          <p className="text-gray-500 mt-1">Enter your family password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col gap-4">
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter family password"
            autoFocus
          />
          {login.isError && (
            <p className="text-sm text-red-600">Invalid password. Please try again.</p>
          )}
          <Button type="submit" disabled={login.isPending || !password} className="w-full" size="lg">
            {login.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
