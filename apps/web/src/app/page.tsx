export default function HomePage() {
  const stars = Array.from({ length: 22 }, (_, i) => ({
    left: `${(i * 17 + 7) % 100}%`,
    top: `${(i * 13 + 5) % 100}%`,
    dur: `${1.5 + (i % 5) * 0.5}s`,
    delay: `${(i * 0.3) % 2}s`,
    size: i % 3 === 0 ? '18px' : i % 3 === 1 ? '12px' : '8px',
  }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .kb-root {
          background: #080416;
          background-image:
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(139,92,246,.16) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 60%, rgba(16,185,129,.1) 0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 50% 90%, rgba(252,211,77,.08) 0%, transparent 50%);
          min-height: 100vh;
          font-family: 'Nunito', sans-serif;
          color: white;
          overflow-x: hidden;
        }
        .kb-root::before {
          content: '';
          position: fixed; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(139,92,246,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,.04) 1px, transparent 1px);
          background-size: 50px 50px;
          z-index: 0;
        }

        .df { font-family: 'Fredoka One', cursive; }

        /* ── Keyframes ── */
        @keyframes twinkle {
          0%,100% { opacity:.15; transform:scale(.8); }
          50%      { opacity:1;   transform:scale(1.3); }
        }
        @keyframes wobble {
          0%,100% { transform:translateY(0) rotate(-4deg) scale(1); }
          50%      { transform:translateY(-18px) rotate(4deg) scale(1.08); }
        }
        @keyframes shimmer {
          0%   { background-position:-200% center; }
          100% { background-position:200% center; }
        }
        @keyframes xpfill {
          0%   { width:0; }
          100% { width:74%; }
        }
        @keyframes slideUp {
          from { transform:translateY(36px); opacity:0; }
          to   { transform:translateY(0);    opacity:1; }
        }
        @keyframes popIn {
          0%   { transform:scale(0) rotate(-25deg); opacity:0; }
          65%  { transform:scale(1.15) rotate(4deg); }
          100% { transform:scale(1) rotate(0);    opacity:1; }
        }
        @keyframes shineBar {
          0%   { left:-60%; }
          100% { left:120%; }
        }

        /* ── Utility animations ── */
        .su1 { animation:slideUp .55s ease-out .08s both; }
        .su2 { animation:slideUp .55s ease-out .18s both; }
        .su3 { animation:slideUp .55s ease-out .28s both; }
        .su4 { animation:slideUp .55s ease-out .40s both; }
        .su5 { animation:slideUp .55s ease-out .52s both; }
        .pop1 { animation:popIn .55s cubic-bezier(.34,1.56,.64,1) .7s  both; }
        .pop2 { animation:popIn .55s cubic-bezier(.34,1.56,.64,1) .9s  both; }
        .pop3 { animation:popIn .55s cubic-bezier(.34,1.56,.64,1) 1.1s both; }
        .w1 { animation:wobble 3s ease-in-out infinite; }
        .w2 { animation:wobble 3.8s ease-in-out infinite .4s; }
        .w3 { animation:wobble 2.9s ease-in-out infinite .9s; }

        /* ── Shimmer text ── */
        .shimmer-txt {
          background:linear-gradient(90deg,#FCD34D 0%,#fff 40%,#FCD34D 60%,#fff 80%,#FCD34D 100%);
          background-size:200% auto;
          -webkit-background-clip:text; background-clip:text;
          -webkit-text-fill-color:transparent;
          animation:shimmer 3s linear infinite;
        }

        /* ── Buttons ── */
        .btn-gold {
          display:inline-flex; align-items:center; gap:8px;
          background:linear-gradient(180deg,#FCD34D 0%,#F59E0B 100%);
          border:3px solid #92400E; border-bottom-width:5px;
          color:#1C1917; font-family:'Fredoka One',cursive;
          font-size:1.05rem; padding:12px 30px; border-radius:12px;
          cursor:pointer; text-decoration:none; transition:all .12s;
          white-space:nowrap;
        }
        .btn-gold:hover  { transform:translateY(-2px); border-bottom-width:7px; filter:brightness(1.05); }
        .btn-gold:active { transform:translateY(2px);  border-bottom-width:3px; }

        .btn-ghost {
          display:inline-flex; align-items:center; gap:8px;
          background:rgba(255,255,255,.07); border:2px solid rgba(255,255,255,.22);
          color:white; font-family:'Fredoka One',cursive;
          font-size:1.05rem; padding:12px 30px; border-radius:12px;
          cursor:pointer; text-decoration:none; transition:all .2s;
          backdrop-filter:blur(10px); white-space:nowrap;
        }
        .btn-ghost:hover { background:rgba(255,255,255,.14); border-color:rgba(255,255,255,.4); transform:translateY(-2px); }

        .btn-sm { padding:8px 18px !important; font-size:.88rem !important; }

        /* ── Nav ── */
        .kb-nav {
          position:relative; z-index:20;
          display:flex; align-items:center; justify-content:space-between;
          padding:18px 28px; max-width:1100px; margin:0 auto;
        }
        .kb-logo { font-family:'Fredoka One',cursive; font-size:1.6rem; color:#FCD34D; text-decoration:none; }

        /* ── Hero ── */
        .kb-hero {
          position:relative; z-index:10;
          display:flex; align-items:center; gap:48px;
          max-width:1100px; margin:0 auto;
          padding:52px 28px 80px;
        }
        .kb-hero-text { flex:1; }

        /* ── Pill badge ── */
        .pill {
          display:inline-flex; align-items:center; gap:8px;
          background:rgba(139,92,246,.18); border:1px solid rgba(139,92,246,.38);
          border-radius:100px; padding:5px 14px;
          color:#C4B5FD; font-size:.82rem; font-weight:800;
          margin-bottom:22px;
        }
        .pill-tag {
          background:#8B5CF6; color:white; border-radius:100px;
          padding:2px 8px; font-size:.7rem; font-weight:800;
        }

        /* ── Player Card ── */
        .player-card {
          width:310px; flex-shrink:0;
          background:rgba(255,255,255,.05);
          border:1px solid rgba(255,255,255,.13);
          border-radius:20px; backdrop-filter:blur(20px);
          padding:24px;
        }
        .pc-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
        .pc-lbl { color:rgba(255,255,255,.42); font-size:.68rem; font-weight:800; margin-bottom:2px; }
        .pc-name { font-family:'Fredoka One',cursive; color:white; font-size:1.2rem; }
        .pc-level {
          background:linear-gradient(135deg,#FCD34D,#F59E0B);
          border-radius:10px; padding:7px 13px; text-align:center;
        }
        .pc-level-lbl { font-size:.58rem; font-weight:900; color:#78350F; letter-spacing:.1em; }
        .pc-level-num { font-family:'Fredoka One',cursive; font-size:1.5rem; color:#1C1917; line-height:1; }

        .xp-row { display:flex; justify-content:space-between; margin-bottom:6px; }
        .xp-row span:first-child { color:rgba(255,255,255,.42); font-size:.68rem; font-weight:800; }
        .xp-row span:last-child  { color:#A78BFA; font-size:.68rem; font-weight:900; }
        .xp-bg {
          background:rgba(255,255,255,.09); border:1px solid rgba(255,255,255,.13);
          border-radius:100px; height:13px; overflow:hidden; margin-bottom:20px; position:relative;
        }
        .xp-fill {
          height:100%; border-radius:100px;
          background:linear-gradient(90deg,#8B5CF6,#EC4899);
          animation:xpfill 1.4s ease-out .6s both;
          position:relative; overflow:hidden;
        }
        .xp-fill::after {
          content:''; position:absolute; top:0; left:-60%; width:50%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.45),transparent);
          animation:shineBar 2s linear infinite;
        }

        .pc-stats { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:18px; }
        .pc-stat {
          background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.07);
          border-radius:10px; padding:9px 6px; text-align:center;
        }
        .pc-stat-icon { font-size:1.1rem; }
        .pc-stat-val  { font-family:'Fredoka One',cursive; color:white; font-size:.95rem; line-height:1.2; }
        .pc-stat-lbl  { color:rgba(255,255,255,.38); font-size:.6rem; font-weight:800; }

        .pc-badge-row { display:flex; gap:7px; }
        .pc-badge {
          width:38px; height:38px; border-radius:10px;
          display:flex; align-items:center; justify-content:center; font-size:1.1rem;
          border:1px solid;
        }

        /* ── Stats strip ── */
        .stats-strip {
          position:relative; z-index:10;
          border-top:1px solid rgba(255,255,255,.06);
          border-bottom:1px solid rgba(255,255,255,.06);
          background:rgba(255,255,255,.025);
        }
        .stats-inner {
          display:grid; grid-template-columns:repeat(4,1fr);
          max-width:1100px; margin:0 auto;
        }
        .stat-cell {
          padding:26px 20px; text-align:center;
          border-right:1px solid rgba(255,255,255,.06);
        }
        .stat-cell:last-child { border-right:none; }
        .stat-val { font-family:'Fredoka One',cursive; font-size:2rem; line-height:1; }
        .stat-lbl { color:rgba(255,255,255,.4); font-size:.75rem; font-weight:800; margin-top:3px; }

        /* ── Features ── */
        .features-section { position:relative; z-index:10; padding:72px 28px; max-width:1100px; margin:0 auto; }
        .section-pill {
          display:inline-block;
          background:rgba(252,211,77,.1); border:1px solid rgba(252,211,77,.28);
          border-radius:100px; padding:5px 14px;
          color:#FCD34D; font-size:.75rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase;
          margin-bottom:14px;
        }
        .section-title { font-family:'Fredoka One',cursive; font-size:clamp(2rem,5vw,3.2rem); color:white; margin-bottom:10px; }
        .section-sub   { color:rgba(255,255,255,.45); font-size:.95rem; font-weight:700; max-width:440px; margin:0 auto; line-height:1.6; }

        .features-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:18px; margin-top:48px; }
        .feat-card {
          background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.09);
          border-radius:18px; padding:26px; transition:all .3s;
          position:relative; overflow:hidden;
        }
        .feat-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:18px 18px 0 0;
        }
        .feat-card:hover { transform:translateY(-6px); background:rgba(255,255,255,.07); border-color:rgba(255,255,255,.22); }
        .feat-yellow::before { background:linear-gradient(90deg,#FCD34D,#F59E0B); }
        .feat-purple::before { background:linear-gradient(90deg,#8B5CF6,#6D28D9); }
        .feat-green::before  { background:linear-gradient(90deg,#10B981,#059669); }
        .feat-pink::before   { background:linear-gradient(90deg,#EC4899,#BE185D); }
        .feat-icon  { font-size:2.2rem; margin-bottom:14px; }
        .feat-title { font-family:'Fredoka One',cursive; color:white; font-size:1.2rem; margin-bottom:8px; }
        .feat-desc  { color:rgba(255,255,255,.5); font-size:.875rem; line-height:1.65; font-weight:700; }

        /* ── Steps ── */
        .steps-section { position:relative; z-index:10; padding:0 28px 72px; max-width:1100px; margin:0 auto; }
        .steps-grid    { display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:28px; margin-top:48px; }
        .step-n {
          font-family:'Fredoka One',cursive; font-size:5.5rem; line-height:1;
          -webkit-text-stroke:2px rgba(255,255,255,.08); -webkit-text-fill-color:transparent;
          margin-bottom:-16px;
        }
        .step-body {
          background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.09);
          border-radius:18px; padding:22px;
        }
        .step-icon  { font-size:1.8rem; margin-bottom:10px; }
        .step-title { font-family:'Fredoka One',cursive; color:white; font-size:1.1rem; margin-bottom:6px; }
        .step-desc  { color:rgba(255,255,255,.45); font-size:.85rem; line-height:1.6; font-weight:700; }

        /* ── CTA ── */
        .cta-section { position:relative; z-index:10; padding:0 28px 80px; text-align:center; }
        .cta-box {
          max-width:580px; margin:0 auto;
          background:rgba(139,92,246,.1); border:1px solid rgba(139,92,246,.28);
          border-radius:26px; padding:52px 36px; position:relative; overflow:hidden;
        }
        .cta-box::before {
          content:''; position:absolute; inset:0; pointer-events:none;
          background:radial-gradient(ellipse 60% 50% at 50% 100%,rgba(139,92,246,.22),transparent);
        }
        .cta-emoji  { font-size:2.8rem; margin-bottom:14px; display:inline-block; }
        .cta-title  { font-family:'Fredoka One',cursive; font-size:clamp(1.7rem,4vw,2.6rem); color:white; margin-bottom:10px; position:relative; }
        .cta-sub    { color:rgba(255,255,255,.5); font-size:.95rem; font-weight:700; margin-bottom:28px; position:relative; }
        .cta-btns   { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; position:relative; }

        /* ── Footer ── */
        .kb-footer {
          position:relative; z-index:10;
          border-top:1px solid rgba(255,255,255,.06);
          padding:22px 28px; text-align:center;
          color:rgba(255,255,255,.22); font-size:.78rem; font-weight:700;
        }

        /* ── Trust row ── */
        .trust-row { display:flex; gap:20px; flex-wrap:wrap; align-items:center; }
        .trust-item { display:flex; align-items:center; gap:5px; color:rgba(255,255,255,.42); font-size:.8rem; font-weight:800; }

        /* ── Responsive ── */
        @media (max-width:780px) {
          .player-card { display:none; }
          .kb-hero     { flex-direction:column; text-align:center; padding-top:36px; }
          .trust-row   { justify-content:center; }
          .stats-inner { grid-template-columns:repeat(2,1fr); }
          .stat-cell:nth-child(2) { border-right:none; }
        }
        @media (max-width:480px) {
          .stats-inner { grid-template-columns:1fr 1fr; }
        }
      `}</style>

      <div className="kb-root">
        {/* ── Starfield ── */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
          {stars.map((s, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: s.left,
                top: s.top,
                fontSize: s.size,
                color: 'rgba(255,255,255,0.6)',
                animation: `twinkle ${s.dur} ease-in-out infinite ${s.delay}`,
              }}
            >
              ✦
            </div>
          ))}
        </div>

        {/* ── Nav ── */}
        <nav className="kb-nav">
          <a href="/" className="kb-logo">⭐ Koblio</a>
          <div style={{ display: 'flex', gap: '10px' }}>
            <a href="/login" className="btn-ghost btn-sm">Sign In</a>
            <a href="/register?role=teacher" className="btn-ghost btn-sm" style={{ borderColor: 'rgba(139,92,246,.45)', color: '#C4B5FD' }}>
              For Teachers
            </a>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="kb-hero">
          {/* Left */}
          <div className="kb-hero-text">
            <div className="pill su1">
              <span>🎮</span>
              <span>Adaptive Math · Grades K–6</span>
              <span className="pill-tag">FREE</span>
            </div>

            <h1 className="df su2" style={{ fontSize: 'clamp(2.8rem,8vw,5.2rem)', lineHeight: 1.05, marginBottom: '14px' }}>
              Math Should<br />
              <span className="shimmer-txt">Feel Like a Game.</span>
            </h1>

            <p className="su3" style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,.6)', maxWidth: '500px', lineHeight: 1.65, marginBottom: '32px', fontWeight: 700 }}>
              Koblio adapts to every student's level, rewards real progress with XP, coins, and badges, and keeps kids coming back every day.
            </p>

            <div className="su4" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
              <a href="/register" className="btn-gold">🚀 Start for Free</a>
              <a href="/register?role=teacher" className="btn-ghost">🏫 I'm a Teacher</a>
            </div>

            <div className="trust-row su5">
              {[['✅', 'US Common Core'], ['🔒', 'COPPA Safe'], ['🎓', 'Teacher-loved']].map(([e, t]) => (
                <div key={t} className="trust-item"><span>{e}</span><span>{t}</span></div>
              ))}
            </div>
          </div>

          {/* Right — Player Card */}
          <div className="player-card su3">
            <div className="pc-header">
              <div>
                <div className="pc-lbl">PLAYER</div>
                <div className="pc-name">Alex M.</div>
              </div>
              <div className="pc-level">
                <div className="pc-level-lbl">LEVEL</div>
                <div className="pc-level-num">14</div>
              </div>
            </div>

            <div className="xp-row">
              <span>EXPERIENCE</span>
              <span>2,340 / 3,200 XP</span>
            </div>
            <div className="xp-bg"><div className="xp-fill" /></div>

            <div className="pc-stats">
              {[['🪙', '847', 'Coins'], ['🔥', '12', 'Streak'], ['🏆', '#3', 'Rank']].map(([icon, val, lbl]) => (
                <div key={lbl} className="pc-stat">
                  <div className="pc-stat-icon">{icon}</div>
                  <div className="pc-stat-val">{val}</div>
                  <div className="pc-stat-lbl">{lbl}</div>
                </div>
              ))}
            </div>

            <div className="pc-lbl" style={{ marginBottom: '10px' }}>RECENT BADGES</div>
            <div className="pc-badge-row">
              {[
                ['🌟', '#FCD34D'],
                ['⚡', '#8B5CF6'],
                ['🎯', '#10B981'],
                ['💎', '#6366F1'],
                ['🦊', '#EC4899'],
              ].map(([badge, color], i) => (
                <div
                  key={i}
                  className="pc-badge"
                  style={{
                    background: `${color}22`,
                    borderColor: `${color}55`,
                    animation: `wobble ${2.5 + i * 0.28}s ease-in-out infinite ${i * 0.18}s`,
                  }}
                >
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats strip ── */}
        <div className="stats-strip">
          <div className="stats-inner">
            {[
              ['50K+', 'Problems Solved', '#FCD34D'],
              ['98%',  'Kids Love It',    '#10B981'],
              ['2.4×', 'Faster Learning', '#8B5CF6'],
              ['K–6',  'Grades Covered',  '#EC4899'],
            ].map(([val, lbl, color]) => (
              <div key={lbl} className="stat-cell">
                <div className="stat-val" style={{ color }}>{val}</div>
                <div className="stat-lbl">{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Features ── */}
        <section className="features-section">
          <div style={{ textAlign: 'center' }}>
            <div className="section-pill">🎮 Game Mechanics</div>
            <h2 className="section-title">Built Different.</h2>
            <p className="section-sub">Not flashcards with a coat of paint. Real game loops that make kids want to practice every day.</p>
          </div>
          <div className="features-grid">
            {[
              { color: 'yellow', icon: '🧠', title: 'Adapts in Real-Time',    desc: 'Bayesian Knowledge Tracing tracks mastery per skill. Too easy? Gets harder. Struggling? Steps back and rebuilds confidence.' },
              { color: 'purple', icon: '⚡', title: 'XP, Coins & Badges',     desc: 'Every correct answer earns rewards. Unlock badges, level up your character, and climb the class leaderboard.' },
              { color: 'green',  icon: '🔁', title: 'Smart Spaced Review',    desc: 'FSRS-4.5 schedules the perfect review moment — skills stick for life, not just until the test.' },
              { color: 'pink',   icon: '📊', title: 'Teacher Superpowers',    desc: "See every student's mastery map, assign targeted practice, and spot who's falling behind before it's too late." },
            ].map((f) => (
              <div key={f.title} className={`feat-card feat-${f.color}`}>
                <div className="feat-icon">{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="steps-section">
          <div style={{ textAlign: 'center' }}>
            <h2 className="section-title">Up and Running in Minutes</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>Three steps from signup to your first class session.</p>
          </div>
          <div className="steps-grid">
            {[
              { n: '1', icon: '✏️', title: 'Teacher Creates Class',  desc: 'Sign up free, create your classroom, get a join code. Done in under 60 seconds.' },
              { n: '2', icon: '🎮', title: 'Students Start Playing',  desc: "Kids join with the code, pick their avatar, and start earning XP on day one." },
              { n: '3', icon: '📈', title: 'Watch Them Grow',         desc: 'The AI handles differentiation. You get a live mastery dashboard and weekly reports.' },
            ].map((s) => (
              <div key={s.n}>
                <div className="step-n">{s.n}</div>
                <div className="step-body">
                  <div className="step-icon">{s.icon}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta-section">
          <div className="cta-box">
            <div className="cta-emoji w1">🚀</div>
            <h2 className="cta-title">Ready to Level Up?</h2>
            <p className="cta-sub">Free for teachers. Students join instantly. No credit card ever required.</p>
            <div className="cta-btns">
              <a href="/register" className="btn-gold" style={{ fontSize: '1.1rem', padding: '13px 34px' }}>🎮 Start for Free</a>
              <a href="/login" className="btn-ghost">Sign In</a>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="kb-footer">
          © 2026 Koblio · Adaptive Math Learning for K–6 · Built for Teachers, Students &amp; Parents
        </footer>
      </div>
    </>
  );
}
