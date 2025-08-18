import { useEffect, useState } from 'react'
import api from '../utils/api'

export default function GuardGates(){
  const [gates, setGates] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async()=>{
    setLoading(true)
    try {
      const { data } = await api.get('/api/security-guards/gates')
      setGates(data.gates||[])
    } catch (error) {
      console.error('Failed to load gates:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(()=>{ load() },[])

  return (
    <div>
      <div className="card">
        <h3>My Assigned Gates</h3>
        {loading ? (
          <div>Loading gates...</div>
        ) : gates.length === 0 ? (
          <div>No gates assigned to you yet.</div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{backgroundColor: '#f5f5f5'}}>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Gate Number</th>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Gate Name</th>
                  <th style={{padding: '8px', border: '1px solid #ddd', textAlign: 'left'}}>Status</th>
                </tr>
              </thead>
              <tbody>
                {gates.map(gate=> (
                  <tr key={gate._id} style={{borderBottom: '1px solid #ddd'}}>
                    <td style={{padding: '8px', border: '1px solid #ddd'}}><strong>{gate.gateNumber}</strong></td>
                    <td style={{padding: '8px', border: '1px solid #ddd'}}>{gate.gateName}</td>
                    <td style={{padding: '8px', border: '1px solid #ddd'}}>
                      <span style={{color: 'green', fontWeight: 'bold'}}>Active</span>
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
