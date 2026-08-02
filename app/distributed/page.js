import distributedDoc from "../../public/data/sage-public-distributed-learning-v3.json";
import {
  publicFusionSummary,
  publicFusionDocumentDownload,
  publicSimulationSummary,
  publicSimulationDocumentDownload,
} from "../../lib/public-results";
import { siteUrl } from "../../lib/site";
import { ArrowIcon, SiteFooter, SiteHeader } from "../site-chrome";
import styles from "../simulation/simulation.module.css";

export const metadata = {
  title: "Distributed Learning Simulations",
  description:
    "Public SIMULATED multi-worker teaching grid and aggregates for randomized-stock and unsupervised fusion world-sim campaigns — not physical multi-robot footage.",
  alternates: { canonical: "/distributed/" },
  openGraph: {
    title: "Distributed Learning Simulations | SAGE Suite",
    description:
      "Parallel randomized-stock teaching cells plus public aggregates from multi-worker SIMULATED campaigns.",
    url: "/distributed/",
    type: "article",
  },
};

const structured = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: distributedDoc.title,
  description: distributedDoc.exhibit.purpose,
  url: `${siteUrl}distributed/`,
  isAccessibleForFree: true,
  creator: { "@type": "Organization", name: "SAGE Suite", url: siteUrl },
}).replace(/</g, "\\u003c");

export default function DistributedPage() {
  const ref = distributedDoc.campaign_aggregates_referenced;
  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structured }}
      />
      <SiteHeader />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className="section-kicker">Distributed learning · SIMULATED</div>
          <h1>
            Many workers.
            <span>Randomized stock.</span>
          </h1>
          <p>
            This six-second SIMULATED NVIDIA Isaac Sim view shows 40 independent
            software workers exploring public randomized stock—the virtual
            starting block of material—in parallel. Each worker is one virtual
            cell, not a physical robot. The replay is non-actuating and sent no
            physical-machine commands.
          </p>
          <div className={styles.heroActions}>
            <a
              className="button button-primary"
              href="/data/sage-public-distributed-learning-v3.json"
              download
            >
              Download distributed JSON
              <ArrowIcon />
            </a>
            <a className="button button-secondary" href="/simulation/">
              Simulation explorer
            </a>
          </div>
          <p className={styles.heroBoundary}>
            SIMULATED · non-actuating · gate closed · observed physical samples:{" "}
            {distributedDoc.observed_count}
          </p>
        </div>
        <div className={styles.heroMetrics}>
          <div>
            <span>Teaching cells</span>
            <strong>{distributedDoc.exhibit.visual_workers}</strong>
            <small>{distributedDoc.exhibit.visual_layout}</small>
          </div>
          <div>
            <span>Shadow programs</span>
            <strong>{ref.nvidia_shadow_robot_programs.toLocaleString()}</strong>
            <small>NVIDIA aggregate (public JSON)</small>
          </div>
          <div>
            <span>Fusion episodes</span>
            <strong>{ref.fusion_stress_episodes.toLocaleString()}</strong>
            <small>{ref.fusion_worldsim_worker_runs} worker runs</small>
          </div>
        </div>
      </section>

      <section className={styles.methodSection}>
        <div className="section-kicker">Teaching grid</div>
        <h2>Multi-worker randomized stock</h2>
        <p>
          {distributedDoc.exhibit.visual_workers} virtual cells progress at
          different times using deterministic public stock seeds and circle,
          rounded-rectangle, or slot teaching shapes. This is a public-safe
          NVIDIA Isaac Sim capture, not private campaign footage and not
          measured cutting.
        </p>
        <div style={{ marginTop: 28, borderRadius: 16, overflow: "hidden" }}>
          <video
            controls
            playsInline
            preload="metadata"
            poster="/media/sage-distributed-learning-poster-v3.jpg"
            width={1280}
            height={720}
            style={{ width: "100%", height: "auto", display: "block" }}
            aria-label="SIMULATED distributed NVIDIA Isaac Sim teaching grid"
          >
            <source
              src="/media/sage-distributed-learning-v3.mp4"
              type="video/mp4"
            />
            <track
              kind="captions"
              src="/media/sage-distributed-learning-captions-v3.vtt"
              srcLang="en"
              label="English"
              default
            />
          </video>
        </div>
        <p className={styles.heroBoundary} style={{ marginTop: 12 }}>
          SIMULATED distributed teaching grid · not 40 physical robots · not
          measured material removal
        </p>
        <p className={styles.heroBoundary} style={{ marginTop: 8 }}>
          Background photo: {" "}
          <a href="https://commons.wikimedia.org/wiki/File:360-degree_Panorama_of_Machine_Shop_at_NOIRLab_(360Pano_Machine_room_2-CC).jpg">
            NOIRLab/NSF/AURA/T. Slovinský
          </a>{" "}
          · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
        </p>
      </section>

      <section className={styles.methodSection}>
        <div className="section-kicker">Campaign aggregates</div>
        <h2>Where the large numbers live</h2>
        <p>
          The grid is a readable teaching analogue of multi-bot fleets. Published
          aggregates on this site (not weights, not raw corpora):
        </p>
        <ul>
          <li>
            <strong>{publicSimulationSummary.programCount.toLocaleString()}</strong>{" "}
            NVIDIA shadow robot programs ·{" "}
            <strong>{publicSimulationSummary.archiveCount}</strong> verified
            archives
          </li>
          <li>
            <strong>
              {publicFusionSummary.stressEpisodes.toLocaleString()}
            </strong>{" "}
            multi-sensor fusion stress episodes ·{" "}
            <strong>{publicFusionSummary.workerRuns ?? ref.fusion_worldsim_worker_runs}</strong>{" "}
            worker runs
          </li>
        </ul>
        <div className={styles.artifactActions}>
          <a
            className="button button-secondary"
            href={publicFusionDocumentDownload}
            download
          >
            Fusion world-sim JSON
          </a>
          <a
            className="button button-secondary"
            href={publicSimulationDocumentDownload}
            download
          >
            NVIDIA shadow JSON
          </a>
          <a
            className="button button-secondary"
            href="/media/sage-distributed-learning-manifest-v3.json"
          >
            Media manifest
          </a>
        </div>
      </section>

      <section className={styles.limitations}>
        <div className="section-kicker">Honest limits</div>
        <h2>What this is not</h2>
        <ul>
          {distributedDoc.what_is_not_shown.map((line) => (
            <li key={line}>{line}</li>
          ))}
          {distributedDoc.nonclaims.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <SiteFooter />
    </main>
  );
}
