import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import { api } from '../lib/api.js';
import { timeAgo } from '../lib/format.js';

export default function Messages() {
  const location = useLocation();
  const [threads, setThreads] = useState([]);
  const [partner, setPartner] = useState(location.state?.partner || null);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [found, setFound] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const endRef = useRef(null);

  const loadThreads = () => api('/messages/threads').then((d) => setThreads(d.threads)).catch(() => {});

  useEffect(() => {
    loadThreads();
    const id = setInterval(loadThreads, 8000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!partner) return undefined;
    const load = () => api(`/messages/${partner.id}`).then((d) => setMessages(d.messages)).catch(() => {});
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [partner]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setFound([]);
      return undefined;
    }
    const t = setTimeout(() => {
      api(`/users?q=${encodeURIComponent(query.trim())}`).then((d) => setFound(d.users)).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !partner) return;
    try {
      await api(`/messages/${partner.id}`, { method: 'POST', body: { body: text } });
      setText('');
      const d = await api(`/messages/${partner.id}`);
      setMessages(d.messages);
      loadThreads();
    } catch (ex) {
      setError(ex.message);
    }
  };

  const pick = (u) => {
    setPartner(u);
    setQuery('');
    setFound([]);
  };

  return (
    <div className="page">
      <div className="page-head"><h1>Xabarlar</h1></div>
      {error && <p className="error">{error}</p>}
      <div className="split">
        <div className="glass panel">
          <input className="input" placeholder="Talaba qidirish..." value={query} onChange={(e) => setQuery(e.target.value)} />
          {found.length > 0 && (
            <div className="list">
              {found.map((u) => (
                <button key={u.id} className="list-item" onClick={() => pick(u)}>
                  <Avatar name={u.fullName} size={38} />
                  <div><b>{u.fullName}</b><small className="muted"> @{u.username}</small></div>
                </button>
              ))}
            </div>
          )}
          <div className="list">
            {threads.map((t) => (
              <button key={t.user.id} className={`list-item ${partner?.id === t.user.id ? 'active' : ''}`} onClick={() => pick(t.user)}>
                <Avatar name={t.user.fullName} size={40} />
                <div className="grow">
                  <b>{t.user.fullName}</b>
                  <small className="muted truncate">{t.lastBody}</small>
                </div>
                <small className="muted">{timeAgo(t.lastAt)}</small>
              </button>
            ))}
            {threads.length === 0 && found.length === 0 && <p className="muted">Suhbatlar yo‘q. Yuqoridan talaba qidiring.</p>}
          </div>
        </div>

        <div className="glass chat">
          {!partner ? (
            <div className="empty">Suhbatni tanlang yoki talaba qidiring.</div>
          ) : (
            <>
              <div className="chat-head">
                <Avatar name={partner.fullName} size={40} />
                <div>
                  <h3>{partner.fullName}</h3>
                  <small className="muted">@{partner.username}</small>
                </div>
              </div>
              <div className="chat-log">
                {messages.map((m) => (
                  <div key={m.id} className={`bubble ${m.mine ? 'mine' : ''}`}>{m.body}</div>
                ))}
                <div ref={endRef} />
              </div>
              <form className="chat-input" onSubmit={send}>
                <input className="input" placeholder="Xabar yozing..." value={text} onChange={(e) => setText(e.target.value)} />
                <button className="btn btn-primary">Yuborish</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
