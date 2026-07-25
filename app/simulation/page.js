import simulationRun from "../../public/data/sage-public-simulation-v1.json";
import { siteUrl } from "../../lib/site";
import { ArrowIcon, SiteFooter, SiteHeader } from "../site-chrome";
import SimulationExplorer from "./simulation-explorer";
import styles from "./simulation.module.css";

export const metadata = {
  title: "Public Simulation Evidence",
  description:
    "Inspect, download, and reproduce a 120-row simulated CNC-like process trace with explicit unknowns, a disclosed public-demo advisory rule, and zero observed samples.",
  alternates: {
    canonical: "/simulation/",
  },
  openGraph: {
    title: "Public Simulation Evidence | SAGE Suite",
    description:
      "A reproducible 120-row simulated process trace with public data, hashes, methodology, and explicit limitations.",
    url: "/simulation/",
    type: "article",
  },
  twitter: {
    title: "Public Simulation Evidence | SAGE Suite",
    description:
      "A reproducible 120-row simulated process trace with public data, hashes, methodology, and explicit limitations.",
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
          <div className="section-kicker">Public evidence exhibit · v1</div>
          <h1>
            A simulation
            <span>you can audit.</span>
          </h1>
          <p>
            This is a deterministic, generic CNC-like process trace—not a
            screenshot and not a field-performance claim. Inspect every row,
            reproduce the generator, and verify the hashes.
          </p>
          <div className={styles.heroActions}>
            <a
              className="button button-primary"
              href="/data/sage-public-simulation-v1.csv"
              download
            >
              Download CSV
              <ArrowIcon />
            </a>
            <a
              className="button button-secondary"
              href="https://github.com/kohlkat/kohlkat.github.io/blob/main/scripts/generate-public-simulation.mjs"
              target="_blank"
              rel="noreferrer"
            >
              Read generator source
            </a>
          </div>
          <p className={styles.heroBoundary}>
            Public synthetic data only. Not field measurements.
          </p>
        </div>
        <div className={styles.heroMetrics}>
          <div>
            <span>Samples</span>
            <strong>{simulationRun.summary.sample_count}</strong>
            <small>one second apart</small>
          </div>
          <div>
            <span>Evidence mix</span>
            <strong>120 / 0</strong>
            <small>simulated / observed</small>
          </div>
          <div>
            <span>Stages</span>
            <strong>{simulationRun.summary.stage_count}</strong>
            <small>fully disclosed</small>
          </div>
          <div>
            <span>Demo withholds</span>
            <strong>{simulationRun.summary.withheld_sample_count}</strong>
            <small>threshold-derived rows</small>
          </div>
          <div>
            <span>Ra measurements</span>
            <strong>0</strong>
            <small>null in every row</small>
          </div>
        </div>
      </section>

      <section className={styles.disclaimer} aria-labelledby="disclaimer-title">
        <div>
          <span>Truth boundary</span>
          <h2 id="disclaimer-title">Public simulation evidence only.</h2>
        </div>
        <div>
          <p>
            This page shows <strong>120 one-second SIMULATED</strong> generic
            CNC-like samples generated by a public, reproducible script.{" "}
            <strong>Observed samples: 0.</strong>
          </p>
          <p>
            Values labeled <code>*_command_*</code> are synthetic command
            trajectories. Values labeled <code>*_proxy_*</code> are synthetic
            stand-ins, not calibrated sensor streams from a real machine.{" "}
            <code>surface_roughness_ra_um</code> is null and unmeasured in every
            row.
          </p>
          <p>
            The advisory eligibility rule is a public-demo illustration only:
            output is marked withheld when{" "}
            <code>vibration_proxy_g_rms &gt; 0.85</code>. It is not SAGE
            production policy, a machine-safety interlock, a certification
            criterion, or authorization to move or power equipment.
          </p>
          <p>
            This material makes no claim of optimization, accuracy, defect
            reduction, field validation, regulatory certification, machine
            safety, or actuation. Do not use these numbers for process
            qualification, acceptance testing, or shop-floor decisions.
          </p>
          <p>
            SAGE concepts are described here, not demonstrated as live
            industrial performance.
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
                href="https://github.com/kohlkat/kohlkat.github.io/blob/main/scripts/generate-public-simulation.mjs"
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
