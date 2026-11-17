import { Link } from "react-router-dom";
import Darkmode from "./Utilities/Darkmode";
import "./Home.css";

const FEATURES = [
  {
    title: "Direct messages",
    text: "Real-time one-to-one chat with anyone who's online.",
    icon: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />,
  },
  {
    title: "Group room",
    text: "One shared space to keep the whole house in the loop.",
    icon: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6" />
      </>
    ),
  },
  {
    title: "Voice dictation",
    text: "Tap the mic and say it, for when typing feels slow.",
    icon: (
      <>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </>
    ),
  },
  {
    title: "Session thoughts",
    text: "Set a short status so everyone knows what you're up to.",
    icon: <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />,
  },
];

function Arrow() {
  return (
    <svg className="home-arrow" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

function Brand() {
  return (
    <Link to="/" className="home-brand" aria-label="BinChat home">
      <span className="home-brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-6l-5 4v-4a2 2 0 0 1-2-2V7Z" />
        </svg>
      </span>
      BinChat
    </Link>
  );
}

function ChatPreview() {
  return (
    <div className="home-preview" aria-hidden="true">
      <div className="home-preview-head">
        <span className="home-preview-avatar">#</span>
        <div>
          <strong>Roommates</strong>
          <span><i className="home-dot" /> 3 online</span>
        </div>
      </div>
      <div className="home-preview-body">
        <p className="home-msg">
          <span className="home-msg-name">Maya</span>
          Anyone want to split groceries tonight?
        </p>
        <p className="home-msg home-msg-me">Yes! I'll grab the list 🛒</p>
        <p className="home-msg">
          <span className="home-msg-name">Jules</span>
          Count me in, back by 7
        </p>
        <div className="home-typing"><i /><i /><i /></div>
      </div>
      <div className="home-preview-input">
        <span>Message Roommates…</span>
        <span className="home-preview-send"><Arrow /></span>
      </div>
    </div>
  );
}

function Home() {
  return (
    <main className="home">
      <header className="home-header">
        <Brand />
        <nav className="home-header-actions">
          <Darkmode />
          <Link to="/login" className="home-link">Log in</Link>
          <Link to="/register" className="home-btn home-btn-sm">Sign up</Link>
        </nav>
      </header>

      <section className="home-hero">
        <span className="home-pill"><i className="home-dot" /> Real-time chat for roommates</span>
        <h1>
          Chat that feels
          <br />
          like <span className="home-gradient">home.</span>
        </h1>
        <p className="home-lede">
          One simple place for the people you live with. Message, plan, and
          check in without the noise.
        </p>
        <div className="home-cta">
          <Link to="/register" className="home-btn">Get started <Arrow /></Link>
          <Link to="/login" className="home-btn home-btn-ghost">I have an account</Link>
        </div>
        <ChatPreview />
      </section>

      <section className="home-features" aria-labelledby="features-title">
        <h2 id="features-title">Everything you need. Nothing you don't.</h2>
        <div className="home-grid">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="home-card">
              <span className="home-card-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">{feature.icon}</svg>
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-final">
        <h2>Your roommates are one message away.</h2>
        <Link to="/register" className="home-btn">Create your account <Arrow /></Link>
      </section>

      <footer className="home-footer">
        <Brand />
        <span>© {new Date().getFullYear()} BinChat</span>
      </footer>
    </main>
  );
}

export default Home;
