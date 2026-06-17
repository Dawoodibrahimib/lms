import { useState, useRef } from 'react'

export default function PinLogin({ onUnlock }) {
  const [pin, setPin] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const inputRefs = useRef([])

  function handleDigit(idx, value) {
    if (!/^\d?$/.test(value)) return
    const next = [...pin]
    next[idx] = value
    setPin(next)
    setError('')
    if (value && idx < 3) {
      inputRefs.current[idx + 1]?.focus()
    }
  }

  function handleKeyDown(idx, e) {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  async function handleSubmit() {
    const code = pin.join('')
    if (code.length !== 4) {
      setError('Please enter your 4-digit PIN')
      return
    }

    const ok = await window.electronAPI.pinVerify(code)
    if (ok) {
      onUnlock()
    } else {
      setError('Incorrect PIN')
      setPin(['', '', '', ''])
      inputRefs.current[0]?.focus()
    }
  }

  function handleKeyUp(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="pin-screen">
      <div className="pin-card">
        <img src="logo.png" alt="logo" className="pin-logo" />
        <h1>JFS-Nethawk-LMS</h1>
        <p className="pin-subtitle">Enter your PIN to unlock</p>
        <div className="pin-inputs">
          {[0, 1, 2, 3].map((i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="password"
              maxLength={1}
              value={pin[i]}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onKeyUp={handleKeyUp}
              className={`pin-digit ${error ? 'shake' : ''}`}
              autoFocus={i === 0}
            />
          ))}
        </div>
        {error && <p className="pin-error">{error}</p>}
        <button className="pin-btn" onClick={handleSubmit}>
          Unlock
        </button>
      </div>
    </div>
  )
}
