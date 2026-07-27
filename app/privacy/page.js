import AnalyticsControls from "./analytics-controls";

export const metadata = {
  title: "Privacy",
  description:
    "How the SAGE Suite project site handles contact information, consent-based analytics, and automated access.",
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
          Vercel hosts this site and may process ordinary request and
          security data under GitHub’s own terms and privacy statement. This
          site does not sell personal information.
        </p>

        <h2 id="automated-access">Automated access and archiving</h2>
        <p>
          This site reserves text-and-data-mining rights and does not authorize
          automated model training, retrieval augmentation, AI answer
          synthesis, dataset collection, bulk extraction, or archival copying
          without written permission. Conventional search indexing and social
          link previews are allowed only for the crawlers named in{" "}
          <a href="/robots.txt">robots.txt</a>.
        </p>
        <p>
          The site also publishes a machine-readable reservation at{" "}
          <a href="/.well-known/tdmrep.json">
            /.well-known/tdmrep.json
          </a>
          . These signals apply to cooperative automated systems. They cannot
          stop a crawler that ignores published rules or a person from saving
          content that is already public.
        </p>

        <p className="legal-updated">Last updated July 25, 2026.</p>
      </article>
    </main>
  );
}
