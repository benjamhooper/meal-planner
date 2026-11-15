import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms of Service | Family Meal Planner" };

export default function TermsPage() {
  return (
    <article>
      <h1>Terms of Service</h1>
      <p>Last updated: November 14, 2026</p>
      <p>These terms govern your use of Family Meal Planner, a personal meal planning service operated by Ben Hooper. By using the service, you agree to these terms. If you do not agree, please do not use the service.</p>
      <h2>Using the service</h2>
      <p>Family Meal Planner helps you organize meals, save recipes, and manage grocery lists. You are responsible for the information you enter, protecting your account credentials, and activity under your account. Use the service lawfully. Do not attempt to access another person&apos;s data, bypass security controls, disrupt the service, or upload harmful or unlawful content.</p>
      <h2>Your content</h2>
      <p>You retain your rights to the recipes, notes, and other content you provide. You give the operator permission to store, process, and display that content as needed to provide the service. Only add content you own or have permission to use. Linking to a recipe does not transfer ownership of that recipe.</p>
      <h2>Food and recipe information</h2>
      <p>Meal plans and recipes are organizational tools, not medical or nutritional advice. Check ingredients, allergens, food handling instructions, and suitability for your household. You are responsible for your food choices and preparation.</p>
      <h2>Third-party services</h2>
      <p>Sign-in providers, linked recipe websites, and optional integrations have their own terms and privacy practices. The operator does not control those services. The app is not affiliated with or endorsed by Kroger or Dillons. Any future retailer features may depend on retailer availability and authorization; verify prices, availability, and purchases with the retailer.</p>
      <h2>Availability and limitations</h2>
      <p>The service is provided on an &quot;as is&quot; and &quot;as available&quot; basis. Features may change, and uninterrupted access or error-free information is not guaranteed. Keep your own copy of important information. To the extent permitted by applicable law, the operator disclaims implied warranties and is not liable for indirect or consequential losses arising from use of the service. Nothing in these terms excludes rights or liability that cannot legally be excluded.</p>
      <h2>Stopping use and account access</h2>
      <p>You may stop using the service at any time. Access may be restricted or suspended to address misuse, security issues, or legal requirements. Signing out does not delete your account or stored content. See the <Link href="/privacy">Privacy Policy</Link> for information about data and deletion requests.</p>
      <h2>Changes and questions</h2>
      <p>Revised terms will be posted on this page with an updated date. Review them when using the service after an update. For questions about these terms, contact Ben Hooper at <a href="mailto:me@benhooper.org">me@benhooper.org</a>.</p>
    </article>
  );
}
