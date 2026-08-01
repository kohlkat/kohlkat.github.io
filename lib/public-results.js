import publicFusionDocument from "../public/data/sage-public-fusion-worldsim-v1.json";
import publicSimulationDocument from "../public/data/sage-public-nvidia-simulation-v1.json";
import publicSurfaceDocument from "../public/data/sage-public-nvidia-surface-integrity-v1.json";

const shapeLabels = {
  circle_pocket: "Circle pocket",
  rounded_rectangle_pocket: "Rounded-rectangle pocket",
  slot_pocket: "Slot pocket",
};

const materialLabels = {
  aluminum_6061: "Aluminum 6061",
  mild_steel: "Mild steel",
  titanium_proxy: "Titanium proxy",
};

const reduction =
  publicSimulationDocument.within_simulator_outcomes
    .program_objective_reduction_fraction;
const maximumCellPrograms = Math.max(
  ...publicSimulationDocument.coverage.cells.map((cell) => cell.programs),
);

const asPercent = (value) => value * 100;

export const publicSimulationCells =
  publicSimulationDocument.coverage.cells.map((cell) => ({
    ...cell,
    materialLabel: materialLabels[cell.material],
    shapeLabel: shapeLabels[cell.shape],
    strength: cell.programs / maximumCellPrograms,
  }));

export const publicSimulationSummary = {
  archiveCount: publicSimulationDocument.campaign.verified_shard_archives,
  constraintViolationCount:
    publicSimulationDocument.within_simulator_outcomes
      .declared_simulated_constraint_violations,
  evidenceLabel: publicSimulationDocument.evidence_class,
  integrityStatus: publicSimulationDocument.integrity.postflight_status,
  maximumReductionPercent: asPercent(reduction.maximum),
  meanReductionPercent: asPercent(reduction.mean),
  medianReductionPercent: asPercent(reduction.median),
  minimumReductionPercent: asPercent(reduction.minimum),
  normalizedMedianIndex: 100 - asPercent(reduction.median),
  p10ReductionPercent: asPercent(reduction.p10),
  p90ReductionPercent: asPercent(reduction.p90),
  programCount: publicSimulationDocument.campaign.robot_programs,
  programsWithLowerObjective:
    publicSimulationDocument.within_simulator_outcomes
      .programs_with_lower_objective,
  provenanceCount: publicSimulationDocument.campaign.provenance_records,
  runtimeName: publicSimulationDocument.runtime.name,
  scenarioCellCount: publicSimulationDocument.campaign.scenario_cells,
  surrogatePromoted:
    publicSimulationDocument.model_decision.saved_cnc_surrogate_promoted,
};

export const publicSimulationObjectiveDescription =
  "A composite synthetic score used to compare each candidate program with its own baseline inside the same simulator. Lower is better. The score is not measured cycle time, part quality, cutting force, or shop-floor performance.";

export const publicSimulationRuntimeDescription =
  "Robot articulation ran in NVIDIA Isaac Sim. Cutting loads came from a mechanistic model, and high-frequency vibration was synthesized. No physical cutting or private production data was included.";

export const publicSimulationDocumentDownload =
  "/data/sage-public-nvidia-simulation-v1.json";

const surfaceProxy =
  publicSurfaceDocument.finish_pass_surface_integrity_proxy_um;

export const publicSurfaceSummary = {
  evidenceLabel: publicSurfaceDocument.evidence_class,
  episodeCount: publicSurfaceDocument.campaign.robot_episodes_analyzed,
  lowerMedianUm: surfaceProxy.lower_bound_distribution.median,
  midpointMedianUm: surfaceProxy.midpoint_distribution.median,
  upperMedianUm: surfaceProxy.upper_bound_distribution.median,
  measurementStatus: publicSurfaceDocument.measurement_status,
  measuredCornerRadiusCount:
    publicSurfaceDocument.historical_geometry_boundary
      .campaign_programs_with_measured_corner_radius,
};

export const publicSurfaceDescription =
  "A retrospective, modeled surface-integrity proxy derived from the NVIDIA-run feed, force, acceleration, and temperature trajectories. Historical corner radius was not recorded, so the campaign reports an assumption-bounded interval rather than measured Ra.";

export const publicSurfaceDocumentDownload =
  "/data/sage-public-nvidia-surface-integrity-v1.json";

const fusionLatencyX2 = publicFusionDocument.latency_stress.x2;
const fusionLatencyX4 = publicFusionDocument.latency_stress.x4;

export const publicFusionSummary = {
  evidenceLabel: publicFusionDocument.evidence_class,
  measurementStatus: publicFusionDocument.measurement_status,
  observedCount: publicFusionDocument.observed_count,
  workerRuns: publicFusionDocument.campaign.worker_runs,
  stressEpisodes: publicFusionDocument.campaign.stress_episodes,
  sensorCatalogSize: publicFusionDocument.campaign.sensor_catalog_size,
  completedDate: publicFusionDocument.campaign.completed_date,
  kneeReached: publicFusionDocument.latency_stress.knee_ident_below_0_4_reached,
  x2IdentMean: fusionLatencyX2.ident_mean,
  x2IdentP10: fusionLatencyX2.ident_p10,
  x2FracBelow04Percent: fusionLatencyX2.frac_below_0_4 * 100,
  x4IdentMean: fusionLatencyX4.ident_mean,
  x4IdentP10: fusionLatencyX4.ident_p10,
  x4FracBelow04Percent: fusionLatencyX4.frac_below_0_4 * 100,
  topSuiteIdent:
    publicFusionDocument.top_suite_classes_high_latency[0].ident_overall,
  capabilityStatus: publicFusionDocument.digital_twin_capability.status,
  whatIsReal: publicFusionDocument.digital_twin_capability.what_is_real,
  whatTransfers: publicFusionDocument.digital_twin_capability.what_transfers_today,
  whatDoesNotTransfer:
    publicFusionDocument.digital_twin_capability.what_does_not_transfer_yet,
};

export const publicFusionDocumentDownload =
  "/data/sage-public-fusion-worldsim-v1.json";

export const publicFusionDescription =
  "A multi-sensor digital-twin stress campaign: random sensor suites fuse an asynchronous event stream under transport latency, dropout, and clock skew. Results are SIMULATED against a synthetic latent machining world—useful for suite ranking and latency robustness, not physical validation.";

export {
  publicFusionDocument,
  publicSimulationDocument,
  publicSurfaceDocument,
};
