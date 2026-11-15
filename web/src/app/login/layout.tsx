import { LegalLinks } from "@/components/layout/LegalLinks";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}<footer><LegalLinks /></footer></>;
}
