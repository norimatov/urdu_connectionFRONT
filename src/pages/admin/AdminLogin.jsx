import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api, getToken, setToken } from '../../lib/api.js';
import Field from '../../components/Field.jsx';
import Logo from '../../components/Logo.jsx';

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (getToken('admin')) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const d = await api('/admin/login', { method: 'POST', body: { email, password } });
      setToken(d.token, 'admin');
      nav('/admin', { replace: true });
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-body">
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="center-screen">
        <form className="glass auth-card auth-form" onSubmit={submit}>
          <Logo />
          <h2>Boshqaruv markazi</h2>
          <Field label="Admin email"><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="Parol"><input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
          {err && <p className="error">{err}</p>}
          <button className="btn btn-primary btn-block" disabled={busy}>Kirish</button>
        </form>
      </div>
    </div>
  );
}
