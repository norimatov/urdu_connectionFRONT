import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout.jsx';
import Field from '../components/Field.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../context/auth.jsx';

const TITLES = {
  login: 'Tizimga kirish',
  register: 'Ro‘yxatdan o‘tish',
  forgot: 'Parolni tiklash',
  verify: 'Akkauntni tasdiqlash',
};

export default function Auth({ mode }) {
  const nav = useNavigate();
  const { user, saveSession, setUser, logout } = useAuth();
  const [f, setF] = useState({
    username: '', fullName: '', email: '', phone: '+998', password: '',
    university: '', faculty: '', identifier: '', code: '', newPassword: '',
  });
  const [step, setStep] = useState(1);
  const [codes, setCodes] = useState({ email: '', phone: '' });
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const run = async (fn) => {
    setBusy(true);
    setErr('');
    setOk('');
    try {
      await fn();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const doLogin = (e) => {
    e.preventDefault();
    run(async () => {
      const d = await api('/auth/login', { method: 'POST', body: { identifier: f.identifier, password: f.password } });
      saveSession(d.token, d.user);
      nav(d.user.emailVerified && d.user.phoneVerified ? '/app' : '/verify');
    });
  };

  const doRegister = (e) => {
    e.preventDefault();
    run(async () => {
      const d = await api('/auth/register', {
        method: 'POST',
        body: {
          username: f.username, fullName: f.fullName, email: f.email, phone: f.phone,
          password: f.password, university: f.university, faculty: f.faculty,
        },
      });
      saveSession(d.token, d.user);
      nav('/verify');
    });
  };

  const doForgot = (e) => {
    e.preventDefault();
    run(async () => {
      if (step === 1) {
        await api('/auth/forgot', { method: 'POST', body: { email: f.email } });
        setStep(2);
        setOk('Agar email ro‘yxatdan o‘tgan bo‘lsa, kod yuborildi');
      } else {
        await api('/auth/reset', { method: 'POST', body: { email: f.email, code: f.code, password: f.newPassword } });
        setOk('Parol yangilandi. Endi tizimga kiring');
        setTimeout(() => nav('/login'), 1200);
      }
    });
  };

  const verifyChannel = (ch) =>
    run(async () => {
      const d = await api('/auth/verify', { method: 'POST', body: { channel: ch, code: codes[ch] } });
      setUser(d.user);
      setCodes((c) => ({ ...c, [ch]: '' }));
      setOk(ch === 'email' ? 'Email tasdiqlandi' : 'Telefon tasdiqlandi');
      if (d.user.emailVerified && d.user.phoneVerified) nav('/app');
    });

  const resend = (ch) =>
    run(async () => {
      await api('/auth/resend', { method: 'POST', body: { channel: ch } });
      setOk('Kod qayta yuborildi');
    });

  if (mode === 'verify') {
    return (
      <PublicLayout>
        <div className="auth-wrap">
          <div className="glass auth-card wide">
            <h2>{TITLES.verify}</h2>
            <p className="muted">Email va telefoningizga yuborilgan 6 xonali kodlarni kiriting. Kod 10 daqiqa amal qiladi.</p>
            {['email', 'phone'].map((ch) => {
              const done = ch === 'email' ? user.emailVerified : user.phoneVerified;
              return (
                <div className="verify-row" key={ch}>
                  <div className="grow">
                    <b>{ch === 'email' ? 'Email' : 'Telefon'}</b>
                    <small className="muted">{ch === 'email' ? user.email : user.phone}</small>
                  </div>
                  {done ? (
                    <span className="ok-badge">Tasdiqlangan</span>
                  ) : (
                    <div className="row">
                      <input
                        className="input code"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        value={codes[ch]}
                        onChange={(e) => setCodes((c) => ({ ...c, [ch]: e.target.value.replace(/\D/g, '') }))}
                      />
                      <button className="btn btn-primary" disabled={busy || codes[ch].length !== 6} onClick={() => verifyChannel(ch)}>
                        Tasdiqlash
                      </button>
                      <button className="btn btn-ghost" disabled={busy} onClick={() => resend(ch)}>Qayta yuborish</button>
                    </div>
                  )}
                </div>
              );
            })}
            {err && <p className="error">{err}</p>}
            {ok && <p className="success">{ok}</p>}
            <button className="btn btn-ghost" onClick={() => { logout(); nav('/login'); }}>Boshqa akkaunt</button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="auth-wrap">
        <div className={`glass auth-card ${mode === 'register' ? 'wide' : ''}`}>
          <h2>{TITLES[mode]}</h2>
          <form
            className="auth-form"
            onSubmit={mode === 'login' ? doLogin : mode === 'register' ? doRegister : doForgot}
          >
            {mode === 'login' && (
              <>
                <Field label="Email, username yoki telefon">
                  <input className="input" required value={f.identifier} onChange={set('identifier')} />
                </Field>
                <Field label="Parol">
                  <input className="input" type="password" required value={f.password} onChange={set('password')} />
                </Field>
              </>
            )}

            {mode === 'register' && (
              <>
                <div className="grid2">
                  <Field label="Ism familiya">
                    <input className="input" required minLength={2} value={f.fullName} onChange={set('fullName')} />
                  </Field>
                  <Field label="Username">
                    <input className="input" required placeholder="ali_2026" value={f.username} onChange={set('username')} />
                  </Field>
                </div>
                <div className="grid2">
                  <Field label="Email">
                    <input className="input" type="email" required value={f.email} onChange={set('email')} />
                  </Field>
                  <Field label="Telefon">
                    <input className="input" type="tel" required value={f.phone} onChange={set('phone')} />
                  </Field>
                </div>
                <div className="grid2">
                  <Field label="Universitet">
                    <input className="input" required value={f.university} onChange={set('university')} />
                  </Field>
                  <Field label="Fakultet">
                    <input className="input" value={f.faculty} onChange={set('faculty')} />
                  </Field>
                </div>
                <Field label="Parol (kamida 8 belgi)">
                  <input className="input" type="password" required minLength={8} value={f.password} onChange={set('password')} />
                </Field>
              </>
            )}

            {mode === 'forgot' && (
              <>
                <Field label="Email">
                  <input className="input" type="email" required disabled={step === 2} value={f.email} onChange={set('email')} />
                </Field>
                {step === 2 && (
                  <>
                    <Field label="Kod">
                      <input className="input" required maxLength={6} value={f.code} onChange={set('code')} />
                    </Field>
                    <Field label="Yangi parol">
                      <input className="input" type="password" required minLength={8} value={f.newPassword} onChange={set('newPassword')} />
                    </Field>
                  </>
                )}
              </>
            )}

            {err && <p className="error">{err}</p>}
            {ok && <p className="success">{ok}</p>}
            <button className="btn btn-primary btn-block" disabled={busy}>
              {busy ? '...' : mode === 'login' ? 'Kirish' : mode === 'register' ? 'Ro‘yxatdan o‘tish' : step === 1 ? 'Kod yuborish' : 'Parolni yangilash'}
            </button>
          </form>

          <div className="auth-links">
            {mode === 'login' && (
              <>
                <Link to="/register">Akkaunt yo‘qmi? Ro‘yxatdan o‘ting</Link>
                <Link to="/forgot">Parolni unutdingizmi?</Link>
              </>
            )}
            {mode === 'register' && <Link to="/login">Akkauntingiz bormi? Kirish</Link>}
            {mode === 'forgot' && <Link to="/login">Kirishga qaytish</Link>}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
