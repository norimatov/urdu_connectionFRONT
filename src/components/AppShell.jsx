import { useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import Avatar from './Avatar.jsx';
import CreatorFooter from './CreatorFooter.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../context/auth.jsx';
import { useTheme } from '../context/theme.jsx';

const NAV = [
  { to: '/app/feed', label: 'Asosiy', icon: '◉' },
  { to: '/app/groups', label: 'Guruhlar', icon: '◎' },
  { to: '/app/messages', label: 'Xabarlar', icon: '✉' },
  { to: '/app/profile', label: 'Profil', icon: '◌' },
  { to: '/app/settings', label: 'Sozlamalar', icon: '⚙' },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();

  // Vaqt hisoblash: faol (ko‘rinib turgan) sahifada har 30 soniyada yuboriladi
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') {
        api('/me/heartbeat', { method: 'POST', body: { seconds: 30 } }).catch(() => {});
      }
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const doLogout = () => {
    logout();
    nav('/');
  };

  return (
    <div className="app-shell">
      <div className="blob b1" />
      <div className="blob b2" />

      <aside className="sidebar glass">
        <Link to="/app/feed" className="brand"><Logo /></Link>
        <nav className="side-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to}>
              <span className="ico">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <div className="me">
            <Avatar name={user.fullName} size={38} />
            <div>
              <b>{user.fullName}</b>
              <small>@{user.username}</small>
            </div>
          </div>
          <div className="row">
            <button className="chip-btn" onClick={toggle}>{theme === 'dark' ? 'Kun' : 'Tun'}</button>
            <button className="chip-btn" onClick={doLogout}>Chiqish</button>
          </div>
          <CreatorFooter />
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>

      <nav className="bottom-nav glass">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to}>
            <span className="ico">{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
