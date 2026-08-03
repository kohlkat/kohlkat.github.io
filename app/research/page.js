import {
  publicFusionDocumentDownload,
  publicFusionSummary,
  publicSimulationSummary,
  publicSurfaceDocumentDownload,
  publicSurfaceSummary,
} from "../../lib/public-results";
import { siteUrl } from "../../lib/site";
import { ArrowIcon, SiteFooter, SiteHeader } from "../site-chrome";
import styles from "./research.module.css";

export const metadata = {
  title: "Manufacturing Intelligence Research",
  description:
    "Explore SAGE Suite research in machining measurement, digital-twin VVUQ, surface integrity, force-aware relative pose, transfer, uncertainty, and non-actuating human review.",
  alternates: {
    canonical: "/research/",
  },
  openGraph: {
    title: "Manufacturing Intelligence Research | SAGE Suite",
    description:
      "SAGE research connects machining measurement, digital twins, surface integrity, force-aware relative pose, uncertainty, evidence exchange, and human review.",
    url: "/research/",
    type: "article",
  },
  twitter: {
    title: "Manufacturing Intelligence Research | SAGE Suite",
    description:
      "SAGE research connects machining measurement, digital twins, surface integrity, force-aware relative pose, uncertainty, evidence exchange, and human review.",
  },
};

const researchTracks = [
  {
    number: "01",
    title: "Traceable machining measurement",
    body:
      "Pair controller and spindle context with force, acceleration, temperature, acoustic context, tool state, and SI-traceable surface and dimensional measurements.",
  },
  {
    number: "02",
    title: "Digital-twin VVUQ",
    body:
      "Determine which decisions can rely on reduced-order models, articulation simulation, multi-sensor fusion under latency, higher-fidelity process models, or physical measurements—and keep each fidelity labeled.",
  },
  {
    number: "03",
    title: "Transfer and abstention",
    body:
      "Transfer the twin method and review packet across jobs first; evaluate by held-out machine, tool, material, geometry, pose, and time—and withdraw when the evidence does not support the new context.",
  },
  {
    number: "04",
    title: "Force-aware relative pose",
    body:
      "Compare fixed-base, linear-rail, and tilt-rotary workholding arrangements while preserving reach, singularity, collision, and process boundaries.",
  },
  {
    number: "05",
    title: "Evidence exchange and review",
    body:
      "Bind alternatives, assumptions, applicability, uncertainty, independent checks, and human disposition in a portable non-actuating record.",
  },
];

