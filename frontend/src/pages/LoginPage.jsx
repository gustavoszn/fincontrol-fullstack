import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div style={{ marginBottom: '20px' }}>
          <div className="brand" style={{ justifyContent: 'center' }}>
            <div className="brand-mark">F</div>
            <span>FinControl</span>
          </div>
        </div>

        <h1 style={{ margin: '0 0 8px' }}>Entrar</h1>
        <p className="muted">Acesse sua conta para continuar.</p>

        {error && <div className="error-banner">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>E-mail</span>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label className="field">
            <span>Senha</span>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </label>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>

        <p style={{ marginTop: '16px', textAlign: 'center' }}>
          Ainda não tem conta? <Link className="auth-link" to="/register">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
