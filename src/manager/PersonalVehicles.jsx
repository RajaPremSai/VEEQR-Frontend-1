import { useEffect, useState } from 'react'
import api from '../utils/api'

export default function ManagerPersonalVehicles(){
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async()=>{
    setLoading(true)
    try {
      const { data } = await api.get('/api/manager/personal-vehicles')
      setVehicles(data.vehicles||[])
    } catch (error) {
      console.error('Failed to load personal vehicles:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(()=>{ load() },[])

  return (
    <div>
      <div className="card">
        <h3>Personal Vehicles (Registered by Users)</h3>
        {loading ? (
          <div>Loading vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div>No personal vehicles found</div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{backgroundColor: '#f5f5f5'}}>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Vehicle Number</th>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Vehicle Type</th>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Model Name</th>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Owner</th>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Driver Name</th>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Driver Mobile</th>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Employee Number</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(v=> (
                  <tr key={v._id} style={{borderBottom: '1px solid #ddd'}}>
                    <td style={{padding: '8px', border: '1px solid #ddd'}}><strong>{v.vehicleNumber}</strong></td>
                    <td style={{padding: '8px', border: '1px solid #ddd'}}>{v.vehicleType}</td>
                    <td style={{padding: '8px', border: '1px solid #ddd'}}>{v.vehicleModelName || 'N/A'}</td>
                    <td style={{padding: '8px', border: '1px solid #ddd'}}>{v.vehicleOwner}</td>
                    <td style={{padding: '8px', border: '1px solid #ddd'}}>{v.driverName || 'N/A'}</td>
                    <td style={{padding: '8px', border: '1px solid #ddd'}}>{v.driverMobileNumber || 'N/A'}</td>
                    <td style={{padding: '8px', border: '1px solid #ddd'}}>{v.empNumber}</td>
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
