function SageMark() {
  return (
    <svg
      aria-hidden="true"
      className="sage-mark"
      viewBox="0 0 42 42"
      fill="none"
    >
      <path d="M8 12.5 21 5l13 7.5v17L21 37 8 29.5v-17Z" />
      <path d="m13 15.5 8-4.5 8 4.5-8 4.6-8-4.6Zm0 6 8 4.5 8-4.5M21 20.1V32" />
    </svg>
  );
}

export function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none">
      <path d="M3 9h11M10 5l4 4-4 4" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="/#top" aria-label="SAGE Suite home">
        <SageMark />
        <span>
          SAGE
          <small>SUITE</small>
        </span>
      </a>
      <nav className="desktop-nav" aria-label="Main navigation">
        <a href="/#platform">Platform</a>
        <a href="/simulation/">Simulation evidence</a>
        <a href="/#boundaries">Trust boundary</a>
        <a href="/#roadmap">Roadmap</a>
      </nav>
      <nav className="mobile-nav" aria-label="Compact navigation">
        <a href="/#top">Home</a>
        <a href="/simulation/">Evidence</a>
      </nav>
      <a className="header-cta" href="/#contact">
        Design partners
        <ArrowIcon />
      </a>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <div className="brand footer-brand">
        <SageMark />
        <span>
          SAGE
          <small>SUITE</small>
        </span>
      </div>
      <p>
        SIMULATED public demo · 0 observed · no physical command authority ·
        demo threshold ≠ production policy.
      </p>
      <div className="footer-links">
        <a href="/simulation/">Simulation</a>
        <a href="/privacy/">Privacy</a>
        <a href="https://github.com/kohlkat">GitHub</a>
        <span>© 2026 SAGE Suite</span>
      </div>
    </footer>
  );
}
