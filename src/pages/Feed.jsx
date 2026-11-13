import { useCallback, useEffect, useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import { api } from '../lib/api.js';
import { timeAgo } from '../lib/format.js';
import { useAuth } from '../context/auth.jsx';

const TABS = [
  { k: 'all', l: 'Hammasi' },
  { k: 'post', l: 'Postlar' },
  { k: 'announcement', l: 'E‘lonlar' },
  { k: 'job', l: 'Ish va amaliyot' },
  { k: 'service', l: 'Xizmatlar' },
];
const KIND_LABEL = { post: 'Post', announcement: 'E‘lon', job: 'Ish', service: 'Xizmat' };

function Comments({ postId, onCount }) {
  const [list, setList] = useState([]);
  const [text, setText] = useState('');
  const [err, setErr] = useState('');

  const load = useCallback(() => {
    api(`/posts/${postId}/comments`).then((d) => setList(d.comments)).catch((e) => setErr(e.message));
  }, [postId]);

  useEffect(() => { load(); }, [load]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await api(`/posts/${postId}/comments`, { method: 'POST', body: { body: text } });
      setText('');
      onCount(1);
      load();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <div className="comments">
      {list.map((c) => (
        <div className="comment" key={c.id}>
          <Avatar name={c.author.fullName} size={28} />
          <div>
            <b>{c.author.fullName}</b> <small className="muted">@{c.author.username}</small>
            <div>{c.body}</div>
          </div>
        </div>
      ))}
      {err && <p className="error">{err}</p>}
      <form className="chat-input" onSubmit={send}>
        <input className="input" placeholder="Izoh yozing..." value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn btn-primary">Yuborish</button>
      </form>
    </div>
  );
}

function PostCard({ post, mine, onLike, onDelete, onCommentAdded }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="post glass">
      <div className="post-head">
        <Avatar name={post.author.fullName} size={42} />
        <div className="grow">
          <b>{post.author.fullName}</b>
          <small className="muted"> @{post.author.username}{post.author.faculty ? ` · ${post.author.faculty}` : ''}</small>
          <div><small className="muted">{timeAgo(post.createdAt)}</small></div>
        </div>
        <span className="kind">{KIND_LABEL[post.kind]}</span>
      </div>
      {post.title && <h3 className="post-title">{post.title}</h3>}
      <div className="post-body">{post.body}</div>
      <div className="actions">
        <button className={`btn btn-ghost btn-sm ${post.liked ? 'liked' : ''}`} onClick={() => onLike(post)}>
          ♥ {post.likes}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen((o) => !o)}>
          💬 {post.comments}
        </button>
        {mine && <button className="btn btn-ghost btn-sm" onClick={() => onDelete(post)}>O‘chirish</button>}
      </div>
      {open && <Comments postId={post.id} onCount={(n) => onCommentAdded(post.id, n)} />}
    </article>
  );
}

export default function Feed() {
  const { user } = useAuth();
  const [kind, setKind] = useState('all');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState({ kind: 'post', title: '', body: '' });

  const load = useCallback(async (reset, currentPosts) => {
    setLoading(true);
    setError('');
    try {
      const before = !reset && currentPosts.length ? `&before=${encodeURIComponent(currentPosts.at(-1).createdAt)}` : '';
      const d = await api(`/posts?kind=${kind}${before}`);
      setPosts((p) => (reset ? d.posts : [...p, ...d.posts]));
      setHasMore(d.posts.length === 20);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => { load(true, []); }, [load]);

  const publish = async (e) => {
    e.preventDefault();
    try {
      await api('/posts', { method: 'POST', body: draft });
      setDraft({ kind: draft.kind, title: '', body: '' });
      load(true, []);
    } catch (ex) {
      setError(ex.message);
    }
  };

  const toggleLike = async (post) => {
    const d = await api(`/posts/${post.id}/like`, { method: 'POST' });
    setPosts((ps) => ps.map((p) => (p.id === post.id ? { ...p, liked: d.liked, likes: p.likes + (d.liked ? 1 : -1) } : p)));
  };

  const remove = async (post) => {
    if (!window.confirm('Postni o‘chirishni xohlaysizmi?')) return;
    await api(`/posts/${post.id}`, { method: 'DELETE' });
    setPosts((ps) => ps.filter((p) => p.id !== post.id));
  };

  const commentAdded = (postId, n) =>
    setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, comments: p.comments + n } : p)));

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Asosiy</h1>
          <p className="muted">Hamjamiyatdagi so‘nggi yangiliklar</p>
        </div>
      </div>

      <form className="composer glass" onSubmit={publish}>
        <div className="row">
          <select className="input select-sm" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value })}>
            <option value="post">Post</option>
            <option value="announcement">E‘lon</option>
            <option value="job">Ish / amaliyot</option>
            <option value="service">Xizmat</option>
          </select>
          <input className="input grow" placeholder="Sarlavha (ixtiyoriy)" maxLength={120} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        </div>
        <textarea className="textarea" placeholder={`${user.fullName.split(' ')[0]}, nima yangilik?`} maxLength={3000} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
        <div className="row end">
          <button className="btn btn-primary" disabled={!draft.body.trim()}>Joylash</button>
        </div>
      </form>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.k} className={`tab ${kind === t.k ? 'active' : ''}`} onClick={() => setKind(t.k)}>{t.l}</button>
        ))}
      </div>

      {error && <p className="error">{error}</p>}

      <div className="stack">
        {posts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            mine={p.author.id === user.id}
            onLike={toggleLike}
            onDelete={remove}
            onCommentAdded={commentAdded}
          />
        ))}
        {!loading && posts.length === 0 && <div className="empty glass">Hozircha postlar yo‘q. Birinchi bo‘lib yozing!</div>}
      </div>

      {hasMore && (
        <div className="center-row">
          <button className="btn btn-ghost" disabled={loading} onClick={() => load(false, posts)}>
            {loading ? 'Yuklanmoqda...' : 'Yana yuklash'}
          </button>
        </div>
      )}
    </div>
  );
}
