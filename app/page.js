import { siteUrl } from "../lib/site";
import SimulationPreview from "./simulation-preview";
import { ArrowIcon, SiteFooter, SiteHeader } from "./site-chrome";

const currentCapabilities = [
  {
    number: "01",
    title: "Typed process plans",
    body: "Represent setups and workingsteps in a vendor-neutral graph designed for review, comparison, and traceability.",
  },
  {
    number: "02",
    title: "Evidence-linked reasoning",
    body: "Keep recommendations connected to provenance artifacts instead of presenting unsupported certainty.",
  },
  {
    number: "03",
    title: "Honest evidence labels",
    body: "Separate simulated from observed evidence and preserve unknown values rather than silently replacing them.",
  },
  {
    number: "04",
    title: "Fail-closed approval",
    body: "Require an independent verification record and qualified human approval before any advisory export.",
  },
];

const roadmapItems = [
  "Exact geometry, tool, and fixture feasibility checks",
  "Constrained search across complete process-plan alternatives",
  "System-realized timing beyond toolpath time alone",
  "Non-actuating shadow pilots with design partners",
];

const principles = [
  {
    label: "Gate closed",
    text: "No advisory export without the required verification and human decision.",
  },
  {
    label: "Simulated labeled",
    text: "Synthetic and simulated evidence stays visibly distinct from observed evidence.",
  },
  {
    label: "NaN honest",
    text: "Missing measurements remain unknown, not converted into reassuring zeros.",
  },
  {
    label: "Authority bounded",
    text: "The prototype cannot issue physical CNC or robot commands.",
  },
];

const audiences = [
  {
    title: "Precision manufacturers",
    body: "Explore a reviewable planning approach for complex CNC work without handing physical authority to the software.",
  },
  {
    title: "Manufacturing engineers and CNC programmers",
    body: "Connect setups, workingsteps, evidence, and approval decisions in one accountable planning thread.",
  },
  {
    title: "Applications, tooling, and machine teams",
    body: "Bring machine capability and process evidence into clearer technical conversations around plan feasibility.",
  },
  {
    title: "Research and design partners",
    body: "Evaluate the assurance model, challenge its boundaries, and help shape non-actuating shadow pilots.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}#organization`,
      name: "SAGE Suite",
      url: siteUrl,
      logo: `${siteUrl}icon.svg`,
      description:
        "An assurance-first manufacturing intelligence project for evidence-linked CNC process planning.",
      founder: {
        "@id": `${siteUrl}#founder`,
      },
      sameAs: [
        "https://github.com/kohlkat",
        "https://www.linkedin.com/in/david-kohler22",
      ],
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}#founder`,
      name: "David Kohler",
      url: "https://www.linkedin.com/in/david-kohler22",
      sameAs: [
        "https://github.com/kohlkat",
        "https://www.linkedin.com/in/david-kohler22",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}#website`,
      name: "SAGE Suite",
      url: siteUrl,
      description:
        "The public project hub for SAGE Suite manufacturing intelligence.",
      inLanguage: "en-US",
      publisher: {
        "@id": `${siteUrl}#organization`,
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}#software`,
      name: "SAGE Suite",
      url: siteUrl,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Platform-independent",
      description:
        "A functional, advisory prototype for typed, evidence-linked CNC process planning with independent checks and human approval.",
      creator: {
        "@id": `${siteUrl}#founder`,
      },
      isPartOf: {
        "@id": `${siteUrl}#website`,
      },
      featureList: [
        "Typed process plans",
        "Evidence-linked reasoning",
        "Explicit simulated and observed evidence labels",
        "Reproducible public simulation evidence",
        "Fail-closed human approval",
      ],
    },
  ],
};

const structuredDataJson = JSON.stringify(structuredData).replace(
  /</g,
  "\\u003c",
);

