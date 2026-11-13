import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api, getToken, setToken } from '../../lib/api.js';
import { formatDuration, timeAgo, formatDate } from '../../lib/format.js';
import Logo from '../../components/Logo.jsx';
import { useTheme } from '../../context/theme.jsx';

const REQ_STATUS = [
  { v: 'NEW', l: 'YANGI' },
  { v: 'IN_REVIEW', l: 'SHARHDA' },
  { v: 'REPLIED', l: 'JAVOB BERILDI' },
  { v: 'CLOSED', l: 'YOPIQ' },
];
const CATEGORY_LABEL = {
  partnership: 'Hamkorlik', business: 'Biznes', technical: 'Texnik',
  feedback: 'Fikr-mulohaza', media: 'OAV', other: 'Boshqa',
};

function BarChart({ data, field, label, unit = '' }) {
  const max = Math.max(1, ...data.map((d) => d[field]));
  const total = data.reduce((a, d) => a + d[field], 0);
  return (
    <div className="glass chart-card">
      <div className="chart-head">
        <b>{label}</b>
        <small className="muted">Jami: {Math.round(total * 100) / 100}{unit}</small>
      </div>
      <div className="chart">
        {data.map((d) => (
          <div
            key={d.day}
            className="bar"
            title={`${d.day}: ${d[field]}${unit}`}
            style={{ height: `${Math.max(2, (d[field] / max) * 100)}%` }}
          />
        ))}
      </div>
      <div className="chart-axis">
        <small className="muted">{data[0]?.day.slice(5)}</small>
        <small className="muted">{data.at(-1)?.day.slice(5)}</small>
      </div>
    </div>
  );
}

function Metric({ label, value, hint }) {
  return (
    <div className="glass stat">
      <b>{value}</b>
      <span>{label}</span>
      {hint && <small className="muted block">{hint}</small>}
    </div>
  );
}

