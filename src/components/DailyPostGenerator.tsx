import React, { useState } from 'react'
import { generateDailyPost } from '../utils/posts'

export default function DailyPostGenerator() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [preview, setPreview] = useState('')

  function createPost() {
    setPreview(generateDailyPost(date))
  }

  return (
    <div className="daily-post-generator">
      <div className="form-row">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button onClick={createPost}>Générer post</button>
      </div>
      <div className="preview">
        <label>Post quotidien</label>
        <textarea readOnly value={preview} rows={8} />
      </div>
    </div>
  )
}
