import "@/app/certificate/certificate.css";

const Sparkle = ({
  className = "",
  size = 24,
}: {
  className?: string;
  size?: number;
}) => (
  <svg
    aria-hidden="true"
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M12 1.75c.35 6.92 3.33 9.9 10.25 10.25C15.33 12.35 12.35 15.33 12 22.25 11.65 15.33 8.67 12.35 1.75 12 8.67 11.65 11.65 8.67 12 1.75Z"
      fill="currentColor"
    />
  </svg>
);

function Background() {
  return (
    <div className="background-layer" aria-hidden="true">
      <div className="inner-border" />
      <div className="corner-mark corner-mark-top" />
      <div className="corner-mark corner-mark-bottom" />
    </div>
  );
}

function PixelAccents() {
  return (
    <div className="pixel-accents" aria-hidden="true">
      <div className="pixel-cluster pixel-top">
        <i className="pixel p1" />
        <i className="pixel p2" />
        <i className="pixel p3" />
        <i className="pixel p4" />
        <i className="pixel p5" />
        <i className="pixel p6" />
        <i className="pixel p7" />
        <i className="pixel p8" />
      </div>
      <div className="pixel-cluster pixel-bottom">
        <i className="pixel p1" />
        <i className="pixel p2" />
        <i className="pixel p3" />
        <i className="pixel p4" />
        <i className="pixel p5" />
        <i className="pixel p6" />
      </div>
      <i className="stray-pixel stray-one" />
      <i className="stray-pixel stray-two" />
    </div>
  );
}

function Seal() {
  return (
    <div className="seal-wrap">
      <Sparkle className="seal-sparkle" size={28} />
      <div className="seal" aria-label="BIT and BIS Award of Excellence seal">
        <svg viewBox="0 0 160 160" role="img" aria-hidden="true">
          <circle cx="80" cy="80" r="73" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="80" cy="80" r="58" fill="none" stroke="currentColor" strokeWidth="1" opacity=".72" />
          <path
            d="M80 45.5 88.1 62l18.2 2.65-13.15 12.8 3.1 18.1L80 87l-16.25 8.55 3.1-18.1-13.15-12.8L71.9 62 80 45.5Z"
            fill="currentColor"
          />
          <path
            d="M53.5 102.5c-8-8.4-12.2-18.3-13-28.5M106.5 102.5c8-8.4 12.2-18.3 13-28.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M48 95.5 39 92m5-5.5-8-5.5m7-2.5-6-8M112 95.5l9-3.5m-5-5.5 8-5.5m-7-2.5 6-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span>EXCELLENCE</span>
      </div>
    </div>
  );
}

function BluePanel() {
  return (
    <aside className="blue-panel" aria-label="Award distinction panel">
      <div className="circuit-pattern" aria-hidden="true">
        <svg viewBox="0 0 680 980" preserveAspectRatio="none">
          <path d="M45 40v170h110v100h130v145h145v120h170" />
          <path d="M620 115H470v125H350v125H210v160H70" />
          <path d="M590 690H440v-90H305v120H160v155H45" />
          <path d="M660 830H510v-90h-90v170H250" />
          <circle cx="155" cy="210" r="7" />
          <circle cx="285" cy="455" r="7" />
          <circle cx="470" cy="240" r="7" />
          <circle cx="305" cy="720" r="7" />
          <circle cx="510" cy="830" r="7" />
          <circle cx="160" cy="875" r="7" />
        </svg>
      </div>

      <div className="panel-copy">
        <Sparkle className="title-sparkle" size={30} />
        <p className="panel-kicker">BIT · BIS</p>
        <h2>
          Award of
          <br />
          Recognition
        </h2>
        <div className="panel-rule" />
        <p className="panel-description">
          Celebrating innovation in technology and information systems
        </p>
      </div>
      <Seal />
    </aside>
  );
}

function LogoMark() {
  return (
    <div className="brand">
      <div className="logo-mark" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <span className="brand-name">BIT/BIS AWARDS</span>
    </div>
  );
}

function Signature({ title }: { title: string }) {
  return (
    <div className="signature">
      <div className="signature-line" />
      <p>{title}</p>
    </div>
  );
}

function Text({
  recipient,
  category,
}: {
  recipient: string;
  category: string;
}) {
  return (
    <main className="text-layer">
      <LogoMark />

      <section className="award-copy">
        <div className="heading-block">
          <span className="cyan-line" aria-hidden="true" />
          <div>
            <h1>Certificate of {category}</h1>
          </div>
        </div>

        <p className="presented">This certificate is proudly presented to</p>
        <input
          className="recipient-name"
          aria-label="Student name"
          defaultValue={recipient}
          maxLength={40}
          spellCheck={false}
        />
        <div className="gold-divider" />
        <p className="recognition-copy">
          in recognition of outstanding contribution, dedication and the support
          of classmates in the <strong>BIT / BIS</strong> programme during the{" "}
          <strong>2026</strong> academic year.
        </p>
      </section>

      <footer className="signatures">
        <Signature title="Head of Department" />
        <div className="date">
          <span>Date</span>
          <div />
        </div>
        <Signature title="Programme Coordinator" />
      </footer>
    </main>
  );
}

export default function App({
  recipient = "{student.name}",
  category = "Excellence",
}: {
  recipient?: string;
  category?: string;
} = {}) {
  return (
    <div className="certificate-scope">
      <article className="certificate" aria-label="BIT and BIS Award of Recognition">
        <Background />
        <Text recipient={recipient} category={category} />
        <BluePanel />
        <PixelAccents />
      </article>
    </div>
  );
}
