import { useEffect, useState } from 'react'
import api from '../utils/api'

export default function ManagerLogs(){
  const [logs, setLogs] = useState([])
  const [filters, setFilters] = useState({ 
    vehicleNumber:'', 
    ownerName:'', 
    gate:'', 
    securityGuardId:'', 
    entryTime:'', 
    exitTime:'',
    vehicleType:''
  })
  const [loading, setLoading] = useState(false)

  const load = async()=>{
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k,v])=>{ if (v) params.set(k, v) })
      const { data } = await api.get(`/api/manager/logs?${params.toString()}`)
      setLogs(data.logs||[])
    } catch (error) {
      console.error('Failed to load logs:', error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(()=>{ load() },[])

  const onFilter = async (e)=>{ e.preventDefault(); load() }

  const exportData = async (type) => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k,v])=>{ if (v) params.set(k, v) })
      params.set('export', type)
      
      const response = await api.get(`/api/manager/logs?${params.toString()}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `logs.${type}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(`Failed to export ${type}:`, error)
      alert(`Failed to export ${type.toUpperCase()}. Please try again.`)
    }
  }

  return (
    <div>
      <div className="card">
        <h3>Filters</h3>
        <form onSubmit={onFilter} className="row">
          <div className="col">
            <label>Vehicle Number</label>
            <input className="input" value={filters.vehicleNumber||''} onChange={e=>setFilters(f=>({...f,vehicleNumber:e.target.value}))} />
          </div>
          <div className="col">
            <label>Owner Name</label>
            <input className="input" value={filters.ownerName||''} onChange={e=>setFilters(f=>({...f,ownerName:e.target.value}))} />
          </div>
          <div className="col">
            <label>Gate</label>
            <input className="input" value={filters.gate||''} onChange={e=>setFilters(f=>({...f,gate:e.target.value}))} />
          </div>
          <div className="col">
            <label>Security Guard ID</label>
            <input className="input" value={filters.securityGuardId||''} onChange={e=>setFilters(f=>({...f,securityGuardId:e.target.value}))} />
          </div>
          <div className="col">
            <label>Entry Time (Date)</label>
            <input type="date" className="input" value={filters.entryTime||''} onChange={e=>setFilters(f=>({...f,entryTime:e.target.value}))} />
          </div>
          <div className="col">
            <label>Exit Time (Date)</label>
            <input type="date" className="input" value={filters.exitTime||''} onChange={e=>setFilters(f=>({...f,exitTime:e.target.value}))} />
          </div>
          <div className="col">
            <label>Vehicle Type</label>
            <select className="input" value={filters.vehicleType||''} onChange={e=>setFilters(f=>({...f,vehicleType:e.target.value}))}>
              <option value="">All Types</option>
              <option value="Car">Car</option>
              <option value="Bike">Bike</option>
              <option value="Scooter">Scooter</option>
              <option value="Bus">Bus</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="col"><button className="btn" disabled={loading}>{loading?'Loading...':'Apply'}</button></div>
          <div className="col" style={{display:'flex',gap:8,alignItems:'center'}}>
            <button type="button" className="btn secondary" onClick={() => exportData('csv')}>Export CSV</button>
            <button type="button" className="btn secondary" onClick={() => exportData('pdf')}>Export PDF</button>
          </div>
        </form>
      </div>
      <div className="card">
        <h3>Vehicle Movement Logs</h3>
        {loading ? (
          <div>Loading logs...</div>
        ) : logs.length === 0 ? (
          <div>No logs found</div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{backgroundColor: '#f5f5f5'}}>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Log ID</th>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Vehicle Number</th>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Vehicle Type</th>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Owner</th>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Gate</th>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Security Guard</th>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Entry Time</th>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Exit Time</th>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l=> {
                  const entryTime = l.timeIn ? new Date(l.timeIn) : null
                  const exitTime = l.timeOut ? new Date(l.timeOut) : null
                  const duration = entryTime && exitTime ? 
                    Math.round((exitTime - entryTime) / (1000 * 60)) + ' min' : '-'
                  
                  return (
                    <tr key={l._id} style={{borderBottom: '1px solid #ddd'}}>
                      <td style={{padding: '8px', border: '1px solid #ddd'}}>{l.logId || l._id.slice(-8)}</td>
                      <td style={{padding: '8px', border: '1px solid #ddd'}}><strong>{l.vehicleNumber}</strong></td>
                      <td style={{padding: '8px', border: '1px solid #ddd'}}>{l.vehicleType || 'N/A'}</td>
                      <td style={{padding: '8px', border: '1px solid #ddd'}}>{l.vehicleOwner || 'N/A'}</td>
                      <td style={{padding: '8px', border: '1px solid #ddd'}}>{l.gateNumber}</td>
                      <td style={{padding: '8px', border: '1px solid #ddd'}}>{l.securityGuardName || l.securityGuardId || 'N/A'}</td>
                      <td style={{padding: '8px', border: '1px solid #ddd'}}>
                        {entryTime ? entryTime.toLocaleString() : '-'}
                      </td>
                      <td style={{padding: '8px', border: '1px solid #ddd'}}>
                        {exitTime ? exitTime.toLocaleString() : '-'}
                      </td>
                      <td style={{padding: '8px', border: '1px solid #ddd'}}>{duration}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
