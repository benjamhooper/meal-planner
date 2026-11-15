import Link from "next/link";

export function LegalLinks() {
  return (
    <nav aria-label="Legal" className="flex flex-wrap justify-center gap-x-5 gap-y-2 py-5 text-sm text-gray-600">
      <Link href="/terms" className="underline hover:text-green-700">Terms of Service</Link>
      <Link href="/privacy" className="underline hover:text-green-700">Privacy Policy</Link>
    </nav>
  );
}
