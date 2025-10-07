import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { User, Boat, Order, Batch, DailyCounter } from '../types';

interface LonumirusDB extends DBSchema {
  users: {
    key: string;
    value: User;
    indexes: { 'by-email': string };
  };
  boats: {
    key: string;
    value: Boat;
    indexes: { 'by-slug': string };
  };
  orders: {
    key: string;
    value: Order;
    indexes: { 'by-customer': string; 'by-status': string; 'by-boat': string };
  };
  batches: {
    key: string;
    value: Batch;
  };
  dailyCounters: {
    key: string;
    value: DailyCounter;
  };
}

let dbInstance: IDBPDatabase<LonumirusDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<LonumirusDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<LonumirusDB>('lonumirus-db', 1, {
    upgrade(db) {
      // Users store
      const userStore = db.createObjectStore('users', { keyPath: 'id' });
      userStore.createIndex('by-email', 'email', { unique: true });

      // Boats store
      const boatStore = db.createObjectStore('boats', { keyPath: 'id' });
      boatStore.createIndex('by-slug', 'slug', { unique: true });

      // Orders store
      const orderStore = db.createObjectStore('orders', { keyPath: 'id' });
      orderStore.createIndex('by-customer', 'customerId');
      orderStore.createIndex('by-status', 'status');
      orderStore.createIndex('by-boat', 'boatId');

      // Batches store
      db.createObjectStore('batches', { keyPath: 'id' });

      // Daily counters store
      db.createObjectStore('dailyCounters', { keyPath: 'date' });
    },
  });

  return dbInstance;
}

// Generic CRUD operations
export async function getAll<T>(storeName: keyof LonumirusDB): Promise<T[]> {
  const db = await getDB();
  return db.getAll(storeName) as Promise<T[]>;
}

export async function getById<T>(storeName: keyof LonumirusDB, id: string): Promise<T | undefined> {
  const db = await getDB();
  return db.get(storeName, id) as Promise<T | undefined>;
}

export async function add<T>(storeName: keyof LonumirusDB, value: T): Promise<void> {
  const db = await getDB();
  await db.add(storeName, value as any);
}

export async function update<T>(storeName: keyof LonumirusDB, value: T): Promise<void> {
  const db = await getDB();
  await db.put(storeName, value as any);
}

export async function remove(storeName: keyof LonumirusDB, id: string): Promise<void> {
  const db = await getDB();
  await db.delete(storeName, id);
}

// Specialized queries
export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDB();
  return db.getFromIndex('users', 'by-email', email);
}

export async function getBoatBySlug(slug: string): Promise<Boat | undefined> {
  const db = await getDB();
  return db.getFromIndex('boats', 'by-slug', slug);
}

export async function getOrdersByCustomer(customerId: string): Promise<Order[]> {
  const db = await getDB();
  return db.getAllFromIndex('orders', 'by-customer', customerId);
}

export async function getOrdersByStatus(status: string): Promise<Order[]> {
  const db = await getDB();
  return db.getAllFromIndex('orders', 'by-status', status);
}

export async function getOrdersByBoat(boatId: string): Promise<Order[]> {
  const db = await getDB();
  return db.getAllFromIndex('orders', 'by-boat', boatId);
}

// Generate short code for orders
export async function generateShortCode(): Promise<string> {
  const db = await getDB();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  let counter = await db.get('dailyCounters', today);

  if (!counter) {
    counter = { date: today, next: 0 };
  }

  const shortCode = counter.next.toString().padStart(3, '0');
  counter.next += 1;

  await db.put('dailyCounters', counter);

  return shortCode;
}
