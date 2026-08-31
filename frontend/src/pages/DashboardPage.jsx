import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Check, ChevronRight, Clock3, Plus, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiRequest from '../services/api';

const dayNames=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const monthNames=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
function timeFor(index){return `${String(8+index*2).padStart(2,'0')}:${index%2?'30':'00'}`}
export default function DashboardPage(){
 const {user}=useAuth(); const [activities,setActivities]=useState([]); const [goals,setGoals]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(''); const [checked,setChecked]=useState({});
 const today=useMemo(()=>new Date(),[]);
 useEffect(()=>{Promise.all([apiRequest('/transactions'),apiRequest('/goals')]).then(([a,g])=>{setActivities((a.data||[]).slice(0,7));setGoals(g.data||[])}).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
 if(loading)return <div className="routine-skeleton"><div/><div/><div/><div/></div>;
 return <>
  <section className="today-heading"><div className="date-orb"><strong>{today.getDate()}</strong><span>{monthNames[today.getMonth()].slice(0,3)}</span></div><div><span className="day-name">{dayNames[today.getDay()]}</span><h1>Seu dia, do seu jeito.</h1><p>Boa {today.getHours()<12?'manhã':today.getHours()<18?'tarde':'noite'}, {user?.name?.split(' ')[0]}. Um passo de cada vez.</p></div><Link className="routine-primary" to="/transactions"><Plus/> Nova atividade</Link></section>
  {error&&<div className="routine-feedback">{error}</div>}
  <div className="today-grid"><section className="timeline-section"><div className="soft-heading"><div><span>Hoje</span><h2>Sua timeline</h2></div><Link to="/transactions"><CalendarDays/> Ver calendário</Link></div>
   <div className="timeline">{activities.length===0?<div className="routine-empty"><Sparkles/><strong>Seu dia está livre</strong><span>Adicione uma atividade e comece a construir sua rotina.</span><Link to="/transactions">Planejar meu dia <ArrowRight/></Link></div>:activities.map((item,index)=><article className={`timeline-item ${checked[item.id]?'is-done':''}`} key={item.id} style={{'--delay':`${index*55}ms`}}><time>{timeFor(index)}</time><span className="timeline-line"><i/></span><button className="check-button" onClick={()=>setChecked({...checked,[item.id]:!checked[item.id]})} aria-label="Marcar como concluída">{checked[item.id]&&<Check/>}</button><div className="timeline-card"><span className={`activity-color color-${index%4}`}/><div><strong>{item.description}</strong><span>{item.category_name||'Pessoal'} · {Math.round(Number(item.amount))} min</span></div><ChevronRight/></div></article>)}</div>
  </section><aside className="day-aside"><section className="calm-card intention-card"><span className="mini-icon"><Sparkles/></span><span>Intenção do dia</span><blockquote>“Faça menos, com mais presença.”</blockquote></section><section className="calm-card"><div className="aside-heading"><span>Objetivos em foco</span><Link to="/goals">Ver todos</Link></div>{goals.slice(0,3).map(goal=><Link className="focus-goal" to="/goals" key={goal.id}><span className="goal-ring" style={{'--progress':`${Math.min(goal.progress||0,100)*3.6}deg`}}><i>{Math.round(goal.progress||0)}%</i></span><div><strong>{goal.name}</strong><span>{goal.target_date?`até ${new Date(goal.target_date).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}`:'sem prazo'}</span></div><ChevronRight/></Link>)}{goals.length===0&&<div className="aside-empty"><Target/><span>Defina algo que importa para você.</span></div>}</section><section className="week-glance"><div><Clock3/><span>Ritmo da semana</span></div><strong>{activities.length} atividades</strong><small>Consistência é melhor que intensidade.</small></section></aside></div>
 </>;
}
