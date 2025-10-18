import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define the database schema
interface MyDB extends DBSchema {
  notes: {
    key: number;
    value: {
      id: number;
      title: string;
      content: string;
      createdAt: Date;
      updatedAt: Date;
    };
    indexes: { 'by-date': Date };
  };
}

const DB_NAME = 'FullyJSAIModelDB';
const DB_VERSION = 1;

// Initialize the database
export async function initDB(): Promise<IDBPDatabase<MyDB>> {
  return openDB<MyDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create object store for notes
      if (!db.objectStoreNames.contains('notes')) {
        const noteStore = db.createObjectStore('notes', {
          keyPath: 'id',
          autoIncrement: true,
        });
        noteStore.createIndex('by-date', 'createdAt');
      }
    },
  });
}

// CRUD operations for notes
export async function addNote(title: string, content: string) {
  const db = await initDB();
  const now = new Date();
  return db.add('notes', {
    id: Date.now(),
    title,
    content,
    createdAt: now,
    updatedAt: now,
  });
}

export async function getAllNotes() {
  const db = await initDB();
  return db.getAll('notes');
}

export async function getNoteById(id: number) {
  const db = await initDB();
  return db.get('notes', id);
}

export async function updateNote(
  id: number,
  title: string,
  content: string
) {
  const db = await initDB();
  const note = await db.get('notes', id);
  if (!note) return;
  
  note.title = title;
  note.content = content;
  note.updatedAt = new Date();
  
  return db.put('notes', note);
}

export async function deleteNote(id: number) {
  const db = await initDB();
  return db.delete('notes', id);
}

export async function clearAllNotes() {
  const db = await initDB();
  return db.clear('notes');
}
