import { siteUrl } from "../lib/site";
import {
  publicKernelBoundary,
  publicKernels,
} from "../lib/public-kernels";
import {
  publicSimulationSummary,
  publicSurfaceSummary,
} from "../lib/public-results";
import PilotReadiness from "./pilot-readiness";
import RelativePoseStudy from "./relative-pose-study";
import SimulationPreview from "./simulation-preview";
import { ArrowIcon, SiteFooter, SiteHeader } from "./site-chrome";

const deliverables = [
  {
    number: "01",
    title: "A structured job model",
    body:
      "Part intent, setup, machine, tooling, material, operations, constraints, and available evidence in one reviewable record.",
  },
  {
    number: "02",
    title: "Ranked process-plan alternatives",
    body:
      "Candidate approaches compared on a consistent modeled basis, with the baseline and tradeoffs kept visible.",
  },
  {
    number: "03",
    title: "An evidence-linked review packet",
    body:
      "Sources, assumptions, applicability, independent-check results, and unresolved questions attached to the recommendation.",
  },
];

const workflow = [
  {
    number: "01",
    title: "Bring one difficult job",
    body:
      "Start with a representative part, machine, tool set, material, constraints, and the evidence your team already has.",
  },
  {
    number: "02",
    title: "Compare feasible alternatives",
    body:
      "SAGE organizes the job and evaluates candidate process plans in a declared simulation and evidence context.",
  },
  {
    number: "03",
    title: "Review the decision packet",
    body:
      "A qualified person receives the alternatives, modeled tradeoffs, limits, and independent-check disposition—not a black-box command.",
  },
];

const useCases = [
  {
    title: "Difficult new-part planning",
    body:
      "Compare plausible setup, tooling, and sequencing choices before committing scarce machine time.",
  },
  {
    title: "Alternate machine or tool review",
    body:
      "Make the changed assumptions visible when evaluating whether a job can move to another resource.",
  },
  {
    title: "Engineering design review",
    body:
      "Give manufacturing, applications, tooling, and quality teams one traceable record to challenge together.",
  },
  {
    title: "Non-actuating shadow pilots",
    body:
      "Run beside the existing workflow, compare recommendations, and measure review value without commanding equipment.",
  },
];

const platformCapabilities = [
  {
    number: "01",
    title: "Manufacturing context",
    body:
      "A vendor-neutral representation of the job, setup, machine, tooling, operations, and evidence.",
  },
  {
    number: "02",
    title: "Multi-fidelity comparison",
    body:
      "A declared ladder from lightweight process models to NVIDIA simulation and, when available, governed measurements.",
  },
  {
    number: "03",
    title: "Advisory intelligence",
    body:
      "Deterministic engineering logic, constrained search, and learned ranking used as decision support—not machine authority.",
  },
  {
    number: "04",
    title: "Independent assurance",
    body:
      "Separate checks challenge the evidence, applicability, uncertainty, and approval state before export.",
  },
];

const principles = [
  {
    label: "Gate closed",
    text:
      "The workflow ends at qualified human review. Software does not approve or actuate itself.",
  },
  {
    label: "Evidence attached",
    text:
      "Recommendations retain their sources, assumptions, evidence class, and independent disposition.",
  },
  {
    label: "Unknown stays unknown",
    text:
      "Missing measurements remain missing instead of becoming plausible-looking zeros.",
  },
  {
    label: "Limits stay visible",
    text:
      "A result can be withheld when the context or evidence does not support the requested conclusion.",
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
        "Manufacturing decision intelligence for defensible CNC process planning and simulation-backed comparison.",
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
        "The product and research hub for SAGE manufacturing decision intelligence.",
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
        "CNC manufacturing decision intelligence that compares candidate process plans before machine time is committed and returns an evidence-linked packet for qualified human review.",
      creator: {
        "@id": `${siteUrl}#founder`,
      },
      isPartOf: {
        "@id": `${siteUrl}#website`,
      },
      featureList: [
        "Structured manufacturing job and process-plan context",
        "Simulation-backed candidate comparison",
        "Evidence-linked recommendation packets",
        "Five public-safe independent assurance checks",
        "Explicit simulated and observed evidence labels",
        "Aggregate NVIDIA Isaac Sim campaign evidence",
        "Modeled surface-integrity context",
        "Qualified human approval",
      ],
    },
  ],
};

