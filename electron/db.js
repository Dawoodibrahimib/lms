const initSqlJs = require('sql.js')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')
const { app } = require('electron')

let db
let dbPath

function getDbPath() {
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, 'inventory.db')
}

function saveDb() {
  const data = db.export()
  fs.writeFileSync(dbPath, Buffer.from(data))
}

function rowsToArray(stmt) {
  const rows = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject())
  }
  stmt.free()
  return rows
}

async function initDatabase() {
  const wasmPath = path.join(path.dirname(require.resolve('sql.js')), 'sql-wasm.wasm')
  const SQL = await initSqlJs({ locateFile: () => wasmPath })
  dbPath = getDbPath()

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath)
    db = new SQL.Database(buffer)
  } else {
    // First launch — use pre-seeded database if available
    const seedPath = app.isPackaged
      ? path.join(path.dirname(app.getPath('exe')), 'resources', 'seed.db')
      : path.join(__dirname, '..', 'seed.db')
    if (fs.existsSync(seedPath)) {
      const buffer = fs.readFileSync(seedPath)
      db = new SQL.Database(buffer)
    } else {
      db = new SQL.Database()
    }
  }

  // Migration: add laptop_number column to existing databases
  const existingTable = db.exec("SELECT name FROM sqlite_master WHERE name='laptops' AND type='table'")
  if (existingTable[0]) {
    const cols = db.exec("PRAGMA table_info(laptops)")
    const colNames = cols[0]?.values.map(c => c[1]) || []
    if (!colNames.includes('laptop_number')) {
      db.run("ALTER TABLE laptops ADD COLUMN laptop_number INTEGER")
    }
  } else {
    db.run(`
      CREATE TABLE IF NOT EXISTS laptops (
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
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)

  saveDb()
  return db
}

function getAllLaptops() {
  const stmt = db.prepare('SELECT * FROM laptops ORDER BY created_at DESC')
  return rowsToArray(stmt)
}

function getLaptopById(id) {
  const stmt = db.prepare('SELECT * FROM laptops WHERE id = ?')
  stmt.bind([id])
  const rows = rowsToArray(stmt)
  return rows[0] || null
}

function createLaptop(data) {
  const num = data.laptop_number ? parseInt(data.laptop_number, 10) : null
  db.run(
    `INSERT INTO laptops (laptop_number, brand_model, serial_number, os, status, assigned_to, location, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [num, data.brand_model, data.serial_number, data.os, data.status, data.assigned_to, data.location, data.notes]
  )
  saveDb()
  const id = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0]
  return getLaptopById(id)
}

function updateLaptop(id, data) {
  const num = data.laptop_number ? parseInt(data.laptop_number, 10) : null
  db.run(
    `UPDATE laptops SET laptop_number = ?, brand_model = ?, serial_number = ?, os = ?, status = ?,
     assigned_to = ?, location = ?, notes = ?, updated_at = datetime('now', 'localtime')
     WHERE id = ?`,
    [num, data.brand_model, data.serial_number, data.os, data.status, data.assigned_to, data.location, data.notes, id]
  )
  saveDb()
  return getLaptopById(id)
}

function deleteLaptop(id) {
  db.run('DELETE FROM laptops WHERE id = ?', [id])
  saveDb()
  return { success: true }
}

function getStats() {
  const total = db.exec('SELECT COUNT(*) as count FROM laptops')
  const totalCount = total[0]?.values[0][0] || 0

  const byStatusRows = db.exec("SELECT status, COUNT(*) as count FROM laptops GROUP BY status")
  const byStatus = byStatusRows[0]
    ? byStatusRows[0].values.map(row => ({ status: row[0], count: row[1] }))
    : []

  const byLocationRows = db.exec("SELECT location, COUNT(*) as count FROM laptops WHERE location IS NOT NULL AND location != '' GROUP BY location")
  const byLocation = byLocationRows[0]
    ? byLocationRows[0].values.map(row => ({ location: row[0], count: row[1] }))
    : []

  return { total: totalCount, byStatus, byLocation }
}

function getSetting(key) {
  const stmt = db.prepare('SELECT value FROM settings WHERE key = ?')
  stmt.bind([key])
  const rows = rowsToArray(stmt)
  return rows[0]?.value || null
}

function setSetting(key, value) {
  db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value])
  saveDb()
}

function isPinSet() {
  return getSetting('pin_hash') !== null
}

function setPin(pin) {
  const hash = bcrypt.hashSync(pin, 10)
  setSetting('pin_hash', hash)
  return true
}

function verifyPin(pin) {
  const hash = getSetting('pin_hash')
  if (!hash) return true
  return bcrypt.compareSync(pin, hash)
}

function getSuggestions() {
  const fields = ['brand_model', 'os', 'location']
  const result = {}
  for (const field of fields) {
    const stmt = db.prepare(`SELECT DISTINCT ${field} FROM laptops WHERE ${field} IS NOT NULL AND ${field} != '' ORDER BY ${field}`)
    const rows = rowsToArray(stmt)
    result[field] = rows.map(r => r[field])
  }
  return result
}

module.exports = { initDatabase, getAllLaptops, getLaptopById, createLaptop, updateLaptop, deleteLaptop, getStats, isPinSet, setPin, verifyPin, getSuggestions }
