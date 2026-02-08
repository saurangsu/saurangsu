import Database from "better-sqlite3";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const DB_PATH = path.join(process.cwd(), "giftlist.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS lists (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      event_date TEXT,
      share_id TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      list_id TEXT NOT NULL,
      name TEXT NOT NULL,
      retail_url TEXT,
      price REAL,
      notes TEXT,
      is_claimed INTEGER DEFAULT 0,
      quality_analysis TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
    );
  `);
}

export interface GiftList {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  share_id: string;
  created_at: string;
  updated_at: string;
}

export interface GiftItem {
  id: string;
  list_id: string;
  name: string;
  retail_url: string | null;
  price: number | null;
  notes: string | null;
  is_claimed: number;
  quality_analysis: string | null;
  created_at: string;
}

// --- List operations ---

export function createList(
  title: string,
  description?: string,
  eventDate?: string
): GiftList {
  const db = getDb();
  const id = uuidv4();
  const shareId = uuidv4();
  db.prepare(
    `INSERT INTO lists (id, title, description, event_date, share_id) VALUES (?, ?, ?, ?, ?)`
  ).run(id, title, description ?? null, eventDate ?? null, shareId);
  return getListById(id)!;
}

export function getAllLists(): GiftList[] {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM lists ORDER BY created_at DESC`)
    .all() as GiftList[];
}

export function getListById(id: string): GiftList | undefined {
  const db = getDb();
  return db.prepare(`SELECT * FROM lists WHERE id = ?`).get(id) as
    | GiftList
    | undefined;
}

export function getListByShareId(shareId: string): GiftList | undefined {
  const db = getDb();
  return db.prepare(`SELECT * FROM lists WHERE share_id = ?`).get(shareId) as
    | GiftList
    | undefined;
}

export function deleteList(id: string): void {
  const db = getDb();
  db.prepare(`DELETE FROM lists WHERE id = ?`).run(id);
}

// --- Item operations ---

export function addItem(
  listId: string,
  name: string,
  retailUrl?: string,
  price?: number,
  notes?: string
): GiftItem {
  const db = getDb();
  const id = uuidv4();
  db.prepare(
    `INSERT INTO items (id, list_id, name, retail_url, price, notes) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, listId, name, retailUrl ?? null, price ?? null, notes ?? null);
  return getItemById(id)!;
}

export function getItemsByListId(listId: string): GiftItem[] {
  const db = getDb();
  return db
    .prepare(`SELECT * FROM items WHERE list_id = ? ORDER BY created_at ASC`)
    .all(listId) as GiftItem[];
}

export function getItemById(id: string): GiftItem | undefined {
  const db = getDb();
  return db.prepare(`SELECT * FROM items WHERE id = ?`).get(id) as
    | GiftItem
    | undefined;
}

export function updateItemAnalysis(id: string, analysis: string): void {
  const db = getDb();
  db.prepare(`UPDATE items SET quality_analysis = ? WHERE id = ?`).run(
    analysis,
    id
  );
}

export function claimItem(id: string): void {
  const db = getDb();
  db.prepare(`UPDATE items SET is_claimed = 1 WHERE id = ?`).run(id);
}

export function unclaimItem(id: string): void {
  const db = getDb();
  db.prepare(`UPDATE items SET is_claimed = 0 WHERE id = ?`).run(id);
}

export function deleteItem(id: string): void {
  const db = getDb();
  db.prepare(`DELETE FROM items WHERE id = ?`).run(id);
}
