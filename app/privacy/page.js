import AnalyticsControls from "./analytics-controls";

export const metadata = {
  title: "Privacy",
  description:
    "How the SAGE Suite project site handles contact information and optional, consent-based analytics.",
  alternates: {
    canonical: "/privacy/",
  },
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <header className="legal-header">
        <a href="/">SAGE SUITE</a>
        <a href="/">Back to project</a>
      </header>
      <article className="legal-content">
        <div className="section-kicker">Privacy</div>
        <h1>Clear measurement, limited collection.</h1>
        <p className="legal-lead">
          SAGE Suite is a public project site. It has no accounts, checkout, or
          embedded contact form.
        </p>

        <h2>Optional analytics</h2>
        <p>
          When Google Analytics is configured, it loads only after you choose
          “Allow analytics.” The site disables Google advertising signals and
          ad-personalization signals. Analytics may process page views, browser
          and device information, referrers, and approximate location. Do not
          put personal or confidential information into a page URL.
        </p>

        <AnalyticsControls />

        <h2>Contact</h2>
        <p>
          The contact link opens your email application. Information you choose
          to send is handled through the sender’s and recipient’s email
          providers and is used to respond to the conversation.
        </p>

        <h2>Hosting</h2>
        <p>
          GitHub Pages hosts this site and may process ordinary request and
          security data under GitHub’s own terms and privacy statement. This
          site does not sell personal information.
        </p>

        <p className="legal-updated">Last updated July 25, 2026.</p>
      </article>
    </main>
  );
}
