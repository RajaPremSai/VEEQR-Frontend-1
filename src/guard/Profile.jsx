import { useEffect, useState } from 'react'
import api from '../utils/api'

export default function GuardProfile(){
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async()=>{
    setLoading(true)
    try {
      const { data } = await api.get('/api/security-guards/profile')
      setProfile(data.profile)
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(()=>{ load() },[])

  if (loading) return <div>Loading profile...</div>
  if (!profile) return <div>Profile not found</div>

  return (
    <div>
      <div className="card">
        <h3>My Profile</h3>
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <tbody>
              <tr style={{borderBottom: '1px solid #ddd'}}>
                <td style={{padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f5f5f5'}}>Full Name</td>
                <td style={{padding: '8px', border: '1px solid #ddd'}}>
                  {profile.firstName} {profile.middleName ? profile.middleName + ' ' : ''}{profile.lastName}
                </td>
              </tr>
              <tr style={{borderBottom: '1px solid #ddd'}}>
                <td style={{padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f5f5f5'}}>Employee Number</td>
                <td style={{padding: '8px', border: '1px solid #ddd'}}>{profile.empNumber}</td>
              </tr>
              <tr style={{borderBottom: '1px solid #ddd'}}>
                <td style={{padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f5f5f5'}}>Security Guard ID</td>
                <td style={{padding: '8px', border: '1px solid #ddd'}}>{profile.securityGuardId}</td>
              </tr>
              <tr style={{borderBottom: '1px solid #ddd'}}>
                <td style={{padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f5f5f5'}}>Email</td>
                <td style={{padding: '8px', border: '1px solid #ddd'}}>{profile.email}</td>
              </tr>
              <tr style={{borderBottom: '1px solid #ddd'}}>
                <td style={{padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f5f5f5'}}>Contact Number</td>
                <td style={{padding: '8px', border: '1px solid #ddd'}}>{profile.contactNumber || 'N/A'}</td>
              </tr>
              <tr style={{borderBottom: '1px solid #ddd'}}>
                <td style={{padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f5f5f5'}}>Role</td>
                <td style={{padding: '8px', border: '1px solid #ddd'}}>{profile.role}</td>
              </tr>
              <tr style={{borderBottom: '1px solid #ddd'}}>
                <td style={{padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f5f5f5'}}>Assigned Gates</td>
                <td style={{padding: '8px', border: '1px solid #ddd'}}>
                  {profile.assignedGates && profile.assignedGates.length > 0 
                    ? profile.assignedGates.map(gate => gate.gateName).join(', ')
                    : 'No gates assigned'
                  }
                </td>
              </tr>
              <tr style={{borderBottom: '1px solid #ddd'}}>
                <td style={{padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#f5f5f5'}}>Member Since</td>
                <td style={{padding: '8px', border: '1px solid #ddd'}}>
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
