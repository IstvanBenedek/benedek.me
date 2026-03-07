<script>
  import { onMount } from "svelte";
  import { WebHaptics } from "./lib/web-haptics.mjs";

  const siteUrl = "https://benedek.me";
  const socialImageUrl = `${siteUrl}/og-preview.png`;
  const metaDescription =
    "Security leader, hands-on builder, and AI/security automation architect across Level 1 payment environments, PCI delivery, and Kubernetes-native Rust platforms.";

  const cards = [
    {
      href: "https://www.linkedin.com/in/istvan-benedek/",
      label: "LinkedIn",
    },
  ];
  const personSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Istvan Benedek",
    url: siteUrl,
    jobTitle: "Security Leader and AI Security Automation Architect",
    sameAs: ["https://www.linkedin.com/in/istvan-benedek/"],
    knowsAbout: [
      "Software Development",
      "Application Security",
      "Threat Modeling",
      "Security Automation",
      "PCI DSS",
      "PCI PIN",
      "PCI MPoC",
      "Cryptography",
      "Kubernetes",
    ],
  });
  const focusAreas = [
    "AI-driven security automation",
    "Custom security tooling and assessments",
    "Level 1 PCI / PCI PIN / PCI MPoC / ISO execution",
    "Hands-on engineering across cloud, Kubernetes, cryptography, and HSM",
  ];
  const outcomes = [
    {
      value: "Built from scratch",
      label: "Security functions and audit capability designed and delivered from the ground up.",
      featured: true,
    },
    {
      value: "Level 1 delivery",
      label: "PCI DSS, PCI PIN, and PCI MPoC work in payment environments.",
      accent: true,
    },
    {
      value: "Built for scale",
      label: "Automation and AI-assisted workflows designed to scale across thousands of repositories.",
    },
  ];
  const jobEmailUserParts = ["istvan", "benedek", "job"];
  const jobEmailDomainParts = ["gmail", "com"];

  onMount(() => {
    const interactiveElements = Array.from(document.querySelectorAll("[data-haptic]"));
    const releaseEvents = ["pointerup", "pointercancel", "pointerleave", "blur"];
    const visualDuration = 460;
    const fallbackDurations = {
      light: 12,
      medium: 22,
      heavy: 32,
      success: [18, 28, 18],
      warning: [28, 42, 28],
      error: [36, 52, 36],
      selection: 10,
    };
    const visualTimers = new WeakMap();
    const activeTimers = new Set();
    const cleanup = [];
    const haptics = new WebHaptics();

    let triggerHaptic = (type) => {
      const pattern = fallbackDurations[type] ?? fallbackDurations.medium;
      if (navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    };

    const ensurePressVisual = (element) => {
      let visual = element.querySelector(".press-visual");

      if (!visual) {
        visual = document.createElement("span");
        visual.className = "press-visual";
        visual.setAttribute("aria-hidden", "true");
        element.append(visual);
      }

      return visual;
    };

    const setPressOrigin = (element, clientX, clientY) => {
      const rect = element.getBoundingClientRect();
      const x = clientX == null ? rect.width / 2 : clientX - rect.left;
      const y = clientY == null ? rect.height / 2 : clientY - rect.top;

      element.style.setProperty("--press-x", `${x}px`);
      element.style.setProperty("--press-y", `${y}px`);
    };

    const playPressVisual = (element, clientX, clientY) => {
      ensurePressVisual(element);
      setPressOrigin(element, clientX, clientY);
      element.classList.remove("is-firing");
      void element.offsetWidth;
      element.classList.add("is-firing");

      const existingTimer = visualTimers.get(element);
      if (existingTimer) {
        window.clearTimeout(existingTimer);
        activeTimers.delete(existingTimer);
      }

      const timer = window.setTimeout(() => {
        element.classList.remove("is-firing");
        visualTimers.delete(element);
        activeTimers.delete(timer);
      }, visualDuration);

      visualTimers.set(element, timer);
      activeTimers.add(timer);
    };

    const fireHaptic = (element) => {
      const type = element.dataset.haptic || "medium";
      triggerHaptic(type);
    };

    const addListener = (element, eventName, handler) => {
      element.addEventListener(eventName, handler);
      cleanup.push(() => element.removeEventListener(eventName, handler));
    };

    const isSupported = WebHaptics.isSupported;
    document.documentElement.dataset.haptics = isSupported ? "supported" : "unavailable";

    if (isSupported) {
      triggerHaptic = (type) => {
        void haptics.trigger(type);
      };
    }

    for (const element of interactiveElements) {
      ensurePressVisual(element);

      addListener(element, "pointerdown", (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) {
          return;
        }

        element.classList.add("is-pressed");
        playPressVisual(element, event.clientX, event.clientY);
        fireHaptic(element);
      });

      for (const eventName of releaseEvents) {
        addListener(element, eventName, () => {
          element.classList.remove("is-pressed");
        });
      }

      addListener(element, "keydown", (event) => {
        if ((event.key === "Enter" || event.key === " ") && !event.repeat) {
          playPressVisual(element);
          fireHaptic(element);
        }
      });
    }

    const handlePageHide = () => {
      haptics.destroy();
    };

    window.addEventListener("pagehide", handlePageHide, { once: true });

    return () => {
      for (const dispose of cleanup) {
        dispose();
      }

      for (const timer of activeTimers) {
        window.clearTimeout(timer);
      }

      haptics.destroy();
      delete document.documentElement.dataset.haptics;
      window.removeEventListener("pagehide", handlePageHide);
    };
  });
