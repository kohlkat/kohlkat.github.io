import { ArrowIcon } from "./site-chrome";
import styles from "./relative-pose-study.module.css";

const studyChecks = [
  {
    number: "01",
    title: "Align the contact",
    body:
      "Keep the cutter orientation appropriate to the local surface instead of forcing one arm posture across the entire part.",
  },
  {
    number: "02",
    title: "Protect directional stiffness",
    body:
      "Use the rail or positioner to avoid long-reach, near-singular, or highly compliant robot configurations under the expected cutting load.",
  },
  {
    number: "03",
    title: "Preserve the decision boundary",
    body:
      "Simulation compares candidate relative poses; independent feasibility checks and a qualified person still decide what advances.",
  },
];

function RelativePoseSchematic() {
  return (
    <svg
      className={styles.schematic}
      viewBox="0 0 1080 520"
      role="img"
      aria-labelledby="relative-pose-diagram-title relative-pose-diagram-description"
    >
      <title id="relative-pose-diagram-title">
        Two proposed robotic-machining cell arrangements
      </title>
      <desc id="relative-pose-diagram-description">
        A robot on a seventh-axis linear rail and a fixed robot facing a
        two-axis tilt-rotary workpiece positioner. Both arrangements seek a
        favorable tool, surface, and cutting-load relationship.
      </desc>
      <defs>
        <linearGradient id="cell-panel" x1="0" x2="1">
          <stop offset="0" stopColor="#0c1a20" />
          <stop offset="1" stopColor="#10252a" />
        </linearGradient>
        <marker
          id="cell-arrow"
          markerHeight="7"
          markerWidth="7"
          orient="auto"
          refX="6"
          refY="3.5"
        >
          <path d="M0 0 7 3.5 0 7Z" fill="#19d7d0" />
        </marker>
        <marker
          id="force-arrow"
          markerHeight="7"
          markerWidth="7"
          orient="auto"
          refX="6"
          refY="3.5"
        >
          <path d="M0 0 7 3.5 0 7Z" fill="#ffc766" />
        </marker>
      </defs>

      <rect x="1" y="1" width="1078" height="518" rx="18" fill="#071115" />
      <rect
        x="24"
        y="72"
        width="496"
        height="410"
        rx="12"
        fill="url(#cell-panel)"
        stroke="rgba(255,255,255,0.12)"
      />
      <rect
        x="560"
        y="72"
        width="496"
        height="410"
        rx="12"
        fill="url(#cell-panel)"
        stroke="rgba(255,255,255,0.12)"
      />

      <text x="24" y="38" className={styles.svgEyebrow}>
        ENGINEERING SCHEMATIC · PROPOSED STUDY
      </text>
      <text x="1035" y="38" textAnchor="end" className={styles.svgStatus}>
        NON-ACTUATING
      </text>

      <text x="52" y="112" className={styles.svgPanelLabel}>
        A · RAIL-ASSISTED ROBOT
      </text>
      <text x="588" y="112" className={styles.svgPanelLabel}>
        B · ARTICULATED WORKHOLDING
      </text>

      <line x1="70" y1="422" x2="438" y2="422" className={styles.rail} />
      <line x1="70" y1="442" x2="438" y2="442" className={styles.rail} />
      <rect x="122" y="397" width="120" height="58" rx="5" className={styles.machineBase} />
      <circle cx="182" cy="382" r="24" className={styles.robotJoint} />
      <path d="M182 382 205 303 277 247 347 268" className={styles.robotArm} />
      <circle cx="205" cy="303" r="14" className={styles.robotJoint} />
      <circle cx="277" cy="247" r="14" className={styles.robotJoint} />
      <circle cx="347" cy="268" r="12" className={styles.robotJoint} />
      <path d="M347 268 386 301" className={styles.tool} />
      <rect x="381" y="310" width="92" height="55" rx="4" className={styles.stock} />
      <path
        d="M99 474H419"
        className={styles.motionArrow}
        markerEnd="url(#cell-arrow)"
      />
      <text x="252" y="497" textAnchor="middle" className={styles.svgSmall}>
        7TH AXIS REPOSITIONS THE ROBOT BASE
      </text>
      <path
        d="M410 299 438 276"
        className={styles.forceArrow}
        markerEnd="url(#force-arrow)"
      />
      <text x="443" y="272" className={styles.svgForce}>
        F₍c₎
      </text>

      <rect x="612" y="398" width="108" height="57" rx="5" className={styles.machineBase} />
      <circle cx="666" cy="382" r="24" className={styles.robotJoint} />
      <path d="M666 382 690 306 752 250 822 269" className={styles.robotArm} />
      <circle cx="690" cy="306" r="14" className={styles.robotJoint} />
      <circle cx="752" cy="250" r="14" className={styles.robotJoint} />
      <circle cx="822" cy="269" r="12" className={styles.robotJoint} />
      <path d="M822 269 846 308" className={styles.tool} />

      <path d="M881 415 931 389 981 415 931 441Z" className={styles.positionerBase} />
      <path d="M893 388 931 369 969 388 931 407Z" className={styles.positionerTable} />
      <rect
        x="904"
        y="339"
        width="59"
        height="42"
        rx="4"
        transform="rotate(-10 933.5 360)"
        className={styles.stock}
      />
      <path
        d="M977 350A67 67 0 0 1 986 422"
        className={styles.motionArrow}
        markerEnd="url(#cell-arrow)"
      />
      <path
        d="M925 327 910 292"
        className={styles.motionArrow}
        markerEnd="url(#cell-arrow)"
      />
      <text x="1000" y="352" className={styles.svgAxis}>
        A
      </text>
      <text x="896" y="282" className={styles.svgAxis}>
        B
      </text>
      <path
        d="M908 331 888 302"
        className={styles.forceArrow}
        markerEnd="url(#force-arrow)"
      />
      <text x="866" y="296" className={styles.svgForce}>
        n₍s₎
      </text>
      <text x="808" y="486" textAnchor="middle" className={styles.svgSmall}>
        TILT + ROTATE THE WORKPIECE
      </text>

      <g className={styles.poseBadge}>
        <rect x="431" y="167" width="218" height="80" rx="8" />
        <text x="540" y="197" textAnchor="middle">
          RELATIVE-POSE REVIEW
        </text>
        <text x="540" y="222" textAnchor="middle">
          TOOL · SURFACE · LOAD
        </text>
      </g>
    </svg>
  );
}

