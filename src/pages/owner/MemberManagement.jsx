import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
export default function MemberManagement() {
  const { user, getOwnerClients, getDirectClients, allUsers } = useAuth();
  const allClients = getOwnerClients(user?.id);
  const directClients = getDirectClients(user?.id);
  const [tab, setTab] = useState('all');
  const shown = tab === 'all' ? allClients : tab === 'direct' ? directClients : allClients;
  const getTrainerName = (tid) => { const t = allUsers.find(u => u.id === tid); return t ? t.name : 'Direct'; };
  return (
    <DashboardLayout title="Member Management">
      <div className="tabs" style={{marginBottom:20}}>
        <button className={`tab ${tab==='all'?'active':''}`} onClick={()=>setTab('all')}>All ({allClients.length})</button>
        <button className={`tab ${tab==='direct'?'active':''}`} onClick={()=>setTab('direct')}>Direct ({directClients.length})</button>
      </div>
      <div className="card"><table className="data-table"><thead><tr><th>Member</th><th>Goal</th><th>Trainer</th><th>Diet</th><th>Joined</th><th>Actions</th></tr></thead>
        <tbody>{shown.map(c=>(
          <tr key={c.id}>
            <td><div style={{display:'flex',alignItems:'center',gap:10}}><div style={{width:32,height:32,borderRadius:'50%',background:'var(--gradient-primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize: 'clamp(12px, 3vw, 15px)',fontWeight:800,color:'#fff'}}>{c.avatar}</div><div><div style={{fontWeight:700,fontSize: 'clamp(12px, 3vw, 17px)'}}>{c.name}</div><div style={{fontSize: 'clamp(12px, 3vw, 15px)',color:'var(--text-muted)'}}>{c.email}</div></div></div></td>
            <td><span className="badge badge-blue">{c.goal}</span></td>
            <td><span className={`badge ${c.trainerId ? 'badge-purple' : 'badge-orange'}`}>{getTrainerName(c.trainerId)}</span></td>
            <td style={{fontSize: 'clamp(12px, 3vw, 16px)'}}>{c.diet}</td>
            <td style={{fontSize: 'clamp(12px, 3vw, 16px)',color:'var(--text-muted)'}}>{c.joinDate}</td>
            <td><button className="btn btn-outline btn-sm">View</button></td>
          </tr>
        ))}</tbody>
      </table></div>
    </DashboardLayout>
  );
}
