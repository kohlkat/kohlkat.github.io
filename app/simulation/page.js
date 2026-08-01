import simulationRun from "../../public/data/sage-public-simulation-v1.json";
import { evidenceTermsById } from "../../lib/public-evidence";
import {
  publicFusionDescription,
  publicFusionDocumentDownload,
  publicFusionSummary,
  publicSimulationDocumentDownload,
  publicSimulationSummary,
  publicSurfaceDocumentDownload,
  publicSurfaceSummary,
} from "../../lib/public-results";
import { siteUrl } from "../../lib/site";
import { ArrowIcon, SiteFooter, SiteHeader } from "../site-chrome";
import SimulationExplorer from "./simulation-explorer";
import styles from "./simulation.module.css";

export const metadata = {
  title: "Simulation Results and Data Explorer",
  description:
    "Review NVIDIA Isaac Sim shadow programs, multi-sensor digital-twin fusion stress results, modeled surface-integrity aggregate, and a reproducible browser teaching trace.",
  alternates: {
    canonical: "/simulation/",
  },
  openGraph: {
    title: "Simulation Results and Data Explorer | SAGE Suite",
    description:
      "Executable digital-twin evidence: NVIDIA shadow campaign, multi-sensor fusion under latency, surface-integrity aggregate, and public teaching trace.",
    url: "/simulation/",
    type: "article",
  },
  twitter: {
    title: "Simulation Results and Data Explorer | SAGE Suite",
    description:
      "Executable digital-twin evidence: NVIDIA shadow campaign, multi-sensor fusion under latency, surface-integrity aggregate, and public teaching trace.",
  },
};

const datasetStructuredData = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "SAGE Suite public simulated CNC-like process trace",
  description:
    "A deterministic 120-row public simulation with generic command trajectories, synthetic load, vibration, and temperature proxies, an intentionally unmeasured surface-roughness field, and a disclosed public-demo advisory rule.",
  url: `${siteUrl}simulation/`,
  creator: {
    "@type": "Organization",
    name: "SAGE Suite",
    url: siteUrl,
  },
  isAccessibleForFree: true,
  datePublished: "2026-07-25",
  temporalCoverage: "0/119 seconds",
  measurementTechnique:
    "Deterministic public simulation; no physical-machine observations",
  variableMeasured: [
    "spindle_command_rpm",
    "feed_command_mm_min",
    "load_proxy_pct",
    "vibration_proxy_g_rms",
    "temperature_proxy_c",
    "surface_roughness_ra_um (unmeasured/null)",
    "advisory_state (public-demo rule)",
  ],
  distribution: [
    {
      "@type": "DataDownload",
      encodingFormat: "text/csv",
      contentUrl: `${siteUrl}data/sage-public-simulation-v1.csv`,
    },
    {
      "@type": "DataDownload",
      encodingFormat: "application/json",
      contentUrl: `${siteUrl}data/sage-public-simulation-v1.json`,
    },
  ],
};

const datasetStructuredDataJson = JSON.stringify(datasetStructuredData).replace(
  /</g,
  "\\u003c",
);

const methodCards = [
  {
    number: "01",
    title: "Piecewise command trajectory",
    body: "Spindle and feed commands use a disclosed startup ramp, steady region, and feed step. They are synthetic commands—not measured machine speed or motion.",
  },
  {
    number: "02",
    title: "Generic process proxies",
    body: "Load uses simple command terms and a public injected disturbance. Vibration is the root-mean-square of a 64-sample synthetic waveform scaled by disclosed command and disturbance terms. Temperature uses a first-order lag.",
  },
  {
    number: "03",
    title: "One visible demo rule",
    body: "Advisory eligibility is marked WITHHELD only when the vibration proxy exceeds 0.85 g RMS. That threshold is illustrative and unrelated to production policy or machine safety.",
  },
  {
    number: "04",
    title: "Unknown remains unknown",
    body: "Surface roughness Ra is not generated or inferred. Every JSON value is null and every CSV cell is blank rather than a fabricated zero.",
  },
];

const simulationTermIds = [
  "cnc",
  "simulated",
  "observed",
  "proxy",
  "spindle-speed",
  "feed-rate",
  "g-rms",
  "surface-roughness",
  "null",
  "sha-256",
];

const simulationTerms = simulationTermIds.map(
  (termId) => evidenceTermsById[termId],
);