const releaseChannels = [
  {
    title: "Engineering preprint",
    body:
      "A non-enabling methods paper through TechRxiv, with preprint status stated clearly.",
    href: "https://innovate.ieee.org/techrxiv/",
    label: "TechRxiv",
  },
  {
    title: "Versioned evidence record",
    body:
      "An immutable Zenodo record for the approved PDF, safe aggregate JSON, data dictionary, license, version, and checksums.",
    href:
      "https://help.zenodo.org/docs/deposit/describe-records/reserve-doi/",
    label: "Zenodo DOI guidance",
  },
  {
    title: "Peer-reviewed manufacturing venue",
    body:
      "A later paper targeted to an appropriate manufacturing, automation, or digital-twin journal after the paired study.",
    href:
      "https://www.asme.org/publications-submissions/journals/find-journal/journal-manufacturing-science-engineering",
    label: "ASME JMSE",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ResearchProject",
  name: "SAGE Manufacturing Intelligence Research",
  url: `${siteUrl}research/`,
  description:
    "Research in machining measurement, digital-twin VVUQ, surface integrity, force-aware relative pose, transfer, uncertainty, evidence exchange, and qualified human review.",
  founder: {
    "@type": "Person",
    name: "David Kohler",
    url: "https://www.linkedin.com/in/david-kohler22",
  },
  parentOrganization: {
    "@type": "Organization",
    name: "SAGE Suite",
    url: siteUrl,
  },
};

const structuredDataJson = JSON.stringify(structuredData).replace(
  /</g,
  "\\u003c",
);

export default function ResearchPage() {
  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredDataJson }}
      />
      <SiteHeader />

      <section className={styles.hero}>
        <div className={styles.heroGrid} aria-hidden="true" />
        <div>
          <div className="section-kicker section-kicker-light">
            SAGE research program
          </div>
          <h1>
            Build the measurement science behind
            <span>trustworthy machining decisions.</span>
          </h1>
          <p>
            SAGE research asks how software results become useful engineering
            evidence: connect simulation to measurements, show uncertainty and
            missing information, test whether a result carries to another job,
            and keep the final decision with a qualified person.
          </p>
          <div className={styles.heroActions}>
            <a className="button button-light" href="#program">
              Explore the program
              <ArrowIcon />
            </a>
            <a className={styles.heroLink} href="/evidence/">
              Review current evidence
            </a>
          </div>
        </div>
        <div className={styles.heroFacts}>
          <div>
            <strong>
              {publicSimulationSummary.programCount.toLocaleString()}
            </strong>
            <span>SIMULATED NVIDIA programs</span>
          </div>
          <div>
            <strong>
              {publicFusionSummary.stressEpisodes.toLocaleString()}
            </strong>
            <span>SIMULATED sensor-delay episodes</span>
          </div>
          <div>
            <strong>
              {publicSimulationSummary.medianReductionPercent.toFixed(1)}%
            </strong>
            <span>median modeled score reduction vs. baseline</span>
          </div>
          <div>
            <strong className={styles.surfaceRange}>
              {publicSurfaceSummary.lowerMedianUm.toFixed(2)}–
              {publicSurfaceSummary.upperMedianUm.toFixed(2)}
            </strong>
            <span>µm modeled finish range · not measured</span>
          </div>
          <div>
            <strong>0</strong>
            <span>physical-machine claims made by these results</span>
          </div>
        </div>
      </section>

      <section className={styles.program} id="program">
        <div className={styles.sectionHeading}>
          <div>
            <div className="section-kicker">Research program</div>
            <h2>One question: when should a machining recommendation be trusted?</h2>
          </div>
          <p>
            Accuracy in one software test is not enough. Trust also requires
            traceable measurements, clear simulation limits, tests on new jobs,
            honest uncertainty, separate checks, and the ability to say “there
            is not enough evidence.”
          </p>
        </div>
        <div className={styles.trackGrid}>
          {researchTracks.map((track) => (
            <article key={track.number}>
              <span>{track.number}</span>
              <h3>{track.title}</h3>
              <p>{track.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.currentEvidence}>
        <div className={styles.evidenceCopy}>
          <div className="section-kicker section-kicker-light">
            Current public evidence
          </div>
          <h2>Working simulation software—with its limits still attached.</h2>
          <p>
            The NVIDIA campaign reconciles{" "}
            {publicSimulationSummary.archiveCount} verified archives and{" "}
            {publicSimulationSummary.programCount.toLocaleString()} unique
            Isaac Sim robot programs across{" "}
            {publicSimulationSummary.scenarioCellCount} shape/material cells.
            Every program lowered its own same-simulator composite synthetic
            objective.
          </p>
          <p>
            The multi-sensor fusion twin adds{" "}
            {publicFusionSummary.stressEpisodes.toLocaleString()} latency-stressed
            episodes across {publicFusionSummary.workerRuns} recorded worker runs so
            suite choices can be ranked before hardware is fixed. Methods
            transfer as decision support; physical transfer remains unclaimed.
          </p>
          <p>
            Runtimes combine NVIDIA robot articulation, mechanistic cutting
            loads, synthesized vibration, and asynchronous sensor fusion. All
            layers are labeled SIMULATED and remain non-actuating.
          </p>
          <a className="button button-light" href="/#simulation">
            See the campaign results
            <ArrowIcon />
          </a>
          {" "}
          <a className="button button-secondary" href={publicFusionDocumentDownload} download>
            Download fusion twin JSON
          </a>
        </div>
        <div className={styles.surfaceCard}>
          <span>Surface-integrity retrospective</span>
          <strong>
            {publicSurfaceSummary.lowerMedianUm.toFixed(2)}–
            {publicSurfaceSummary.upperMedianUm.toFixed(2)} µm
          </strong>
          <h3>median finish-pass proxy interval</h3>
          <p>
            Derived from the NVIDIA-run feed, force, acceleration, and
            temperature trajectories. Historical corner radius was not
            recorded, so the analysis uses a disclosed sensitivity interval.
          </p>
          <div>
            <span>Evidence class</span>
            <strong>{publicSurfaceSummary.evidenceLabel}</strong>
          </div>
          <div>
            <span>Measurement status</span>
            <strong>Modeled, not measured Ra</strong>
          </div>
          <a href={publicSurfaceDocumentDownload} download>
            Download public aggregate JSON
          </a>
        </div>
      </section>

      <section className={styles.poseStudy} id="relative-pose-study">
        <div className={styles.poseStudyHeading}>
          <div>
            <div className="section-kicker">
              Proposed robotic-machining study
            </div>
            <h2>“Head-on” is a stiffness and geometry question.</h2>
          </div>
          <div>
            <span>Proposed · not current replay</span>
            <p>
              The research question is not whether a cutter should simply point
              straight into metal. It is whether the robot, workpiece, and tool
              can be arranged so the local surface and predicted cutting load
              meet a better-conditioned robot pose.
            </p>
          </div>
        </div>

        <div className={styles.poseTopologyGrid}>
          <article>
            <span>Reference</span>
            <h3>Fixed-base robot</h3>
            <p>
              Establish the same synthetic job and constraints used by the
              current fixed-base UR10e simulation replay.
            </p>
          </article>
          <article>
            <span>Robot moves</span>
            <h3>Seventh-axis linear rail</h3>
            <p>
              Reposition the robot base between cut regions to open stronger
              postures without claiming that the rail stiffens the arm itself.
            </p>
          </article>
          <article>
            <span>Part moves</span>
            <h3>Two-axis tilt-rotary positioner</h3>
            <p>
              Present the workpiece to the cutter while the robot remains in a
              better-conditioned part of its workspace.
            </p>
          </article>
        </div>

        <div className={styles.poseStudyBody}>
          <div>
            <h3>Same synthetic job, three cell topologies.</h3>
            <p>
              A force-aware relative-pose study would compare candidate
              tool-workpiece relationships on a consistent modeled basis. The
              review should keep each contributing constraint visible rather
              than reducing the answer to one unexplained score.
            </p>
            <ul>
              <li>Local surface orientation and tool-axis suitability</li>
              <li>
                Predicted cutting-load direction and pose-dependent stiffness
              </li>
              <li>
                Reach, joint limits, singularity distance, and collision margin
              </li>
              <li>
                Process limits, assumptions, alternatives, and abstention state
              </li>
            </ul>
          </div>
          <aside>
            <strong>Evidence boundary</strong>
            <p>
              This is a proposed simulation study. It is not a live ROS command
              path, a physical cut, or a measured efficiency result. The
              independent gate remains closed and a qualified person decides
              what advances.
            </p>
            <div className={styles.poseSources}>
              <span>Prior methods context</span>
              <a
                href="https://www.jstage.jst.go.jp/article/ijat/13/5/13_574/_article/-char/en"
                target="_blank"
                rel="noreferrer"
              >
                Tool-orientation optimization research
              </a>
              <a
                href="https://www.mdpi.com/2076-3417/9/6/1044"
                target="_blank"
                rel="noreferrer"
              >
                Workpiece-pose optimization research
              </a>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.nextStudy}>
        <div>
          <div className="section-kicker">Next scientific study</div>
          <h2>Pair simulation with traceable physical measurements.</h2>
        </div>
        <div>
          <p>
            The next study is designed around synchronized process context and
            measurement: controller and spindle data, force, acceleration,
            temperature, acoustic context where available, tool geometry and
            wear, runout and fixturing, plus traceable surface texture and
            dimensional results.
          </p>
          <ul>
            <li>Predeclare machine, tool, material, geometry, pose, and time holdouts.</li>
            <li>Measure uncertainty, calibration, abstention, and negative findings.</li>
            <li>Compare the modeled surface proxy with profilometer measurements.</li>
            <li>Keep the software in shadow mode with qualified human review.</li>
          </ul>
        </div>
      </section>

      <section className={styles.nistSection}>
        <div className={styles.sectionHeading}>
          <div>
            <div className="section-kicker">NIST collaboration path</div>
            <h2>Measurement, VVUQ, interoperability, and adoption belong together.</h2>
          </div>
          <p>
            SAGE is preparing a controlled collaboration concept aligned with
            NIST digital-twin, digital-thread, surface-texture, and trustworthy
            AI work. This site does not imply NIST review, funding, or
            endorsement.
          </p>
        </div>
        <div className={styles.nistGrid}>
          <article>
            <span>Cooperative research</span>
            <h3>CRADA or related collaboration</h3>
            <p>
              A route for joint confidential measurement, testbed, VVUQ, and
              standards work. A CRADA does not fund the collaborator.
            </p>
            <a
              href="https://www.nist.gov/tpo/cooperative-research-and-development-agreement-crada"
              target="_blank"
              rel="noreferrer"
            >
              NIST CRADA overview
            </a>
          </article>
          <article>
            <span>Small-business research</span>
            <h3>NIST SBIR when a topic matches</h3>
            <p>
              A Phase I path only when a released solicitation directly matches
              the proposed measurement and manufacturing scope.
            </p>
            <a
              href="https://www.nist.gov/tpo/small-business-innovation-research-program-sbir"
              target="_blank"
              rel="noreferrer"
            >
              NIST SBIR
            </a>
          </article>
          <article>
            <span>Manufacturing adoption</span>
            <h3>MEP partnership</h3>
            <p>
              A practical route for small- and medium-manufacturer pilots
              through an eligible MEP Center or consortium.
            </p>
            <a
              href="https://www.nist.gov/news-events/news/2026/05/nist-issues-notice-intent-upcoming-technology-accelerator-pilot-program"
              target="_blank"
              rel="noreferrer"
            >
              Technology Accelerator notice
            </a>
          </article>
        </div>
        <div className={styles.nistLinks}>
          <a
            href="https://www.nist.gov/programs-projects/digital-twins-advanced-manufacturing"
            target="_blank"
            rel="noreferrer"
          >
            Digital twins for advanced manufacturing
          </a>
          <a
            href="https://www.nist.gov/programs-projects/digital-thread-manufacturing"
            target="_blank"
            rel="noreferrer"
          >
            Digital thread for manufacturing
          </a>
          <a
            href="https://www.nist.gov/programs-projects/surface-texture-and-forensic-topography"
            target="_blank"
            rel="noreferrer"
          >
            Surface texture and topography
          </a>
          <a
            href="https://www.nist.gov/itl/ai-risk-management-framework"
            target="_blank"
            rel="noreferrer"
          >
            AI Risk Management Framework
          </a>
        </div>
      </section>

      <section className={styles.releaseSection}>
        <div className={styles.sectionHeading}>
          <div>
            <div className="section-kicker">Research release path</div>
            <h2>Publish useful methods without publishing the private implementation.</h2>
          </div>
          <p>
            The release sequence remains gated by registered patent counsel.
            Preprints establish a public record; they are not peer review.
          </p>
        </div>
        <div className={styles.releaseGrid}>
          {releaseChannels.map((channel) => (
            <article key={channel.title}>
              <h3>{channel.title}</h3>
              <p>{channel.body}</p>
              <a href={channel.href} target="_blank" rel="noreferrer">
                {channel.label}
              </a>
            </article>
          ))}
        </div>
        <div className={styles.publicBoundary}>
          <div>
            <strong>Appropriate for a reviewed public package</strong>
            <p>
              Problem framing, non-enabling workflow, public-source provenance,
              labeled aggregate simulation results, methods boundaries,
              prospective experiments, negative findings, and checksums.
            </p>
          </div>
          <div>
            <strong>Kept controlled</strong>
            <p>
              Source code, model weights, hyperparameters, objective weights,
              calibration internals, exact trust envelopes, proprietary
              curation logic, raw programs and geometry, customer data, and
              legal or patent material.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.contact}>
        <div>
          <div className="section-kicker section-kicker-light">
            Research and measurement partners
          </div>
          <h2>Help turn the simulation evidence into a traceable paired study.</h2>
          <p>
            SAGE is seeking manufacturing, metrology, digital-twin, surface
            integrity, standards, and research partners for a controlled,
            non-actuating collaboration.
          </p>
        </div>
        <a
          className="button button-light"
          href="mailto:dkohlkat@gmail.com?subject=SAGE%20research%20collaboration"
        >
          Start a research conversation
          <ArrowIcon />
        </a>
      </section>

      <SiteFooter />
    </main>
  );
}
