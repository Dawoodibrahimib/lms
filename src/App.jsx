import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import LaptopList from './components/LaptopList'
import LaptopForm from './components/LaptopForm'
import PinSetup from './components/PinSetup'
import PinLogin from './components/PinLogin'
import './styles/app.css'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [laptops, setLaptops] = useState([])
  const [editingLaptop, setEditingLaptop] = useState(null)
  const [pinState, setPinState] = useState('loading')

  useEffect(() => {
    window.electronAPI.pinIsSet().then((isSet) => {
      setPinState(isSet ? 'lock' : 'setup')
    })
  }, [])

  useEffect(() => {
    if (pinState === 'unlocked') loadLaptops()
  }, [pinState])

  async function loadLaptops() {
    const data = await window.electronAPI.getAllLaptops()
    setLaptops(data)
  }

  async function handleSave(data) {
    if (editingLaptop) {
      await window.electronAPI.updateLaptop(editingLaptop.id, data)
    } else {
      await window.electronAPI.createLaptop(data)
    }
    setEditingLaptop(null)
    setPage('list')
    loadLaptops()
  }

  function handleEdit(laptop) {
    setEditingLaptop(laptop)
    setPage('form')
  }

  async function handleDelete(id) {
    await window.electronAPI.deleteLaptop(id)
    loadLaptops()
  }

  function handleAdd() {
    setEditingLaptop(null)
    setPage('form')
  }

  if (pinState === 'loading') {
    return (
      <div className="pin-screen">
        <div className="pin-card">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (pinState === 'setup') {
    return <PinSetup onComplete={() => setPinState('unlocked')} />
  }

  if (pinState === 'lock') {
    return <PinLogin onUnlock={() => setPinState('unlocked')} />
  }

  return (
    <div className="app">
      <Sidebar currentPage={page} onNavigate={setPage} onAdd={handleAdd} />
      <main className="main-content">
        {page === 'dashboard' && <Dashboard laptops={laptops} />}
        {page === 'list' && (
          <LaptopList
            laptops={laptops}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        {page === 'form' && (
          <LaptopForm
            laptop={editingLaptop}
            onSave={handleSave}
            onCancel={() => { setEditingLaptop(null); setPage('list') }}
          />
        )}
      </main>
    </div>
  )
}
