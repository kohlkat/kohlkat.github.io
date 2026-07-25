import simulationRun from "../public/data/sage-public-simulation-v1.json";
import { ArrowIcon } from "./site-chrome";
import styles from "./simulation-preview.module.css";

const chartWidth = 760;
const chartHeight = 270;
const chartPadding = { top: 24, right: 24, bottom: 34, left: 46 };
const maximumVibration = 1.2;

function xPosition(timeSeconds) {
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  return (
    chartPadding.left +
    (timeSeconds / (simulationRun.summary.sample_count - 1)) * plotWidth
  );
}

function yPosition(value) {
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  return (
    chartPadding.top +
    (1 - Math.min(value, maximumVibration) / maximumVibration) * plotHeight
  );
}

const vibrationPath = simulationRun.observations
  .map((observation, index) => {
    const command = index === 0 ? "M" : "L";
    return `${command}${xPosition(observation.time_s).toFixed(2)},${yPosition(
      observation.vibration_proxy_g_rms,
    ).toFixed(2)}`;
  })
  .join(" ");

const stageColors = {
  startup: "rgba(25, 215, 208, 0.08)",
  steady_cut: "rgba(255, 255, 255, 0.025)",
  feed_step: "rgba(185, 242, 93, 0.08)",
  disturbance: "rgba(255, 199, 102, 0.13)",
  recovery: "rgba(25, 215, 208, 0.045)",
};

export default function SimulationPreview() {
  const threshold = simulationRun.public_demo_policy.threshold;
  const thresholdY = yPosition(threshold);

  return (
    <section className={styles.section} id="simulation">
      <div className={styles.heading}>
        <div>
          <div className="section-kicker">See one example</div>
          <h2>Watch what the software is looking at.</h2>
        </div>
        <p>
          This public teaching trace shows how SAGE keeps a source row, an
          evidence label, a visible rule, and an unknown value together. It is
          simulated—not a result measured on a machine.
        </p>
      </div>

      <div className={styles.grid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <span>Vibration proxy</span>
              <strong>Injected disturbance · 70–94 s</strong>
            </div>
            <span className={styles.simulatedBadge}>SIMULATED</span>
          </div>
          <svg
            className={styles.chart}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            role="img"
            aria-labelledby="simulation-preview-title simulation-preview-description"
          >
            <title id="simulation-preview-title">
              Public simulated vibration proxy trace
            </title>
            <desc id="simulation-preview-description">
              A 120-second synthetic trace with an injected disturbance. Thirteen
              samples cross the disclosed 0.85 g RMS public-demo threshold.
            </desc>
            {simulationRun.stages.map((stage) => {
              const start = xPosition(stage.start_s);
              const end = xPosition(stage.end_s + 1);
              return (
                <rect
                  key={stage.id}
                  x={start}
                  y={chartPadding.top}
                  width={Math.max(0, end - start)}
                  height={
                    chartHeight - chartPadding.top - chartPadding.bottom
                  }
                  fill={stageColors[stage.id]}
                />
              );
            })}
            {[0, 0.4, 0.8, 1.2].map((tick) => (
              <g key={tick}>
                <line
                  x1={chartPadding.left}
                  x2={chartWidth - chartPadding.right}
                  y1={yPosition(tick)}
                  y2={yPosition(tick)}
                  stroke="rgba(255,255,255,0.1)"
                />
                <text
                  x={chartPadding.left - 10}
                  y={yPosition(tick) + 4}
                  textAnchor="end"
                  fill="rgba(255,255,255,0.5)"
                  fontSize="10"
                >
                  {tick.toFixed(1)}
                </text>
              </g>
            ))}
            <line
              x1={chartPadding.left}
              x2={chartWidth - chartPadding.right}
              y1={thresholdY}
              y2={thresholdY}
              stroke="#ffc766"
              strokeDasharray="7 6"
            />
            <text
              x={chartWidth - chartPadding.right}
              y={thresholdY - 8}
              textAnchor="end"
              fill="#ffc766"
              fontSize="10"
            >
              public-demo threshold · {threshold} g RMS
            </text>
            <path
              d={vibrationPath}
              fill="none"
              stroke="#19d7d0"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <text
              x={chartPadding.left}
              y={chartHeight - 8}
              fill="rgba(255,255,255,0.48)"
              fontSize="10"
            >
              0 s
            </text>
            <text
              x={chartWidth - chartPadding.right}
              y={chartHeight - 8}
              textAnchor="end"
              fill="rgba(255,255,255,0.48)"
              fontSize="10"
            >
              119 s
            </text>
          </svg>
          <p className={styles.chartNote}>
            The threshold and response are illustrative public-demo logic—not
            SAGE production policy or a machine-safety limit.
          </p>
        </div>

        <div className={styles.metrics}>
          <div className={styles.metric}>
            <span>Rows</span>
            <strong>{simulationRun.summary.sample_count}</strong>
            <small>one-second samples</small>
          </div>
          <div className={styles.metric}>
            <span>Evidence</span>
            <strong>{simulationRun.summary.simulated_sample_count} / 0</strong>
            <small>simulated / observed</small>
          </div>
          <div className={styles.metric}>
            <span>Demo response</span>
            <strong>{simulationRun.summary.withheld_sample_count}</strong>
            <small>samples withheld</small>
          </div>
          <div className={styles.metric}>
            <span>Ra values</span>
            <strong>0</strong>
            <small>unmeasured, kept null</small>
          </div>
          <a
            className={`button button-primary ${styles.explore}`}
            href="/evidence/#guided-replay"
          >
            Watch the guided replay
            <ArrowIcon />
          </a>
          <div className={styles.downloads}>
            <a href="/data/sage-public-simulation-v1.csv" download>
              CSV
            </a>
            <a href="/data/sage-public-simulation-v1.json" download>
              JSON
            </a>
            <a href="/data/SHA256SUMS.txt" download>
              SHA-256
            </a>
          </div>
          <p className={styles.downloadBoundary}>
            Public synthetic data · not field measurements
          </p>
        </div>
      </div>
    </section>
  );
}
