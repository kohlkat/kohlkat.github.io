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

function MenuIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M3 5h14M3 10h14M3 15h14" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <a
        className="brand"
        href="/#top"
        aria-label="SAGE Suite — Software-Aware G-code Extension home"
      >
        <SageMark />
        <span>
          SAGE
          <small>SUITE</small>
        </span>
      </a>
      <nav className="desktop-nav" aria-label="Main navigation">
        <a href="/#product">Product</a>
        <a href="/#how-it-works">How it works</a>
        <a href="/#simulation">Proof</a>
        <a href="/distributed/">Distributed</a>
        <a href="/research/">Research</a>
        <a href="/evidence/">Evidence</a>
      </nav>
      <details className="mobile-menu">
        <summary aria-label="Navigation menu">
          <span>Menu</span>
          <MenuIcon />
        </summary>
        <nav aria-label="Mobile navigation">
          <a href="/#top">Home</a>
          <a href="/#product">What SAGE does</a>
          <a href="/#how-it-works">How it works</a>
          <a href="/#simulation">Simulation proof</a>
          <a href="/distributed/">Distributed studies</a>
          <a href="/research/">Research</a>
          <a href="/evidence/">Evidence</a>
          <a href="/#pilot">Discuss a pilot</a>
        </nav>
      </details>
      <a className="header-cta" href="/#pilot">
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
        SAGE means Software-Aware G-code Extension. It adds reviewable planning
        context around machining programs while qualified people retain every
        approval and machine decision.
      </p>
      <div className="footer-links">
        <a href="/#product">Product</a>
        <a href="/#pilot">Pilot</a>
        <a href="/research/">Research</a>
        <a href="/evidence/">Evidence</a>
        <a href="/simulation/">Simulation</a>
        <a href="/distributed/">Distributed</a>
        <a href="/privacy/">Privacy &amp; access</a>
        <a href="https://github.com/kohlkat">GitHub</a>
        <span>© 2026 SAGE Suite</span>
      </div>
    </footer>
  );
}
