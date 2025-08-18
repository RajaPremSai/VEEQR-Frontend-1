import { useEffect, useState } from 'react'
import api from '../utils/api'

export default function GuardAnnouncements(){
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async()=>{
    setLoading(true)
    try {
      const { data } = await api.get('/api/security-guards/announcements')
      setAnnouncements(data.announcements||[])
    } catch (error) {
      console.error('Failed to load announcements:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(()=>{ load() },[])

  return (
    <div>
      <div className="card">
        <h3>Announcements</h3>
        {loading ? (
          <div>Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <div>No announcements available.</div>
        ) : (
          <div>
            {announcements.map(announcement => (
              <div key={announcement._id} className="card" style={{marginBottom: '15px', border: '1px solid #ddd'}}>
                <h4 style={{margin: '0 0 10px 0', color: '#333'}}>{announcement.title}</h4>
                <p style={{margin: '0 0 10px 0', lineHeight: '1.5'}}>{announcement.description}</p>
                <div style={{fontSize: '12px', color: '#666'}}>
                  <strong>Date:</strong> {announcement.date ? new Date(announcement.date).toLocaleDateString() : 'N/A'} | 
                  <strong> Published:</strong> {announcement.createdAt ? new Date(announcement.createdAt).toLocaleString() : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