const structuredDataJson = JSON.stringify(structuredData).replace(
  /</g,
  "\\u003c",
);

function DecisionPacket() {
  return (
    <div
      className="decision-packet"
      role="group"
      aria-label="Illustrative SAGE engineering decision packet"
    >
      <div className="decision-packet-grid" aria-hidden="true" />
      <div className="decision-packet-header">
        <span>SAGE engineering decision packet</span>
        <span className="decision-packet-status">
          <i />
          Review ready
        </span>
      </div>
      <div className="decision-packet-title">
        <small>Representative planning question</small>
        <h2>Which candidate plan deserves engineering review?</h2>
        <p>
          SAGE keeps the recommendation, alternatives, evidence, and limits in
          one accountable object.
        </p>
      </div>
      <div className="decision-packet-options">
        <div>
          <span>Candidate A</span>
          <strong>Baseline</strong>
          <small>Known reference</small>
        </div>
        <div className="decision-packet-selected">
          <span>Candidate B</span>
          <strong>Recommended for review</strong>
          <small>Modeled tradeoffs attached</small>
        </div>
        <div>
          <span>Candidate C</span>
          <strong>Withheld</strong>
          <small>Evidence boundary reached</small>
        </div>
      </div>
      <div className="decision-packet-footer">
        <span>Inputs bound</span>
        <span>Evidence attached</span>
        <span>Independent check</span>
        <span>Human decision</span>
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
            Manufacturing decision intelligence · Pittsburgh
          </div>
          <h1>
            Make every difficult cut
            <span>a decision you can defend.</span>
          </h1>
          <p className="hero-lead">
            Before scarce machine time is committed, SAGE compares candidate
            process plans in simulation and returns the evidence, tradeoffs,
            limits, and independent-check disposition a qualified engineer
            needs—not just an answer.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#how-it-works">
              See how SAGE works
              <ArrowIcon />
            </a>
            <a className="button button-secondary" href="#pilot">
              Discuss a shadow pilot
            </a>
          </div>
          <div className="boundary-strip">
            <span>One job model</span>
            <span>Ranked alternatives</span>
            <span>Evidence-linked review</span>
            <span>Non-actuating</span>
          </div>
        </div>
        <div className="hero-visual">
          <DecisionPacket />
        </div>
      </section>

      <section className="start-section" id="product">
        <div className="section-heading">
          <div>
            <div className="section-kicker">What your team receives</div>
            <h2>A decision packet, not a black-box prediction.</h2>
          </div>
          <p>
            A process plan is the manufacturing recipe for making a part. SAGE
            turns the recipe and its context into an object your team can
            compare, challenge, and approve.
          </p>
        </div>
        <div className="start-grid">
          {deliverables.map((deliverable) => (
            <article key={deliverable.number}>
              <span>{deliverable.number}</span>
              <h3>{deliverable.title}</h3>
              <p>{deliverable.body}</p>
            </article>
          ))}
        </div>
        <div className="plain-boundary">
          The practical outcome: more alternatives examined before scarce
          machine time is committed, with the technical basis preserved for
          review.
        </div>
      </section>

      <section className="problem-section" id="how-it-works">
        <div className="section-kicker">How SAGE works</div>
        <div className="problem-layout">
          <h2>
            Bring one difficult job. Leave with alternatives and an accountable
            technical record.
          </h2>
          <div className="problem-copy">
            {workflow.map((step) => (
              <div className="workflow-step" key={step.number}>
                <span>{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SimulationPreview />
      <RelativePoseStudy />

      <section className="audience-section" id="use-cases">
        <div className="section-heading">
          <div>
            <div className="section-kicker">Where SAGE fits</div>
            <h2>Start where planning is expensive, uncertain, or fragmented.</h2>
          </div>
          <p>
            SAGE is built for engineering decisions that cross part intent,
            tooling, machine capability, simulation, sensing, and human
            judgment.
          </p>
        </div>
        <div className="audience-grid">
          {useCases.map((useCase, index) => (
            <article className="audience-card" key={useCase.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{useCase.title}</h3>
              <p>{useCase.body}</p>
            </article>
          ))}
        </div>
      </section>

      <PilotReadiness />

      <section className="platform-section" id="platform">
        <div className="section-heading">
          <div>
            <div className="section-kicker">One product platform</div>
            <h2>Planning, simulation, intelligence, and assurance stay connected.</h2>
          </div>
          <p>
            SAGE is broader than one model or dataset. Each layer contributes to
            the same reviewable manufacturing decision.
          </p>
        </div>
        <div className="capability-grid">
          {platformCapabilities.map((capability) => (
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

      <section className="kernel-section" id="assurance">
        <div className="section-heading">
          <div>
            <div className="section-kicker">Independent trust layer</div>
            <h2>Five focused checks ask whether a recommendation should continue.</h2>
          </div>
          <p>
            Each check answers a different question about limits, evidence,
            context, physical plausibility, or uncertainty. If a required answer
            is missing, the advisory result can be withheld.
          </p>
        </div>
        <div className="public-kernel-grid">
          {publicKernels.map((kernel) => (
            <article key={kernel.number}>
              <span>{kernel.number}</span>
              <h3>{kernel.shortName}</h3>
              <strong>{kernel.question}</strong>
              <p>{kernel.action}</p>
              <small>{kernel.value}</small>
            </article>
          ))}
        </div>
        <div className="public-kernel-boundary">
          <strong>Public description boundary</strong>
          <p>{publicKernelBoundary}</p>
          <a href="/evidence/#kernels">Read the plain-language assurance guide</a>
        </div>
      </section>

      <section className="boundary-section" id="boundaries">
        <div className="boundary-panel">
          <div className="boundary-intro">
            <div className="section-kicker section-kicker-light">
              Built for accountable use
            </div>
            <h2>Strong recommendations keep their evidence and limits attached.</h2>
            <p>
              SAGE is designed to make a manufacturing decision easier to
              inspect without hiding uncertainty or crossing into machine
              authority.
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

      <section className="roadmap-section" id="research">
        <div className="roadmap-label">
          <span>Research program</span>
          <small>
            Measurement, digital twins, relative pose, and surface integrity
          </small>
        </div>
        <div className="roadmap-content">
          <div>
            <h2>Build the measurement science behind trustworthy machining intelligence.</h2>
            <p>
              SAGE&apos;s research program connects simulation fidelity,
              machine/tool/material transfer, uncertainty and abstention,
              traceable surface texture, interoperable evidence, and human
              review. A current public prospectus and NIST collaboration path
              are summarized in the research hub.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="/research/">
                Explore the research program
                <ArrowIcon />
              </a>
              <a className="button button-secondary" href="/evidence/">
                Audit the evidence
              </a>
            </div>
          </div>
          <ol>
            <li>
              <span>01</span>
              Traceable machining and surface measurements
            </li>
            <li>
              <span>02</span>
              Digital-twin verification, validation, and uncertainty
            </li>
            <li>
              <span>03</span>
              Machine, tool, material, geometry, pose, and time transfer
            </li>
            <li>
              <span>04</span>
              Force-aware relative pose for robotic machining
            </li>
            <li>
              <span>05</span>
              Evidence exchange and non-actuating shadow pilots
            </li>
          </ol>
        </div>
      </section>

      <section className="partner-section" id="contact">
        <div className="partner-grid" aria-hidden="true" />
        <div className="partner-copy">
          <div className="section-kicker section-kicker-light">
            Design-partner conversations
          </div>
          <h2>Bring a difficult planning problem to the conversation.</h2>
          <p>
            SAGE is seeking precision manufacturers, CNC programmers,
            applications engineers, research partners, and technical teams who
            want to evaluate an evidence-linked planning workflow in shadow
            mode.
          </p>
        </div>
        <div className="partner-actions">
          <a
            className="button button-light"
            href="mailto:dkohlkat@gmail.com?subject=SAGE%20Suite%20shadow%20pilot"
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
