import { Database } from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

// Create a data directory if it doesn't exist
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, "social_media.db");
let db: Database | null = null;

// Initialize the database
export const initializeDatabase = (): void => {
	try {
		db = new Database(dbPath);
		console.log("Connected to the SQLite database.");

		// Create users table
		db.exec(`CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			username TEXT UNIQUE NOT NULL,
			email TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`);

		// Create profiles table
		db.exec(`CREATE TABLE IF NOT EXISTS profiles (
			user_id TEXT PRIMARY KEY,
			display_name TEXT,
			bio TEXT,
			avatar_url TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
		)`);

		// Create posts table
		db.exec(`CREATE TABLE IF NOT EXISTS posts (
			id TEXT PRIMARY KEY,
			author_id TEXT NOT NULL,
			content TEXT NOT NULL,
			attachments TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
		)`);

		// Create comments table
		db.exec(`CREATE TABLE IF NOT EXISTS comments (
			id TEXT PRIMARY KEY,
			post_id TEXT NOT NULL,
			author_id TEXT NOT NULL,
			content TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
			FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
		)`);

		// Create likes table
		db.exec(`CREATE TABLE IF NOT EXISTS likes (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			post_id TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(user_id, post_id),
			FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
			FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
		)`);

		// Create follows table
		db.exec(`CREATE TABLE IF NOT EXISTS follows (
			follower_id TEXT NOT NULL,
			followee_id TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (follower_id, followee_id),
			FOREIGN KEY (follower_id) REFERENCES users (id) ON DELETE CASCADE,
			FOREIGN KEY (followee_id) REFERENCES users (id) ON DELETE CASCADE
		)`);

		console.log("Database initialized successfully");
	} catch (error) {
		console.error("Database initialization error:", error);
		throw error;
	}
};

// Helper function to get a database connection
export const getDatabase = (): Database => {
	if (!db) {
		db = new Database(dbPath);
	}
	return db;
};

// Helper function to run a database query with parameters
export const dbRun = (
	sql: string,
	params: Record<string, unknown> = {},
): void => {
	const db = getDatabase();
	const stmt = db.prepare(sql);
	stmt.run(params);
};

// Helper function to get a single row
export const dbGet = <T>(
	sql: string,
	params: Record<string, unknown> = {},
): T | null => {
	const db = getDatabase();
	const stmt = db.prepare(sql);
	return (stmt.get(params) as T) || null;
};

// Helper function to get multiple rows
export const dbAll = <T>(
	sql: string,
	params: Record<string, unknown> = {},
): T[] => {
	const db = getDatabase();
	const stmt = db.prepare(sql);
	return stmt.all(params) as T[];
};
