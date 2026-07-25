"use client";

import { useEffect, useMemo, useState } from "react";
import simulationRun from "../../public/data/sage-public-simulation-v1.json";
import styles from "./evidence.module.css";

const stageNames = {
  startup: "Start-up",
  steady_cut: "Steady example cut",
  feed_step: "Feed-rate change",
  disturbance: "Injected disturbance",
  recovery: "Recovery",
};

const stagePlainLanguage = {
  startup: "The example spindle and feed commands rise from rest.",
  steady_cut: "The example commands hold mostly steady.",
  feed_step: "The example feed command increases.",
  disturbance: "The generator adds a visible synthetic disturbance.",
  recovery: "The synthetic disturbance fades.",
};

const chart = {
  width: 940,
  height: 230,
  left: 48,
  right: 20,
  top: 20,
  bottom: 38,
  max: 1.2,
};

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function percent(value, maximum) {
  if (!Number.isFinite(value) || maximum <= 0) return 0;
  return clamp(value / maximum, 0, 1);
}

function chartX(index) {
  const plotWidth = chart.width - chart.left - chart.right;
  return chart.left + (index / (simulationRun.observations.length - 1)) * plotWidth;
}

function chartY(value) {
  const plotHeight = chart.height - chart.top - chart.bottom;
  return chart.top + (1 - clamp(value / chart.max, 0, 1)) * plotHeight;
}

const vibrationPath = simulationRun.observations
  .map((row, index) => {
    const command = index === 0 ? "M" : "L";
    return `${command}${chartX(index).toFixed(2)},${chartY(
      row.vibration_proxy_g_rms,
    ).toFixed(2)}`;
  })
  .join(" ");

