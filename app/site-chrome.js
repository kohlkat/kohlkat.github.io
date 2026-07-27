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
        <a href="/#product">Product</a>
        <a href="/#simulation">Results</a>
        <a href="/#use-cases">Use cases</a>
        <a href="/research/">Research</a>
        <a href="/evidence/">Evidence</a>
      </nav>
      <nav className="mobile-nav" aria-label="Compact navigation">
        <a href="/#top">Home</a>
        <a href="/research/">Research</a>
      </nav>
      <a className="header-cta" href="/#contact">
        Pilot SAGE
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
        Manufacturing decision intelligence for structured planning,
        simulation-backed comparison, evidence-linked review, and qualified
        human approval.
      </p>
      <div className="footer-links">
        <a href="/#product">Product</a>
        <a href="/research/">Research</a>
        <a href="/evidence/">Evidence</a>
        <a href="/simulation/">Simulation</a>
        <a href="/privacy/">Privacy &amp; crawler policy</a>
        <a href="https://github.com/kohlkat">GitHub</a>
        <span>© 2026 SAGE Suite</span>
      </div>
    </footer>
  );
}
