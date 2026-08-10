import { Activity, Pill, Trophy, Coins, HeartPulse, History, Settings } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', name: 'Diagnóstico General', icon: Activity },
    { id: 'expenses', name: 'Tratamiento (Gastos)', icon: Pill },
    { id: 'projections', name: 'Entrenamiento (Goles)', icon: Trophy },
    { id: 'investments', name: 'Fichajes (Inversiones)', icon: Coins },
    { id: 'history', name: 'Historial Cierres', icon: History },
    { id: 'config', name: 'Configuración', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <HeartPulse className="text-cyan" size={24} />
        <span className="sidebar-logo-text">Ahorro FC</span>
      </div>
      
      <ul className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.id}
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </li>
          );
        })}
      </ul>
      
      <div className="sidebar-footer">
        <div>Clínica del Ahorro FC v1.0</div>
        <div className="partner-badge">ENFERMERO GOLEADOR</div>
      </div>
    </aside>
  );
}
