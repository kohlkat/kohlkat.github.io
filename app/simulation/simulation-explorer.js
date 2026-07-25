"use client";

import { useMemo, useState } from "react";
import simulationRun from "../../public/data/sage-public-simulation-v1.json";
import styles from "./simulation.module.css";

const chartWidth = 1040;
const chartHeight = 420;
const chartPadding = { top: 34, right: 34, bottom: 48, left: 74 };
const pageSize = 12;
const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const seriesOptions = [
  {
    id: "vibration",
    label: "Vibration proxy",
    field: "vibration_proxy_g_rms",
    unit: "g RMS",
    minimum: 0,
    maximum: 1.2,
    digits: 3,
    color: "#19d7d0",
  },
  {
    id: "load",
    label: "Load proxy",
    field: "load_proxy_pct",
    unit: "%",
    minimum: 0,
    maximum: 80,
    digits: 2,
    color: "#b9f25d",
  },
  {
    id: "temperature",
    label: "Temperature proxy",
    field: "temperature_proxy_c",
    unit: "°C",
    minimum: 20,
    maximum: 42,
    digits: 2,
    color: "#ffc766",
  },
  {
    id: "spindle",
    label: "Spindle command",
    field: "spindle_command_rpm",
    unit: "RPM",
    minimum: 0,
    maximum: 8500,
    digits: 0,
    color: "#8db7ff",
  },
  {
    id: "feed",
    label: "Feed command",
    field: "feed_command_mm_min",
    unit: "mm/min",
    minimum: 0,
    maximum: 700,
    digits: 0,
    color: "#e5a9ff",
  },
];

const stageColors = {
  startup: "rgba(25, 215, 208, 0.08)",
  steady_cut: "rgba(255, 255, 255, 0.025)",
  feed_step: "rgba(185, 242, 93, 0.08)",
  disturbance: "rgba(255, 199, 102, 0.13)",
  recovery: "rgba(25, 215, 208, 0.045)",
};

