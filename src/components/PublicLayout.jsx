import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo.jsx';
import CreatorFooter from './CreatorFooter.jsx';
import { useI18n } from '../context/i18n.jsx';
import { useTheme } from '../context/theme.jsx';
import { useAuth } from '../context/auth.jsx';

const L = {
  home: { uz: 'Bosh sahifa', en: 'Home' },
  about: { uz: 'Haqida', en: 'About' },
  login: { uz: 'Kirish', en: 'Log in' },
  register: { uz: 'Ro‘yxatdan o‘tish', en: 'Sign up' },
  open: { uz: 'Platformaga o‘tish', en: 'Open app' },
};

export default function PublicLayout({ children }) {
  const { lang, setLang, tr } = useI18n();
  const { theme, toggle } = useTheme();
  const { user } = useAuth();

  return (
    <div className="public">
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />

      <header className="topbar glass">
        <Link to="/" className="brand"><Logo /></Link>
        <nav className="top-nav">
          <NavLink to="/" end>{tr(L.home)}</NavLink>
          <NavLink to="/about">{tr(L.about)}</NavLink>
        </nav>
        <div className="top-actions">
          <button className="chip-btn" onClick={() => setLang(lang === 'uz' ? 'en' : 'uz')}>
            {lang === 'uz' ? 'EN' : 'UZ'}
          </button>
          <button className="chip-btn" onClick={toggle}>{theme === 'dark' ? 'Kun' : 'Tun'}</button>
          {user ? (
            <Link className="btn btn-primary" to="/app">{tr(L.open)}</Link>
          ) : (
            <>
              <Link className="btn btn-ghost" to="/login">{tr(L.login)}</Link>
              <Link className="btn btn-primary" to="/register">{tr(L.register)}</Link>
            </>
          )}
        </div>
      </header>

      <main className="public-main">{children}</main>

      <footer className="site-footer glass">
        <div className="footer-links">
          <Link to="/about">{tr(L.about)}</Link>
          <Link to="/privacy">Maxfiylik siyosati</Link>
          <Link to="/terms">Foydalanish shartlari</Link>
          <Link to="/about#contact">Aloqa</Link>
        </div>
        <CreatorFooter />
      </footer>
    </div>
  );
}
