import { useState } from 'react';
import { useAuth } from '../App';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0E0B0C',
    color: '#F5EFE6',
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#171214',
    borderRadius: '16px',
    border: '1px solid #3A2F2C',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
    fontSize: '30px',
    fontWeight: 600,
    color: '#C9A65A',
    margin: '0 0 8px 0',
    textAlign: 'center',
  },
  subtitle: {
    color: '#9A8F86',
    textAlign: 'center',
    fontSize: '14px',
    margin: '0 0 32px 0',
  },
  tabs: {
    display: 'flex',
    marginBottom: '24px',
    borderBottom: '1px solid #3A2F2C',
  },
  tab: {
    flex: 1,
    padding: '12px',
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    background: 'none',
    color: '#9A8F86',
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  },
  tabActive: {
    flex: 1,
    padding: '12px',
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    background: 'none',
    color: '#C9A65A',
    borderBottom: '2px solid #C9A65A',
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  },
  field: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    color: '#9A8F86',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #3A2F2C',
    backgroundColor: '#0E0B0C',
    color: '#F5EFE6',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  },
  button: {
    width: '100%',
    padding: '14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#C9A65A',
    color: '#0E0B0C',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '8px',
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  },
  error: {
    color: '#8E1B22',
    fontSize: '13px',
    textAlign: 'center',
    marginTop: '16px',
    padding: '10px',
    borderRadius: '8px',
    backgroundColor: 'rgba(142, 27, 34, 0.1)',
    border: '1px solid rgba(142, 27, 34, 0.3)',
  },
  redCarpet: {
    width: '100%',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #8E1B22, #C9A65A, #8E1B22, transparent)',
    margin: '0 0 24px 0',
  },
};

function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail('');
    setUsername('');
    setPassword('');
    setError('');
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, username, password);
      }
    } catch (err) {
      const detail = err.data?.detail || err.message || 'Ein Fehler ist aufgetreten';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Glamour Closet</h1>
        <p style={styles.subtitle}>Red-Carpet Kleiderschrank-Manager</p>
        <div style={styles.redCarpet} />
        <div style={styles.tabs}>
          <button
            style={mode === 'login' ? styles.tabActive : styles.tab}
            onClick={() => switchMode('login')}
          >
            Anmelden
          </button>
          <button
            style={mode === 'register' ? styles.tabActive : styles.tab}
            onClick={() => switchMode('register')}
          >
            Registrieren
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>E-Mail</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.de"
              required
            />
          </div>
          {mode === 'register' && (
            <div style={styles.field}>
              <label style={styles.label}>Benutzername</label>
              <input
                style={styles.input}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Dein Benutzername"
                required
              />
            </div>
          )}
          <div style={styles.field}>
            <label style={styles.label}>Passwort</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button style={styles.button} type="submit" disabled={loading}>
            {loading
              ? 'Wird bearbeitet...'
              : mode === 'login'
                ? 'Anmelden'
                : 'Registrieren'}
          </button>
        </form>
        {error && <div style={styles.error}>{error}</div>}
      </div>
    </div>
  );
}

export default Login;
