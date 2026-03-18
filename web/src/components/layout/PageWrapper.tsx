export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <main className="max-w-lg mx-auto px-4 pt-4 pb-24 min-h-screen">
      {children}
    </main>
  );
}
