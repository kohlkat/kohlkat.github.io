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

function SageMark() {
  return (
    <svg
      aria-hidden="true"
      className="sage-mark"
      viewBox="0 0 42 42"
      fill="none"
    >
      <path d="M8 12.5 21 5l13 7.5v17L21 37 8 29.5v-17Z" />
      <path d="m13 15.5 8-4.5 8 4.5-8 4.6-8-4.6Zm0 6 8 4.5 8-4.5M21 20.1V32" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none">
      <path d="M3 9h11M10 5l4 4-4 4" />
    </svg>
  );
}

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
          <span className="flow-link" aria-hidden="true" />
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
      <header className="site-header">
        <a className="brand" href="#top" aria-label="SAGE Suite home">
          <SageMark />
          <span>
            SAGE
            <small>SUITE</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#platform">Platform</a>
          <a href="#boundaries">Trust boundary</a>
          <a href="#roadmap">Roadmap</a>
        </nav>
        <a className="header-cta" href="#contact">
          Design partners
          <ArrowIcon />
        </a>
      </header>

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
            platform being built for CNC process planning—connecting typed
            plans, evidence, independent checks, and human approval.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#platform">
              Explore the approach
              <ArrowIcon />
            </a>
            <a
              className="button button-secondary"
              href="https://github.com/kohlkat"
              target="_blank"
              rel="noreferrer"
            >
              Founder profile
            </a>
          </div>
          <div className="boundary-strip">
            <span>Functional prototype</span>
            <span>Advisory only</span>
            <span>No physical command authority</span>
          </div>
        </div>
        <div className="hero-visual">
          <ProcessMap />
        </div>
      </section>

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
          <span>Pittsburgh, Pennsylvania</span>
        </div>
      </section>

      <footer>
        <div className="brand footer-brand">
          <SageMark />
          <span>
            SAGE
            <small>SUITE</small>
          </span>
        </div>
        <p>
          Assurance-first manufacturing intelligence. Prototype · Advisory
          only · No machine command authority.
        </p>
        <span>© 2026 SAGE Suite</span>
      </footer>
    </main>
  );
}
