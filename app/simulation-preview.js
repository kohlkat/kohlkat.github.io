import {
  publicFusionDocumentDownload,
  publicFusionSummary,
  publicSimulationCells,
  publicSimulationDocumentDownload,
  publicSimulationObjectiveDescription,
  publicSimulationRuntimeDescription,
  publicSimulationSummary,
  publicSurfaceDescription,
  publicSurfaceDocumentDownload,
  publicSurfaceSummary,
} from "../lib/public-results";
import { ArrowIcon } from "./site-chrome";
import styles from "./simulation-preview.module.css";

const shapes = [
  ["circle_pocket", "Circle pocket"],
  ["rounded_rectangle_pocket", "Rounded rectangle"],
  ["slot_pocket", "Slot pocket"],
];

const materials = [
  ["aluminum_6061", "Aluminum 6061"],
  ["mild_steel", "Mild steel"],
  ["titanium_proxy", "Titanium proxy"],
];

const campaignSteps = [
  {
    number: "01",
    label: "What ran",
    body:
      "NVIDIA Isaac Sim moved a virtual robot through three pocket shapes and three material models.",
  },
  {
    number: "02",
    label: "What SAGE compared",
    body:
      "A shadow program is a software-only candidate. Each one was compared with its own starting version using the same combined modeled score.",
  },
  {
    number: "03",
    label: "What passed",
    body:
      "All program and source records matched across 659 verified result archives, also called shards.",
  },
  {
    number: "04",
    label: "What the surface layer adds",
    body:
      "A modeled finish estimate connects simulated feed, force, vibration, and temperature. It is not a physical roughness measurement (Ra).",
  },
  {
    number: "05",
    label: "What the fusion twin adds",
    body: `A virtual sensor study delayed combined data streams by 2× and 4× across ${publicFusionSummary.stressEpisodes.toLocaleString()} SIMULATED episodes to test whether conditions remained distinguishable.`,
  },
];

function findCell(shape, material) {
  return publicSimulationCells.find(
    (cell) => cell.shape === shape && cell.material === material,
  );
}