</script>

<svelte:head>
  <title>Istvan Benedek | Security Leadership, PCI, and AI Security Automation</title>
  <meta name="description" content={metaDescription} />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#f3ede2" />
  <link rel="canonical" href={siteUrl} />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={siteUrl} />
  <meta property="og:site_name" content="Istvan Benedek" />
  <meta
    property="og:title"
    content="Istvan Benedek | Security Leadership, PCI, and AI Security Automation"
  />
  <meta property="og:description" content={metaDescription} />
  <meta property="og:image" content={socialImageUrl} />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Istvan Benedek professional landing page preview" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content="Istvan Benedek | Security Leadership, PCI, and AI Security Automation"
  />
  <meta name="twitter:description" content={metaDescription} />
  <meta name="twitter:image" content={socialImageUrl} />
  <meta name="twitter:image:alt" content="Istvan Benedek professional landing page preview" />
  <script type="application/ld+json">{personSchema}</script>
</svelte:head>

<main class="page">
  <div class="shell">
    <section class="hero">
      <div class="hero-main">
        <h1>Istvan Benedek</h1>
        <p class="positioning">
          Security leader, hands-on builder, and AI/security automation architect.
        </p>
        <p class="lede">
          I build security systems, automation, and AI-driven workflows that let
          organizations run security work at scale instead of treating it as manual
          overhead.
        </p>
        <div class="detail-copy">
          <p class="intro">
            I bring 26 years across software development, application security,
            incident and crisis management, and compliance, including Level 1 PCI
            DSS, PCI PIN, PCI MPoC, and ISO work in payment environments. I build
            security tooling from scratch, including Kubernetes-native Rust
            platforms and deterministic AI-assisted workflows that let secure
            SDLC work run reliably at scale.
          </p>
        </div>
      </div>
      <div class="hero-side">
        <div class="outcome-stack" aria-label="Representative scope">
          <h2 class="capability-kicker capability-kicker-primary">Representative scope</h2>
          <div class="outcome-grid">
            {#each outcomes as point}
            <div class:proof-card--featured={point.featured} class:proof-card--accent={point.accent} class="proof-card">
              <p class="proof-value">{point.value}</p>
              <p class="proof-label">{point.label}</p>
            </div>
            {/each}
          </div>
          <p class="scope-meta">
            <span class="scope-label">Operating scope</span>
            Built security functions, audit programs, and secure SDLC capability for
            Level 1 payment environments, regulated platforms, and large engineering
            estates.
            <span class="scope-separator" aria-hidden="true">•</span>
            Across Teya, Anaplan, ASOS, Paddy Power Betfair, Qualys, and MSCI Barra,
            spanning payments, PCI, FedRAMP, cryptography, HSM, and Kubernetes.
          </p>
        </div>
        <div class="capability-stack" aria-label="What I do">
          <h2 class="capability-kicker">What I do</h2>
          <div class="focus-strip" aria-label="Capabilities">
            {#each focusAreas as area}
              <span class="focus-pill">{area}</span>
            {/each}
          </div>
        </div>
      </div>
    </section>

    <section class="links" aria-label="Contact">
      <div class="contact-row">
        {#each cards as card}
          <a
            class="connect-link contact-link"
            href={card.href}
            data-haptic="medium"
            target="_blank"
            rel="noreferrer"
          >
            <span class="connect-link-label">{card.label}</span>
          </a>
        {/each}
        <span class="contact-divider" aria-hidden="true"></span>
        <div class="contact-email-item">
          <span class="contact-email">
            {jobEmailUserParts.join(".")} [at] {jobEmailDomainParts[0]} [dot] {jobEmailDomainParts[1]}
          </span>
        </div>
      </div>
    </section>
  </div>
</main>

<style>
  :global(:root) {
    --bg: #121826;
    --bg-soft: #1c2740;
    --panel: rgba(14, 20, 33, 0.72);
    --panel-strong: rgba(10, 15, 25, 0.82);
    --line: rgba(255, 255, 255, 0.1);
    --text: #f8f2e7;
    --muted: #b8c0d4;
    --accent: #f59e0b;
    --accent-soft: #ffd79a;
    --shadow: 0 32px 70px rgba(3, 8, 20, 0.34);
    --radius-xl: 32px;
    --radius-lg: 22px;
    --radius-md: 16px;
    --content-width: 1120px;
    --sans: "Avenir Next", "Segoe UI", "Helvetica Neue", Helvetica, sans-serif;
    --serif: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Baskerville,
      Georgia, serif;
    --mono: "SFMono-Regular", "IBM Plex Mono", "Menlo", "Monaco", "Liberation Mono",
      monospace;
  }

  :global(*) {
    box-sizing: border-box;
  }

  :global(html) {
    color-scheme: dark;
  }

  :global(body) {
    margin: 0;
    min-height: 100vh;
    font-family: var(--sans);
    color: var(--text);
    background:
      radial-gradient(circle at top left, rgba(245, 158, 11, 0.22), transparent 28%),
      radial-gradient(circle at 85% 15%, rgba(59, 130, 246, 0.25), transparent 26%),
      linear-gradient(135deg, #0b1220 0%, #121826 42%, #1f2a44 100%);
  }

  :global(body)::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    background-size: 72px 72px;
    mask-image: radial-gradient(circle at center, black, transparent 78%);
    opacity: 0.35;
  }

  a {
    color: inherit;
    -webkit-tap-highlight-color: transparent;
  }

  .page {
    width: min(calc(100% - 2rem), var(--content-width));
    margin: 0 auto;
    padding: 1.25rem 0 3rem;
  }

  .shell {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: calc(var(--radius-xl) + 8px);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 22%),
      linear-gradient(135deg, rgba(245, 158, 11, 0.08), transparent 38%),
      var(--panel);
    box-shadow: var(--shadow);
    backdrop-filter: blur(22px);
  }

  .shell::after {
    content: "";
    position: absolute;
    width: 28rem;
    height: 28rem;
    right: -11rem;
    top: -8rem;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 215, 154, 0.22), transparent 65%);
  }

  .hero {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1.08fr) minmax(20rem, 0.92fr);
    gap: 1.5rem 2rem;
    align-items: start;
    padding: 0.6rem 1.25rem 1.1rem;
  }

  .hero-main {
    padding: 0 0.25rem 0.75rem;
    max-width: 40rem;
  }

  .hero-side {
    display: grid;
    gap: 0.85rem;
    align-content: start;
    padding: 0 0.25rem 0.75rem;
  }

  .detail-copy {
    margin-top: 0.28rem;
    max-width: 35rem;
  }

  h1 {
    margin: 0 0 0.95rem;
    max-width: 11ch;
    font-family: var(--serif);
    font-size: clamp(3.1rem, 6.9vw, 5.75rem);
    line-height: 0.96;
    letter-spacing: -0.05em;
  }

  .positioning {
    max-width: 36rem;
    margin: 0 0 0.7rem;
    color: var(--accent-soft);
    font-size: clamp(1.06rem, 2vw, 1.24rem);
    font-weight: 600;
    line-height: 1.45;
    letter-spacing: -0.02em;
  }

  .intro {
    max-width: 35rem;
    margin: 0;
    color: var(--muted);
    font-size: 1.02rem;
    line-height: 1.58;
  }

  .lede {
    max-width: 38rem;
    margin: 0 0 0.88rem;
    color: var(--text);
    font-family: var(--serif);
    font-size: clamp(1.32rem, 2.5vw, 1.7rem);
    line-height: 1.35;
    letter-spacing: -0.03em;
  }

  .capability-stack {
    max-width: 44rem;
    margin-bottom: 0.2rem;
  }

  .capability-kicker {
    margin: 0 0 0.55rem;
    color: rgba(255, 215, 154, 0.8);
    font-family: var(--mono);
    font-size: 0.76rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .capability-kicker-primary {
    color: var(--accent-soft);
    font-size: 0.82rem;
  }

  .outcome-stack {
    margin-bottom: 0.15rem;
  }

  .outcome-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem;
  }

  .proof-card {
    padding: 0.9rem 0.95rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent 28%),
      rgba(255, 255, 255, 0.035);
  }

  .proof-card--featured {
    grid-column: 1 / -1;
    padding: 1.1rem 1.05rem;
    border-color: rgba(245, 158, 11, 0.2);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 28%),
      linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(255, 255, 255, 0.04));
    box-shadow: 0 12px 32px rgba(3, 8, 20, 0.18);
  }

  .proof-card--accent {
    border-color: rgba(245, 158, 11, 0.14);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 28%),
      linear-gradient(135deg, rgba(245, 158, 11, 0.07), rgba(255, 255, 255, 0.035));
  }

  .proof-value,
  .proof-label {
    margin: 0;
  }

  .proof-value {
    color: var(--text);
    font-family: var(--serif);
    font-size: 1.03rem;
    line-height: 1.2;
  }

  .proof-label {
    margin-top: 0.35rem;
    color: var(--muted);
    font-size: 0.9rem;
    line-height: 1.55;
  }

  .proof-card--featured .proof-value {
    color: var(--accent-soft);
    font-size: 1.32rem;
  }

  .proof-card--featured .proof-label {
    color: rgba(248, 242, 231, 0.88);
    font-size: 0.95rem;
  }

  .scope-meta {
    margin: 0.55rem 0 0;
    color: var(--muted);
    font-size: 0.78rem;
    line-height: 1.45;
  }

  .scope-label {
    color: rgba(255, 215, 154, 0.74);
    font-family: var(--mono);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-right: 0.5rem;
  }

  .scope-separator {
    margin: 0 0.45rem;
    color: rgba(255, 255, 255, 0.22);
  }

  .focus-strip {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.65rem;
  }

  .focus-pill {
    display: flex;
    align-items: center;
    min-height: 4.45rem;
    padding: 0.78rem 0.9rem;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.03);
    color: rgba(248, 242, 231, 0.92);
    font-size: 0.92rem;
    line-height: 1.45;
    text-wrap: balance;
  }

  .links {
    margin-top: 0.05rem;
    padding: 0.42rem 1.25rem 0.42rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .contact-row {
    display: grid;
    grid-template-columns: max-content auto minmax(0, 1fr);
    align-items: center;
    gap: 0.7rem;
  }

  .contact-link {
    position: relative;
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    color: inherit;
    overflow: hidden;
    isolation: isolate;
    transition:
      transform 180ms ease,
      color 180ms ease;
  }

  .contact-link:focus-visible {
    outline: 2px solid var(--accent-soft);
    outline-offset: 3px;
  }

  .connect-link {
    justify-content: flex-start;
    cursor: pointer;
    touch-action: manipulation;
    color: var(--accent-soft);
    font-family: var(--mono);
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .connect-link:hover,
  .connect-link:focus-visible {
    transform: translateY(-1px);
    color: var(--text);
  }

  :global(.connect-link.is-pressed) {
    transform: translateY(0) scale(0.988);
  }

  :global(.connect-link.is-firing) {
    color: var(--text);
  }

  .connect-link > *:not(.press-visual) {
    position: relative;
    z-index: 1;
  }

  .connect-link:hover,
  .connect-link:focus-visible,
  :global(.connect-link.is-firing) {
    color: var(--text);
  }

  :global(.press-visual) {
    position: absolute;
    left: var(--press-x, 50%);
    top: var(--press-y, 50%);
    width: 11rem;
    height: 11rem;
    border-radius: 999px;
    pointer-events: none;
    z-index: 0;
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.18);
    background:
      radial-gradient(
        circle,
        rgba(255, 255, 255, 0.52) 0%,
        rgba(255, 255, 255, 0.18) 18%,
        rgba(255, 215, 154, 0.24) 42%,
        rgba(245, 158, 11, 0) 72%
      );
    filter: blur(1px);
  }

  :global(.connect-link .press-visual) {
    width: 15rem;
    height: 15rem;
  }

  :global(.connect-link.is-firing .press-visual) {
    animation: press-visual 460ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .connect-link-label {
    position: relative;
    z-index: 1;
  }

  .contact-divider {
    width: 1px;
    height: 1rem;
    background: rgba(255, 255, 255, 0.12);
  }

  .contact-email-item {
    min-width: 0;
    justify-self: end;
  }

  .contact-email {
    display: block;
    max-width: 100%;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: rgba(255, 215, 154, 0.88);
    font-family: var(--mono);
    font-size: 0.74rem;
    line-height: 1.25;
    letter-spacing: 0.01em;
    text-align: right;
    word-break: break-word;
  }

  @media (max-width: 900px) {
    .hero {
      grid-template-columns: 1fr;
      gap: 1rem;
      padding-top: 1.5rem;
    }

    .hero-main,
    .hero-side {
      max-width: none;
      padding-left: 0.25rem;
      padding-right: 0.25rem;
    }

    .detail-copy {
      max-width: none;
    }

    h1 {
      max-width: 100%;
    }

    .outcome-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .contact-row {
      grid-template-columns: max-content auto minmax(0, 1fr);
    }
  }

  @media (max-width: 640px) {
    .page {
      width: min(calc(100% - 1rem), var(--content-width));
      padding-top: 0.5rem;
    }

    :global(body)::before {
      background-size: 48px 48px;
      opacity: 0.2;
    }

    .shell {
      border-radius: 28px;
    }

    .shell::after {
      width: 19rem;
      height: 19rem;
      right: -8rem;
      top: -6rem;
    }

    .hero,
    .links {
      padding-left: 1rem;
      padding-right: 1rem;
    }

    .hero {
      gap: 1rem;
      padding-top: 1.2rem;
      padding-bottom: 1rem;
    }

    .hero-main,
    .hero-side {
      padding: 0;
    }

    h1 {
      margin: 0 0 0.55rem;
      font-size: clamp(2.85rem, 14vw, 4.1rem);
      line-height: 0.94;
    }

    .intro {
      font-size: 1rem;
      line-height: 1.65;
    }

    .outcome-grid {
      grid-template-columns: 1fr;
      gap: 0.7rem;
    }

    .proof-card--featured {
      grid-column: auto;
    }

    .proof-value {
      font-size: 1rem;
    }

    .proof-label,
    .contact-email,
    .scope-meta {
      font-size: 0.95rem;
      line-height: 1.65;
    }

    .lede {
      font-size: 1.2rem;
      margin-bottom: 0.85rem;
    }

    .positioning {
      font-size: 1rem;
      margin-bottom: 0.65rem;
    }

    .focus-strip {
      grid-template-columns: 1fr;
      gap: 0.55rem;
      margin-bottom: 0.1rem;
    }

    .focus-pill {
      padding: 0.7rem 0.8rem;
      font-size: 0.92rem;
      min-height: auto;
    }

    .scope-label {
      display: block;
      margin: 0 0 0.22rem;
    }

    .scope-separator {
      display: none;
    }

    .contact-row {
      grid-template-columns: 1fr;
      gap: 0.35rem;
    }

    .contact-divider {
      display: none;
    }

    .contact-email-item {
      justify-self: start;
      width: 100%;
    }

    .contact-email {
      width: 100%;
      text-align: left;
    }
  }

  @media (max-width: 420px) {
    .page {
      width: min(calc(100% - 0.75rem), var(--content-width));
    }

    .hero,
    .links {
      padding-left: 0.85rem;
      padding-right: 0.85rem;
    }

    .shell {
      border-radius: 24px;
    }

  }

  @media (prefers-reduced-motion: no-preference) {
    .hero-main,
    .hero-side,
    .links {
      animation: fade-up 700ms ease backwards;
    }

    @keyframes fade-up {
      from {
        opacity: 0;
        transform: translateY(18px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes press-visual {
      0% {
        opacity: 0.82;
        transform: translate(-50%, -50%) scale(0.14);
      }

      58% {
        opacity: 0.26;
      }

      100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(1);
      }
    }
  }
</style>
