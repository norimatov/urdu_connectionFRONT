import { useState } from 'react';
import { Link } from 'react-router-dom';
import Field from '../components/Field.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../context/auth.jsx';

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const [profile, setProfile] = useState({
    fullName: user.fullName, university: user.university, faculty: user.faculty, bio: user.bio || '',
  });
  const [pw, setPw] = useState({ current: '', next: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const d = await api('/me', { method: 'PATCH', body: profile });
      setUser(d.user);
      setMsg({ type: 'success', text: 'Profil saqlandi' });
    } catch (ex) {
      setMsg({ type: 'error', text: ex.message });
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/me/password', { method: 'POST', body: pw });
      setPw({ current: '', next: '' });
      setMsg({ type: 'success', text: 'Parol yangilandi' });
    } catch (ex) {
      setMsg({ type: 'error', text: ex.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <div className="page-head"><h1>Sozlamalar</h1></div>

      <section className="glass panel-lg">
        <h3>Tasdiqlash holati</h3>
        <div className="row">
          <span className={`pill-sm ${user.emailVerified ? 'ok' : 'warn'}`}>Email: {user.emailVerified ? 'tasdiqlangan' : 'tasdiqlanmagan'}</span>
          <span className={`pill-sm ${user.phoneVerified ? 'ok' : 'warn'}`}>Telefon: {user.phoneVerified ? 'tasdiqlangan' : 'tasdiqlanmagan'}</span>
        </div>
        {!(user.emailVerified && user.phoneVerified) && <Link className="btn btn-ghost btn-sm" to="/verify">Tasdiqlashga o‘tish</Link>}
      </section>

      <form className="glass panel-lg auth-form" onSubmit={saveProfile}>
        <h3>Profil ma‘lumotlari</h3>
        <Field label="Ism familiya">
          <input className="input" required minLength={2} value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
        </Field>
        <div className="grid2">
          <Field label="Universitet">
            <input className="input" value={profile.university} onChange={(e) => setProfile({ ...profile, university: e.target.value })} />
          </Field>
          <Field label="Fakultet">
            <input className="input" value={profile.faculty} onChange={(e) => setProfile({ ...profile, faculty: e.target.value })} />
          </Field>
        </div>
        <Field label="Bio">
          <textarea className="textarea" maxLength={300} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
        </Field>
        <button className="btn btn-primary" disabled={busy}>Saqlash</button>
      </form>

      <form className="glass panel-lg auth-form" onSubmit={changePassword}>
        <h3>Parolni o‘zgartirish</h3>
        <Field label="Joriy parol">
          <input className="input" type="password" required value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
        </Field>
        <Field label="Yangi parol (kamida 8 belgi)">
          <input className="input" type="password" required minLength={8} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
        </Field>
        <button className="btn btn-primary" disabled={busy}>Parolni yangilash</button>
      </form>

      <section className="glass panel-lg">
        <h3>Akkaunt</h3>
        <p className="muted">Email: {user.email}</p>
        <p className="muted">Telefon: {user.phone}</p>
        <button className="btn btn-danger" onClick={() => { logout(); }}>Chiqish</button>
      </section>

      {msg.text && <p className={msg.type === 'error' ? 'error' : 'success'}>{msg.text}</p>}
    </div>
  );
}
