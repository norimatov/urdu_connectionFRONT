import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout.jsx';
import Avatar from '../components/Avatar.jsx';
import { FEATURES, STEPS, WHY, DEMO_POSTS } from '../content.js';
import { useI18n } from '../context/i18n.jsx';

function PhoneMock() {
  const { tr } = useI18n();
  return (
    <div className="phone glass">
      <div className="phone-top">
        <span className="logo-mark sm">UC</span>
        <b>{tr({ uz: 'Hamjamiyat', en: 'Community' })}</b>
      </div>
      <div className="phone-tabs">
        <span className="active">{tr({ uz: 'Hammasi', en: 'All' })}</span>
        <span>{tr({ uz: 'E‘lonlar', en: 'Notices' })}</span>
        <span>{tr({ uz: 'Ish', en: 'Jobs' })}</span>
      </div>
      {DEMO_POSTS.map((p, i) => (
        <div className="mini-post glass" key={i}>
          <div className="post-head">
            <Avatar name={p.author} size={28} />
            <div>
              <small className="muted">{p.author}</small>
              <div className="mini-title">{tr(p.title)}</div>
            </div>
          </div>
          <small className="muted">♥ {p.likes} · 💬 {p.comments}</small>
        </div>
      ))}
      <small className="muted demo-note">{tr({ uz: 'Demo kontent', en: 'Demo content' })}</small>
    </div>
  );
}

export default function Landing() {
  const { tr } = useI18n();
  return (
    <PublicLayout>
      <section className="hero">
        <div className="hero-text">
          <span className="pill glass">
            {tr({ uz: 'Talabalar uchun yangi avlod platformasi', en: 'The next-gen platform for students' })}
          </span>
          <h1>{tr({ uz: 'Universitetingiz endi bitta joyda', en: 'Your university, all in one place' })}</h1>
          <p>
            {tr({
              uz: 'URDU CONNECT — talabalar uchun ijtimoiy tarmoq: hamjamiyat, xabarlar, e‘lonlar, ish va xizmatlar. Instagram, Facebook va Telegram qulayliklari bitta ilovada.',
              en: 'URDU CONNECT is a social network for students: community, messages, notices, jobs and services. The best of Instagram, Facebook and Telegram in one app.',
            })}
          </p>
          <div className="cta-row">
            <Link className="btn btn-primary btn-lg" to="/register">
              {tr({ uz: 'URDU CONNECTga qo‘shiling', en: 'Join URDU CONNECT' })}
            </Link>
            <a className="btn btn-ghost btn-lg" href="#features">
              {tr({ uz: 'Platformani o‘rganing', en: 'Explore the platform' })}
            </a>
          </div>
        </div>
        <div className="hero-visual"><PhoneMock /></div>
      </section>

      <section className="section">
        <h2>{tr({ uz: 'Nima uchun URDU CONNECT?', en: 'Why URDU CONNECT?' })}</h2>
        <div className="grid2 wide">
          {WHY.map((w, i) => <div className="card glass" key={i}>{tr(w)}</div>)}
        </div>
      </section>

      <section className="section" id="features">
        <h2>{tr({ uz: 'Asosiy imkoniyatlar', en: 'Key features' })}</h2>
        <p className="lead">{tr({ uz: 'Har bir talaba uchun kerak bo‘lgan hamma narsa.', en: 'Everything a student needs.' })}</p>
        <div className="grid3">
          {FEATURES.map((f, i) => (
            <div className="card glass" key={i}>
              <div className="feature-ico">{f.icon}</div>
              <h3>{tr(f.title)}</h3>
              <p className="muted">{tr(f.text)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>{tr({ uz: 'Qanday ishlaydi', en: 'How it works' })}</h2>
        <div className="grid4">
          {STEPS.map((s, i) => (
            <div className="card glass step" key={i}>
              <span className="step-no">{i + 1}</span>
              <h3>{tr(s.title)}</h3>
              <p className="muted">{tr(s.text)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section cta-band glass">
        <h2>{tr({ uz: 'Hamjamiyatga qo‘shilishga tayyormisiz?', en: 'Ready to join the community?' })}</h2>
        <p className="lead">{tr({ uz: 'Ro‘yxatdan o‘tish bir necha daqiqa oladi.', en: 'Sign-up takes just a few minutes.' })}</p>
        <div className="cta-row">
          <Link className="btn btn-primary btn-lg" to="/register">{tr({ uz: 'Ro‘yxatdan o‘tish', en: 'Sign up' })}</Link>
          <Link className="btn btn-ghost btn-lg" to="/about">{tr({ uz: 'Loyiha haqida', en: 'About the project' })}</Link>
        </div>
      </section>
    </PublicLayout>
  );
}
