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
      <div className="section-card-header" style={{ border: 'none', padding: 0, marginBottom: 16 }}>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
          Chaque jour, un contenu inspirant avec verset biblique, prêt à publier sur les réseaux sociaux.
          Le thème change selon la date.
        </p>
      </div>

      <div className="form-row">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <button className="btn btn-primary" onClick={createPost}>Générer</button>
      </div>

      <div className="preview-box">
        <label>Publication du jour</label>
        <textarea
          readOnly
          value={preview}
          rows={8}
          placeholder="Choisis une date et clique sur Générer..."
          style={preview ? {} : { color: 'var(--muted)' }}
        />
        {preview && (
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={copyToClipboard}>📋 Copier</button>
          </div>
        )}
      </div>
    </div>
  )
}