function titleCase(value) {
  return value
    .split("_")
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function formatValue(value, digits) {
  if (value === null) return "— unmeasured";
  return Number(value).toFixed(digits);
}

function buildStateSegments(observations) {
  const segments = [];
  for (const observation of observations) {
    const current = segments.at(-1);
    if (current?.state === observation.advisory_state) {
      current.end = observation.time_s;
    } else {
      segments.push({
        state: observation.advisory_state,
        start: observation.time_s,
        end: observation.time_s,
      });
    }
  }
  return segments;
}

export default function SimulationExplorer() {
  const [seriesId, setSeriesId] = useState("vibration");
  const [selectedIndex, setSelectedIndex] = useState(82);
  const [tablePage, setTablePage] = useState(0);
  const series =
    seriesOptions.find((option) => option.id === seriesId) ?? seriesOptions[0];
  const selected = simulationRun.observations[selectedIndex];
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const xPosition = (timeSeconds) =>
    chartPadding.left +
    (timeSeconds / (simulationRun.summary.sample_count - 1)) * plotWidth;
  const yPosition = (value) =>
    chartPadding.top +
    (1 - (value - series.minimum) / (series.maximum - series.minimum)) *
      plotHeight;
  const seriesPath = useMemo(
    () =>
      simulationRun.observations
        .map((observation, index) => {
          const command = index === 0 ? "M" : "L";
          return `${command}${xPosition(observation.time_s).toFixed(
            2,
          )},${yPosition(observation[series.field]).toFixed(2)}`;
        })
        .join(" "),
    [series],
  );
  const stateSegments = useMemo(
    () => buildStateSegments(simulationRun.observations),
    [],
  );
  const pageCount = Math.ceil(
    simulationRun.observations.length / pageSize,
  );
  const tableRows = simulationRun.observations.slice(
    tablePage * pageSize,
    (tablePage + 1) * pageSize,
  );
  const yTicks = Array.from({ length: 5 }, (_, index) =>
    Number(
      (
        series.minimum +
        ((series.maximum - series.minimum) * index) / 4
      ).toFixed(series.digits),
    ),
  );
  const threshold =
    series.id === "vibration"
      ? simulationRun.public_demo_policy.threshold
      : null;

  function selectTime(timeSeconds) {
    const nextIndex = Math.max(
      0,
      Math.min(simulationRun.observations.length - 1, Math.round(timeSeconds)),
    );
    setSelectedIndex(nextIndex);
    setTablePage(Math.floor(nextIndex / pageSize));
  }

  return (
    <section className={styles.explorer} aria-labelledby="explorer-heading">
      <div className={styles.sectionHeading}>
        <div>
          <div className="section-kicker">Interactive evidence explorer</div>
          <h2 id="explorer-heading">Every sample stays inspectable.</h2>
        </div>
        <p>
          Switch signals, scrub the timeline, inspect the advisory state, and
          verify the intentionally unmeasured Ra field. Nothing on this page is
          a physical-machine observation.
        </p>
      </div>

      <div className={styles.explorerShell}>
        <div className={styles.seriesControls} aria-label="Chart signal">
          {seriesOptions.map((option) => (
            <button
              className={
                option.id === series.id ? styles.seriesButtonActive : undefined
              }
              key={option.id}
              type="button"
              aria-pressed={option.id === series.id}
              onClick={() => setSeriesId(option.id)}
            >
              <span style={{ background: option.color }} />
              {option.label}
            </button>
          ))}
        </div>

        <div className={styles.chartFrame}>
          <div className={styles.chartMeta}>
            <div>
              <span>Selected signal</span>
              <strong>
                {series.label} · {series.unit}
              </strong>
            </div>
            <span className={styles.simulatedBadge}>SIMULATED · 0 OBSERVED</span>
          </div>
          <p className={styles.mobileChartHint}>
            Scroll the chart horizontally; use the sample control below to
            change time.
          </p>
          <div
            className={styles.chartViewport}
            tabIndex="0"
            aria-label="Scrollable simulation chart"
          >
            <svg
              className={styles.chart}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              role="img"
              aria-labelledby="explorer-chart-title explorer-chart-description"
            >
              <title id="explorer-chart-title">
                {`${series.label} across the public 120-second simulation`}
              </title>
              <desc id="explorer-chart-description">
                {`A synthetic ${series.label.toLowerCase()} trace across startup, steady cut, feed step, injected disturbance, and recovery. Use the range input below for an accessible sample-by-sample readout.`}
              </desc>
              {simulationRun.stages.map((stage) => {
                const start = xPosition(stage.start_s);
                const end = xPosition(Math.min(stage.end_s + 1, 119));
                return (
                  <rect
                    key={stage.id}
                    x={start}
                    y={chartPadding.top}
                    width={Math.max(0, end - start)}
                    height={plotHeight}
                    fill={stageColors[stage.id]}
                  />
                );
              })}
              {yTicks.map((tick) => (
                <g key={tick}>
                  <line
                    x1={chartPadding.left}
                    x2={chartWidth - chartPadding.right}
                    y1={yPosition(tick)}
                    y2={yPosition(tick)}
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <text
                    x={chartPadding.left - 13}
                    y={yPosition(tick) + 4}
                    textAnchor="end"
                    fill="rgba(255,255,255,0.55)"
                    fontSize="11"
                  >
                    {formatValue(tick, series.digits)}
                  </text>
                </g>
              ))}
              {[0, 20, 50, 70, 95, 119].map((tick) => (
                <g key={tick}>
                  <line
                    x1={xPosition(tick)}
                    x2={xPosition(tick)}
                    y1={chartPadding.top}
                    y2={chartHeight - chartPadding.bottom}
                    stroke="rgba(255,255,255,0.055)"
                  />
                  <text
                    x={xPosition(tick)}
                    y={chartHeight - 15}
                    textAnchor={
                      tick === 0 ? "start" : tick === 119 ? "end" : "middle"
                    }
                    fill="rgba(255,255,255,0.5)"
                    fontSize="11"
                  >
                    {tick} s
                  </text>
                </g>
              ))}
              {threshold !== null ? (
                <g>
                  <line
                    x1={chartPadding.left}
                    x2={chartWidth - chartPadding.right}
                    y1={yPosition(threshold)}
                    y2={yPosition(threshold)}
                    stroke="#ffc766"
                    strokeDasharray="8 7"
                    strokeWidth="1.5"
                  />
                  <text
                    x={chartWidth - chartPadding.right}
                    y={yPosition(threshold) - 9}
                    textAnchor="end"
                    fill="#ffc766"
                    fontSize="11"
                  >
                    0.85 g RMS public-demo threshold
                  </text>
                </g>
              ) : null}
              <path
                d={seriesPath}
                fill="none"
                stroke={series.color}
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <line
                x1={xPosition(selected.time_s)}
                x2={xPosition(selected.time_s)}
                y1={chartPadding.top}
                y2={chartHeight - chartPadding.bottom}
                stroke="rgba(255,255,255,0.7)"
                strokeDasharray="3 4"
              />
              <circle
                cx={xPosition(selected.time_s)}
                cy={yPosition(selected[series.field])}
                r="6"
                fill={series.color}
                stroke="#071115"
                strokeWidth="3"
              />
            </svg>
          </div>
          <p className={styles.chartAlternative}>
            Text alternative: {series.label} at {selected.time_s} seconds is{" "}
            {formatValue(selected[series.field], series.digits)} {series.unit}.
            Stage: {titleCase(selected.stage)}. Advisory state:{" "}
            {selected.advisory_state}.
          </p>
        </div>

        <div className={styles.scrubber}>
          <button
            type="button"
            onClick={() => selectTime(selectedIndex - 1)}
            disabled={selectedIndex === 0}
          >
            Previous
          </button>
          <label>
            <span>Selected time · {selected.time_s} seconds</span>
            <input
              type="range"
              min="0"
              max={simulationRun.observations.length - 1}
              value={selectedIndex}
              aria-label="Select simulation sample by time"
              aria-valuemin={0}
              aria-valuemax={simulationRun.observations.length - 1}
              aria-valuenow={selectedIndex}
              aria-valuetext={`${selected.time_s} seconds, ${titleCase(
                selected.stage,
              )}, ${selected.advisory_state}`}
              onChange={(event) => selectTime(Number(event.target.value))}
            />
          </label>
          <button
            type="button"
            onClick={() => selectTime(selectedIndex + 1)}
            disabled={selectedIndex === simulationRun.observations.length - 1}
          >
            Next
          </button>
        </div>

        <div className={styles.timelineBlock}>
          <div className={styles.timelineLabel}>
            <span>Process stage</span>
            <small>click a stage to jump</small>
          </div>
          <div className={styles.stageTimeline}>
            {simulationRun.stages.map((stage) => (
              <button
                key={stage.id}
                type="button"
                style={{
                  flexGrow: stage.end_s - stage.start_s + 1,
                  background: stageColors[stage.id],
                }}
                onClick={() => selectTime(stage.start_s)}
              >
                {titleCase(stage.id)}
                <small>
                  {stage.start_s}–{stage.end_s} s
                </small>
              </button>
            ))}
          </div>
          <div className={styles.timelineLabel}>
            <span>Public-demo advisory state</span>
            <small>not a safety state</small>
          </div>
          <div className={styles.stateTimeline}>
            {stateSegments.map((segment) => (
              <button
                key={`${segment.state}-${segment.start}`}
                className={
                  segment.state === "WITHHELD"
                    ? styles.stateWithheld
                    : styles.stateEligible
                }
                type="button"
                style={{ flexGrow: segment.end - segment.start + 1 }}
                onClick={() => selectTime(segment.start)}
              >
                {segment.state}
                <small>
                  {segment.start}–{segment.end} s
                </small>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.readout} aria-live="polite">
          <div className={styles.readoutLead}>
            <span>t = {selected.time_s} s</span>
            <strong>{titleCase(selected.stage)}</strong>
            <small>{selected.evidence_label} evidence</small>
          </div>
          <dl>
            <div>
              <dt>Spindle command</dt>
              <dd>
                {integerFormatter.format(selected.spindle_command_rpm)} RPM
              </dd>
            </div>
            <div>
              <dt>Feed command</dt>
              <dd>
                {integerFormatter.format(selected.feed_command_mm_min)} mm/min
              </dd>
            </div>
            <div>
              <dt>Load proxy</dt>
              <dd>{selected.load_proxy_pct.toFixed(2)}%</dd>
            </div>
            <div>
              <dt>Vibration proxy</dt>
              <dd>{selected.vibration_proxy_g_rms.toFixed(3)} g RMS</dd>
            </div>
            <div>
              <dt>Temperature proxy</dt>
              <dd>{selected.temperature_proxy_c.toFixed(2)} °C</dd>
            </div>
            <div>
              <dt>Surface roughness Ra</dt>
              <dd>— unmeasured (null)</dd>
            </div>
            <div>
              <dt>Advisory state</dt>
              <dd>{selected.advisory_state} · demo rule only</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <div>
            <div className="section-kicker">Raw public artifact</div>
            <h3>All 120 simulated samples</h3>
          </div>
          <div className={styles.tablePaging}>
            <button
              type="button"
              disabled={tablePage === 0}
              onClick={() => setTablePage((page) => page - 1)}
            >
              Previous 12
            </button>
            <span>
              Page {tablePage + 1} of {pageCount}
            </span>
            <button
              type="button"
              disabled={tablePage === pageCount - 1}
              onClick={() => setTablePage((page) => page + 1)}
            >
              Next 12
            </button>
          </div>
        </div>
        <div
          className={styles.tableScroll}
          tabIndex="0"
          aria-label="Scrollable public simulation sample table"
        >
          <table>
            <caption>
              Rows {tablePage * pageSize + 1}–
              {Math.min((tablePage + 1) * pageSize, 120)} of 120. All rows are
              simulated; observed rows are zero.
            </caption>
            <thead>
              <tr>
                <th scope="col">t (s)</th>
                <th scope="col">Stage</th>
                <th scope="col">Spindle cmd (RPM)</th>
                <th scope="col">Feed cmd (mm/min)</th>
                <th scope="col">Load proxy (%)</th>
                <th scope="col">Vibration proxy (g RMS)</th>
                <th scope="col">Temperature proxy (°C)</th>
                <th scope="col">Ra (µm)</th>
                <th scope="col">Evidence</th>
                <th scope="col">Advisory</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((observation) => (
                <tr
                  key={observation.time_s}
                  className={
                    selected.time_s === observation.time_s
                      ? styles.selectedRow
                      : undefined
                  }
                >
                  <td>
                    <button
                      className={styles.rowSelect}
                      type="button"
                      aria-label={`Select sample at ${observation.time_s} seconds`}
                      aria-pressed={selected.time_s === observation.time_s}
                      onClick={() => selectTime(observation.time_s)}
                    >
                      {observation.time_s}
                    </button>
                  </td>
                  <td>{titleCase(observation.stage)}</td>
                  <td>{observation.spindle_command_rpm}</td>
                  <td>{observation.feed_command_mm_min}</td>
                  <td>{observation.load_proxy_pct.toFixed(2)}</td>
                  <td>{observation.vibration_proxy_g_rms.toFixed(3)}</td>
                  <td>{observation.temperature_proxy_c.toFixed(2)}</td>
                  <td>— null</td>
                  <td>{observation.evidence_label}</td>
                  <td>{observation.advisory_state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
