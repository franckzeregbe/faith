import React, { useEffect, useState } from 'react'
import { loadJsonFromStorage } from '../utils/storage'

const PIN_KEY = 'faith_pin'

type Props = {
  onUnlock: () => void
}

export default function PinLock({ onUnlock }: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  const storedPin = loadJsonFromStorage<string>(PIN_KEY, '')

  useEffect(() => {
    if (!storedPin) onUnlock()
  }, [])

  useEffect(() => {
    if (value.length < 4) return
    if (value === storedPin) {
      onUnlock()
    } else {
      setError(true)
      const t = setTimeout(() => { setValue(''); setError(false) }, 1200)
      return () => clearTimeout(t)
    }
  }, [value])

  if (!storedPin) return null

  function handleDigit(d: string) {
    if (value.length < 6) {
      setValue(v => v + d)
      setError(false)
    }
  }

  function handleRemove() {
    setValue(v => v.slice(0, -1))
    setError(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg-alt) 100%)',
      padding: 24,
    }}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        padding: '40px 32px',
        boxShadow: 'var(--shadow-lg)',
        textAlign: 'center',
        maxWidth: 340,
        width: '100%',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(180deg, var(--primary-soft), var(--primary-light))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', fontSize: '1.2rem', fontWeight: 800,
          color: 'var(--text)', letterSpacing: '0.12em',
        }}>FOI</div>
        <h2 style={{ margin: '0 0 4px', fontSize: '1.2rem', color: 'var(--text)' }}>FAITH</h2>
        <p style={{ margin: '0 0 24px', fontSize: '0.85rem', color: 'var(--muted)' }}>Entrez votre code PIN</p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: 16, height: 16, borderRadius: '50%',
              background: value[i] ? 'var(--primary)' : 'var(--border)',
              transition: 'background 0.15s ease',
            }} />
          ))}
        </div>

        {error && (
          <p style={{ color: '#991b1b', fontSize: '0.85rem', margin: '0 0 16px' }}>Code incorrect</p>
        )}

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
          maxWidth: 240, margin: '0 auto',
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
            <button key={d} type="button" onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-alt)' }}
              onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)' }}
              onClick={() => handleDigit(String(d))} style={{
                padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                background: 'var(--surface)', fontSize: '1.3rem', fontWeight: 700,
                color: 'var(--text)', cursor: 'pointer',
              }}>{d}</button>
          ))}
          <div />
          <button type="button" onClick={() => handleDigit('0')} style={{
            padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
            background: 'var(--surface)', fontSize: '1.3rem', fontWeight: 700,
            color: 'var(--text)', cursor: 'pointer',
          }}>0</button>
          <button type="button" onClick={handleRemove} style={{
            padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
            background: 'var(--surface)', fontSize: '0.9rem', fontWeight: 600,
            color: 'var(--muted)', cursor: 'pointer',
          }}>⌫</button>
        </div>
      </div>
    </div>
  )
}