function ProcessMap() {
  return (
    <div className="process-map" aria-label="SAGE assurance flow">
      <div className="map-grid" aria-hidden="true" />
      <div className="map-header">
        <span>Assurance flow</span>
        <span className="live-label">
          <i />
          Prototype
        </span>
      </div>
      <div className="map-flow">
        <div className="flow-row">
          <div className="flow-node flow-node-source">
            <span>Inputs</span>
            <small>part · machine · evidence</small>
          </div>
          <span className="flow-link" aria-hidden="true" />
          <div className="flow-node">
            <span>Typed plan</span>
            <small>setups · workingsteps</small>
          </div>
        </div>
        <div className="flow-down" aria-hidden="true" />
        <div className="flow-row flow-row-reverse">
          <div className="flow-node flow-node-check">
            <span>Independent check</span>
            <small>record · provenance</small>
          </div>
          <span className="flow-link flow-link-left" aria-hidden="true" />
          <div className="flow-node">
            <span>Evidence binding</span>
            <small>observed ≠ simulated</small>
          </div>
        </div>
        <div className="flow-down flow-down-left" aria-hidden="true" />
        <div className="flow-row">
          <div className="flow-node flow-node-gate">
            <span>Human gate</span>
            <small>closed by default</small>
          </div>
          <span className="flow-link flow-link-dashed" aria-hidden="true" />
          <div className="flow-node flow-node-output">
            <span>Advisory export</span>
            <small>no machine authority</small>
          </div>
        </div>
      </div>
      <div className="map-status">
        <span>
          <i className="status-dot status-dot-green" />
          Evidence attached
        </span>
        <span>
          <i className="status-dot status-dot-amber" />
          Human decision required
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredDataJson }}
      />
      <SiteHeader />

      <section className="hero" id="top">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            Manufacturing intelligence · Pittsburgh
          </div>
          <h1>
            Complete process planning,
            <span>bounded by evidence.</span>
          </h1>
          <p className="hero-lead">
            SAGE Suite is an assurance-first manufacturing intelligence
            platform being built for CNC process planning. Start with a
            120-row public simulation you can inspect, download, hash, and
            regenerate.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="/simulation/">
              Explore simulation evidence
              <ArrowIcon />
            </a>
            <a className="button button-secondary" href="#platform">
              See the platform
            </a>
          </div>
          <div className="boundary-strip">
            <span>120 simulated samples</span>
            <span>0 observed samples</span>
            <span>Advisory only</span>
            <span>No physical command authority</span>
          </div>
        </div>
        <div className="hero-visual">
          <ProcessMap />
        </div>
      </section>

      <SimulationPreview />

      <section className="problem-section">
        <div className="section-kicker">The operating problem</div>
        <div className="problem-layout">
          <h2>
            Manufacturing knowledge lives in fragments. Decisions still need
            one accountable thread.
          </h2>
          <div className="problem-copy">
            <p>
              A CNC process plan spans geometry, tooling, workholding, machine
              capability, sequencing, timing, and hard-earned shop knowledge.
              Those inputs rarely share one evidence model.
            </p>
            <p>
              SAGE is designed to make the plan reviewable as a whole—without
              hiding uncertainty or crossing the boundary into machine control.
            </p>
          </div>
        </div>
      </section>

      <section className="platform-section" id="platform">
        <div className="section-heading">
          <div>
            <div className="section-kicker">Current prototype</div>
            <h2>An assurance layer for process-plan intelligence.</h2>
          </div>
          <p>
            The prototype focuses on trustworthy representation and review.
            It does not claim autonomous production control.
          </p>
        </div>
        <div className="capability-grid">
          {currentCapabilities.map((capability) => (
            <article className="capability-card" key={capability.number}>
              <span className="card-number">{capability.number}</span>
              <div>
                <h3>{capability.title}</h3>
                <p>{capability.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="audience-section" id="audiences">
        <div className="section-heading">
          <div>
            <div className="section-kicker">Project hub</div>
            <h2>
              Built for the people who plan, verify, and improve CNC work.
            </h2>
          </div>
          <p>
            This is the public home for SAGE Suite—not a campaign page for one
            program. Follow what exists now, what comes next, and where outside
            perspective can improve the work.
          </p>
        </div>
        <div className="audience-grid">
          {audiences.map((audience, index) => (
            <article className="audience-card" key={audience.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{audience.title}</h3>
              <p>{audience.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="boundary-section" id="boundaries">
        <div className="boundary-panel">
          <div className="boundary-intro">
            <div className="section-kicker section-kicker-light">
              Trust boundary
            </div>
            <h2>Useful intelligence should make its limits visible.</h2>
            <p>
              SAGE keeps advisory reasoning separate from physical authority.
              Qualified people, OEM controls, and certified safety systems
              remain responsible for real equipment.
            </p>
          </div>
          <div className="principle-list">
            {principles.map((principle, index) => (
              <div className="principle" key={principle.label}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{principle.label}</h3>
                  <p>{principle.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="roadmap-section" id="roadmap">
        <div className="roadmap-label">
          <span>Roadmap</span>
          <small>Not represented as deployed capability</small>
        </div>
        <div className="roadmap-content">
          <div>
            <h2>From evidence-aware plans to bounded plan exploration.</h2>
            <p>
              The next stage targets deeper feasibility and timing models,
              developed in shadow mode with manufacturing design partners.
            </p>
          </div>
          <ol>
            {roadmapItems.map((item, index) => (
              <li key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="partner-section" id="contact">
        <div className="partner-grid" aria-hidden="true" />
        <div className="partner-copy">
          <div className="section-kicker section-kicker-light">
            Design-partner conversations
          </div>
          <h2>Help shape an evidence-first planning workflow.</h2>
          <p>
            We are looking to learn from precision manufacturers, manufacturing
            engineers, CNC programmers, applications engineers, and operations
            leaders working with complex process-planning decisions.
          </p>
        </div>
        <div className="partner-actions">
          <a
            className="button button-light"
            href="mailto:dkohlkat@gmail.com?subject=SAGE%20Suite%20design%20partner"
          >
            Start a conversation
            <ArrowIcon />
          </a>
          <a
            className="founder-link"
            href="https://www.linkedin.com/in/david-kohler22"
            target="_blank"
            rel="noreferrer"
          >
            Founder: David Kohler
          </a>
          <span>Pittsburgh, Pennsylvania</span>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
