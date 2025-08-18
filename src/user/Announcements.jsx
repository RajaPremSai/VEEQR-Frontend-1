import { useEffect, useState } from 'react'
import api from '../utils/api'

export default function UserAnnouncements(){
  const [items, setItems] = useState([])
  useEffect(()=>{
    (async()=>{
      const { data } = await api.get('/api/users/announcements')
      setItems(data.announcements||[])
    })()
  },[])
  return (
    <div className="card">
      <h3>Announcements</h3>
      {items.map(a=> (
        <div key={a._id} className="card">
          <strong>{a.title}</strong>
          <div>{a.description}</div>
          <small>{new Date(a.date || a.createdAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  )
}
