import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
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
            <div className="brand-mark">R</div>
            <span>routine</span>
          </div>
        </div>

        <h1 style={{ margin: '0 0 8px' }}>Criar conta</h1>
        <p className="muted">Comece a organizar sua vida financeira.</p>

        {error && <div className="error-banner">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Nome</span>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label className="field">
            <span>E-mail</span>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label className="field">
            <span>Senha</span>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required />
          </label>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Criando conta...' : 'Criar conta'}</button>
        </form>

        <p style={{ marginTop: '16px', textAlign: 'center' }}>
          Já tem conta? <Link className="auth-link" to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
