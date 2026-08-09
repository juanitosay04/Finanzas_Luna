import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ExpensesTracker from './components/ExpensesTracker';
import ProjectionsCalculator from './components/ProjectionsCalculator';
import InvestmentsTracker from './components/InvestmentsTracker';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [syncStatus, setSyncStatus] = useState('loading');

  const localStorageKey = 'finances_luna_data';

  // Initial State tailored for the nurse, soccer & vallenato fan
  const [financialData, setRawFinancialData] = useState(() => {
    const saved = localStorage.getItem(localStorageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved financial data", e);
      }
    }
    return {
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
      updatedAt: 1
    };
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
          } else {
            setSyncStatus('synced');
          }
        } else {
          setSyncStatus('error');
        }
      } catch (e) {
        console.warn("Could not save to Vercel KV cloud", e);
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
          } else {
            setSyncStatus('synced');
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
          setSyncStatus('error');
        }
      } catch (e) {
        console.warn("Could not load from Vercel KV cloud", e);
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

  const totalIncome = (financialData.incomes || []).reduce((sum, inc) => sum + inc.amount, 0);
  const financialDataWithTotals = {
    ...financialData,
    income: totalIncome
  };

  return (
    <div className="app-container">
      <div className="aurora-2"></div>
      
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
          />
        )}
        
        {activeTab === 'expenses' && (
          <ExpensesTracker 
            expenses={financialData.expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            incomes={financialData.incomes}
            onAddIncome={handleAddIncome}
            onDeleteIncome={handleDeleteIncome}
            obligations={financialData.obligations}
            onToggleObligation={handleToggleObligation}
            onAddObligation={handleAddObligation}
            onDeleteObligation={handleDeleteObligation}
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
      </main>
    </div>
  );
}
