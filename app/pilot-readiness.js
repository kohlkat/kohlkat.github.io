import { ArrowIcon } from "./site-chrome";
import styles from "./pilot-readiness.module.css";

const pilotSteps = [
  {
    number: "01",
    title: "Scope one representative job",
    body:
      "Choose one bounded part or part family, the current planning baseline, machine and tool constraints, and the evidence already available.",
  },
  {
    number: "02",
    title: "Compare in shadow",
    body:
      "SAGE structures the context and compares candidate plans on a declared modeled basis. Rejected options and evidence limits stay visible.",
  },
  {
    number: "03",
    title: "Review together",
    body:
      "A qualified engineer receives the alternatives, evidence, assumptions, limits, and independent-check disposition in one packet.",
  },
  {
    number: "04",
    title: "Decide the next step",
    body:
      "The final report preserves positive and negative findings so the team can stop, repeat offline, add measurements, or design a separate trial.",
  },
];

const partnerInputs = [
  "One representative job or part family",
  "Current plan and known constraints",
  "A designated engineering reviewer",
  "Written approval for the supplied data",
];

const sageOutputs = [
  "Structured baseline record",
  "Ranked candidate alternatives",
  "Evidence-linked review packet",
  "Disposition log and pilot report",
];

export default function PilotReadiness() {
  return (
    <section
      className={styles.section}
      id="pilot"
      aria-labelledby="pilot-heading"
    >
      <div className={styles.heading}>
        <div>
          <div className="section-kicker section-kicker-light">
            Shadow pilot · offline and non-actuating
          </div>
          <h2 id="pilot-heading">
            Start with one difficult job.
            <span>Prove the decision workflow before touching the machine.</span>
          </h2>
        </div>
        <div className={styles.intro}>
          <p>
            A SAGE pilot runs beside the planning process your team already
            trusts. No controller connection is required for the initial
            engagement.
          </p>
          <strong>
            One bounded question. One accountable packet. One human decision.
          </strong>
        </div>
      </div>

      <div className={styles.stepGrid}>
        {pilotSteps.map((step) => (
          <article key={step.number}>
            <span>{step.number}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>

      <div className={styles.exchange}>
        <div>
          <span>You bring</span>
          <ul>
            {partnerInputs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className={styles.exchangeArrow} aria-hidden="true">
          <span>Shadow review</span>
          <ArrowIcon />
        </div>
        <div>
          <span>SAGE returns</span>
          <ul>
            {sageOutputs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.boundary}>
        <div>
          <strong>Data and authority boundary</strong>
          <p>
            Customer files remain controlled. No cross-customer training or
            public case study occurs without written permission. Any physical
            trial is a separate protocol with independent safety controls and
            site authorization.
          </p>
        </div>
        <a
          className="button button-light"
          href="mailto:dkohlkat@gmail.com?subject=SAGE%20shadow%20pilot"
        >
          Scope a shadow pilot
          <ArrowIcon />
        </a>
      </div>
    </section>
  );
}
