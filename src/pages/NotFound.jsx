import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="center-screen">
      <div className="glass auth-card" style={{ textAlign: 'center' }}>
        <h1>404</h1>
        <p className="muted">Sahifa topilmadi.</p>
        <Link className="btn btn-primary" to="/">Bosh sahifaga</Link>
      </div>
    </div>
  );
}
