import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Icon, Dumbbell } from '../../components/Icons';
const programs = [{name:'Advanced Hypertrophy',days:['Push','Pull','Legs','Recovery','Upper','Lower','Rest'],color:'#ef4444'},{name:'HIIT & Endurance',days:['HIIT','Cardio','Core','Rest','Interval','Plyo','Rest'],color:'#f59e0b'},{name:'Mobility & Core',days:['Yoga','Core','Stretch','Rest','Mobility','Balance','Rest'],color:'#10b981'}];
export default function WorkoutPlans() {
  const [sel, setSel] = useState(0);
  return (
    <DashboardLayout title="Workout Plans">
      <div className="card" style={{marginBottom:24}}>
        <div className="card-header"><h3 className="card-title"><Icon icon={Dumbbell} size={16} style={{marginRight:6}} /> Program Templates</h3></div>
        <div style={{display:'flex',gap:8,marginBottom:16}}>
          {programs.map((p,i)=>(<button key={i} className={`btn ${sel===i?'btn-primary':'btn-outline'}`} onClick={()=>setSel(i)}>{p.name}</button>))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:8}}>
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i)=>(
            <div key={i} style={{padding:14,background:'var(--bg-tertiary)',borderRadius:12,textAlign:'center',border:'1px solid var(--border)'}}>
              <div style={{fontSize: 'clamp(12px, 1.0vw, 14px)',fontWeight:800,color:'var(--text-muted)',marginBottom:6}}>{d}</div>
              <div style={{fontSize: 'clamp(12px, 1.0vw, 14px)',fontWeight:700,color:programs[sel].days[i]==='Rest'?'var(--text-muted)':programs[sel].color}}>{programs[sel].days[i]}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" style={{marginTop:16}}>Assign to Members</button>
      </div>
    </DashboardLayout>
  );
}
