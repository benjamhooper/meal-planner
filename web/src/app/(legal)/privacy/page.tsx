import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy | Family Meal Planner" };

export default function PrivacyPage() {
  return (
    <article>
      <h1>Privacy Policy</h1>
      <p>Last updated: November 14, 2026</p>
      <p>This policy describes how Family Meal Planner, operated by Ben Hooper, handles information when you use the service.</p>
      <h2>Information collected</h2>
      <p>Account information includes your name and email address. When you sign in with Google or GitHub, the service also receives a provider account identifier and, when provided, your profile image URL. For email and password accounts, the service stores a password hash rather than your readable password. Accounts using the same email address may be linked.</p>
      <p>The service stores the recipes, ingredients, instructions, source links, meal plans, custom labels, notes, and grocery list items you enter, along with identifiers and timestamps needed to manage them. Avoid entering sensitive information that is not needed for meal planning.</p>
      <p>Hosting and infrastructure services may process technical information such as IP addresses, request details, and error logs to deliver, secure, and troubleshoot the service.</p>
      <h2>How information is used</h2>
      <p>Information is used to authenticate you, maintain your account, save and display your content, respond to support requests, and operate and protect the service. The current application does not include advertising or advertising tracking features.</p>
      <h2>Cookies</h2>
      <p>An essential authentication cookie keeps you signed in and is configured to expire after 30 days. Temporary cookies are also used during third-party sign-in. Signing out removes the application&apos;s authentication cookie. Blocking cookies may prevent sign-in. Signing out or clearing cookies does not delete information stored in your account.</p>
      <h2>Service providers and integrations</h2>
      <p>Hosting and database providers process information needed to run the app. Google and GitHub process sign-in information under their own privacy policies. Loading a profile image or opening a recipe link can send a request to that external provider, which may receive your IP address and browser information.</p>
      <p>If the operator has configured the optional Alexa integration for an account, that account&apos;s meal names for today are sent to Amazon&apos;s Alexa service to answer meal queries. Anyone with access to the configured Alexa skill or device may be able to hear those meals. Amazon handles voice interactions under its own policies.</p>
      <p>Kroger and Dillons integration is planned, but is not part of the current application. This policy will be updated to explain retailer data access and sharing before those features are introduced.</p>
      <p>Information may also be disclosed when required by law or when necessary to address security incidents, misuse, or protection of legal rights.</p>
      <h2>Retention and security</h2>
      <p>Account information and saved content remain stored so you can return to your plans. There is currently no automatic account expiration or self-service account deletion feature. Deleted information may remain in operational logs or backups until those copies are rotated or removed. Authentication and access controls help protect information, but no system can guarantee absolute security.</p>
      <h2>Your choices and requests</h2>
      <p>You can view, edit, and remove recipes, planned meals, and grocery items through the application. You can stop using the service or revoke access through your sign-in provider; revoking provider access does not itself delete the app&apos;s stored data. Contact the operator to request access, correction, or deletion of account information. Identity verification may be needed before a request can be fulfilled, and applicable legal retention requirements may affect deletion.</p>
      <h2>Children</h2>
      <p>The service is intended for adults managing meals, not for children under 13 to create accounts. If you believe a child has provided personal information, contact the operator to request review and removal.</p>
      <h2>Changes and contact</h2>
      <p>Updates to this policy will appear here with a revised date. For privacy questions, account deletion, or other account requests, contact Ben Hooper, the application operator, at <a href="mailto:me@benhooper.org">me@benhooper.org</a>.</p>
    </article>
  );
}
