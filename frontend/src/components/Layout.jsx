import { NavLink } from 'react-router-dom';
import { CalendarDays, CircleUserRound, Home, Leaf, LogOut, Plus, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [{ to: '/', label: 'Hoje', icon: Home }, { to: '/transactions', label: 'Calendário', icon: CalendarDays }, { to: '/goals', label: 'Objetivos', icon: Target }];
export default function Layout({ children }) {
  const { logout, user } = useAuth();
  return <div className="routine-shell">
    <header className="routine-header"><div className="routine-header-inner"><NavLink className="routine-brand" to="/"><span className="routine-logo"><Leaf /></span><span>routine</span></NavLink><nav className="routine-nav">{links.map(({to,label})=><NavLink key={to} to={to}>{label}</NavLink>)}</nav><div className="routine-profile"><span className="routine-greeting">Olá, <strong>{user?.name?.split(' ')[0]}</strong></span><button type="button" onClick={logout} aria-label="Sair" data-tooltip="Sair"><LogOut size={17}/></button></div></div></header>
    <main className="routine-content"><div className="routine-container route-enter">{children}</div></main>
    <nav className="bottom-nav" aria-label="Navegação mobile">{links.slice(0,2).map(({to,label,icon:Icon})=><NavLink key={to} to={to}><Icon/><span>{label}</span></NavLink>)}<NavLink className="bottom-add" to="/transactions" aria-label="Nova atividade"><Plus/></NavLink><NavLink to="/goals"><Target/><span>Objetivos</span></NavLink><button type="button" onClick={logout}><CircleUserRound/><span>Perfil</span></button></nav>
  </div>;
}
