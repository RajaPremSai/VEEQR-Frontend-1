import { useEffect, useState } from 'react'
import api from '../utils/api'

export default function ManagerAnnouncements(){
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ title:'', description:'', date:'' })
  const [loading, setLoading] = useState(false)
  
  const load = async()=>{ 
    setLoading(true)
    try {
      const {data} = await api.get('/api/manager/announcements'); 
      setItems(data.announcements||[]) 
    } catch (error) {
      console.error('Failed to load announcements:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(()=>{ load() },[])
  
  const submit = async (e)=>{ 
    e.preventDefault(); 
    setLoading(true)
    try {
      await api.post('/api/manager/announcements', form); 
      setForm({ title:'', description:'', date:'' }); 
      await load() 
    } catch (error) {
      console.error('Failed to create announcement:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const del = async (id)=>{ 
    if (confirm('Are you sure you want to delete this announcement?')) {
      try {
        await api.delete(`/api/manager/announcements/${id}`); 
        await load() 
      } catch (error) {
        console.error('Failed to delete announcement:', error)
      }
    }
  }
  
  return (
    <div>
      <div className="card">
        <h3>Add Announcement</h3>
        <form onSubmit={submit} className="row">
          <div className="col">
            <label>Title</label>
            <input className="input" value={form.title||''} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required />
          </div>
          <div className="col">
            <label>Description</label>
            <textarea className="input" value={form.description||''} onChange={e=>setForm(f=>({...f,description:e.target.value}))} required style={{minHeight: '60px'}} />
          </div>
          <div className="col">
            <label>Date</label>
            <input type="date" className="input" value={form.date||''} onChange={e=>setForm(f=>({...f,date:e.target.value}))} />
          </div>
          <div className="col"><button className="btn" disabled={loading}>{loading?'Publishing...':'Publish'}</button></div>
        </form>
      </div>
      <div className="card">
        <h3>Announcements</h3>
        {loading ? (
          <div>Loading announcements...</div>
        ) : items.length === 0 ? (
          <div>No announcements found</div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{backgroundColor: '#f5f5f5'}}>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Title</th>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Description</th>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Date</th>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Created</th>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(a=> (
                  <tr key={a._id} style={{borderBottom: '1px solid #ddd'}}>
                    <td style={{padding: '8px', border: '1px solid #ddd'}}><strong>{a.title}</strong></td>
                    <td style={{padding: '8px', border: '1px solid #ddd'}}>{a.description}</td>
                    <td style={{padding: '8px', border: '1px solid #ddd'}}>
                      {a.date ? new Date(a.date).toLocaleDateString('en-GB') : 'N/A'}
                    </td>
                    <td style={{padding: '8px', border: '1px solid #ddd'}}>
                      {a.createdAt ? new Date(a.createdAt).toLocaleString() : 'N/A'}
                    </td>
                    <td style={{padding: '8px', border: '1px solid #ddd'}}>
                      <button className="btn danger" onClick={()=>del(a._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
