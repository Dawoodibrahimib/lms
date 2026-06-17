export default function Dashboard({ laptops }) {
  const total = laptops.length
  const inUse = laptops.filter((l) => l.status === 'In Use').length
  const available = laptops.filter((l) => l.status === 'Available').length
  const maintenance = laptops.filter((l) => l.status === 'Maintenance').length
  const retired = laptops.filter((l) => l.status === 'Retired').length

  const locations = [...new Set(laptops.map((l) => l.location).filter(Boolean))]

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card total">
          <span className="stat-number">{total}</span>
          <span className="stat-label">Total Laptops</span>
        </div>
        <div className="stat-card in-use">
          <span className="stat-number">{inUse}</span>
          <span className="stat-label">In Use</span>
        </div>
        <div className="stat-card available">
          <span className="stat-number">{available}</span>
          <span className="stat-label">Available</span>
        </div>
        <div className="stat-card maintenance">
          <span className="stat-number">{maintenance}</span>
          <span className="stat-label">Maintenance</span>
        </div>
        <div className="stat-card retired">
          <span className="stat-number">{retired}</span>
          <span className="stat-label">Retired</span>
        </div>
      </div>
      <div className="dashboard-bottom">
        <div className="location-section">
          <h3>By Location</h3>
          {locations.length === 0 ? (
            <p className="empty-text">No locations recorded yet</p>
          ) : (
            <div className="location-list">
              {locations.map((loc) => (
                <div key={loc} className="location-item">
                  <span className="location-name">{loc}</span>
                  <span className="location-count">
                    {laptops.filter((l) => l.location === loc).length}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="recent-section">
          <h3>Recently Added</h3>
          {laptops.length === 0 ? (
            <p className="empty-text">No laptops yet</p>
          ) : (
            <div className="recent-list">
              {laptops.slice(0, 5).map((laptop) => (
                <div key={laptop.id} className="recent-item">
                  <span className="recent-name">{laptop.brand_model}</span>
                  <span className={`status-badge ${laptop.status?.toLowerCase().replace(' ', '-')}`}>
                    {laptop.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
