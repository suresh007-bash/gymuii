import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
export default function ManageTrainers() {
  const { user, getOwnerTrainers, getTrainerClients, addUser, getDirectClients, allUsers, updateUser } = useAuth();
  const { showToast } = useNotifications();
  const trainers = getOwnerTrainers(user?.id);
  const directClients = getDirectClients(user?.id);
  const [showAdd, setShowAdd] = useState(false);
  const [activeTrainer, setActiveTrainer] = useState(null);
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
      
      {activeTrainer && (
        <div className="modal-overlay" onClick={() => setActiveTrainer(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h3 className="modal-title">👥 Assign Client to {activeTrainer.name}</h3>
              <button className="modal-close" onClick={() => setActiveTrainer(null)}>✕</button>
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0' }}>
              {allUsers.filter(u => u.role === 'client' && u.gymId === user.gymId).length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>No clients found in this gym.</div>
              ) : (
                allUsers.filter(u => u.role === 'client' && u.gymId === user.gymId).map(client => {
                  const currentTrainer = allUsers.find(u => u.id === client.trainerId);
                  const isAssignedToThis = client.trainerId === activeTrainer.id;
                  return (
                    <div key={client.id} style={{
                      display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: 12, padding: 10,
                      borderRadius: 12, background: 'var(--bg-tertiary)', border: '1px solid var(--border)'
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f97316, #fb923c)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 800, color: '#fff'
                      }}>{client.avatar}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{client.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {currentTrainer ? `Trainer: ${currentTrainer.name}` : 'Direct Client'}
                        </div>
                      </div>
                      <div>
                        {isAssignedToThis ? (
                          <span style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 700 }}>Assigned ✅</span>
                        ) : (
                          <button className="btn btn-primary btn-sm" onClick={() => {
                            updateUser(client.id, { trainerId: activeTrainer.id });
                            showToast(`✅ Assigned ${client.name} to ${activeTrainer.name}`);
                          }}>Assign</button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="modal-footer" style={{ marginTop: 14 }}>
              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setActiveTrainer(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

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
            <button className="btn btn-outline btn-sm" style={{width:'100%'}} onClick={() => setActiveTrainer(t)}>Assign Client</button>
          </div>
        );})}
      </div>
    </DashboardLayout>
  );
}
