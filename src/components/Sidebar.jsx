export default function Sidebar({ currentPage, onNavigate, onAdd }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="logo.png" alt="logo" className="sidebar-logo" />
        <h1>JFS-Nethawk-LMS</h1>
      </div>
      <nav className="sidebar-nav">
        <button
          className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`nav-item ${currentPage === 'list' ? 'active' : ''}`}
          onClick={() => onNavigate('list')}
        >
          All Laptops
        </button>
      </nav>
      <button className="add-btn" onClick={onAdd}>
        + Add Laptop
      </button>
    </aside>
  )
}
