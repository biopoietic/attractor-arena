import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import * as schema from './schema.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '../data/tournament.db')

let dbInstance = null
let sqliteInstance = null

/**
 * Get or create database connection
 * @returns {Object} - Drizzle database instance
 */
export function getDb() {
	if (!dbInstance) {
		sqliteInstance = new Database(DB_PATH)
		dbInstance = drizzle(sqliteInstance, { schema })
	}
	return dbInstance
}

/**
 * Initialize database with schema
 * This should be called before running the tournament
 */
export function initDb() {
	const db = getDb()

	// Execute schema creation directly using better-sqlite3
	sqliteInstance.exec(`
		CREATE TABLE IF NOT EXISTS competitors (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			justification TEXT NOT NULL,
			rating INTEGER DEFAULT 1500,
			uncertainty INTEGER DEFAULT 300,
			mu REAL DEFAULT 0,
			sigma REAL DEFAULT 1.5,
			matches INTEGER DEFAULT 0,
			wins INTEGER DEFAULT 0,
			losses INTEGER DEFAULT 0,
			total_evaluations INTEGER DEFAULT 0,
			win_rate INTEGER DEFAULT 0
		);

		CREATE TABLE IF NOT EXISTS matches (
			id TEXT PRIMARY KEY,
			timestamp TEXT NOT NULL,
			competitor_a_id TEXT NOT NULL REFERENCES competitors(id),
			competitor_b_id TEXT NOT NULL REFERENCES competitors(id),
			winner_id TEXT NOT NULL REFERENCES competitors(id),
			score_a INTEGER NOT NULL,
			score_b INTEGER NOT NULL,
			total_evaluations INTEGER NOT NULL,
			entropy REAL NOT NULL,
			seed INTEGER NOT NULL,
			judge_version TEXT NOT NULL
		);

		CREATE TABLE IF NOT EXISTS evaluations (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			match_id TEXT NOT NULL REFERENCES matches(id),
			model TEXT NOT NULL,
			ordering TEXT NOT NULL,
			choice TEXT NOT NULL,
			selected_id TEXT NOT NULL REFERENCES competitors(id),
			rationale TEXT NOT NULL
		);

		CREATE INDEX IF NOT EXISTS idx_matches_timestamp ON matches(timestamp DESC);
		CREATE INDEX IF NOT EXISTS idx_matches_competitor_a ON matches(competitor_a_id);
		CREATE INDEX IF NOT EXISTS idx_matches_competitor_b ON matches(competitor_b_id);
		CREATE INDEX IF NOT EXISTS idx_evaluations_match ON evaluations(match_id);
	`)

	console.log('Database initialized successfully')
	return db
}

/**
 * Close database connection
 */
export function closeDb() {
	if (sqliteInstance) {
		sqliteInstance.close()
		dbInstance = null
		sqliteInstance = null
	}
}
