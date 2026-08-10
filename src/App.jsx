import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ExpensesTracker from './components/ExpensesTracker';
import ProjectionsCalculator from './components/ProjectionsCalculator';
import InvestmentsTracker from './components/InvestmentsTracker';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [syncStatus, setSyncStatus] = useState('loading');
  const [syncError, setSyncError] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryPeriod, setSelectedHistoryPeriod] = useState(null);

  // Floating custom toast alert state for Luna
  const [activeAlert, setActiveAlert] = useState({
    show: false,
    message: '',
    type: 'info'
  });

  const triggerToastAlert = (message, type) => {
    setActiveAlert({ show: true, message, type });
    const timer = setTimeout(() => {
      setActiveAlert((prev) => ({ ...prev, show: false }));
    }, 8000);
    return () => clearTimeout(timer);
  };

  const getExpenseMessage = (amount) => {
    return `Gasto registrado con éxito: ${formatCurrency(amount)}`;
  };

  const getIncomeMessage = (amount) => {
    return `Ingreso registrado con éxito: ${formatCurrency(amount)}`;
  };

  const localStorageKey = 'finances_luna_data';

  // Initial State tailored for the nurse, soccer & vallenato fan
  const [financialData, setRawFinancialData] = useState(() => {
    const saved = localStorage.getItem(localStorageKey);
    let parsedData = null;
    if (saved) {
      try {
        parsedData = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved financial data", e);
      }
    }

    const defaultData = {
      incomes: [
        { id: 1, description: 'Sueldo Enfermero Clínico Base', amount: 6800000, category: 'Sueldo', date: '2026-08-05' }
      ],
      expenses: [
        { id: 1, description: 'Arriendo Apartamento', amount: 1200000, category: 'Vivienda', date: '2026-08-01' },
        { id: 2, description: 'Compra de Fonendoscopio Littmann III', amount: 320000, category: 'Otros', date: '2026-08-03' },
        { id: 3, description: 'Inscripción Torneo Local Fútbol 8', amount: 150000, category: 'Entretenimiento', date: '2026-08-04' },
        { id: 4, description: 'Servicios Públicos (Luz/Internet)', amount: 350000, category: 'Servicios', date: '2026-08-05' },
        { id: 5, description: 'Boleta Concierto Silvestre Dangond', amount: 480000, category: 'Entretenimiento', date: '2026-08-06' },
        { id: 6, description: 'Seguro Responsabilidad Civil Médica', amount: 180000, category: 'Seguros', date: '2026-08-07' },
        { id: 7, description: 'Ahorro para Fichajes (Fondos)', amount: 600000, category: 'Inversiones', date: '2026-08-07' }
      ],
      investments: [
        { id: 1, name: 'Ecopetrol S.A. (ECO)', type: 'Acciones', shares: 1500, averageCost: 2200, currentPrice: 2450 },
        { id: 2, name: 'Fondo Renta Fija Colectiva', type: 'Renta Fija', shares: 1, averageCost: 10000000, currentPrice: 10800000 },
        { id: 3, name: 'Bitcoin (BTC)', type: 'Criptomonedas', shares: 0.05, averageCost: 180000000, currentPrice: 256800000 }
      ],
      transactions: [
        { id: 1, description: 'Ahorro para Fichajes (Fondos)', amount: 600000, category: 'Inversiones', type: 'expense', date: '2026-08-07' },
        { id: 2, description: 'Seguro Responsabilidad Civil Médica', amount: 180000, category: 'Seguros', type: 'expense', date: '2026-08-07' },
        { id: 3, description: 'Boleta Concierto Silvestre Dangond', amount: 480000, category: 'Entretenimiento', type: 'expense', date: '2026-08-06' },
        { id: 4, description: 'Sueldo Enfermero Clínico Base', amount: 6800000, category: 'Sueldo', type: 'income', date: '2026-08-05' },
        { id: 5, description: 'Servicios Públicos (Luz/Internet)', amount: 350000, category: 'Servicios', type: 'expense', date: '2026-08-05' },
        { id: 6, description: 'Inscripción Torneo Local Fútbol 8', amount: 150000, category: 'Entretenimiento', type: 'expense', date: '2026-08-04' }
      ],
      obligations: [
        { id: 1, description: 'Arriendo Apartamento', amount: 1200000, category: 'Vivienda', type: 'Gasto Fijo', dueDate: 'Día 05', paid: true },
        { id: 2, description: 'Seguro Responsabilidad Civil Médica', amount: 180000, category: 'Seguros', type: 'Gasto Fijo', dueDate: 'Día 07', paid: true },
        { id: 3, description: 'Tarjeta Bancolombia (Camiseta Selección)', amount: 500000, category: 'Tarjetas de Crédito', type: 'Tarjeta de Crédito', dueDate: 'Día 16', paid: false },
        { id: 4, description: 'Crédito de Moto Yamaha FZ', amount: 750000, category: 'Créditos', type: 'Crédito Vehicular', dueDate: 'Día 20', paid: false },
        { id: 5, description: 'Servicios Públicos (Luz/Internet)', amount: 350000, category: 'Servicios', type: 'Gasto Fijo', dueDate: 'Día 25', paid: false }
      ],
      config: {
        monthlyBudget: 6800000,
        cycleStartDay: 1
      },
      updatedAt: 1
    };

    if (!parsedData) return defaultData;

    // Migrate old data missing config field
    if (!parsedData.config) {
      parsedData.config = {
        monthlyBudget: 6800000,
        cycleStartDay: 1
      };
    }
    return parsedData;
  });

  const setFinancialData = (updater) => {
    setRawFinancialData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (!next) return prev;
      return {
        ...next,
        updatedAt: Date.now()
      };
    });
  };

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(financialData));

    // Asynchronously push updates to Vercel KV database
    const saveToCloud = async () => {
      try {
        const res = await fetch('/api/finances', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(financialData)
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.warning) {
            setSyncStatus('local');
            setSyncError('');
          } else {
            setSyncStatus('synced');
            setSyncError('');
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          setSyncError(errData.error || `HTTP ${res.status}`);
          setSyncStatus('error');
        }
      } catch (e) {
        console.warn("Could not save to Vercel KV cloud", e);
        setSyncError(e.message);
        setSyncStatus('error');
      }
    };
    saveToCloud();
  }, [financialData]);

  useEffect(() => {
    // Fetch from Vercel KV Cloud database on mount
    const loadFromCloud = async () => {
      try {
        const res = await fetch('/api/finances');
        if (res.ok) {
          const data = await res.json();
          if (data && data.warning) {
            setSyncStatus('local');
            setSyncError('');
          } else {
            setSyncStatus('synced');
            setSyncError('');
            if (data && (data.incomes || data.expenses || data.investments)) {
              const localSaved = localStorage.getItem(localStorageKey);
              const localObj = localSaved ? JSON.parse(localSaved) : null;
              const localTime = localObj?.updatedAt || 0;
              const cloudTime = data.updatedAt || 0;

              // Only update local state if the cloud state is strictly newer
              if (cloudTime > localTime) {
                setRawFinancialData(data);
                localStorage.setItem(localStorageKey, JSON.stringify(data));
              }
            }
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          setSyncError(errData.error || `HTTP ${res.status}`);
          setSyncStatus('error');
        }
      } catch (e) {
        console.warn("Could not load from Vercel KV cloud", e);
        setSyncError(e.message);
        setSyncStatus('error');
      }
    };
    loadFromCloud();
  }, []);

  // Handlers for Incomes
  const handleAddIncome = (newIncome) => {
    const incomeWithId = {
      ...newIncome,
      id: Date.now()
    };
    
    const transaction = {
      id: Date.now() + 1,
      description: newIncome.description,
      amount: newIncome.amount,
      category: newIncome.category,
      type: 'income',
      date: newIncome.date
    };

    setFinancialData((prev) => {
      const updatedIncomes = [incomeWithId, ...prev.incomes];
      return {
        ...prev,
        incomes: updatedIncomes,
        transactions: [transaction, ...prev.transactions]
      };
    });

    triggerToastAlert(getIncomeMessage(newIncome.amount), 'income');
  };

  const handleDeleteIncome = (id) => {
    setFinancialData((prev) => {
      const incomeToDelete = prev.incomes.find(inc => inc.id === id);
      const filteredIncomes = prev.incomes.filter((inc) => inc.id !== id);
      
      const filteredTransactions = prev.transactions.filter(
        (t) => !(t.description === incomeToDelete?.description && t.amount === incomeToDelete?.amount)
      );

      return {
        ...prev,
        incomes: filteredIncomes,
        transactions: filteredTransactions
      };
    });
  };

  const handleDeleteTransaction = (id) => {
    setFinancialData((prev) => {
      const tx = prev.transactions.find(t => t.id === id);
      if (!tx) return prev;

      const filteredTransactions = prev.transactions.filter(t => t.id !== id);
      
      let updatedExpenses = prev.expenses;
      let updatedIncomes = prev.incomes;

      if (tx.type === 'expense') {
        updatedExpenses = prev.expenses.filter(
          exp => !(exp.description === tx.description && exp.amount === tx.amount)
        );
      } else if (tx.type === 'income') {
        updatedIncomes = prev.incomes.filter(
          inc => !(inc.description === tx.description && inc.amount === tx.amount)
        );
      }

      return {
        ...prev,
        transactions: filteredTransactions,
        expenses: updatedExpenses,
        incomes: updatedIncomes
      };
    });
  };

  // Handlers for Expenses
  const handleAddExpense = (newExpense) => {
    const expenseWithId = {
      ...newExpense,
      id: Date.now()
    };
    
    const transaction = {
      id: Date.now() + 1,
      description: newExpense.description,
      amount: newExpense.amount,
      category: newExpense.category,
      type: 'expense',
      date: newExpense.date
    };

    setFinancialData((prev) => ({
      ...prev,
      expenses: [expenseWithId, ...prev.expenses],
      transactions: [transaction, ...prev.transactions]
    }));

    triggerToastAlert(getExpenseMessage(newExpense.amount), 'expense');
  };

  const handleDeleteExpense = (id) => {
    setFinancialData((prev) => {
      const expenseToDelete = prev.expenses.find(exp => exp.id === id);
      const filteredExpenses = prev.expenses.filter((exp) => exp.id !== id);
      
      const filteredTransactions = prev.transactions.filter(
        (t) => !(t.description === expenseToDelete?.description && t.amount === expenseToDelete?.amount)
      );

      return {
        ...prev,
        expenses: filteredExpenses,
        transactions: filteredTransactions
      };
    });
  };

  // Handlers for Investments
  const handleAddInvestment = (newInv) => {
    const investmentWithId = {
      ...newInv,
      id: Date.now()
    };

    setFinancialData((prev) => ({
      ...prev,
      investments: [investmentWithId, ...prev.investments]
    }));
  };

  const handleDeleteInvestment = (id) => {
    setFinancialData((prev) => ({
      ...prev,
      investments: prev.investments.filter((inv) => inv.id !== id)
    }));
  };

  // Handlers for Obligations
  const handleToggleObligation = (id) => {
    setFinancialData((prev) => {
      const obligation = prev.obligations.find((ob) => ob.id === id);
      if (!obligation) return prev;

      const isMarkingPaid = !obligation.paid;
      const updatedObligations = prev.obligations.map((ob) => {
        if (ob.id === id) {
          return { ...ob, paid: isMarkingPaid };
        }
        return ob;
      });

      let updatedExpenses = [...prev.expenses];
      let updatedTransactions = [...prev.transactions];

      if (isMarkingPaid) {
        const newExpense = {
          id: Date.now(),
          description: obligation.description,
          amount: obligation.amount,
          category: obligation.category,
          date: new Date().toISOString().split('T')[0]
        };
        const newTransaction = {
          id: Date.now() + 1,
          description: obligation.description,
          amount: obligation.amount,
          category: obligation.category,
          type: 'expense',
          date: new Date().toISOString().split('T')[0]
        };
        updatedExpenses = [newExpense, ...updatedExpenses];
        updatedTransactions = [newTransaction, ...updatedTransactions];
      } else {
        updatedExpenses = updatedExpenses.filter(
          (exp) => !(exp.description === obligation.description && exp.amount === obligation.amount)
        );
        updatedTransactions = updatedTransactions.filter(
          (t) => !(t.description === obligation.description && t.amount === obligation.amount)
        );
      }

      return {
        ...prev,
        obligations: updatedObligations,
        expenses: updatedExpenses,
        transactions: updatedTransactions
      };
    });

    if (isMarkingPaid) {
      triggerToastAlert(getExpenseMessage(obligation.amount), 'expense');
    }
  };

  const handleAddObligation = (newObl) => {
    setFinancialData((prev) => ({
      ...prev,
      obligations: [
        ...prev.obligations,
        {
          ...newObl,
          id: Date.now(),
          paid: false
        }
      ]
    }));
  };

  const handleDeleteObligation = (id) => {
    setFinancialData((prev) => ({
      ...prev,
      obligations: prev.obligations.filter((ob) => ob.id !== id)
    }));
  };

  // Simulates automatic sync with nurse shifts, soccer, and vallenato items
  const handleSimulateBankSync = () => {
    const mockDescriptions = [
      { desc: 'Turno Extra Nocturno UCI', amount: 380000, category: 'Sueldo', type: 'income' },
      { desc: 'Compra Uniformes Quirúrgicos (Scrubs)', amount: 220000, category: 'Otros', type: 'expense' },
      { desc: 'Alquiler Cancha de Fútbol 5', amount: 110000, category: 'Entretenimiento', type: 'expense' },
      { desc: 'Vinilo Colección Diomedes Díaz', amount: 150000, category: 'Otros', type: 'expense' },
      { desc: 'Premio Goleador Torneo Local', amount: 200000, category: 'Sueldo', type: 'income' },
      { desc: 'Honorario Turno Consulta Externa', amount: 450000, category: 'Sueldo', type: 'income' }
    ];

    const randomIndex = Math.floor(Math.random() * mockDescriptions.length);
    const mock = mockDescriptions[randomIndex];
    const newId = Date.now();

    const newTransaction = {
      id: newId,
      description: mock.desc,
      amount: mock.amount,
      category: mock.category,
      type: mock.type,
      date: new Date().toISOString().split('T')[0]
    };

    setFinancialData((prev) => {
      const updatedTransactions = [newTransaction, ...prev.transactions];
      let updatedExpenses = prev.expenses;

      if (mock.type === 'expense') {
        const newExpense = {
          id: newId + 1,
          description: mock.desc,
          amount: mock.amount,
          category: mock.category,
          date: newTransaction.date
        };
        updatedExpenses = [newExpense, ...prev.expenses];
      } else if (mock.type === 'income') {
        const newIncome = {
          id: newId + 2,
          description: mock.desc,
          amount: mock.amount,
          category: mock.category,
          date: newTransaction.date
        };

        return {
          ...prev,
          incomes: [newIncome, ...prev.incomes],
          transactions: updatedTransactions
        };
      }

      return {
        ...prev,
        expenses: updatedExpenses,
        transactions: updatedTransactions
      };
    });
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(financialData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Finanzas_Enfermero_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearData = () => {
    if (window.confirm("¿Estás seguro de que quieres borrar todos los datos de demostración para iniciar en limpio con tus valores reales? Esto vaciará tus registros de enfermero e inversiones actuales.")) {
      setFinancialData({
        incomes: [],
        expenses: [],
        investments: [],
        transactions: [],
        obligations: []
      });
    }
  };

  const config = financialData.config || { monthlyBudget: 6800000, cycleStartDay: 1 };

  const getPeriodRange = (startDay) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    let startYear = year;
    let startMonth = month;

    if (day < startDay) {
      startMonth = month - 1;
    }

    const startDate = new Date(startYear, startMonth, startDay);
    const endDate = new Date(startYear, startMonth + 1, startDay - 1, 23, 59, 59);

    return { startDate, endDate };
  };

  const { startDate, endDate } = getPeriodRange(config.cycleStartDay);

  const isInCurrentPeriod = (dateStr) => {
    if (!dateStr) return false;
    const txDate = new Date(dateStr + 'T00:00:00');
    return txDate >= startDate && txDate <= endDate;
  };

  // Filter lists for current period
  const currentIncomes = (financialData.incomes || []).filter(inc => isInCurrentPeriod(inc.date));
  const currentExpenses = (financialData.expenses || []).filter(exp => isInCurrentPeriod(exp.date));
  const currentTransactions = (financialData.transactions || []).filter(tx => isInCurrentPeriod(tx.date));

  const totalIncome = currentIncomes.reduce((sum, inc) => sum + inc.amount, 0);
  const financialDataWithTotals = {
    ...financialData,
    incomes: currentIncomes,
    expenses: currentExpenses,
    transactions: currentTransactions,
    income: totalIncome
  };

  const getHistoricalPeriods = () => {
    const periodsMap = {};
    const txs = financialData.transactions || [];
    const startDay = config.cycleStartDay;

    txs.forEach(tx => {
      const parts = tx.date.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);

      let pYear = year;
      let pMonth = month;

      if (day < startDay) {
        const prev = new Date(year, month - 1, 1);
        pYear = prev.getFullYear();
        pMonth = prev.getMonth();
      }

      const pKey = `${pYear}-${String(pMonth + 1).padStart(2, '0')}`;
      
      if (!periodsMap[pKey]) {
        const pStartDate = new Date(pYear, pMonth, startDay);
        const pEndDate = new Date(pYear, pMonth + 1, startDay - 1);
        
        const opt = { day: '2-digit', month: 'short' };
        const label = `${pStartDate.toLocaleDateString('es-ES', opt)} - ${pEndDate.toLocaleDateString('es-ES', opt)}`;
        const name = pStartDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

        periodsMap[pKey] = {
          key: pKey,
          label,
          name: capitalizedName,
          incomes: 0,
          expenses: 0,
          transactions: []
        };
      }

      if (tx.type === 'income') {
        periodsMap[pKey].incomes += tx.amount;
      } else {
        periodsMap[pKey].expenses += tx.amount;
      }
      periodsMap[pKey].transactions.push(tx);
    });

    return Object.values(periodsMap).sort((a, b) => b.key.localeCompare(a.key));
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '$ 0';
    const isNegative = val < 0;
    const absVal = Math.round(Math.abs(val));
    const formatted = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${isNegative ? '-' : ''}$ ${formatted}`;
  };

  return (
    <div className="app-container">
      <div className="aurora-2"></div>
      
      {/* Floating alert toast notification */}
      {activeAlert.show && (
        <div className="toast-container">
          <div className={`toast-alert ${activeAlert.type}`}>
            <span className="toast-alert-text">{activeAlert.message}</span>
            <button 
              className="toast-alert-close" 
              onClick={() => setActiveAlert((prev) => ({ ...prev, show: false }))}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Sidebar with themed links */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main panel */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard 
            financialData={financialDataWithTotals} 
            simulateBankSync={handleSimulateBankSync}
            exportData={handleExportData}
            onDeleteTransaction={handleDeleteTransaction}
            clearData={handleClearData}
            syncStatus={syncStatus}
            syncError={syncError}
            config={config}
          />
        )}
        
        {activeTab === 'expenses' && (
          <ExpensesTracker 
            expenses={financialDataWithTotals.expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            incomes={financialDataWithTotals.incomes}
            onAddIncome={handleAddIncome}
            onDeleteIncome={handleDeleteIncome}
            obligations={financialData.obligations}
            onToggleObligation={handleToggleObligation}
            onAddObligation={handleAddObligation}
            onDeleteObligation={handleDeleteObligation}
            config={config}
          />
        )}

        {activeTab === 'projections' && (
          <ProjectionsCalculator />
        )}

        {activeTab === 'investments' && (
          <InvestmentsTracker 
            investments={financialData.investments}
            onAddInvestment={handleAddInvestment}
            onDeleteInvestment={handleDeleteInvestment}
          />
        )}

        {activeTab === 'history' && (
          <div className="tab-pane active">
            <div className="top-header">
              <div className="header-title-area">
                <h1>Historial de Signos (Cierres)</h1>
                <p>Consulta el diagnóstico y tratamiento de tus periodos anteriores.</p>
              </div>
            </div>

            <div className="glass-card">
              <div className="table-container">
                {getHistoricalPeriods().length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No hay suficientes tratamientos registrados para armar un histórico clínico.
                  </p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Período</th>
                        <th>Rango de Fechas</th>
                        <th>Ingresos (Guardias)</th>
                        <th>Dosis (Gastos)</th>
                        <th>Ahorro Neto</th>
                        <th>Presupuesto Clínico</th>
                        <th>Estado de Salud</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getHistoricalPeriods().map((period) => {
                        const netSavings = period.incomes - period.expenses;
                        const isExceeded = period.expenses > (config.monthlyBudget);
                        return (
                          <tr key={period.key}>
                            <td style={{ fontWeight: 700 }}>{period.name}</td>
                            <td style={{ color: 'var(--text-muted)' }}>{period.label}</td>
                            <td className="text-emerald">{formatCurrency(period.incomes)}</td>
                            <td className="text-rose">{formatCurrency(period.expenses)}</td>
                            <td className={netSavings >= 0 ? 'text-emerald' : 'text-rose'} style={{ fontWeight: 700 }}>
                              {formatCurrency(netSavings)}
                            </td>
                            <td>{formatCurrency(config.monthlyBudget)}</td>
                            <td>
                              <span className={`badge ${isExceeded ? 'text-rose' : 'text-emerald'}`} style={{ background: isExceeded ? 'rgba(230, 57, 70, 0.12)' : 'rgba(129, 178, 154, 0.12)' }}>
                                {isExceeded ? "Triaje Crítico 🛑" : "Paciente Estable 🟢"}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 'auto' }}
                                onClick={() => {
                                  setSelectedHistoryPeriod(period);
                                  setShowHistoryModal(true);
                                }}
                              >
                                Ver Ficha
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Modal para ver detalles del periodo seleccionado */}
            {showHistoryModal && selectedHistoryPeriod && (
              <div className="modal-overlay" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0, 0, 0, 0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 3000,
                backdropFilter: 'blur(5px)'
              }}>
                <div className="glass-card" style={{
                  width: '90%',
                  maxWidth: '650px',
                  maxHeight: '80vh',
                  overflowY: 'auto',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                    <div>
                      <h2 style={{ margin: 0 }}>Desglose Clínico</h2>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedHistoryPeriod.name} ({selectedHistoryPeriod.label})</p>
                    </div>
                    <button 
                      onClick={() => setShowHistoryModal(false)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ingresos</span>
                      <div className="text-emerald" style={{ fontWeight: 800, fontSize: '1.25rem' }}>{formatCurrency(selectedHistoryPeriod.incomes)}</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Egresos</span>
                      <div className="text-rose" style={{ fontWeight: 800, fontSize: '1.25rem' }}>{formatCurrency(selectedHistoryPeriod.expenses)}</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ahorro</span>
                      <div className={selectedHistoryPeriod.incomes - selectedHistoryPeriod.expenses >= 0 ? 'text-emerald' : 'text-rose'} style={{ fontWeight: 800, fontSize: '1.25rem' }}>
                        {formatCurrency(selectedHistoryPeriod.incomes - selectedHistoryPeriod.expenses)}
                      </div>
                    </div>
                  </div>

                  <h3>Fichas de Movimientos</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {selectedHistoryPeriod.transactions.map((tx) => {
                      const isExpense = tx.type === 'expense';
                      return (
                        <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{tx.description}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.category} • {tx.date}</div>
                          </div>
                          <div className={isExpense ? 'text-rose' : 'text-emerald'} style={{ fontWeight: 700 }}>
                            {isExpense ? '-' : '+'}{formatCurrency(tx.amount)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'config' && (
          <div className="tab-pane active">
            <div className="top-header">
              <div className="header-title-area">
                <h1>Configuración de Tratamiento</h1>
                <p>Personaliza tus límites de dosis y días de facturación de guardia. 🛠️🩹</p>
              </div>
            </div>
            
            <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-cyan)' }}>Ajustes del Ciclo Clínico</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const budgetInput = document.getElementById('cfg-budget').value;
                const cycleInput = parseInt(document.getElementById('cfg-cycle-day').value, 10);
                const cleanBudget = parseFloat(budgetInput.replace(/\./g, '')) || 0;
                
                setFinancialData(prev => ({
                  ...prev,
                  config: {
                    monthlyBudget: cleanBudget,
                    cycleStartDay: cycleInput
                  }
                }));
                window.alert("Configuración de signos vitales guardada.");
              }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                    Presupuesto Mensual / Sueldo Base (COP)
                  </label>
                  <input 
                    id="cfg-budget"
                    type="text"
                    defaultValue={formatCurrency(config.monthlyBudget).replace('$ ', '')}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '');
                      e.target.value = clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '1rem'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                    Día de Inicio de Ciclo
                  </label>
                  <select 
                    id="cfg-cycle-day"
                    defaultValue={config.cycleStartDay}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '1rem'
                    }}
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day} style={{ background: '#08120e', color: 'var(--text-primary)' }}>
                        Día {day} de cada mes
                      </option>
                    ))}
                  </select>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Tus dosis y guardias se agruparán en ciclos automáticos desde el día {config.cycleStartDay} de un mes hasta el día {config.cycleStartDay === 1 ? '30/31' : config.cycleStartDay - 1} del mes siguiente.
                  </p>
                </div>

                <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
                  Guardar Parámetros Clínicos
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