export default function RelativePoseStudy() {
  return (
    <section
      className={styles.section}
      id="relative-pose"
      aria-labelledby="relative-pose-heading"
    >
      <div className={styles.heading}>
        <div>
          <div className="section-kicker">
            Robotic machining research · force-aware relative pose
          </div>
          <h2 id="relative-pose-heading">
            Move the robot or move the part—
            <span>keep the cut in a stronger pose.</span>
          </h2>
        </div>
        <div className={styles.intro}>
          <p>
            Industrial robot arms are not equally stiff in every direction or
            joint configuration. The same cut can load the arm very differently
            as reach, tool orientation, and the expected cutting-force direction
            change.
          </p>
          <p>
            SAGE&apos;s proposed study treats the robot, external axis,
            workpiece, and cut as one relative-pose problem.
          </p>
        </div>
      </div>

      <div className={styles.studyFrame}>
        <div className={styles.frameHeader}>
          <div>
            <span>Two candidate cell topologies</span>
            <strong>One engineering question: which side should move?</strong>
          </div>
          <span className={styles.proposedBadge}>Proposed · not current replay</span>
        </div>
        <RelativePoseSchematic />
        <div className={styles.optionGrid}>
          <article>
            <span>A</span>
            <div>
              <h3>Robot on a seventh-axis linear rail</h3>
              <p>
                Reposition the base between cut regions so the arm can avoid
                long-reach or weak configurations. The rail does not make the
                arm stiffer by itself; it gives the planner more ways to choose
                a favorable posture.
              </p>
            </div>
          </article>
          <article>
            <span>B</span>
            <div>
              <h3>Part on a two-axis tilt-rotary positioner</h3>
              <p>
                Present each surface to the cutter while keeping the robot in a
                better-conditioned portion of its workspace—similar in spirit
                to the rotary axes of a five-axis machining center.
              </p>
            </div>
          </article>
        </div>
      </div>

      <div className={styles.translation}>
        <strong>What “head-on” means here</strong>
        <p>
          Not blindly pointing straight into the metal. It means selecting a
          relative orientation that respects the local surface, tool axis, and
          expected cutting-load direction while avoiding weak poses,
          singularities, collisions, and process-limit violations.
        </p>
      </div>

      <div className={styles.checkGrid}>
        {studyChecks.map((check) => (
          <article key={check.number}>
            <span>{check.number}</span>
            <h3>{check.title}</h3>
            <p>{check.body}</p>
          </article>
        ))}
      </div>

      <div className={styles.boundary}>
        <div>
          <strong>Current status</strong>
          <p>
            The v3 video above is a fixed-base UR10e simulation capture. The
            rail and positioner comparison is a proposed next study, not a live
            ROS command path, physical-machining result, or measured efficiency
            claim.
          </p>
        </div>
        <a className="button button-light" href="/research/#relative-pose-study">
          See the proposed study
          <ArrowIcon />
        </a>
      </div>
    </section>
  );
}
