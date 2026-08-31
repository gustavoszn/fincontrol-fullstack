import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line } from 'recharts';
import apiRequest from '../services/api';

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const payload = await apiRequest('/dashboard');
        setData(payload.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const pieData = useMemo(() => (data?.categoryBreakdown || []).map((item) => ({ name: item.name, value: Number(item.total || 0) })), [data]);

  if (loading) {
    return <div className="card section-card">Carregando dashboard...</div>;
  }

  if (error) {
    return <div className="error-banner">{error}</div>;
  }

  const summary = data?.summary || { currentBalance: 0, monthlyIncome: 0, monthlyExpense: 0, monthlySavings: 0 };
  const chartData = (data?.monthlyEvolution || []).map((item) => ({
    month: item.month?.slice(5) || item.month,
    income: Number(item.income || 0),
    expense: Number(item.expense || 0),
  }));

  return (
    <>
      <div className="page-header">
        <div>
          <p className="muted" style={{ margin: 0 }}>Visão geral</p>
          <h1 className="page-title">Dashboard</h1>
        </div>
      </div>

      <div className="summary-grid">
        <div className="card summary-card">
          <div className="summary-label">Saldo atual</div>
          <div className="summary-value">R$ {summary.currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div className="summary-trend">+17.4% vs. mês anterior</div>
        </div>
        <div className="card summary-card">
          <div className="summary-label">Receitas do mês</div>
          <div className="summary-value">R$ {summary.monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div className="summary-trend">Fluxo positivo</div>
        </div>
        <div className="card summary-card">
          <div className="summary-label">Despesas do mês</div>
          <div className="summary-value">R$ {summary.monthlyExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div className="summary-trend">Controle de gastos</div>
        </div>
        <div className="card summary-card">
          <div className="summary-label">Economia do mês</div>
          <div className="summary-value">R$ {summary.monthlySavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div className="summary-trend">Meta dentro do esperado</div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card chart-panel">
          <h3>Receitas x despesas</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#16a34a" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-panel">
          <h3>Gastos por categoria</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card chart-panel">
          <h3>Evolução financeira</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#16a34a" strokeWidth={3} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-panel">
          <h3>Últimas transações</h3>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {(data?.lastTransactions || []).map((item) => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td><span className={`badge ${item.type === 'income' ? 'income' : 'expense'}`}>{item.type === 'income' ? 'Receita' : 'Despesa'}</span></td>
                    <td>R$ {Number(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
