
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const getDB = async () => {
    if (db) {
        return db;
    }
    db = await SQLite.openDatabaseAsync('transform_control.db');
    return db;
};

export const initDB = async () => {
    const database = await getDB();

    await database.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS transformers (
      id TEXT PRIMARY KEY NOT NULL,
      serial_number TEXT,
      brand TEXT,
      model TEXT,
      power_kva REAL,
      status TEXT,
      qr_code TEXT,
      location_lat REAL,
      location_lng REAL,
      last_synced_at TEXT
    );

    CREATE TABLE IF NOT EXISTS form_templates (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT,
      description TEXT,
      questions_json TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS transformer_form_config (
      id TEXT PRIMARY KEY NOT NULL,
      transformer_id TEXT,
      template_id TEXT,
      enabled_questions_json TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS inspections (
      id TEXT PRIMARY KEY NOT NULL,
      transformer_id TEXT NOT NULL,
      technician_id TEXT,
      date TEXT,
      overall_status TEXT,
      data_json TEXT,
      synced INTEGER DEFAULT 0,
      created_at TEXT
    );
  `);

    console.log('Database initialized');
};
