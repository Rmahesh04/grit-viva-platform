const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const DB_PATH = path.join(__dirname, 'grit_platform.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Initialize SQLite database instance
const db = new DatabaseSync(DB_PATH);

// Enable foreign key constraints
db.exec('PRAGMA foreign_keys = ON;');

// Initialize schema if not present
function initializeSchema() {
  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schemaSql);
}

// Transaction wrapper for atomic multi-statement operations
function runTransaction(callback) {
  db.exec('BEGIN TRANSACTION;');
  try {
    const result = callback(db);
    db.exec('COMMIT;');
    return result;
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

module.exports = {
  db,
  initializeSchema,
  runTransaction
};

