import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/auth.jsx';
import AppShell from './components/AppShell.jsx';
import Landing from './pages/Landing.jsx';
import About from './pages/About.jsx';
import Legal from './pages/Legal.jsx';
import Auth from './pages/Auth.jsx';
import Feed from './pages/Feed.jsx';
import Groups from './pages/Groups.jsx';
import Messages from './pages/Messages.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';

function Splash() {
  return (
    <div className="center-screen">
      <div className="loader" />
    </div>
  );
}

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.emailVerified || !user.phoneVerified) return <Navigate to="/verify" replace />;
  return children ?? <Outlet />;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  if (user) return <Navigate to={user.emailVerified && user.phoneVerified ? '/app' : '/verify'} replace />;
  return children;
}

function VerifyGate() {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.emailVerified && user.phoneVerified) return <Navigate to="/app" replace />;
  return <Auth mode="verify" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/privacy" element={<Legal kind="privacy" />} />
      <Route path="/terms" element={<Legal kind="terms" />} />
      <Route path="/login" element={<GuestOnly><Auth mode="login" /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Auth mode="register" /></GuestOnly>} />
      <Route path="/forgot" element={<Auth mode="forgot" />} />
      <Route path="/verify" element={<VerifyGate />} />

      <Route path="/app" element={<Protected><AppShell /></Protected>}>
        <Route index element={<Navigate to="feed" replace />} />
        <Route path="feed" element={<Feed />} />
        <Route path="groups" element={<Groups />} />
        <Route path="messages" element={<Messages />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/:username" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Admin: havola sayt menyusida yo‘q, faqat to‘g‘ridan-to‘g‘ri manzil orqali */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
