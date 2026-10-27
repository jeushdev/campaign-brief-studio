import Link from "next/link";
import { Icon } from "@/components/icon";
import styles from "./landing.module.css";

export const metadata = {
  title: "Campaign Brief Studio — Human-in-the-Loop AI Marketing Systems",
  description:
    "Transform raw business briefs into validated messaging angles, conversion wireframes, and 7-day multi-channel execution plans with strict human review gates.",
};

export default function Home() {
  return (
    <div className={styles.landingPage}>
      {/* Frosted Header */}
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Campaign Brief Studio">
          <span className={styles.brandMark}>
            <Icon name="document" size={20} />
          </span>
          <span className={styles.brandText}>
            <span className={styles.brandTitle}>Campaign Brief Studio</span>
            <span className={styles.brandSubtitle}>Human-in-the-Loop Engine</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Landing Navigation">
          <a href="#workflow" className={styles.navLink}>Workflow</a>
          <a href="#features" className={styles.navLink}>Capabilities</a>
          <a href="#architecture" className={styles.navLink}>Architecture</a>
          <Link href="/demo" className={styles.navLink}>Interactive Demo</Link>
        </nav>

        <div className={styles.headerActions}>
          <a
            href="https://github.com/jeushdev/campaign-brief-studio"
            target="_blank"
            rel="noreferrer"
            className={styles.githubLink}
            aria-label="GitHub Repository"
          >
            <span>GitHub</span>
            <Icon name="external" size={14} />
          </a>
          <Link href="/demo" className={styles.primaryCta}>
            <span>Launch Demo</span>
            <Icon name="arrow" size={15} />
          </Link>
        </div>
      </header>

      {/* Main Landing Content */}
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.badge}>
            <Icon name="spark" size={14} />
            <span>Human-in-the-Loop AI Marketing Workspace</span>
          </div>

          <h1 id="hero-title" className={styles.title}>
            Turn raw business briefs into validated campaign strategies.
          </h1>

          <p className={styles.subtitle}>
            Transforms product goals and customer constraints into 3 distinct messaging angles,
            conversion-focused wireframes, and 7-day multi-channel calendars. Built with deliberate
            human review gates, Zod schema contracts, and async n8n orchestration.
          </p>

          <div className={styles.heroActions}>
            <Link href="/demo" className={styles.primaryCta}>
              <span>Launch Interactive Demo</span>
              <Icon name="arrow" size={16} />
            </Link>
            <a href="#workflow" className={styles.secondaryCta}>
              <span>Explore Engine Workflow</span>
              <Icon name="chevron" size={16} />
            </a>
          </div>

          <div className={styles.heroNote}>
            <span className={styles.heroNoteItem}>
              <Icon name="check" size={14} />
              Zero-dependency in-memory demo
            </span>
            <span>•</span>
            <span className={styles.heroNoteItem}>
              <Icon name="check" size={14} />
              Spreadsheet-safe CSV export
            </span>
            <span>•</span>
            <span className={styles.heroNoteItem}>
              <Icon name="check" size={14} />
              Pre-seeded fictional test cases
            </span>
          </div>

          {/* Interactive Strategy Blueprint Preview */}
          <div className={styles.previewSection} aria-label="Campaign Plan Blueprint Preview">
            <div className={styles.previewCard}>
              <div className={styles.previewHeader}>
                <div className={styles.previewStatusGroup}>
                  <span className="status status-approved">
                    <span className="status-dot"></span>
                    Approved
                  </span>
                  <span className="confidence confidence-high">
                    <span></span>
                    High confidence
                  </span>
                  <span style={{ color: "var(--muted)", fontSize: "11px" }}>Revision 2</span>
                </div>
                <div style={{ color: "var(--muted)", fontSize: "11px" }}>
                  Campaign Plan Blueprint #CBS-842
                </div>
              </div>

              <div className={styles.previewBody}>
                <div className={styles.previewMeta}>
                  <div>
                    <h3>Voltaic Cloud: Enterprise Database Migration</h3>
                    <p>
                      B2B Infrastructure • High-volume PostgreSQL & MySQL migrations with zero application downtime.
                    </p>
                  </div>
                  <Link href="/demo" className="button secondary" style={{ minHeight: "38px", fontSize: "12px" }}>
                    Test in Sandbox <Icon name="spark" size={14} />
                  </Link>
                </div>

                <div className={styles.previewAnglesGrid}>
                  <div className={styles.previewAngleCard}>
                    <span className={styles.previewAngleLabel}>Angle 1: Pain-Relief</span>
                    <h4 className={styles.previewAngleHeadline}>Downtime Immunity</h4>
                    <p className={styles.previewAngleQuote}>
                      &ldquo;Eliminate multi-hour maintenance windows and transactional loss with automated, two-way replication rollback.&rdquo;
                    </p>
                  </div>

                  <div className={styles.previewAngleCard}>
                    <span className={styles.previewAngleLabel}>Angle 2: Social Proof</span>
                    <h4 className={styles.previewAngleHeadline}>Scale Transformation</h4>
                    <p className={styles.previewAngleQuote}>
                      &ldquo;Benchmark-verified 12,000 queries/sec across 450+ production databases with SOC-2 Type II audit parity.&rdquo;
                    </p>
                  </div>

                  <div className={styles.previewAngleCard}>
                    <span className={styles.previewAngleLabel}>Angle 3: Risk-Reversal</span>
                    <h4 className={styles.previewAngleHeadline}>Parallel Pilot</h4>
                    <p className={styles.previewAngleQuote}>
                      &ldquo;Run parallel shadow traffic alongside your legacy cluster for 30 days before cutting over production DNS.&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.previewFooterBar}>
                <span style={{ color: "var(--muted)" }}>
                  Includes 7-day multi-channel calendar (Email, Social, Paid, Content) + landing page wireframe
                </span>
                <Link href="/demo" style={{ color: "var(--accent)", fontWeight: 600, fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  Open Interactive Demo <Icon name="arrow" size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className={styles.section} aria-labelledby="workflow-title">
          <div className={styles.sectionHeading}>
            <div className={styles.sectionTag}>Human-in-the-Loop Architecture</div>
            <h2 id="workflow-title">AI output is a proposal, not a final decision.</h2>
            <p>
              Most generative marketing tools produce isolated snippets of unverified copy. Campaign Brief Studio
              embeds human judgment, confidence scoring, and strict revision controls into every stage.
            </p>
          </div>

          <div className={styles.workflowGrid}>
            <div className={styles.workflowCard}>
              <div className={styles.stepNumber}>1</div>
              <h3>Guided Intake Wizard</h3>
              <p>
                Structured 4-stage business and audience questionnaire with local auto-save, crash recovery, and instant Zod validation.
              </p>
            </div>

            <div className={styles.workflowCard}>
              <div className={styles.stepNumber}>2</div>
              <h3>AI Strategy Synthesis</h3>
              <p>
                Deterministic offline engine or asynchronous n8n + Groq LLM workflow generates 3 angles, wireframes, and calendar schedules.
              </p>
            </div>

            <div className={styles.workflowCard}>
              <div className={styles.stepNumber}>3</div>
              <h3>Deliberate Review Gate</h3>
              <p>
                Operators inspect assumptions, acknowledge low-confidence risk alerts, request specific revisions, or reject unsuitable drafts.
              </p>
            </div>

            <div className={styles.workflowCard}>
              <div className={styles.stepNumber}>4</div>
              <h3>Spreadsheet-Safe Export</h3>
              <p>
                Approved campaigns export into Markdown dossiers and formula-injection neutralized CSV content calendars ready for execution.
              </p>
            </div>
          </div>
        </section>

        {/* Bento Capabilities Grid */}
        <section id="features" className={styles.section} aria-labelledby="features-title">
          <div className={styles.sectionHeading}>
            <div className={styles.sectionTag}>Core Capabilities</div>
            <h2 id="features-title">Engineered for marketing precision and operational safety.</h2>
            <p>
              Every component is crafted following strict Apple design foundations: frosted glass depth,
              high-contrast typographic hierarchy, and responsive reflow down to 320px screens.
            </p>
          </div>

          <div className={styles.bentoGrid}>
            <div className={styles.bentoCard}>
              <div className={styles.cardIcon}>
                <Icon name="document" size={20} />
              </div>
              <h3>3 Strategic Messaging Angles</h3>
              <p>
                Avoids monotonous single-tone copy. Every brief generates three distinct positioning hooks: Pain-Relief, Social Proof, and Risk-Reversal.
              </p>
            </div>

            <div className={styles.bentoCard}>
              <div className={styles.cardIcon}>
                <Icon name="review" size={20} />
              </div>
              <h3>Conversion Wireframe Blueprint</h3>
              <p>
                Full landing page structural breakdown: headline hierarchies, benefit blocks, trust proof points, and conversion call-to-actions.
              </p>
            </div>

            <div className={styles.bentoCard}>
              <div className={styles.cardIcon}>
                <Icon name="clock" size={20} />
              </div>
              <h3>7-Day Multi-Channel Calendar</h3>
              <p>
                Day-by-day scheduling across Email, Social, Paid Search, and Content channels with audience targeting and hook copy.
              </p>
            </div>

            <div className={`${styles.bentoCard} ${styles.bentoCardWide}`}>
              <div className={styles.cardIcon}>
                <Icon name="shield" size={20} />
              </div>
              <h3>Deliberate Human Approval & Revision Guards</h3>
              <p>
                AI outputs remain in an explicit &ldquo;Needs review&rdquo; state until authorized. Low-confidence generations require mandatory acknowledgment notes.
              </p>
              <ul className={styles.cardList}>
                <li>
                  <Icon name="check" size={14} />
                  <span>Revision cycles preserve full historical plans and decision notes</span>
                </li>
                <li>
                  <Icon name="check" size={14} />
                  <span>CSV exports sanitize spreadsheet formula injection (=, +, -, @)</span>
                </li>
                <li>
                  <Icon name="check" size={14} />
                  <span>Session storage recovers in-flight submissions after unexpected tab crashes</span>
                </li>
              </ul>
            </div>

            <div className={styles.bentoCard}>
              <div className={styles.cardIcon}>
                <Icon name="spark" size={20} />
              </div>
              <h3>Zero-Setup Client Sandbox</h3>
              <p>
                Explore the complete authoring, generation, revision, and export flow directly in browser memory without database credentials or API keys.
              </p>
            </div>
          </div>
        </section>

        {/* Architecture Section */}
        <section id="architecture" className={styles.section} aria-labelledby="arch-title">
          <div className={styles.sectionHeading}>
            <div className={styles.sectionTag}>Technical Topology</div>
            <h2 id="arch-title">Pairing Next.js 16 with asynchronous automation.</h2>
            <p>
              Clean separation between user presentation, transactional persistence, and background AI execution.
            </p>
          </div>

          <div className={styles.archCard}>
            <div className={styles.pipelineVisual}>
              <div className={styles.pipelineNode}>
                <span className={styles.pipelineNodeTitle}>Structured Brief</span>
                <span className={styles.pipelineNodeSub}>Zod Client Intake</span>
              </div>
              <span className={styles.pipelineArrow}>→</span>
              <div className={styles.pipelineNode}>
                <span className={styles.pipelineNodeTitle}>Next.js Engine</span>
                <span className={styles.pipelineNodeSub}>SQLite WAL & Idempotency</span>
              </div>
              <span className={styles.pipelineArrow}>→</span>
              <div className={styles.pipelineNode}>
                <span className={styles.pipelineNodeTitle}>n8n Webhook</span>
                <span className={styles.pipelineNodeSub}>HMAC Header Auth</span>
              </div>
              <span className={styles.pipelineArrow}>→</span>
              <div className={styles.pipelineNode}>
                <span className={styles.pipelineNodeTitle}>Groq LLM</span>
                <span className={styles.pipelineNodeSub}>Structured JSON Envelope</span>
              </div>
              <span className={styles.pipelineArrow}>→</span>
              <div className={styles.pipelineNode}>
                <span className={styles.pipelineNodeTitle}>Human Review</span>
                <span className={styles.pipelineNodeSub}>Approve / Revise / Export</span>
              </div>
            </div>

            <div className={styles.archPillars}>
              <div className={styles.pillar}>
                <h4>HMAC Callback Verification</h4>
                <p>
                  Asynchronous webhook delivery verifies dedicated secret headers, validates versioned plan envelopes, and rejects stale/expired attempt IDs.
                </p>
              </div>

              <div className={styles.pillar}>
                <h4>Transactional SQLite WAL</h4>
                <p>
                  Full write-ahead logging with immediate transaction locks, foreign key cascade integrity, and zero silent data overwrites.
                </p>
              </div>

              <div className={styles.pillar}>
                <h4>Fail-Safe Boundary</h4>
                <p>
                  Unauthenticated operator routes are shielded by loopback proxy enforcement, keeping persistent backend storage safe from public exposure.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className={styles.ctaBanner}>
          <h2>Test the studio live in your browser.</h2>
          <p>
            Experience brief authoring, AI positioning generation, review gates, and spreadsheet exports with zero setup in browser memory.
          </p>
          <div className={styles.heroActions}>
            <Link href="/demo" className={styles.primaryCta}>
              <span>Launch Interactive Demo</span>
              <Icon name="arrow" size={16} />
            </Link>
            <a
              href="https://github.com/jeushdev/campaign-brief-studio"
              target="_blank"
              rel="noreferrer"
              className={styles.secondaryCta}
            >
              <span>View Source on GitHub</span>
              <Icon name="external" size={14} />
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <strong>Campaign Brief Studio</strong> • Human-in-the-Loop AI Automation
          </div>
          <div className={styles.footerLinks}>
            <a href="#workflow">Workflow</a>
            <a href="#features">Capabilities</a>
            <a href="#architecture">Architecture</a>
            <Link href="/demo">Demo Sandbox</Link>
            <a href="https://github.com/jeushdev/campaign-brief-studio" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
