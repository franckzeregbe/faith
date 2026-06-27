import React, { useState } from 'react'
import { generateDailyPost } from '../utils/posts'

export default function DailyPostGenerator() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [preview, setPreview] = useState('')

  function createPost() {
    setPreview(generateDailyPost(date))
  }

  function copyToClipboard() {
    if (!preview) return
    navigator.clipboard.writeText(preview)
  }

  return (
    <div>
      <div className="form-row">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <button className="btn btn-primary" onClick={createPost}>Générer post</button>
      </div>

      <div className="preview-box">
        <label>Post quotidien</label>
        <textarea readOnly value={preview} rows={8} placeholder="Clique sur Générer post pour créer un contenu..." />
        {preview && (
          <div className="form-actions">
            <button className="btn btn-secondary btn-sm" onClick={copyToClipboard}>Copier</button>
          </div>
        )}
      </div>
    </div>
  )
}
