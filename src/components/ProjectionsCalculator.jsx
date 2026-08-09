import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trophy, Sparkles, TrendingUp } from 'lucide-react';

export default function ProjectionsCalculator() {
  // Main Projection Inputs (COP)
  const [initialAmount, setInitialAmount] = useState(10000000);
  const [monthlyContribution, setMonthlyContribution] = useState(500000);
  const [interestRate, setInterestRate] = useState(8);
  const [years, setYears] = useState(15);

  // Target Goal Calculator Inputs
  const [targetGoal, setTargetGoal] = useState(500000000);
  const [targetYears, setTargetYears] = useState(20);
  const [targetRate, setTargetRate] = useState(9);

  // Force dots formatting helper
  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '$ 0';
    const isNegative = val < 0;
    const absVal = Math.round(Math.abs(val));
    const formatted = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${isNegative ? '-' : ''}$ ${formatted}`;
  };

  const formatNumberInput = (value) => {
    if (value === undefined || value === null || isNaN(value)) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseNumberInput = (value) => {
    const clean = value.replace(/\D/g, '');
    return parseFloat(clean) || 0;
  };

  // Compound Interest Calculation
  const projectionData = useMemo(() => {
    const data = [];
    const monthlyRate = interestRate / 100 / 12;
    let totalValue = initialAmount;
    let totalInvested = initialAmount;

    data.push({
      year: 0,
      'Capital Aportado': Math.round(totalInvested),
      'Copa Ganada': Math.round(totalValue),
      'Goles Marcados': 0
    });

    for (let year = 1; year <= years; year++) {
      for (let month = 1; month <= 12; month++) {
        totalValue = (totalValue + monthlyContribution) * (1 + monthlyRate);
        totalInvested += monthlyContribution;
      }
      data.push({
        year: year,
        'Capital Aportado': Math.round(totalInvested),
        'Copa Ganada': Math.round(totalValue),
        'Goles Marcados': Math.round(totalValue - totalInvested)
      });
    }
    return data;
  }, [initialAmount, monthlyContribution, interestRate, years]);

  const finalMetrics = projectionData[projectionData.length - 1];

  // Target Goal Calculation (PMT)
  const requiredMonthlyContribution = useMemo(() => {
    const rate = targetRate / 100 / 12;
    const months = targetYears * 12;
    if (rate === 0) return targetGoal / months;
    
    const numerator = targetGoal * rate;
    const denominator = Math.pow(1 + rate, months) - 1;
    return numerator / denominator;
  }, [targetGoal, targetYears, targetRate]);

  return (
    <div className="tab-pane active">
      <div className="top-header">
        <div className="header-title-area">
          <h1>Entrenamiento Financiero</h1>
          <p>Planifica tus metas de ahorro, simula el interés compuesto de tus temporadas y clasifica a la copa.</p>
        </div>
      </div>

      {/* Main Calculator Grid */}
      <div className="grid-cols-3">
        {/* Inputs Form */}
        <div className="glass-card col-span-1" style={{ height: 'fit-content' }}>
          <h2>Táctica de Entrenamiento (Simulaciones)</h2>
          
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label>Ahorro Inicial (Capital)</label>
              <span className="text-cyan font-bold">{formatCurrency(initialAmount)}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="500000000" 
              step="1000000"
              value={initialAmount} 
              onChange={(e) => setInitialAmount(parseFloat(e.target.value))}
            />
            <input 
              type="text" 
              value={formatNumberInput(initialAmount)} 
              onChange={(e) => setInitialAmount(parseNumberInput(e.target.value))}
              style={{ marginTop: '-5px' }}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label>Aporte Mensual (Guardias/Turnos)</label>
              <span className="text-cyan font-bold">{formatCurrency(monthlyContribution)}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="20000000" 
              step="100000"
              value={monthlyContribution} 
              onChange={(e) => setMonthlyContribution(parseFloat(e.target.value))}
            />
            <input 
              type="text" 
              value={formatNumberInput(monthlyContribution)} 
              onChange={(e) => setMonthlyContribution(parseNumberInput(e.target.value))}
              style={{ marginTop: '-5px' }}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label>Rendimiento por Temporada Estimado (%)</label>
              <span className="text-cyan font-bold">{interestRate}%</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="25" 
              step="0.5"
              value={interestRate} 
              onChange={(e) => setInterestRate(parseFloat(e.target.value))}
            />
            <input 
              type="number" 
              value={interestRate} 
              onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
              style={{ marginTop: '-5px' }}
            />
          </div>

          <div className="form-group">
            <label>Plazo de Entrenamiento (Temporadas/Años)</label>
            <select value={years} onChange={(e) => setYears(parseInt(e.target.value))}>
              <option value={5}>5 Años (Temporadas)</option>
              <option value={10}>10 Años (Temporadas)</option>
              <option value={15}>15 Años (Temporadas)</option>
              <option value={20}>20 Años (Temporadas)</option>
              <option value={25}>25 Años (Temporadas)</option>
              <option value={30}>30 Años (Temporadas)</option>
              <option value={40}>40 Años (Temporadas)</option>
            </select>
          </div>
        </div>

        {/* Chart Area */}
        <div className="glass-card col-span-2">
          <h2>Curva de Crecimiento del Plantel</h2>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" stroke="#5a7d6e" fontSize={11} label={{ value: 'Temporadas (Años)', position: 'insideBottom', offset: -5, fill: '#5a7d6e' }} />
                <YAxis stroke="#5a7d6e" fontSize={11} tickFormatter={(val) => `$${(val / 1000000).toFixed(0)}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#06110c', borderColor: 'rgba(255,255,255,0.08)' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line type="monotone" dataKey="Capital Aportado" stroke="#ff2a85" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Copa Ganada" stroke="#05f3a2" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Results metrics */}
          <div className="grid-cols-3" style={{ marginTop: '1.5rem', marginBottom: 0, gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Capital Aportado en la Cancha</span>
              <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', color: 'var(--accent-rose)' }}>
                {formatCurrency(finalMetrics['Capital Aportado'])}
              </h3>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Goles Marcados (Intereses)</span>
              <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', color: 'var(--accent-emerald)' }}>
                {formatCurrency(finalMetrics['Goles Marcados'])}
              </h3>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Copa Ganada (Acumulado)</span>
              <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', color: 'var(--accent-cyan)' }}>
                {formatCurrency(finalMetrics['Copa Ganada'])}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Target Goal Calculator */}
      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Trophy className="text-gold" size={24} />
          <h2>Plan de Copa (Trofeo Objetivo)</h2>
        </div>
        
        <p style={{ marginBottom: '1.5rem' }}>
          ¿Tienes un patrimonio objetivo en mente? Calcula exactamente cuánto necesitas entrenar (ahorrar mensualmente) para coronarte campeón del torneo financiero, considerando interés compuesto por rendimiento.
        </p>

        <div className="grid-cols-4" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label>Trofeo Objetivo (Meta Financiera)</label>
            <input 
              type="text" 
              value={formatNumberInput(targetGoal)} 
              onChange={(e) => setTargetGoal(parseNumberInput(e.target.value))}
              placeholder="Ej. 500.000.000"
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatCurrency(targetGoal)}</span>
          </div>

          <div className="form-group">
            <label>Plazo para Campeonar (Años)</label>
            <input 
              type="number" 
              value={targetYears} 
              onChange={(e) => setTargetYears(parseInt(e.target.value) || 1)}
              placeholder="Ej. 20"
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Rendimiento por Temporada Estimado (%)</label>
            <input 
              type="number" 
              value={targetRate} 
              onChange={(e) => setTargetRate(parseFloat(e.target.value) || 0)}
              placeholder="Ej. 8"
              step="0.5"
            />
          </div>

          <div className="metric-card gold" style={{ background: 'rgba(255, 190, 11, 0.04)', border: '1px solid rgba(255, 190, 11, 0.15)', padding: '1rem', borderRadius: '12px' }}>
            <div className="metric-header" style={{ marginBottom: '0.25rem' }}>
              <span className="metric-title" style={{ color: 'var(--accent-gold)' }}>Entrenamiento Mensual Requerido</span>
              <TrendingUp size={16} className="text-gold" />
            </div>
            <div className="metric-value text-gold" style={{ fontSize: '1.5rem', marginBottom: 0 }}>
              {formatCurrency(requiredMonthlyContribution)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Durante {targetYears} años al {targetRate}% anual
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
