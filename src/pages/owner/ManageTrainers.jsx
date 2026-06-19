import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
export default function ManageTrainers() {
  const { user, getOwnerTrainers, getTrainerClients, addUser, getDirectClients } = useAuth();
  const { showToast } = useNotifications();
  const trainers = getOwnerTrainers(user?.id);
  const directClients = getDirectClients(user?.id);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', specialization: '' });
  const upd = (k,v) => setForm(p=>({...p,[k]:v}));
  const inp = {width:'100%',padding:'10px 14px',background:'var(--bg-input)',border:'1px solid var(--border)',borderRadius:12,color:'var(--text-primary)',fontSize:14};
  const save = () => { if(!form.name||!form.email) return; const avatar = form.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2); addUser({...form,avatar,role:'trainer',gymId:user.gymId,ownerId:user.id,password:'trainer123'}); showToast('Trainer added!'); setShowAdd(false); setForm({name:'',email:'',phone:'',specialization:''}); };
  return (
    <DashboardLayout title="Manage Trainers">
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}><h2 style={{fontFamily:'Outfit',fontWeight:800}}>💪 Trainers ({trainers.length})</h2><button className="btn btn-primary" onClick={()=>setShowAdd(true)}>+ Add Trainer</button></div>
      {showAdd && <div className="modal-overlay" onClick={()=>setShowAdd(false)}><div className="modal-content" onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><h3 className="modal-title">Add New Trainer</h3><button className="modal-close" onClick={()=>setShowAdd(false)}>✕</button></div>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div><label className="form-label">Name</label><input style={inp} value={form.name} onChange={e=>upd('name',e.target.value)}/></div>
          <div><label className="form-label">Email</label><input style={inp} value={form.email} onChange={e=>upd('email',e.target.value)}/></div>
          <div><label className="form-label">Phone</label><input style={inp} value={form.phone} onChange={e=>upd('phone',e.target.value)}/></div>
          <div><label className="form-label">Specialization</label><input style={inp} value={form.specialization} onChange={e=>upd('specialization',e.target.value)}/></div>
        </div>
        <div className="modal-footer"><button className="btn btn-outline" onClick={()=>setShowAdd(false)}>Cancel</button><button className="btn btn-success" onClick={save}>Add Trainer</button></div>
      </div></div>}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
        {trainers.map(t=>{const tc=getTrainerClients(t.id); return (
          <div key={t.id} className="card" style={{animation:'fadeInUp 0.4s ease'}}>
            <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:12}}>
              <div style={{width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,#4f46e5,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:800,color:'#fff'}}>{t.avatar}</div>
              <div><div style={{fontWeight:700,fontSize:15}}>{t.name}</div><div style={{fontSize:11,color:'var(--text-muted)'}}>{t.specialization||'General'}</div></div>
            </div>
            <div style={{display:'flex',gap:8,marginBottom:12}}>
              <span className="badge badge-blue">👥 {tc.length} clients</span>
              <span className="badge badge-green">{t.certifications||'Certified'}</span>
            </div>
            <button className="btn btn-outline btn-sm" style={{width:'100%'}}>Assign Client</button>
          </div>
        );})}
      </div>
    </DashboardLayout>
  );
}
