import { useState, useRef } from 'react'

export default function PinSetup({ onComplete }) {
  const [pin, setPin] = useState(['', '', '', ''])
  const [confirm, setConfirm] = useState(['', '', '', ''])
  const [step, setStep] = useState('set')
  const [error, setError] = useState('')
  const inputRefs = useRef([])

  function handleDigit(arr, setter, idx, value) {
    if (!/^\d?$/.test(value)) return
    const next = [...arr]
    next[idx] = value
    setter(next)
    if (value && idx < 3) {
      inputRefs.current[idx + 1]?.focus()
    }
  }

  function handleKeyDown(arr, setter, idx, e) {
    if (e.key === 'Backspace' && !arr[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  async function handleSubmit() {
    const code = pin.join('')
    if (code.length !== 4) {
      setError('Please enter a 4-digit PIN')
      return
    }

    if (step === 'set') {
      setError('')
      setStep('confirm')
      inputRefs.current[0]?.focus()
      return
    }

    if (code !== confirm.join('')) {
      setError('PINs do not match. Try again.')
      setConfirm(['', '', '', ''])
      setStep('set')
      setPin(['', '', '', ''])
      inputRefs.current[0]?.focus()
      return
    }

    setError('')
    await window.electronAPI.pinSet(code)
    onComplete()
  }

  const currentArr = step === 'set' ? pin : confirm
  const setter = step === 'set' ? setPin : setConfirm
  const label = step === 'set' ? 'Set your 4-digit PIN' : 'Confirm your PIN'

  return (
    <div className="pin-screen">
      <div className="pin-card">
        <img src="logo.png" alt="logo" className="pin-logo" />
        <h1>JFS-Nethawk-LMS</h1>
        <p className="pin-subtitle">{label}</p>
        <div className="pin-inputs">
          {[0, 1, 2, 3].map((i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="password"
              maxLength={1}
              value={currentArr[i]}
              onChange={(e) => handleDigit(currentArr, setter, i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(currentArr, setter, i, e)}
              className="pin-digit"
              autoFocus={i === 0}
            />
          ))}
        </div>
        {error && <p className="pin-error">{error}</p>}
        <button className="pin-btn" onClick={handleSubmit}>
          {step === 'set' ? 'Next' : 'Confirm'}
        </button>
      </div>
    </div>
  )
}
