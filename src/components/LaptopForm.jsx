import { useState, useEffect } from 'react'

export default function LaptopForm({ laptop, onSave, onCancel }) {
  const [form, setForm] = useState({
    laptop_number: laptop?.laptop_number || '',
    brand_model: laptop?.brand_model || '',
    serial_number: laptop?.serial_number || '',
    os: laptop?.os || '',
    status: laptop?.status || 'Available',
    assigned_to: laptop?.assigned_to || '',
    location: laptop?.location || '',
    notes: laptop?.notes || '',
  })

  const [suggestions, setSuggestions] = useState({ brand_model: [], os: [], location: [] })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    window.electronAPI.getSuggestions().then(setSuggestions)
  }, [])

  function validate() {
    const errs = {}
    if (!form.brand_model.trim()) errs.brand_model = 'Brand/Model is required'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (validate()) onSave(form)
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const title = laptop ? 'Edit Laptop' : 'Add Laptop'

  return (
    <div className="laptop-form">
      <div className="form-header">
        <h2>{title}</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="brand_model">Brand / Model *</label>
            <input
              id="brand_model"
              name="brand_model"
              value={form.brand_model}
              onChange={handleChange}
              placeholder="e.g. Dell Latitude 5420"
              list="suggest-brand"
            />
            <datalist id="suggest-brand">
              {suggestions.brand_model.map((s) => <option key={s} value={s} />)}
            </datalist>
            {errors.brand_model && <span className="field-error">{errors.brand_model}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="serial_number">Serial Number *</label>
            <input
              id="serial_number"
              name="serial_number"
              value={form.serial_number}
              onChange={handleChange}
              placeholder="e.g. ABC123XYZ"
            />
            {errors.serial_number && <span className="field-error">{errors.serial_number}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="laptop_number">Laptop #</label>
            <input
              id="laptop_number"
              name="laptop_number"
              type="number"
              min={1}
              max={999}
              value={form.laptop_number}
              onChange={handleChange}
              placeholder="e.g. 1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="os">Operating System</label>
            <input
              id="os"
              name="os"
              value={form.os}
              onChange={handleChange}
              placeholder="e.g. Windows 11 Pro"
              list="suggest-os"
            />
            <datalist id="suggest-os">
              {suggestions.os.map((s) => <option key={s} value={s} />)}
            </datalist>
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={form.status} onChange={handleChange}>
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="assigned_to">Assigned To</label>
            <input
              id="assigned_to"
              name="assigned_to"
              value={form.assigned_to}
              onChange={handleChange}
              placeholder="Person's name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Office A, Floor 2"
              list="suggest-location"
            />
            <datalist id="suggest-location">
              {suggestions.location.map((s) => <option key={s} value={s} />)}
            </datalist>
          </div>
          <div className="form-group full-width">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Any additional notes..."
              rows={3}
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-save">
            {laptop ? 'Update' : 'Add'} Laptop
          </button>
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
