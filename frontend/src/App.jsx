import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import api from './api/client';
import Login from './views/Login';
import OutfitCreator from './views/OutfitCreator';
import Outfits from './views/Outfits';
import Wardrobe from './views/Wardrobe';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/auth/me')
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await api.get('/auth/me');
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    await api.post('/auth/login', { email, password });
    await refreshUser();
    navigate('/wardrobe');
  }, [navigate, refreshUser]);

  const register = useCallback(async (email, username, password) => {
    await api.post('/auth/register', { email, username, password });
    await refreshUser();
    navigate('/wardrobe');
  }, [navigate, refreshUser]);

  const logout = useCallback(async () => {
    await api.post('/auth/logout');
    setUser(null);
    navigate('/');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0E0B0C',
    color: '#F5EFE6',
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  },
  header: {
    padding: '48px 24px 24px',
    textAlign: 'center',
    borderBottom: '1px solid #3A2F2C',
  },
  title: {
    fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
    fontSize: '44px',
    fontWeight: 600,
    color: '#C9A65A',
    margin: 0,
  },
  subtitle: {
    fontSize: '16px',
    color: '#9A8F86',
    marginTop: '8px',
  },
  main: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '48px 24px',
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#171214',
    borderRadius: '16px',
    border: '1px solid #3A2F2C',
    padding: '32px',
    marginBottom: '32px',
  },
  statusLabel: {
    fontSize: '13px',
    color: '#9A8F86',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '8px',
  },
  statusValue: {
    fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
    fontSize: '30px',
    fontWeight: 600,
    color: '#C9A65A',
  },
  statusError: {
    fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
    fontSize: '30px',
    fontWeight: 600,
    color: '#8E1B22',
  },
  nav: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    marginTop: '32px',
    flexWrap: 'wrap',
  },
  link: {
    color: '#9A8F86',
    textDecoration: 'none',
    fontSize: '15px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #3A2F2C',
    transition: 'all 0.2s',
  },
  logoutBtn: {
    color: '#8E1B22',
    textDecoration: 'none',
    fontSize: '15px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #8E1B22',
    cursor: 'pointer',
    background: 'none',
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    transition: 'all 0.2s',
  },
  redCarpet: {
    width: '100%',
    height: '4px',
    background: 'linear-gradient(90deg, transparent, #8E1B22, #C9A65A, #8E1B22, transparent)',
    marginTop: '24px',
  },
  loading: {
    color: '#9A8F86',
    fontSize: '16px',
  },
  userBadge: {
    fontSize: '13px',
    color: '#C9A65A',
    marginTop: '12px',
  },
};

function HomePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
    fetch(`${base}/api/health`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Glamour Closet</h1>
        <p style={styles.subtitle}>Red-Carpet Kleiderschrank-Manager</p>
        {isAuthenticated && user && (
          <div style={styles.userBadge}>Angemeldet als {user.username}</div>
        )}
        <div style={styles.redCarpet} />
      </div>
      <div style={styles.main}>
        <div style={styles.statusCard}>
          <div style={styles.statusLabel}>Backend Status</div>
          {loading ? (
            <div style={styles.loading}>Verbindung wird hergestellt...</div>
          ) : error ? (
            <div style={styles.statusError}>{error}</div>
          ) : (
            <div style={styles.statusValue}>{status}</div>
          )}
        </div>
        <div style={styles.nav}>
          {isAuthenticated ? (
            <>
              <a href="/wardrobe" style={styles.link}>Garderobe</a>
              <a href="/outfit-creator" style={styles.link}>Outfit-Creator</a>
              <a href="/outfits" style={styles.link}>Outfits</a>
              <button onClick={logout} style={styles.logoutBtn}>Abmelden</button>
            </>
          ) : (
            <>
              <a href="/login" style={styles.link}>Anmelden</a>
              <a href="/wardrobe" style={styles.link}>Garderobe</a>
              <a href="/outfit-creator" style={styles.link}>Outfit-Creator</a>
              <a href="/outfits" style={styles.link}>Outfits</a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/wardrobe" element={<Wardrobe />} />
        <Route path="/outfit-creator" element={<OutfitCreator />} />
        <Route path="/outfits" element={<Outfits />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
