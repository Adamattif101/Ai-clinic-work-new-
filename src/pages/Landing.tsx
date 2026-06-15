import { Link } from 'react-router-dom';

// Public marketing landing page (shown at "/"). Calm, premium, light theme.
// Aimed at prospective clinics; routes through to the live demo.
const FEATURES = [
  { ic: '📝', title: 'Notes to insight', body: 'Turn your own session notes into a clear client summary, a “what changed” recap, and a pre-session prep brief — a drafting aid you review and own.' },
  { ic: '📅', title: 'Effortless admin', body: 'Scheduling, intake forms, consent capture, automated reminders and billing reminders — the busywork, handled.' },
  { ic: '📊', title: 'Owner dashboard', body: 'See caseload, room and clinician utilisation, no-show rate, and wellbeing engagement trends at a glance.' },
  { ic: '🌱', title: 'Patient companion', body: 'A clinic-branded space for journaling, daily wellbeing check-ins, and therapist-assigned exercises.' },
  { ic: '🛟', title: 'Built-in safety', body: 'A deterministic safety layer surfaces UK helplines (Samaritans 116 123, 999) before any free-text chat. Always signposting, never advice.' },
  { ic: '🔒', title: 'Compliance first', body: 'UK GDPR by design: per-clinic data isolation, audit logs, explicit consent, UK/EU residency, and easy data export.' },
];

export default function Landing() {
  return (
    <div className="land">
      <nav className="land-nav">
        <div className="land-brand">Wellspring</div>
        <Link to="/dashboard" className="btn">View live demo</Link>
      </nav>

      <header className="hero">
        <span className="pill fade-up">For private UK therapy &amp; counselling clinics</span>
        <h1 className="fade-up d1">
          The calm <span className="grad">operating system</span> for your practice
        </h1>
        <p className="fade-up d2">
          Wellspring turns your session notes into clear summaries, automates the admin,
          and gives your clients a gentle wellbeing companion — so you can focus on the work that matters.
        </p>
        <div className="hero-cta fade-up d3">
          <Link to="/dashboard" className="btn">Explore the demo</Link>
          <a href="#features" className="btn btn-ghost">See features</a>
        </div>

        <div className="hero-preview fade-up d3" aria-hidden="true">
          <div className="bar"><i></i><i></i><i></i></div>
          <div className="body">
            <div className="hp-side"></div>
            <div className="hp-main">
              <div className="hp-card"></div><div className="hp-card"></div><div className="hp-card"></div>
              <div className="hp-wide"></div>
            </div>
          </div>
        </div>
      </header>

      <section className="stats-strip">
        <div><b>2,400+</b><span>notes summarised</span></div>
        <div><b>17%→6%</b><span>no-show reduction</span></div>
        <div><b>5 min</b><span>to write up a session</span></div>
        <div><b>100%</b><span>UK/EU data residency</span></div>
      </section>

      <section className="section" id="features">
        <h2>Everything a small clinic needs</h2>
        <p className="sub">One tool for the clinician side and the client side — role-gated, secure, and refreshingly simple.</p>
        <div className="feat-grid">
          {FEATURES.map((f) => (
            <div className="feat" key={f.title}>
              <div className="ic">{f.ic}</div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>From notes to insight in three steps</h2>
        <p className="sub">No new workflow to learn — paste what you already write.</p>
        <div className="steps">
          <div className="step"><span className="num">1</span><h3>Write your notes</h3><p>Type or paste your session notes as you always have.</p></div>
          <div className="step"><span className="num">2</span><h3>Generate a draft</h3><p>Get a structured summary, a “what changed” recap, or a prep brief.</p></div>
          <div className="step"><span className="num">3</span><h3>Review &amp; own it</h3><p>You check and edit the draft — it’s a drafting aid, not clinical advice.</p></div>
        </div>
      </section>

      <section className="section">
        <div className="quote">
          <p>“It gives me back the hour I used to spend writing up sessions — and my clients love the wellbeing companion between appointments.”</p>
          <div className="who"><span className="av">PS</span> Dr Priya Sharma · Edgbaston Wellbeing Practice</div>
        </div>
      </section>

      <section className="section">
        <div className="band">
          <h2>A wellbeing &amp; admin tool — not a medical device</h2>
          <p>
            Wellspring never diagnoses, screens, triages or monitors clinical conditions.
            It supports your practice and your clients’ wellbeing, with your clinical judgement always in charge.
          </p>
          <div className="chips">
            <span className="chip">UK GDPR by design</span>
            <span className="chip">Per-clinic isolation</span>
            <span className="chip">UK/EU data residency</span>
            <span className="chip">Full audit trail</span>
            <span className="chip">Explicit consent</span>
          </div>
        </div>
      </section>

      <section className="section" style={{ textAlign: 'center' }}>
        <h2>See it in action</h2>
        <p className="sub">Browse the full demo — no sign-up needed.</p>
        <Link to="/dashboard" className="btn">Open the live demo →</Link>
      </section>

      <footer className="land-footer">
        © {new Date().getFullYear()} Wellspring · Wellbeing &amp; practice-administration support · Not a medical device
      </footer>
    </div>
  );
}