export default function AdminDashboard() {
  const nav = useNavigate();
  const { theme, toggle } = useTheme();
  const hasToken = !!getToken('admin');
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [userQ, setUserQ] = useState('');
  const [requests, setRequests] = useState([]);
  const [reqStatus, setReqStatus] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [error, setError] = useState('');

  const call = useCallback(async (fn) => {
    try {
      await fn();
      setError('');
    } catch (e) {
      if (e.status === 401) {
        setToken(null, 'admin');
        nav('/admin/login', { replace: true });
      } else {
        setError(e.message);
      }
    }
  }, [nav]);

  const loadStats = useCallback(() => call(async () => setStats(await api('/admin/stats', { admin: true }))), [call]);
  const loadUsers = useCallback(() => call(async () => {
    const d = await api(`/admin/users?q=${encodeURIComponent(userQ)}`, { admin: true });
    setUsers(d.users);
  }), [call, userQ]);
  const loadRequests = useCallback(() => call(async () => {
    const qs = new URLSearchParams({ archived: String(showArchived) });
    if (reqStatus) qs.set('status', reqStatus);
    const d = await api(`/admin/requests?${qs}`, { admin: true });
    setRequests(d.requests);
  }), [call, reqStatus, showArchived]);

  useEffect(() => {
    if (!hasToken) return undefined;
    loadStats();
    const id = setInterval(loadStats, 30000);
    return () => clearInterval(id);
  }, [hasToken, loadStats]);

  useEffect(() => {
    if (!hasToken) return;
    if (tab === 'users') {
      const t = setTimeout(loadUsers, 250);
      return () => clearTimeout(t);
    }
    if (tab === 'requests') loadRequests();
    return undefined;
  }, [tab, hasToken, loadUsers, loadRequests]);

  if (!hasToken) return <Navigate to="/admin/login" replace />;

  const toggleBan = (u) =>
    call(async () => {
      await api(`/admin/users/${u.id}`, { method: 'PATCH', admin: true, body: { isBanned: !u.isBanned } });
      loadUsers();
      loadStats();
    });

  const updateRequest = (r, patch) =>
    call(async () => {
      await api(`/admin/requests/${r.id}`, { method: 'PATCH', admin: true, body: patch });
      loadRequests();
      loadStats();
    });

  const logout = () => {
    setToken(null, 'admin');
    nav('/admin/login', { replace: true });
  };

  const t = stats?.totals;

  return (
    <div className="admin-body">
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="admin-wrap">
        <header className="topbar glass">
          <Logo />
          <span className="pill-sm">Admin</span>
          <div className="top-actions">
            <button className="chip-btn" onClick={toggle}>{theme === 'dark' ? 'Kun' : 'Tun'}</button>
            <button className="chip-btn" onClick={loadStats}>Yangilash</button>
            <button className="chip-btn" onClick={logout}>Chiqish</button>
          </div>
        </header>

        <nav className="tabs admin-tabs">
          {[
            ['overview', 'Umumiy ko‘rsatkichlar'],
            ['users', 'Foydalanuvchilar'],
            ['requests', `So‘rovlar${t ? ` (${t.newRequests})` : ''}`],
          ].map(([k, l]) => (
            <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </nav>

        {error && <p className="error">{error}</p>}

        {tab === 'overview' && stats && (
          <>
            <div className="stat-grid">
              <Metric label="Jami foydalanuvchilar" value={t.users} hint={`Bugun yangi: ${t.newToday}`} />
              <Metric label="Tasdiqlangan" value={t.verified} />
              <Metric label="Faol (24 soat)" value={t.activeToday} hint={`7 kunda: ${t.activeWeek}`} />
              <Metric label="Jami o‘tkazilgan vaqt" value={`${t.totalHours} soat`} hint={`Har bir foydalanuvchi o‘rtacha: ${t.avgMinutesPerUser} daq`} />
              <Metric label="Postlar" value={t.posts} hint={`Izohlar: ${t.comments}`} />
              <Metric label="Xabarlar" value={t.directMessages + t.groupMessages} hint={`Shaxsiy: ${t.directMessages}, guruh: ${t.groupMessages}`} />
              <Metric label="Guruhlar" value={t.groups} />
              <Metric label="Yangi so‘rovlar" value={t.newRequests} />
              <Metric label="Bloklangan" value={t.banned} />
            </div>
            <div className="charts">
              <BarChart data={stats.daily} field="signups" label="Yangi ro‘yxatdan o‘tganlar (30 kun)" />
              <BarChart data={stats.daily} field="hours" label="Kunlik foydalanish vaqti (soat)" unit=" soat" />
            </div>
          </>
        )}

        {tab === 'users' && (
          <section className="glass panel-lg">
            <div className="row between">
              <input className="input search" placeholder="Qidirish: ism, username, email, telefon" value={userQ} onChange={(e) => setUserQ(e.target.value)} />
              <small className="muted">{users.length} ta natija</small>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Foydalanuvchi</th><th>Email / Telefon</th><th>Universitet</th><th>Tasdiq</th>
                    <th>Postlar</th><th>Vaqt</th><th>So‘nggi faollik</th><th>Ro‘yxat</th><th>Holat</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td><b>{u.fullName}</b><div className="muted">@{u.username}</div></td>
                      <td>{u.email}<div className="muted">{u.phone}</div></td>
                      <td>{u.university || '—'}<div className="muted">{u.faculty}</div></td>
                      <td>{u.emailVerified ? 'Email ✓' : 'Email ✗'}<div>{u.phoneVerified ? 'Telefon ✓' : 'Telefon ✗'}</div></td>
                      <td>{u.posts}</td>
                      <td>{formatDuration(u.totalSeconds)}</td>
                      <td>{u.lastSeenAt ? timeAgo(u.lastSeenAt) : '—'}</td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        <button className={`btn btn-sm ${u.isBanned ? 'btn-primary' : 'btn-danger'}`} onClick={() => toggleBan(u)}>
                          {u.isBanned ? 'Blokdan chiqarish' : 'Bloklash'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === 'requests' && (
          <section className="glass panel-lg">
            <div className="row between">
              <select className="input search" value={reqStatus} onChange={(e) => setReqStatus(e.target.value)}>
                <option value="">Barcha holatlar</option>
                {REQ_STATUS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
              <label className="check">
                <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} /> Arxiv
              </label>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Sana</th><th>Yuboruvchi</th><th>Kategoriya</th><th>Mavzu / Xabar</th><th>Holat</th><th>Ichki eslatma</th><th></th></tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td>{formatDate(r.createdAt)}</td>
                      <td><b>{r.fullName}</b><div className="muted">{r.email}</div><div className="muted">{r.phone}</div></td>
                      <td>{CATEGORY_LABEL[r.category] || r.category}</td>
                      <td>
                        <details>
                          <summary>{r.subject}</summary>
                          <p className="pre">{r.message}</p>
                        </details>
                      </td>
                      <td>
                        <select className="input select-sm" value={r.status} onChange={(e) => updateRequest(r, { status: e.target.value })}>
                          {REQ_STATUS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
                        </select>
                      </td>
                      <td>
                        <textarea
                          className="textarea small"
                          defaultValue={r.internalNotes}
                          onBlur={(e) => e.target.value !== r.internalNotes && updateRequest(r, { internalNotes: e.target.value })}
                        />
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => updateRequest(r, { archived: !r.archived })}>
                          {r.archived ? 'Qaytarish' : 'Arxivlash'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {requests.length === 0 && <p className="muted empty">So‘rovlar yo‘q</p>}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
