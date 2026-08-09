import React from 'react';
import { 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity, 
  RefreshCw, 
  Download,
  Shield,
  ActivitySquare,
  Trash2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
export default function Dashboard({ 
  financialData, 
  simulateBankSync, 
  exportData,
  onDeleteTransaction,
  clearData
}) {
  const { income, expenses, transactions, investments } = financialData;

  // Calculations
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalInvestments = investments.reduce((sum, inv) => sum + (inv.shares * inv.currentPrice), 0);
  const bankSavings = 25000000; // Mock cash in bank (COP)
  const netWorth = bankSavings + totalInvestments - (totalExpenses * 0.2); // Liabilities
  
  const savingsAmount = income - totalExpenses;
  const savingsRate = income > 0 ? ((savingsAmount / income) * 100).toFixed(1) : 0;

  // Force dots formatting helper
  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '$ 0';
    const isNegative = val < 0;
    const absVal = Math.round(Math.abs(val));
    const formatted = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${isNegative ? '-' : ''}$ ${formatted}`;
  };

  // Mock historical data scaled for COP
  const historicalCashFlow = [
    { name: 'Mar', Ingresos: 8000000, Gastos: 3100000 },
    { name: 'Abr', Ingresos: 8200000, Gastos: 3400000 },
    { name: 'May', Ingresos: 8500000, Gastos: 3200000 },
    { name: 'Jun', Ingresos: 8500000, Gastos: 3600000 },
    { name: 'Jul', Ingresos: 8800000, Gastos: 3500000 },
    { name: 'Ago', Ingresos: income, Gastos: totalExpenses },
  ];

  const historicalNetWorth = [
    { name: 'Mar', Patrimonio: 92000000 },
    { name: 'Abr', Patrimonio: 98000000 },
    { name: 'May', Patrimonio: 104000000 },
    { name: 'Jun', Patrimonio: 109000000 },
    { name: 'Jul', Patrimonio: 114000000 },
    { name: 'Ago', Patrimonio: netWorth },
  ];

  return (
    <div className="tab-pane active">
      {/* Header bar */}
      <div className="top-header">
        <div className="header-title-area">
          <h1>Diagnóstico Financiero</h1>
          <p>Signos vitales de tu salud patrimonial, estadísticas de juego y fichajes.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={simulateBankSync} style={{ width: 'auto' }}>
            <RefreshCw size={16} />
            <span>Simular Turno Extra</span>
          </button>
          <button className="btn btn-primary" onClick={exportData} style={{ width: 'auto' }}>
            <Download size={16} />
            <span>Descargar Epicrisis (JSON)</span>
          </button>
          {clearData && (
            <button className="btn btn-danger" onClick={clearData} style={{ width: 'auto', background: '#d90429', color: '#fff' }}>
              <Trash2 size={16} />
              <span>Limpiar Demostración</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid-cols-4">
        {/* Net Worth (Salud Patrimonial) */}
        <div className="glass-card metric-card cyan">
          <div className="metric-header">
            <span className="metric-title">Salud Patrimonial (Neto)</span>
            <div className="metric-icon-wrapper">
              <Heart size={20} className="text-cyan" />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(netWorth)}</div>
          <div className="metric-footer">
            <span className="trend-badge up">
              <ArrowUpRight size={12} />
              +5.4%
            </span>
            <span>este mes</span>
          </div>
        </div>

        {/* Income (Turnos & Guardias) */}
        <div className="glass-card metric-card emerald">
          <div className="metric-header">
            <span className="metric-title">Guardias & Turnos (Ingresos)</span>
            <div className="metric-icon-wrapper">
              <ArrowUpRight size={20} className="text-emerald" />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(income)}</div>
          <div className="metric-footer">
            <span className="trend-badge up">
              <ArrowUpRight size={12} />
              +3.5%
            </span>
            <span>vs mes anterior</span>
          </div>
        </div>

        {/* Expenses (Dosis de Gastos) */}
        <div className="glass-card metric-card rose">
          <div className="metric-header">
            <span className="metric-title">Dosis de Gastos (Egresos)</span>
            <div className="metric-icon-wrapper">
              <ArrowDownRight size={20} className="text-rose" />
            </div>
          </div>
          <div className="metric-value">{formatCurrency(totalExpenses)}</div>
          <div className="metric-footer">
            <span className={`trend-badge ${totalExpenses > 4000000 ? 'down' : 'up'}`}>
              {totalExpenses > 4000000 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {totalExpenses > 4000000 ? '+12.4%' : '-4.2%'}
            </span>
            <span>vs mes anterior</span>
          </div>
        </div>

        {/* Savings Rate (Capacidad Cardíaca) */}
        <div className="glass-card metric-card gold">
          <div className="metric-header">
            <span className="metric-title">Capacidad Cardíaca (Ahorro)</span>
            <div className="metric-icon-wrapper">
              <Activity size={20} className="text-gold" />
            </div>
          </div>
          <div className="metric-value">{savingsRate}%</div>
          <div className="metric-footer">
            <span className="trend-badge up">
              <ArrowUpRight size={12} />
              {savingsRate > 50 ? 'Goleador' : 'Físico Óptimo'}
            </span>
            <span>de las guardias</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid-cols-2">
        {/* Net Worth Area Chart */}
        <div className="glass-card">
          <h2>Historial Cardíaco (Evolución de Patrimonio)</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalNetWorth} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPatrimonio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#05f3a2" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#05f3a2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#5a7d6e" fontSize={12} />
                <YAxis 
                  stroke="#5a7d6e" 
                  fontSize={12} 
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(0)}M`} 
                  domain={['dataMin - 10000000', 'dataMax + 10000000']}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#06110c', borderColor: 'rgba(255,255,255,0.08)' }}
                  formatter={(value) => [formatCurrency(value), 'Salud Patrimonial']}
                />
                <Area 
                  type="monotone" 
                  dataKey="Patrimonio" 
                  stroke="#05f3a2" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPatrimonio)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cash Flow Bar Chart */}
        <div className="glass-card">
          <h2>Rendimiento en la Cancha (Flujo de Caja)</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalCashFlow} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#5a7d6e" fontSize={12} />
                <YAxis stroke="#5a7d6e" fontSize={12} tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#06110c', borderColor: 'rgba(255,255,255,0.08)' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="Ingresos" fill="#ffbe0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gastos" fill="#ff2a85" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions & Info */}
      <div className="grid-cols-3">
        {/* Transactions List */}
        <div className="glass-card col-span-2">
          <h2>Registro de Jugadas Recientes</h2>
          <div style={{ maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
            {transactions.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No hay jugadas registradas en el partido de este mes.
              </p>
            ) : (
              transactions.slice(0, 6).map((t) => {
                const isExpense = t.type === 'expense';
                return (
                  <div key={t.id} className="transaction-item">
                    <div className="transaction-info">
                      <div className="transaction-icon">
                        {isExpense ? (
                          <TrendingDown className="text-rose" size={16} />
                        ) : (
                          <TrendingUp className="text-emerald" size={16} />
                        )}
                      </div>
                      <div className="transaction-details">
                        <h4>{t.description}</h4>
                        <p>{t.category} • {t.date}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className={`transaction-value ${isExpense ? 'text-rose' : 'text-emerald'}`} style={{ marginRight: '0.25rem' }}>
                        {isExpense ? '-' : '+'}{formatCurrency(t.amount)}
                      </div>
                      {onDeleteTransaction && (
                        <button 
                          onClick={() => onDeleteTransaction(t.id)}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: 'var(--accent-rose)', 
                            cursor: 'pointer', 
                            padding: '0.25rem', 
                            display: 'flex', 
                            alignItems: 'center',
                            opacity: 0.7
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
                          title="Eliminar Movimiento"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Wealth Checkup / Triaje */}
        <div className="glass-card">
          <h2>Triaje Patrimonial (Signos Vitales)</h2>
          <p style={{ marginBottom: '1.25rem' }}>
            Evaluación clínica y deportiva rápida de tus indicadores patrimoniales.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Balón de Oxígeno (Fondo)</span>
              <span className="badge text-emerald" style={{ background: 'rgba(5, 243, 162, 0.12)' }}>Estable (7.3 meses)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Presión Arterial (Deuda)</span>
              <span className="badge text-cyan" style={{ background: 'rgba(5, 243, 162, 0.12)' }}>Baja (12%)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Esquema Táctico (Activos)</span>
              <span className="badge text-purple" style={{ background: 'rgba(255, 190, 11, 0.12)' }}>Completo (4 Clases)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Estado del Paciente</span>
              <span className="badge text-gold" style={{ background: 'rgba(255, 190, 11, 0.12)' }}>Jugador de Élite</span>
            </div>
          </div>

          <div className="quick-actions-grid">
            <div className="quick-action-btn" onClick={() => window.alert('Próximamente: Integración con historial de turnos.')}>
              <ActivitySquare size={18} />
              <span>Turnos</span>
            </div>
            <div className="quick-action-btn" onClick={simulateBankSync}>
              <RefreshCw size={18} />
              <span>Sincronizar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
