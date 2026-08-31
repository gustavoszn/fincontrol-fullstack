import { useEffect, useMemo, useState } from 'react';
import apiRequest from '../services/api';

const emptyForm = {
  description: '',
  amount: '',
  type: 'expense',
  categoryId: '',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ search: '', type: '', categoryId: '', startDate: '', endDate: '', minAmount: '', maxAmount: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    try {
      const [txResponse, catResponse] = await Promise.all([
        apiRequest(`/transactions?${new URLSearchParams({
          ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '')),
        }).toString()}`),
        apiRequest('/categories'),
      ]);
      setTransactions(txResponse.data || []);
      setCategories(catResponse.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [filters]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await apiRequest(`/transactions/${editingId}`, { method: 'PUT', body: JSON.stringify({ ...form, categoryId: form.categoryId || null }) });
      } else {
        await apiRequest('/transactions', { method: 'POST', body: JSON.stringify({ ...form, categoryId: form.categoryId || null }) });
      }
      setForm(emptyForm);
      setEditingId(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Deseja excluir esta atividade?')) return;
    try {
      await apiRequest(`/transactions/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(transaction) {
    setEditingId(transaction.id);
    setForm({
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.category_id || '',
      date: transaction.date.slice(0, 10),
      notes: transaction.notes || '',
    });
  }

  const totalRows = useMemo(() => transactions.length, [transactions]);

  if (loading) {
    return <div className="card section-card">Carregando transações...</div>;
  }

  return (
    <>
      <div className="page-header">
        <div>
          <p className="muted" style={{ margin: 0 }}>Planeje seu tempo com leveza</p>
          <h1 className="page-title">Calendário e atividades</h1>
        </div>
      </div>

      {error && <div className="error-banner" style={{ marginBottom: '18px' }}>{error}</div>}

      <div className="card section-card" style={{ marginBottom: '20px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ marginBottom: '16px' }}>
            <label className="field">
              <span>Descrição</span>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </label>
            <label className="field">
              <span>Duração (minutos)</span>
              <input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </label>
            <label className="field">
              <span>Tipo</span>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="expense">Atividade</option>
                <option value="income">Compromisso</option>
              </select>
            </label>
            <label className="field">
              <span>Categoria</span>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Sem categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Data</span>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </label>
          </div>
          <label className="field" style={{ marginBottom: '16px' }}>
            <span>Observação</span>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" type="submit">{editingId ? 'Salvar atividade' : 'Adicionar atividade'}</button>
            {editingId && <button className="btn btn-secondary" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="card section-card">
        <div className="toolbar">
          <h3 style={{ margin: 0 }}>Filtros</h3>
          <div style={{ color: '#64748b' }}>{totalRows} registros</div>
        </div>
        <div className="filters">
          <input placeholder="Pesquisar..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">Tipo</option>
            <option value="income">Compromisso</option>
            <option value="expense">Atividade</option>
          </select>
          <select value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}>
            <option value="">Categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
          <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
          <input type="number" placeholder="Min" value={filters.minAmount} onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })} />
          <input type="number" placeholder="Max" value={filters.maxAmount} onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })} />
        </div>
      </div>

      <div className="card section-card" style={{ marginTop: '20px' }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Tipo</th>
                <th>Duração</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6"><div className="empty-state">Nenhuma transação encontrada.</div></td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.description}</td>
                    <td>{transaction.category_name || 'Sem categoria'}</td>
                    <td><span className={`badge ${transaction.type === 'income' ? 'income' : 'expense'}`}>{transaction.type === 'income' ? 'Compromisso' : 'Atividade'}</span></td>
                    <td>{Math.round(Number(transaction.amount))} min</td>
                    <td>{new Date(transaction.date).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary" type="button" onClick={() => startEdit(transaction)}>Editar</button>
                        <button className="btn btn-danger" type="button" onClick={() => handleDelete(transaction.id)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
