import { useEffect, useState } from 'react';
import apiRequest from '../services/api';

const emptyForm = { name: '', targetAmount: '', currentAmount: '', targetDate: '' };

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadGoals() {
    try {
      const response = await apiRequest('/goals');
      setGoals(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGoals();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await apiRequest(`/goals/${editingId}`, { method: 'PUT', body: JSON.stringify({ ...form, targetAmount: Number(form.targetAmount), currentAmount: Number(form.currentAmount) }) });
      } else {
        await apiRequest('/goals', { method: 'POST', body: JSON.stringify({ ...form, targetAmount: Number(form.targetAmount), currentAmount: Number(form.currentAmount) }) });
      }
      setForm(emptyForm);
      setEditingId(null);
      loadGoals();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Deseja excluir esta meta?')) return;
    try {
      await apiRequest(`/goals/${id}`, { method: 'DELETE' });
      loadGoals();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(goal) {
    setEditingId(goal.id);
    setForm({
      name: goal.name,
      targetAmount: goal.target_amount,
      currentAmount: goal.current_amount,
      targetDate: goal.target_date || '',
    });
  }

  if (loading) {
    return <div className="card section-card">Carregando metas...</div>;
  }

  return (
    <>
      <div className="page-header">
        <div>
          <p className="muted" style={{ margin: 0 }}>Planejamento financeiro</p>
          <h1 className="page-title">Metas</h1>
        </div>
      </div>

      {error && <div className="error-banner" style={{ marginBottom: '18px' }}>{error}</div>}

      <div className="card section-card" style={{ marginBottom: '20px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field">
              <span>Nome da meta</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label className="field">
              <span>Valor da meta</span>
              <input type="number" min="0" step="0.01" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} required />
            </label>
            <label className="field">
              <span>Valor acumulado</span>
              <input type="number" min="0" step="0.01" value={form.currentAmount} onChange={(e) => setForm({ ...form, currentAmount: e.target.value })} required />
            </label>
            <label className="field">
              <span>Prazo</span>
              <input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
            </label>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" type="submit">{editingId ? 'Salvar meta' : 'Adicionar meta'}</button>
            {editingId && <button className="btn btn-secondary" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="card section-card">
        <div className="goal-list">
          {goals.length === 0 ? (
            <div className="empty-state">Nenhuma meta cadastrada.</div>
          ) : (
            goals.map((goal) => (
              <div className="goal-item card" key={goal.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px' }}>{goal.name}</h3>
                    <div className="muted">Meta: R$ {Number(goal.target_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div className="muted">Acumulado: R$ {Number(goal.current_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button className="btn btn-secondary" type="button" onClick={() => startEdit(goal)}>Editar</button>
                    <button className="btn btn-danger" type="button" onClick={() => handleDelete(goal.id)}>Excluir</button>
                  </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong>{Math.round(goal.progress || 0)}%</strong>
                    <span className="muted">{goal.target_date ? new Date(goal.target_date).toLocaleDateString('pt-BR') : 'Sem prazo'}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(goal.progress || 0, 100)}%` }} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
