import { siteUrl } from "../lib/site";
import {
  publicKernelBoundary,
  publicKernels,
} from "../lib/public-kernels";
import {
  publicFusionSummary,
  publicSimulationSummary,
} from "../lib/public-results";
import PilotReadiness from "./pilot-readiness";
import RelativePoseStudy from "./relative-pose-study";
import SimulationPreview, { ReplayHero } from "./simulation-preview";
import { ArrowIcon, SiteFooter, SiteHeader } from "./site-chrome";

const deliverables = [
  {
    number: "01",
    title: "The whole job in one place",
    body:
      "Part intent, setup, machine, tooling, material, operations, constraints, and available evidence in one record your team can inspect.",
  },
  {
    number: "02",
    title: "Alternatives compared fairly",
    body:
      "Candidate manufacturing approaches tested on the same modeled basis, with the current plan and tradeoffs kept visible.",
  },
  {
    number: "03",
    title: "A review record with evidence",
    body:
      "Sources, assumptions, separate check results, limits, and unresolved questions stay attached to every recommendation.",
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
      "A qualified person receives the alternatives, modeled tradeoffs, limits, and each independent check's outcome and reason—not a black-box command.",
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
    title: "Non-actuating offline pilots",
    body:
      "Run beside the existing workflow, compare recommendations, and measure review value without commanding equipment.",
  },
];

const platformCapabilities = [
  {
    number: "01",
    title: "Job context",
    body:
      "A common description of the job, setup, machine, tooling, operations, constraints, and evidence.",
  },
  {
    number: "02",
    title: "Software test environments",
    body:
      "The same plan can move from fast engineering models to more detailed NVIDIA simulated cells, so alternatives are exercised before machine time is spent.",
  },
  {
    number: "03",
    title: "Decision support, not machine control",
    body:
      "Engineering rules, bounded search, and learned ranking help a person compare choices; they never receive machine authority.",
  },
  {
    number: "04",
    title: "Separate stop checks",
    body:
      "Independent checks challenge the evidence, fit, uncertainty, and approval state before anything can be exported for review.",
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
      "Recommendations retain their sources, assumptions, evidence class, and the outcome and reason from each independent check.",
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
        "Executable multi-fidelity digital twin ladder",
        "Simulation-backed candidate comparison",
        "Multi-sensor fusion under latency stress",
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
            SAGE · Software-Aware G-code Extension
          </div>
          <h1>
            Make every difficult cut
            <span>a decision you can defend.</span>
          </h1>
          <div className="hero-visual">
            <ReplayHero />
          </div>
          <p className="hero-lead">
            G-code is the instruction language that tells a CNC machine how to move.
            SAGE adds the job context that file leaves out, compares candidate
            plans in SIMULATED trials, and returns evidence, tradeoffs, and
            limits for qualified human review. It does not command equipment.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#how-it-works">
              See how SAGE works
              <ArrowIcon />
            </a>
            <a className="button button-secondary" href="#pilot">
              Discuss an offline pilot
            </a>
          </div>
          <div className="boundary-strip">
            <span>One job model</span>
            <span>Ranked alternatives</span>
            <span>Evidence-linked review</span>
            <span>Non-actuating</span>
          </div>
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
            connects that recipe to the machine, tools, material, constraints,
            and evidence your team needs to compare, challenge, and approve it.
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

      <section className="platform-section" id="digital-twin" aria-labelledby="digital-twin-heading">
        <div className="section-heading">
          <div>
            <div className="section-kicker">Software test environments</div>
            <h2 id="digital-twin-heading">
              Test the plan in software before spending machine time.
            </h2>
          </div>
          <p>
            A digital twin is a software test environment for a real process.
            SAGE uses several levels of simulation to expose weak assumptions
            and compare plans. The results support review; they do not control a
            physical machine.
          </p>
        </div>
        <div className="capability-grid">
          <article className="capability-card">
            <span className="card-number">01</span>
            <div>
              <h3>What has been run</h3>
              <p>
                {publicFusionSummary.stressEpisodes.toLocaleString()} SIMULATED
                sensor-and-network stress episodes across{" "}
                {publicFusionSummary.workerRuns} recorded worker runs, plus{" "}
                {publicSimulationSummary.programCount.toLocaleString()} NVIDIA
                shadow programs—software-only trials of candidate machining
                plans—with files and results tied together by recorded hashes.
              </p>
            </div>
          </article>
          <article className="capability-card">
            <span className="card-number">02</span>
            <div>
              <h3>What the tests can teach us</h3>
              <p>
                They show how plan rankings react to delayed sensor data and
                produce review packets that keep SIMULATED and OBSERVED evidence
                distinct. The physical safety gate stays closed.
              </p>
            </div>
          </article>
          <article className="capability-card">
            <span className="card-number">03</span>
            <div>
              <h3>What happened when data was delayed</h3>
              <p>
                The identification score asks how well combined virtual sensors
                distinguish the hidden condition inside the simulation; higher
                is better, and 0.4 is a study comparison line, not a physical
                safety limit. At 4× modeled transport latency, the mean score
                was {publicFusionSummary.x4IdentMean.toFixed(2)}. Low-scoring
                episodes still rose from{" "}
                {publicFusionSummary.x2FracBelow04Percent.toFixed(1)}% →{" "}
                {publicFusionSummary.x4FracBelow04Percent.toFixed(1)}%. That is a
                useful warning for future sensor planning, and it remains
                SIMULATED.
              </p>
            </div>
          </article>
          <article className="capability-card">
            <span className="card-number">04</span>
            <div>
              <h3>What does not transfer yet</h3>
              <p>
                Field-validated accuracy on your machine, certified safety, or
                guaranteed cycle-time and surface-quality improvement. Observed
                physical samples in this twin campaign:{" "}
                {publicFusionSummary.observedCount}.
              </p>
            </div>
          </article>
        </div>
        <div className="plain-boundary">
          Download the public fusion aggregate:{" "}
          <a href="/data/sage-public-fusion-worldsim-v1.json">
            sage-public-fusion-worldsim-v1.json
          </a>
          . Full campaign detail lives on{" "}
          <a href="/simulation/#fusion-twin">Simulation</a> and{" "}
          <a href="/evidence/">Evidence</a>.
        </div>
      </section>

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
            <h2>One job stays connected from first question to human review.</h2>
          </div>
          <p>
            Planning context, software tests, ranked alternatives, and separate
            checks all contribute to the same reviewable manufacturing decision.
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
            <h2>Turn promising software results into evidence people can trust.</h2>
            <p>
              The research program asks where simulation matches reality, where
              a result transfers to another job, and when SAGE should decline to
              recommend anything. The research hub summarizes the measurement
              plan, proposed robot/workholding study, and NIST collaboration
              path.
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
              Evidence exchange and non-actuating offline pilots
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
            want to evaluate an evidence-linked planning workflow offline,
            without connecting it to equipment.
          </p>
        </div>
        <div className="partner-actions">
          <a
            className="button button-light"
            href="mailto:dkohlkat@gmail.com?subject=SAGE%20Suite%20offline%20pilot"
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
