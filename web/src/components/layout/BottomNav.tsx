"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, ShoppingCart, BookOpen } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/meals", label: "Meals", icon: Calendar },
  { href: "/grocery", label: "Grocery", icon: ShoppingCart },
  { href: "/recipes", label: "Recipes", icon: BookOpen },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
      <div className="flex max-w-lg mx-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors",
              pathname.startsWith(href) ? "text-green-600" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Icon size={22} strokeWidth={pathname.startsWith(href) ? 2.5 : 1.5} />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
