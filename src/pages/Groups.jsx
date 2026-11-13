import { useEffect, useRef, useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../context/auth.jsx';

export default function Groups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const endRef = useRef(null);

  const loadGroups = () => api('/groups').then((d) => setGroups(d.groups)).catch((e) => setError(e.message));
  useEffect(() => { loadGroups(); }, []);

  const current = groups.find((g) => g.id === selected);

  useEffect(() => {
    if (!selected || !current?.joined) {
      setMessages([]);
      return undefined;
    }
    const load = () => api(`/groups/${selected}/messages`).then((d) => setMessages(d.messages)).catch(() => {});
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [selected, current?.joined]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const create = async (e) => {
    e.preventDefault();
    try {
      const d = await api('/groups', { method: 'POST', body: newGroup });
      setNewGroup({ name: '', description: '' });
      await loadGroups();
      setSelected(d.id);
    } catch (ex) {
      setError(ex.message);
    }
  };

  const toggleJoin = async () => {
    await api(`/groups/${selected}/${current.joined ? 'leave' : 'join'}`, { method: 'POST' });
    loadGroups();
  };

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await api(`/groups/${selected}/messages`, { method: 'POST', body: { body: text } });
      setText('');
      const d = await api(`/groups/${selected}/messages`);
      setMessages(d.messages);
    } catch (ex) {
      setError(ex.message);
    }
  };

  return (
    <div className="page">
      <div className="page-head"><h1>Guruhlar</h1></div>
      {error && <p className="error">{error}</p>}
      <div className="split">
        <div className="glass panel">
          <form className="stack-sm" onSubmit={create}>
            <input className="input" placeholder="Guruh nomi" required minLength={3} value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} />
            <input className="input" placeholder="Tavsif (ixtiyoriy)" value={newGroup.description} onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })} />
            <button className="btn btn-primary btn-block">Guruh yaratish</button>
          </form>
          <div className="list">
            {groups.map((g) => (
              <button key={g.id} className={`list-item ${selected === g.id ? 'active' : ''}`} onClick={() => setSelected(g.id)}>
                <Avatar name={g.name} size={40} />
                <div className="grow">
                  <b>{g.name}</b>
                  <small className="muted">{g.members} a‘zo{g.joined ? ' · a‘zosiz' : ''}</small>
                </div>
              </button>
            ))}
            {groups.length === 0 && <p className="muted">Hozircha guruhlar yo‘q.</p>}
          </div>
        </div>

        <div className="glass chat">
          {!current ? (
            <div className="empty">Guruhni tanlang yoki yangi guruh yarating.</div>
          ) : (
            <>
              <div className="chat-head">
                <div>
                  <h3>{current.name}</h3>
                  <small className="muted">{current.description}</small>
                </div>
                <button className={`btn ${current.joined ? 'btn-ghost' : 'btn-primary'} btn-sm`} onClick={toggleJoin}>
                  {current.joined ? 'Guruhdan chiqish' : 'Qo‘shilish'}
                </button>
              </div>
              {current.joined ? (
                <>
                  <div className="chat-log">
                    {messages.map((m) => (
                      <div key={m.id} className={`bubble-wrap ${m.author.id === user.id ? 'mine' : ''}`}>
                        {m.author.id !== user.id && <small className="muted">{m.author.fullName}</small>}
                        <div className={`bubble ${m.author.id === user.id ? 'mine' : ''}`}>{m.body}</div>
                      </div>
                    ))}
                    <div ref={endRef} />
                  </div>
                  <form className="chat-input" onSubmit={send}>
                    <input className="input" placeholder="Xabar yozing..." value={text} onChange={(e) => setText(e.target.value)} />
                    <button className="btn btn-primary">Yuborish</button>
                  </form>
                </>
              ) : (
                <div className="empty">Xabarlarni ko‘rish uchun guruhga qo‘shiling.</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