export default function SimulationPage() {
  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: datasetStructuredDataJson }}
      />
      <SiteHeader />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className="section-kicker">Digital twin evidence + public explorer</div>
          <h1>
            Twin results
            <span>you can inspect.</span>
          </h1>
          <p>
            Start with executable twin evidence:{" "}
            {publicSimulationSummary.programCount.toLocaleString()} NVIDIA
            Isaac Sim shadow programs and{" "}
            {publicFusionSummary.stressEpisodes.toLocaleString()} multi-sensor
            fusion stress episodes. Then open a separate 120-row teaching
            trace to inspect how commands, proxies, labels, and unknowns are
            presented.
          </p>
          <div className={styles.heroActions}>
            <a
              className="button button-primary"
              href={publicFusionDocumentDownload}
              download
            >
              Download fusion twin JSON
              <ArrowIcon />
            </a>
            <a
              className="button button-secondary"
              href={publicSimulationDocumentDownload}
              download
            >
              Download NVIDIA campaign JSON
            </a>
          </div>
          <p className={styles.heroBoundary}>
            SIMULATED, non-actuating evidence. No customer geometry or telemetry.
            Observed physical samples: 0.
          </p>
        </div>
        <div className={styles.heroMetrics}>
          <div>
            <span>NVIDIA programs</span>
            <strong>{publicSimulationSummary.programCount.toLocaleString()}</strong>
            <small>verified shadow comparisons</small>
          </div>
          <div>
            <span>Fusion twin episodes</span>
            <strong>
              {publicFusionSummary.stressEpisodes.toLocaleString()}
            </strong>
            <small>
              {publicFusionSummary.workerRuns} GPU workers · latency stress
            </small>
          </div>
          <div>
            <span>Campaign median</span>
            <strong>
              {publicSimulationSummary.medianReductionPercent.toFixed(1)}%
            </strong>
            <small>lower composite synthetic objective</small>
          </div>
          <div>
            <span>Verified archives</span>
            <strong>{publicSimulationSummary.archiveCount}</strong>
            <small>program and provenance records reconciled</small>
          </div>
          <div>
            <span>Coverage</span>
            <strong>{publicSimulationSummary.scenarioCellCount}</strong>
            <small>shape/material cells</small>
          </div>
          <div>
            <span>Modeled finish proxy</span>
            <strong>
              {publicSurfaceSummary.lowerMedianUm.toFixed(2)}–
              {publicSurfaceSummary.upperMedianUm.toFixed(2)}
            </strong>
            <small>µm median interval · not measured Ra</small>
          </div>
        </div>
      </section>

      <section className={styles.disclaimer} aria-labelledby="disclaimer-title">
        <div>
          <span>Three evidence layers</span>
          <h2 id="disclaimer-title">
            Twin campaigns, surface context, and a teaching replay.
          </h2>
        </div>
        <div>
          <p>
            Layer one is the completed NVIDIA campaign:{" "}
            <strong>
              {publicSimulationSummary.programCount.toLocaleString()} SIMULATED
              shadow programs
            </strong>{" "}
            and a retrospective surface-integrity proxy from their simulated
            feed, force, acceleration, and temperature trajectories.
          </p>
          <p>
            Layer two is the multi-sensor digital twin:{" "}
            <strong>
              {publicFusionSummary.stressEpisodes.toLocaleString()} SIMULATED
              fusion stress episodes
            </strong>{" "}
            across a {publicFusionSummary.sensorCatalogSize}-class catalog under
            2× and 4× transport latency. {publicFusionDescription}
          </p>
          <p>
            The browser explorer below is a separate{" "}
            <strong>120 one-second SIMULATED</strong> generic teaching trace.{" "}
            <strong>Observed samples: 0.</strong> Its command fields and proxy
            values are synthetic and its <code>surface_roughness_ra_um</code>{" "}
            field remains null.
          </p>
          <p>
            The advisory eligibility rule is a public-demo illustration only:
            output is marked withheld when{" "}
            <code>vibration_proxy_g_rms &gt; 0.85</code>. It is not SAGE
            production policy, a machine-safety interlock, a certification
            criterion, or authorization to move or power equipment.
          </p>
          <p>
            These campaigns establish executable twin software and same-simulator
            optimization with provenance. They are not measured Ra, physical
            material removal, field transfer proof, or a performance guarantee.
          </p>
          <a href={publicSurfaceDocumentDownload} download>
            Download the surface-integrity aggregate JSON
          </a>
          {" · "}
          <a href={publicFusionDocumentDownload} download>
            Download the fusion twin aggregate JSON
          </a>
        </div>
      </section>

      <section className={styles.methodSection} id="fusion-twin">
        <div className={styles.sectionHeading}>
          <div>
            <div className="section-kicker">Multi-sensor digital twin</div>
            <h2>Latency-stressed fusion you can rank before hardware.</h2>
          </div>
          <p>
            Random sensor suites fuse an asynchronous event stream while
            transport latency, dropout, and clock skew are injected. The twin is
            real software; the world it observes here is synthetic.
          </p>
        </div>
        <div className={styles.methodGrid}>
          <article>
            <span>01</span>
            <h3>Scale</h3>
            <p>
              {publicFusionSummary.workerRuns} GPU workers produced{" "}
              {publicFusionSummary.stressEpisodes.toLocaleString()} stress
              episodes over a {publicFusionSummary.sensorCatalogSize}-class
              sensor catalog (completed {publicFusionSummary.completedDate}).
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Latency curve</h3>
            <p>
              At 2× latency, mean identifiability is{" "}
              {publicFusionSummary.x2IdentMean.toFixed(3)} (p10{" "}
              {publicFusionSummary.x2IdentP10.toFixed(3)};{" "}
              {publicFusionSummary.x2FracBelow04Percent.toFixed(1)}% of episodes
              below 0.4). At 4×: mean{" "}
              {publicFusionSummary.x4IdentMean.toFixed(3)}, p10{" "}
              {publicFusionSummary.x4IdentP10.toFixed(3)},{" "}
              {publicFusionSummary.x4FracBelow04Percent.toFixed(1)}% below 0.4.
              Knee not reached.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>What transfers</h3>
            <p>
              {publicFusionSummary.whatTransfers.join(" ")} Top public suite
              class retains overall identifiability{" "}
              {publicFusionSummary.topSuiteIdent.toFixed(3)} (n≈4 suite
              instances—directional, not definitive).
            </p>
          </article>
          <article>
            <span>04</span>
            <h3>What does not</h3>
            <p>
              {publicFusionSummary.whatDoesNotTransfer.join(" ")} Evidence class:{" "}
              {publicFusionSummary.evidenceLabel}. Observed count:{" "}
              {publicFusionSummary.observedCount}.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.methodSection} id="browser-replay">
        <div className={styles.sectionHeading}>
          <div>
            <div className="section-kicker">Interactive teaching replay</div>
            <h2>Inspect the public data model row by row.</h2>
          </div>
          <p>
            This explorer is intentionally simple and reproducible. It teaches
            how SAGE keeps commands, modeled proxies, evidence labels, and
            unknown values distinct; it is not footage or raw data from the
            NVIDIA campaign.
          </p>
        </div>
      </section>

      <SimulationExplorer />

      <section className={styles.methodSection}>
        <div className={styles.sectionHeading}>
          <div>
            <div className="section-kicker">Transparent methodology</div>
            <h2>Simple enough to reproduce. Honest enough to challenge.</h2>
          </div>
          <p>
            The generator contains no SAGE production planner, estimator,
            model, threshold, customer record, machine program, or private
            schema. It is a standalone public teaching trace.
          </p>
        </div>
        <div className={styles.methodGrid}>
          {methodCards.map((method) => (
            <article key={method.number}>
              <span>{method.number}</span>
              <h3>{method.title}</h3>
              <p>{method.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.artifactSection}>
        <div className={styles.artifactPanel}>
          <div>
            <div className="section-kicker section-kicker-light">
              Reproducible artifacts
            </div>
            <h2>Download the evidence, not a marketing screenshot.</h2>
            <p>
              The CSV and JSON are generated from one committed script.
              `npm run check:simulation` rebuilds the expected bytes in memory
              and fails if a committed artifact drifts. These are public
              synthetic data, not field measurements. SAGE concepts are
              described, not demonstrated as live industrial performance. The
              0.85 g RMS threshold is public-demo-only; no optimization,
              accuracy, defect-reduction, validation, certification, safety,
              or actuation claim is made.
            </p>
            <div className={styles.artifactActions}>
              <a
                className="button button-light"
                href="/data/sage-public-simulation-v1.csv"
                download
              >
                CSV · 120 rows
              </a>
              <a
                className={styles.artifactLink}
                href="/data/sage-public-simulation-v1.json"
                download
              >
                JSON + metadata
              </a>
              <a
                className={styles.artifactLink}
                href="/data/SHA256SUMS.txt"
                download
              >
                SHA256SUMS
              </a>
              <a
                className={styles.artifactLink}
                href="https://github.com/kohlkat/sage-public-evidence/blob/main/scripts/generate-public-simulation.mjs"
                target="_blank"
                rel="noreferrer"
              >
                Generator source
              </a>
            </div>
          </div>
          <dl className={styles.hashList}>
            <div>
              <dt>Observation array SHA-256</dt>
              <dd>{simulationRun.observation_sha256}</dd>
            </div>
            <div>
              <dt>CSV SHA-256</dt>
              <dd>{simulationRun.csv_sha256}</dd>
            </div>
            <div>
              <dt>Generator SHA-256</dt>
              <dd>{simulationRun.generator_sha256}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className={styles.glossarySection} aria-labelledby="terms-heading">
        <div className={styles.sectionHeading}>
          <div>
            <div className="section-kicker">Terms used on this page</div>
            <h2 id="terms-heading">The field names, in ordinary language.</h2>
          </div>
          <p>
            The exact technical names stay visible for reproducibility. These
            definitions explain what each one means without assuming machining
            or statistics experience.
          </p>
        </div>
        <dl className={styles.glossaryGrid}>
          {simulationTerms.map((entry) => (
            <div key={entry.id}>
              <dt>{entry.term}</dt>
              <dd>{entry.definition}</dd>
            </div>
          ))}
        </dl>
        <a className={styles.glossaryLink} href="/evidence/#glossary">
          Open the complete evidence and statistics glossary
          <ArrowIcon />
        </a>
      </section>

      <section className={styles.limitations}>
        <div>
          <div className="section-kicker">What this does not show</div>
          <h2>Limits stay attached to the evidence.</h2>
        </div>
        <ul>
          {simulationRun.limitations.map((limitation) => (
            <li key={limitation}>{limitation}</li>
          ))}
          <li>
            This page does not execute SAGE production checks or demonstrate
            live industrial performance.
          </li>
        </ul>
      </section>

      <SiteFooter />
    </main>
  );
}
