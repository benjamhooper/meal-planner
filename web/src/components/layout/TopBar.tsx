"use client";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

interface TopBarProps {
  title: string;
  actions?: React.ReactNode;
}

export function TopBar({ title, actions }: TopBarProps) {
  const logout = useLogout();
  const { data: user } = useAuth();
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (menu.current && !menu.current.contains(event.target as Node)) menu.current.open = false;
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menu.current?.open) {
        menu.current.open = false;
        menu.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="flex items-center gap-2">
          {actions}
          {user && (
            <details ref={menu} className="relative">
              <summary aria-label="Account options" className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-full hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-600 [&::-webkit-details-marker]:hidden">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-semibold text-green-700">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              </summary>
              <nav aria-label="Account" className="absolute right-0 top-full mt-2 w-60 rounded-xl border bg-white p-2 shadow-lg">
                <p className="truncate border-b px-3 py-2 text-sm font-medium">{user.name}</p>
                <Link href="/terms" className="block rounded-lg px-3 py-3 text-sm hover:bg-gray-50">Terms of Service</Link>
                <Link href="/privacy" className="block rounded-lg px-3 py-3 text-sm hover:bg-gray-50">Privacy Policy</Link>
                <button onClick={() => logout.mutate()} disabled={logout.isPending} className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60">
                  <LogOut size={18} />{logout.isPending ? "Logging out..." : "Log out"}
                </button>
                {logout.isError && <p role="alert" className="px-3 py-2 text-sm text-red-600">Could not log out. Please try again.</p>}
              </nav>
            </details>
          )}
        </div>
      </div>
    </header>
  );
}

