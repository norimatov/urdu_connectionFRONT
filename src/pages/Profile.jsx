import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import { api } from '../lib/api.js';
import { formatDate } from '../lib/format.js';
import { useAuth } from '../context/auth.jsx';

export default function Profile() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const nav = useNavigate();
  const target = username || me.username;
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setProfile(null);
    setError('');
    api(`/users/${target}`).then((d) => setProfile(d.user)).catch((e) => setError(e.message));
  }, [target]);

  if (error) return <div className="page"><p className="error">{error}</p></div>;
  if (!profile) return <div className="page"><div className="loader" /></div>;

  const isMe = profile.id === me.id;
  return (
    <div className="page">
      <div className="page-head"><h1>Profil</h1></div>
      <section className="glass profile-card">
        <Avatar name={profile.fullName} size={96} />
        <div className="grow">
          <h2>{profile.fullName}</h2>
          <p className="muted">@{profile.username}</p>
          <p>{[profile.university, profile.faculty].filter(Boolean).join(' · ') || 'Universitet ko‘rsatilmagan'}</p>
          {profile.bio && <p className="bio">{profile.bio}</p>}
          <div className="row">
            <span className="pill-sm">{profile.postsCount} ta post</span>
            <span className="pill-sm">Qo‘shilgan: {formatDate(profile.createdAt)}</span>
            {profile.emailVerified && profile.phoneVerified && <span className="pill-sm ok">Tasdiqlangan</span>}
          </div>
          {!isMe && (
            <button
              className="btn btn-primary"
              onClick={() => nav('/app/messages', { state: { partner: { id: profile.id, username: profile.username, fullName: profile.fullName } } })}
            >
              Xabar yozish
            </button>
          )}
          {isMe && <button className="btn btn-ghost" onClick={() => nav('/app/settings')}>Profilni tahrirlash</button>}
        </div>
      </section>
    </div>
  );
}
