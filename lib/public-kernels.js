export const publicKernelBoundary =
  "These are intentionally high-level descriptions of what each software check asks and how it fails closed. The implementation methods, calibration, thresholds, and internal composition are not published.";

export const publicKernels = [
  {
    number: "01",
    shortName: "Limits check",
    question: "Does this advisory result stay inside the allowed limits?",
    action:
      "If not, the result is constrained or refused rather than allowed to extend the limits.",
    value:
      "A learned model cannot make its own operating boundary larger.",
  },
  {
    number: "02",
    shortName: "Familiarity check",
    question: "Is the current situation close enough to evidence the model knows?",
    action:
      "When support is too weak, model authority is withdrawn instead of letting the model guess more aggressively.",
    value:
      "Being unfamiliar causes less software authority, not more confidence.",
  },
  {
    number: "03",
    shortName: "Evidence contract",
    question: "Are the required measurements present and usable for this context?",
    action:
      "Missing, mismatched, or untrustworthy inputs remain unknown and can stop the advisory path.",
    value:
      "A missing sensor value never quietly becomes a reassuring zero.",
  },
  {
    number: "04",
    shortName: "Identification honesty",
    question: "Does the available evidence actually support a physical estimate?",
    action:
      "If the data cannot support an estimate, the check declines and records why.",
    value:
      "An honest ‘unknown’ is treated as a result, not a failure to hide.",
  },
  {
    number: "05",
    shortName: "Uncertainty check",
    question: "Is the uncertainty around this candidate small enough to continue?",
    action:
      "If uncertainty is too large, the candidate is vetoed before it can become an advisory output.",
    value:
      "A plausible average is not enough when the uncertainty is unacceptable.",
  },
];

export const kernelPlainTerms = [
  {
    term: "Kernel",
    definition:
      "Here, a kernel is one small, focused software check. It is not an operating-system kernel, a machine controller, or a certified safety device.",
  },
  {
    term: "Fail closed",
    definition:
      "When required evidence is missing or a check fails, the default outcome is refusal—not permission.",
  },
  {
    term: "Authority",
    definition:
      "What an output is allowed to influence. In the public prototype, the kernels can affect advisory eligibility but have no physical machine authority.",
  },
  {
    term: "Model support",
    definition:
      "The kinds of conditions represented by evidence used to develop or evaluate a model. Outside that support, confidence should decrease.",
  },
  {
    term: "Uncertainty",
    definition:
      "The range of plausible error around a result. A single prediction can look acceptable while its uncertainty is still too large.",
  },
];
