import { useState, useMemo } from 'react'

export default function LaptopList({ laptops, onEdit, onDelete }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortDir, setSortDir] = useState('asc')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const filtered = laptops.filter((l) => {
      const matchesSearch =
        String(l.laptop_number || '').includes(q) ||
        l.brand_model?.toLowerCase().includes(q) ||
        l.serial_number?.toLowerCase().includes(q) ||
        l.assigned_to?.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'All' || l.status === statusFilter
      return matchesSearch && matchesStatus
    })

    if (sortDir) {
      filtered.sort((a, b) => {
        const an = a.laptop_number || 9999
        const bn = b.laptop_number || 9999
        return sortDir === 'asc' ? an - bn : bn - an
      })
    }

    return filtered
  }, [laptops, search, statusFilter, sortDir])

  function toggleSort() {
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
  }

  function handleDeleteConfirm(id, brand) {
    if (window.confirm(`Delete "${brand}"?`)) {
      onDelete(id)
    }
  }

  const sortArrow = sortDir === 'asc' ? ' \u25B2' : ' \u25BC'

  return (
    <div className="laptop-list">
      <div className="list-header">
        <h2>All Laptops ({filtered.length})</h2>
      </div>
      <div className="list-filters">
        <input
          type="text"
          placeholder="Search by model, serial, or assignee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="All">All Status</option>
          <option value="In Use">In Use</option>
          <option value="Available">Available</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Retired">Retired</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No laptops found</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th></th>
                <th></th>
                <th className="th-sortable" onClick={toggleSort}>#{sortArrow}</th>
                <th>Brand / Model</th>
                <th>Serial #</th>
                <th>OS</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((laptop) => (
                <tr key={laptop.id} className={`row-${laptop.status?.toLowerCase().replace(' ', '-')}`}>
                  <td className="cell-led">
                    <span className={`led led-${laptop.status?.toLowerCase().replace(' ', '-')}`} />
                  </td>
                  <td className="cell-avatar">
                    <div className={`avatar ${laptop.assigned_to ? '' : 'avatar-empty'}`}>
                      {laptop.assigned_to ? laptop.assigned_to.charAt(0).toUpperCase() : ''}
                    </div>
                  </td>
                  <td className="cell-number">{laptop.laptop_number || '-'}</td>
                  <td className="cell-brand">{laptop.brand_model}</td>
                  <td className="cell-serial">{laptop.serial_number || '-'}</td>
                  <td>{laptop.os || '-'}</td>
                  <td>
                    <span className={`status-badge ${laptop.status?.toLowerCase().replace(' ', '-')}`}>
                      {laptop.status}
                    </span>
                  </td>
                  <td>{laptop.assigned_to || '-'}</td>
                  <td>{laptop.location || '-'}</td>
                  <td className="cell-actions">
                    <button className="btn-edit" onClick={() => onEdit(laptop)}>
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteConfirm(laptop.id, laptop.brand_model)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
