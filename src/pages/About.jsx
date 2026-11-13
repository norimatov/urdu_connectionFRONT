import { useState } from 'react';
import PublicLayout from '../components/PublicLayout.jsx';
import Field from '../components/Field.jsx';
import Avatar from '../components/Avatar.jsx';
import { FOUNDERS } from '../content.js';
import { useI18n } from '../context/i18n.jsx';
import { api } from '../lib/api.js';

const CATEGORIES = [
  { v: 'partnership', uz: 'Hamkorlik taklifi', en: 'Partnership' },
  { v: 'business', uz: 'Biznes hamkorligi', en: 'Business' },
  { v: 'technical', uz: 'Texnik savol', en: 'Technical question' },
  { v: 'feedback', uz: 'Loyiha bo‘yicha fikr-mulohaza', en: 'Feedback' },
  { v: 'media', uz: 'OAV va aloqa', en: 'Media & press' },
  { v: 'other', uz: 'Boshqa', en: 'Other' },
];

function ContactModal({ onClose }) {
  const { tr } = useI18n();
  const [f, setF] = useState({ fullName: '', email: '', phone: '', subject: '', category: 'partnership', message: '', website: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api('/founder-requests', { method: 'POST', body: f });
      setDone(true);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal glass" onClick={(e) => e.stopPropagation()}>
        <h2>{tr({ uz: 'Ta‘sischilar bilan bog‘laning', en: 'Contact the founders' })}</h2>
        {done ? (
          <>
            <p className="success">{tr({ uz: 'So‘rovingiz qabul qilindi. Tez orada javob beramiz.', en: 'Request received. We will reply soon.' })}</p>
            <button className="btn btn-primary" onClick={onClose}>OK</button>
          </>
        ) : (
          <form className="auth-form" onSubmit={submit}>
            <div className="grid2">
              <Field label={tr({ uz: 'To‘liq ism', en: 'Full name' })}><input className="input" required value={f.fullName} onChange={set('fullName')} /></Field>
              <Field label="Email"><input className="input" type="email" required value={f.email} onChange={set('email')} /></Field>
            </div>
            <div className="grid2">
              <Field label={tr({ uz: 'Telefon (ixtiyoriy)', en: 'Phone (optional)' })}><input className="input" value={f.phone} onChange={set('phone')} /></Field>
              <Field label={tr({ uz: 'So‘rov kategoriyasi', en: 'Category' })}>
                <select className="input" value={f.category} onChange={set('category')}>
                  {CATEGORIES.map((c) => <option key={c.v} value={c.v}>{tr(c)}</option>)}
                </select>
              </Field>
            </div>
            <Field label={tr({ uz: 'Mavzu', en: 'Subject' })}><input className="input" required value={f.subject} onChange={set('subject')} /></Field>
            <Field label={tr({ uz: 'Xabar', en: 'Message' })}><textarea className="textarea" required minLength={10} value={f.message} onChange={set('message')} /></Field>
            {/* Honeypot: botlar uchun */}
            <input className="hp" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} aria-hidden="true" />
            {err && <p className="error">{err}</p>}
            <div className="row">
              <button className="btn btn-primary" disabled={busy}>{busy ? '...' : tr({ uz: 'Yuborish', en: 'Send' })}</button>
              <button type="button" className="btn btn-ghost" onClick={onClose}>{tr({ uz: 'Bekor qilish', en: 'Cancel' })}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function About() {
  const { tr } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <PublicLayout>
      <section className="section narrow">
        <h1 className="page-title">{tr({ uz: 'URDU CONNECT haqida', en: 'About URDU CONNECT' })}</h1>
        <p className="lead">
          {tr({
            uz: 'URDU CONNECT — universitet talabalari uchun yaratilgan hamjamiyat platformasi. U talabalarni bir-biri bilan bog‘laydi: guruhlar, xabarlar, universitet e‘lonlari, ish o‘rinlari va talabalar xizmatlari — hammasi bitta joyda.',
            en: 'URDU CONNECT is a community platform built for university students. It connects students through groups, messages, university notices, jobs and student services — all in one place.',
          })}
        </p>
      </section>

      <section className="grid2 wide">
        <div className="card glass">
          <h3>{tr({ uz: 'Missiya', en: 'Mission' })}</h3>
          <p className="muted">{tr({ uz: 'Talabalar o‘rtasidagi aloqani osonlashtirish va universitet hayotini yanada ochiq, qulay va ishonchli qilish.', en: 'Make student connections easier and university life more open, convenient and trustworthy.' })}</p>
        </div>
        <div className="card glass">
          <h3>{tr({ uz: 'Vizyon', en: 'Vision' })}</h3>
          <p className="muted">{tr({ uz: 'Har bir universitet talabasi uchun bir joyda ishlaydigan raqamli kampus.', en: 'A digital campus for every university student, in one place.' })}</p>
        </div>
      </section>

      <section className="section narrow">
        <h2>{tr({ uz: 'Loyiha tarixi', en: 'Project history' })}</h2>
        <p className="muted">{tr({ uz: 'Loyiha talabalar o‘rtasidagi aloqa uzilishi muammosini hal qilish maqsadida boshlangan. Kelajakda platforma yangi funksiyalar va universitetlar bilan kengayib boradi.', en: 'The project started to solve the broken communication between students. The platform will grow with new features and universities.' })}</p>
      </section>

      <section className="section">
        <h2>{tr({ uz: 'Ta‘sischilar', en: 'Founders' })}</h2>
        <div className="grid3">
          {FOUNDERS.map((f, i) => (
            <div className="card glass" key={i}>
              <div className="founder">
                <Avatar name={f.name} size={56} />
                <div>
                  <h3>{f.name}</h3>
                  <small className="muted">{tr(f.role)}</small>
                </div>
              </div>
              <p className="muted">{tr(f.bio)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section narrow" id="contact">
        <h2>{tr({ uz: 'Aloqa', en: 'Contact' })}</h2>
        <p className="muted">{tr({ uz: 'Hamkorlik, savol yoki fikr-mulohaza uchun so‘rov yuboring. Xabar faqat ta‘sischilarga yetkaziladi.', en: 'Send a request for partnership, questions or feedback. Messages are delivered only to the founders.' })}</p>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          {tr({ uz: 'Ta‘sischilar bilan bog‘laning', en: 'Contact the founders' })}
        </button>
      </section>

      {open && <ContactModal onClose={() => setOpen(false)} />}
    </PublicLayout>
  );
}