export default function SimulationPreview() {
  return (
    <section
      className={styles.section}
      id="simulation"
      aria-labelledby="simulation-results-heading"
    >
      <div className={styles.heading}>
        <div>
          <div className="section-kicker">Public evidence · SIMULATED</div>
          <h2 id="simulation-results-heading">
            What the software has tested so far.
          </h2>
        </div>
        <p>
          Two software campaigns compare candidate machining plans and delayed
          virtual sensor data. They are runnable, traceable experiments—not
          physical machining results. Every number below is SIMULATED and
          non-actuating; physical validation is separate.
        </p>
      </div>

      <div className={styles.resultGrid}>
        <article className={styles.featuredResult}>
          <div className={styles.resultTopline}>
            <span>Campaign median</span>
            <i>{publicSimulationSummary.evidenceLabel}</i>
          </div>
          <strong>
            {publicSimulationSummary.medianReductionPercent.toFixed(1)}%
          </strong>
          <h3>lower modeled score than baseline</h3>
          <p>
            The middle result across all{" "}
            {publicSimulationSummary.programCount.toLocaleString()} program
            comparisons. Lower is better only within this declared simulator
            scoring method.
          </p>
          <div className={styles.distribution}>
            <span>
              Middle 80%:{" "}
              {publicSimulationSummary.p10ReductionPercent.toFixed(1)}% to{" "}
              {publicSimulationSummary.p90ReductionPercent.toFixed(1)}%
            </span>
            <i>
              <b
                style={{
                  left: `${publicSimulationSummary.p10ReductionPercent}%`,
                  right: `${
                    100 - publicSimulationSummary.p90ReductionPercent
                  }%`,
                }}
              />
            </i>
          </div>
        </article>

        <article>
          <div className={styles.resultTopline}>
            <span>Campaign scale</span>
          </div>
          <strong>{publicSimulationSummary.programCount.toLocaleString()}</strong>
          <h3>software-only shadow programs</h3>
          <p>
            {publicSimulationSummary.programsWithLowerObjective.toLocaleString()}{" "}
            candidates scored below their own starting versions in the same
            simulator.
          </p>
        </article>

        <article>
          <div className={styles.resultTopline}>
            <span>Evidence integrity</span>
          </div>
          <strong>{publicSimulationSummary.archiveCount}</strong>
          <h3>verified result archives (shards)</h3>
          <p>
            A shard is one packaged batch of results. Program and source-record
            counts matched; final integrity status{" "}
            {publicSimulationSummary.integrityStatus}.
          </p>
        </article>

        <article>
          <div className={styles.resultTopline}>
            <span>Modeled finish context</span>
            <i>{publicSurfaceSummary.evidenceLabel}</i>
          </div>
          <strong>{publicSurfaceSummary.midpointMedianUm.toFixed(2)}</strong>
          <h3>modeled finish midpoint (µm)</h3>
          <p>
            Median assumption-bounded interval:{" "}
            {publicSurfaceSummary.lowerMedianUm.toFixed(2)}–
            {publicSurfaceSummary.upperMedianUm.toFixed(2)} µm. Modeled, not
            measured Ra.
          </p>
        </article>

        <article>
          <div className={styles.resultTopline}>
            <span>Multi-sensor twin</span>
            <i>{publicFusionSummary.evidenceLabel}</i>
          </div>
          <strong>
            {publicFusionSummary.stressEpisodes.toLocaleString()}
          </strong>
          <h3>SIMULATED sensor-delay episodes</h3>
          <p>
            Each episode combines virtual sensor streams. Across{" "}
            {publicFusionSummary.workerRuns} GPU workers and{" "}
            {publicFusionSummary.sensorCatalogSize} sensor categories, the mean
            identification score was {publicFusionSummary.x4IdentMean.toFixed(2)}
            at 4× modeled delay.{" "}
            <a href={publicFusionDocumentDownload} download>
              Download aggregate
            </a>
          </p>
        </article>
      </div>

      <div className={styles.coverageGrid}>
        <div className={styles.matrixPanel}>
          <div className={styles.panelHeader}>
            <div>
              <span>Campaign coverage</span>
              <h3>Every shape/material cell is represented.</h3>
            </div>
            <small>Cell value = program count</small>
          </div>
          <div
            className={styles.tableWrap}
            role="region"
            aria-label="Campaign coverage table"
            tabIndex={0}
          >
            <table>
              <thead>
                <tr>
                  <th scope="col">Shape</th>
                  {materials.map(([, label]) => (
                    <th scope="col" key={label}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shapes.map(([shape, shapeLabel]) => (
                  <tr key={shape}>
                    <th scope="row">{shapeLabel}</th>
                    {materials.map(([material, materialLabel]) => {
                      const cell = findCell(shape, material);

                      return (
                        <td key={material}>
                          <span
                            className={styles.matrixCell}
                            style={{ "--cell-strength": cell.strength }}
                          >
                            {cell.programs}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Titanium is explicitly a proxy material model. The public aggregate
            contains no private part geometry, command schedule, or customer
            telemetry.
          </p>
        </div>

        <div className={styles.campaignSteps}>
          {campaignSteps.map((step) => (
            <article key={step.number}>
              <span>{step.number}</span>
              <div>
                <h3>{step.label}</h3>
                <p>{step.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className={styles.showcaseGrid}>
        <figure className={styles.videoCard}>
          <video
            autoPlay
            controls
            loop
            muted
            playsInline
            poster="/media/sage-simulation-replay-poster-v4.jpg"
            preload="metadata"
            aria-describedby="simulation-replay-caption"
          >
            <source
              src="/media/sage-simulation-replay-v4.mp4"
              type="video/mp4"
            />
            <track
              default
              kind="captions"
              src="/media/sage-simulation-replay-captions-v4.vtt"
              srcLang="en"
              label="English"
            />
            Your browser cannot play the simulation replay.{" "}
            <a href="/media/sage-simulation-replay-v4.mp4">
              Open the MP4 directly.
            </a>
          </video>
          <figcaption id="simulation-replay-caption">
            <strong>CNC + robot teaching showcase (SIMULATED)</strong>
            <span>
              Public-safe showcase with tool–stock cutting contact, progressive
              cut reveal, and metal lighting. Non-actuating; independent physical
              gate closed. Public SIMULATED Isaac Sim capture; current-source
              recapture remains available for visual review.{" "}
              <a
                href="/media/sage-isaac-capture-manifest-v4.json"
                download
              >
                Inspect the capture manifest.
              </a>
            </span>
          </figcaption>
        </figure>

        <aside className={styles.explainer}>
          <span className={styles.explainerLabel}>How to read the result</span>
          <h3>Modeled progress with the evidence attached.</h3>
          <p>{publicSimulationObjectiveDescription}</p>
          <p>{publicSimulationRuntimeDescription}</p>
          <div className={styles.decision}>
            <span>Surface-integrity layer</span>
            <strong>
              {publicSurfaceSummary.lowerMedianUm.toFixed(2)}–
              {publicSurfaceSummary.upperMedianUm.toFixed(2)} µm median interval
            </strong>
            <p>{publicSurfaceDescription}</p>
          </div>
          <div className={styles.actions}>
            <a className="button button-primary" href="/evidence/">
              Read the evidence guide
              <ArrowIcon />
            </a>
            <a
              className="button button-secondary"
              href={publicSimulationDocumentDownload}
              download
            >
              Download campaign JSON
            </a>
            <a
              className="button button-secondary"
              href={publicSurfaceDocumentDownload}
              download
            >
              Download surface JSON
            </a>
          </div>
        </aside>
      </div>

      <p className={styles.methodNote}>
        Result boundary: the campaign shows repeatable within-simulator shadow
        optimization and evidence capture. It does not establish held-out policy
        generalization, measured cycle time, part quality, physical cutting, or
        safety performance.
      </p>
    </section>
  );
}
