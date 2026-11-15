import Link from "next/link";
import { LegalLinks } from "@/components/layout/LegalLinks";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="font-semibold text-green-700">Family Meal Planner</Link>
        <Link href="/login" className="text-sm underline">Sign in</Link>
      </header>
      <main className="rounded-2xl border bg-white p-6 sm:p-8 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_p]:mb-3 [&_p]:text-sm [&_p]:leading-7 [&_a]:text-green-700 [&_a]:underline">{children}</main>
      <footer><LegalLinks /></footer>
    </div>
  );
}