function MachineScene({ row, index }) {
  const progress = index / (simulationRun.observations.length - 1);
  const spindle = percent(row.spindle_command_rpm, 7200);
  const feed = percent(row.feed_command_mm_min, 850);
  const load = percent(row.load_proxy_pct, 100);
  const vibration = percent(row.vibration_proxy_g_rms, 1.2);
  const toolX = 170 + progress * 420;
  const stageOffset = {
    startup: -42,
    steady_cut: -12,
    feed_step: 18,
    disturbance: 38,
    recovery: 8,
  }[row.stage];
  const toolY = 225 + stageOffset;
  const chipCount = Math.round(load * 8);

  return (
    <svg
      className={styles.machineScene}
      viewBox="0 0 760 430"
      role="img"
      aria-labelledby="machine-scene-title machine-scene-description"
    >
      <title id="machine-scene-title">
        {`Illustrative CNC cell synchronized to simulation row ${index + 1}`}
      </title>
      <desc id="machine-scene-description">
        A generic browser illustration. Tool position and glow respond to the
        selected public simulation row. It is not machine geometry or a physical
        twin.
      </desc>
      <defs>
        <linearGradient id="scene-floor" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#11272f" />
          <stop offset="1" stopColor="#071216" />
        </linearGradient>
        <linearGradient id="scene-metal" x1="0" x2="1">
          <stop offset="0" stopColor="#d8e4e8" />
          <stop offset="0.5" stopColor="#7f969e" />
          <stop offset="1" stopColor="#40545b" />
        </linearGradient>
        <radialGradient id="scene-glow">
          <stop offset="0" stopColor="#b9f25d" stopOpacity="0.88" />
          <stop offset="1" stopColor="#19d7d0" stopOpacity="0" />
        </radialGradient>
        <filter id="scene-soft-glow">
          <feGaussianBlur stdDeviation={8 + vibration * 12} />
        </filter>
        <pattern id="scene-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#3b5963" strokeOpacity="0.22" />
        </pattern>
      </defs>

      <rect width="760" height="430" rx="22" fill="#071115" />
      <path d="M74 358 266 242h414L494 358Z" fill="url(#scene-floor)" />
      <path d="M74 358 266 242h414L494 358Z" fill="url(#scene-grid)" />

      <g opacity="0.88">
        <path d="M96 96h160v229H96z" fill="#10262e" stroke="#36535c" />
        <path d="M116 122h120v163H116z" fill="#071317" stroke="#2d4851" />
        <path d="M520 82h133v252H520z" fill="#0e2229" stroke="#36535c" />
        <path d="M539 110h95v122h-95z" fill="#071317" stroke="#2d4851" />
        <circle cx="586.5" cy="273" r="24" fill="#152f38" stroke="#5f7c86" />
        <circle cx="586.5" cy="273" r="8" fill="#19d7d0" opacity={0.3 + spindle * 0.7} />
      </g>

      <g>
        <path d="M176 310 286 254h278l-110 56Z" fill="#4b626a" />
        <path d="M176 310v48l278 1v-49Z" fill="#273c43" />
        <path d="m454 310 110-56v47l-110 58Z" fill="#182c33" />
        <g stroke="#9db0b6" strokeOpacity="0.28">
          {[0, 1, 2, 3, 4, 5].map((line) => (
            <path
              key={line}
              d={`M${222 + line * 46} 287 ${332 + line * 46} 287`}
            />
          ))}
        </g>
      </g>

      <g>
        <path d="M282 272 360 232l145 1-77 40Z" fill="#cbd7da" />
        <path d="M282 272v38l146 1v-38Z" fill="#82969c" />
        <path d="m428 273 77-40v38l-77 40Z" fill="#52676d" />
        <path
          d="M298 258 374 220h116"
          fill="none"
          stroke="#19d7d0"
          strokeDasharray="5 8"
          strokeOpacity="0.7"
        />
      </g>

      <circle
        cx={toolX}
        cy={toolY + 34}
        r={42 + vibration * 32}
        fill="url(#scene-glow)"
        opacity={0.22 + vibration * 0.42}
        filter="url(#scene-soft-glow)"
      />

      <g transform={`translate(${toolX} ${toolY})`}>
        <path d="M-23-140h46v83H-23z" fill="#1b343d" stroke="#53717b" />
        <path d="M-17-57h34v72h-34z" fill="url(#scene-metal)" />
        <path d="M-8 15h16v56H-8z" fill="#b9c8cc" />
        <path d="m-7 71 7 16 7-16Z" fill="#b9f25d" />
        <ellipse
          cx="0"
          cy="-18"
          rx={20 + spindle * 4}
          ry={5 + spindle * 2}
          fill="none"
          stroke="#19d7d0"
          strokeOpacity={0.2 + spindle * 0.8}
          strokeWidth="2"
          strokeDasharray={`${3 + spindle * 5} 5`}
        />
      </g>

      <g fill="#ffc766" opacity={0.3 + load * 0.7}>
        {Array.from({ length: chipCount }, (_, chip) => {
          const angle = chip * 0.82 + progress * 12;
          const radius = 23 + chip * 5 + feed * 10;
          const x = toolX + Math.cos(angle) * radius;
          const y = toolY + 79 + Math.sin(angle) * radius * 0.35;
          return (
            <path
              key={chip}
              d={`M${x} ${y} q${5 + feed * 7} -${4 + vibration * 8} ${
                10 + load * 6
              } 1`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}
      </g>

      <g className={styles.sceneLabels}>
        <text x="113" y="116">GENERIC CELL</text>
        <text x="538" y="104">ADVISORY VIEW</text>
        <text x="32" y="404">ILLUSTRATIVE GEOMETRY · SIMULATED SOURCE ROW</text>
      </g>
    </svg>
  );
}

export default function EvidenceLab() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const rows = simulationRun.observations;
  const row = rows[index];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setReducedMotion(mediaQuery.matches);
      if (mediaQuery.matches) setPlaying(false);
    };

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!playing || reducedMotion) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1 >= rows.length ? 0 : current + 1));
    }, 125);
    return () => window.clearInterval(timer);
  }, [playing, reducedMotion, rows.length]);

  const metrics = useMemo(
    () => [
      {
        label: "Spindle speed",
        value: `${Math.round(row.spindle_command_rpm).toLocaleString()} RPM`,
        note: "Synthetic rotation command",
      },
      {
        label: "Feed rate",
        value: `${Math.round(row.feed_command_mm_min)} mm/min`,
        note: "Synthetic advance command",
      },
      {
        label: "Load proxy",
        value: `${row.load_proxy_pct.toFixed(1)}%`,
        note: "Illustrative stand-in",
      },
      {
        label: "Vibration proxy",
        value: `${row.vibration_proxy_g_rms.toFixed(3)} g RMS`,
        note: "Synthetic waveform summary",
      },
    ],
    [row],
  );

  const markerX = chartX(index);
  const markerY = chartY(row.vibration_proxy_g_rms);
  const thresholdY = chartY(simulationRun.public_demo_policy.threshold);

  return (
    <div className={styles.labGrid}>
      <section className={styles.scenePanel} aria-labelledby="replay-heading">
        <div className={styles.panelHeader}>
          <div>
            <span className={styles.overline}>Guided browser replay</span>
            <h2 id="replay-heading">One simulation row, shown three ways.</h2>
          </div>
          <span className={styles.simulatedBadge}>SIMULATED</span>
        </div>
        <p className={styles.panelLead}>
          The picture, numbers, and chart all read the same public row. Changing
          the slider changes all three together. That is what
          “source-synchronized” means here.
        </p>

        <div className={styles.sceneFrame}>
          <MachineScene row={row} index={index} />
          <div
            className={`${styles.sceneState} ${
              row.advisory_state === "WITHHELD" ? styles.withheld : ""
            }`}
          >
            <span>{stageNames[row.stage]}</span>
            <strong>{row.advisory_state}</strong>
          </div>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            onClick={() => {
              if (reducedMotion) {
                setPlaying(false);
                setIndex((current) =>
                  current + 1 >= rows.length ? 0 : current + 1,
                );
                return;
              }
              setPlaying((current) => !current);
            }}
            aria-pressed={reducedMotion ? undefined : playing}
          >
            {reducedMotion
              ? "Next row"
              : playing
                ? "Pause replay"
                : "Play replay"}
          </button>
          <button
            type="button"
            className={styles.secondaryControl}
            onClick={() => {
              setPlaying(false);
              setIndex(0);
            }}
          >
            Restart
          </button>
          <label>
            <span>
              Row {index + 1} of {rows.length} · {row.time_s} seconds
            </span>
            <input
              type="range"
              min="0"
              max={rows.length - 1}
              value={index}
              onChange={(event) => {
                setPlaying(false);
                setIndex(Number(event.target.value));
              }}
              aria-label="Choose a public simulation row"
            />
          </label>
        </div>

        <p className={styles.stageExplanation} aria-live="polite">
          <strong>{stageNames[row.stage]}:</strong>{" "}
          {stagePlainLanguage[row.stage]}
        </p>
      </section>

      <aside className={styles.readoutPanel} aria-label="Selected row details">
        <div className={styles.readoutIntro}>
          <span>What the selected row says</span>
          <strong>{row.advisory_state}</strong>
          <p>
            This demo marks a row withheld when its synthetic vibration proxy is
            above 0.85 g RMS. That is a teaching rule, not a safety limit or
            production policy.
          </p>
        </div>
        <div className={styles.readoutGrid}>
          {metrics.map((metric) => (
            <div key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.note}</small>
            </div>
          ))}
        </div>
        <div className={styles.unknownReadout}>
          <span>Surface roughness Ra</span>
          <strong>Unknown</strong>
          <p>
            It was not measured or generated, so the value stays null instead of
            becoming zero.
          </p>
        </div>
        <details className={styles.explainDetails}>
          <summary>What this picture leaves out</summary>
          <p>
            The geometry is generic. It is not a customer part, machine model,
            toolpath, collision study, calibrated sensor feed, Omniverse
            execution, or physical validation.
          </p>
        </details>
      </aside>

      <section className={styles.chartPanel} aria-labelledby="trace-heading">
        <div className={styles.chartHeading}>
          <div>
            <span className={styles.overline}>Same source · full 120 seconds</span>
            <h3 id="trace-heading">Synthetic vibration proxy</h3>
          </div>
          <p>
            The dot follows the selected row. The dashed line is the public-demo
            rule at 0.85 g RMS.
          </p>
        </div>
        <svg
          className={styles.traceChart}
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          role="img"
          aria-label="Synthetic vibration proxy across 120 one-second rows"
        >
          {[0, 0.4, 0.8, 1.2].map((tick) => (
            <g key={tick}>
              <line
                x1={chart.left}
                x2={chart.width - chart.right}
                y1={chartY(tick)}
                y2={chartY(tick)}
                className={styles.chartGridLine}
              />
              <text
                x={chart.left - 10}
                y={chartY(tick) + 4}
                textAnchor="end"
                className={styles.chartLabel}
              >
                {tick.toFixed(1)}
              </text>
            </g>
          ))}
          <line
            x1={chart.left}
            x2={chart.width - chart.right}
            y1={thresholdY}
            y2={thresholdY}
            className={styles.thresholdLine}
          />
          <path d={vibrationPath} className={styles.tracePath} />
          <line
            x1={markerX}
            x2={markerX}
            y1={chart.top}
            y2={chart.height - chart.bottom}
            className={styles.markerLine}
          />
          <circle cx={markerX} cy={markerY} r="7" className={styles.markerDot} />
          <text
            x={chart.left}
            y={chart.height - 10}
            className={styles.chartLabel}
          >
            0 s
          </text>
          <text
            x={chart.width - chart.right}
            y={chart.height - 10}
            textAnchor="end"
            className={styles.chartLabel}
          >
            119 s
          </text>
        </svg>
      </section>
    </div>
  );
}
