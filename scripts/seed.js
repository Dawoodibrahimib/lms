const initSqlJs = require('sql.js')
const fs = require('fs')
const path = require('path')

async function seed() {
  const SQL = await initSqlJs({
    locateFile: (f) => path.join(require.resolve('sql.js'), '..', f)
  })
  const db = new SQL.Database()

  db.run(`
    CREATE TABLE laptops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      laptop_number INTEGER,
      brand_model TEXT NOT NULL,
      serial_number TEXT,
      os TEXT,
      status TEXT DEFAULT 'Available' CHECK(status IN ('In Use', 'Available', 'Maintenance', 'Retired')),
      assigned_to TEXT,
      location TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT (datetime('now', 'localtime')),
      updated_at DATETIME DEFAULT (datetime('now', 'localtime'))
    )
  `)

  db.run(`
    CREATE TABLE settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)

  const laptops = [
    { num: 1,  brand: 'Dell Latitude 5420',    serial: 'SN-001', os: 'Windows 11 Pro', status: 'In Use',       person: 'Alice Chen',     loc: 'Floor 1 - Office A' },
    { num: 2,  brand: 'Dell Latitude 5420',    serial: 'SN-002', os: 'Windows 11 Pro', status: 'In Use',       person: 'Bob Martinez',   loc: 'Floor 1 - Office A' },
    { num: 3,  brand: 'Dell Latitude 5420',    serial: 'SN-003', os: 'Windows 11 Pro', status: 'Available',    person: '',               loc: '' },
    { num: 4,  brand: 'HP EliteBook 840',      serial: 'SN-004', os: 'Windows 11 Pro', status: 'In Use',       person: 'Carol Ng',       loc: 'Floor 2 - Office B' },
    { num: 5,  brand: 'HP EliteBook 840',      serial: 'SN-005', os: 'Windows 11 Pro', status: 'Maintenance',  person: '',               loc: 'IT Workshop' },
    { num: 6,  brand: 'HP EliteBook 840',      serial: 'SN-006', os: 'Windows 11 Pro', status: 'Available',    person: '',               loc: '' },
    { num: 7,  brand: 'Lenovo ThinkPad X1',    serial: 'SN-007', os: 'Windows 10 Pro', status: 'In Use',       person: 'David Kim',      loc: 'Floor 3 - Office C' },
    { num: 8,  brand: 'Lenovo ThinkPad X1',    serial: 'SN-008', os: 'Windows 10 Pro', status: 'In Use',       person: 'Eve Johnson',    loc: 'Floor 3 - Office C' },
    { num: 9,  brand: 'Lenovo ThinkPad X1',    serial: 'SN-009', os: 'Windows 10 Pro', status: 'Available',    person: '',               loc: '' },
    { num: 10, brand: 'Microsoft Surface Pro', serial: 'SN-010', os: 'Windows 11 Pro', status: 'In Use',       person: 'Frank Lee',      loc: 'Floor 1 - Office A' },
    { num: 11, brand: 'Microsoft Surface Pro', serial: 'SN-011', os: 'Windows 11 Pro', status: 'Retired',      person: '',               loc: 'Storage' },
    { num: 12, brand: 'MacBook Air M2',        serial: 'SN-012', os: 'macOS Ventura',  status: 'In Use',       person: 'Grace Patel',    loc: 'Floor 2 - Office B' },
  ]

  const stmt = db.prepare(
    `INSERT INTO laptops (laptop_number, brand_model, serial_number, os, status, assigned_to, location)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )

  for (const l of laptops) {
    stmt.run([l.num, l.brand, l.serial, l.os, l.status, l.person, l.loc])
  }

  const outPath = path.join(__dirname, '..', 'seed.db')
  fs.writeFileSync(outPath, Buffer.from(db.export()))
  console.log('Seeded', laptops.length, 'laptops ->', outPath)
}

seed().catch(console.error)
