import "server-only";
import {
  getFirestore,
  Timestamp,
  type DocumentReference,
  type Firestore,
} from "firebase-admin/firestore";
import { getFirebaseApp } from "./admin";

/**
 * Firestore collections holding list-shaped records. Every document stores its
 * numeric `id` (allocated from `counters`) so the existing numeric-ID wire
 * format and routes (/api/.../[id]) keep working unchanged.
 */
export const COLLECTIONS = [
  "menuItems",
  "menuCategories",
  "galleryItems",
  "attractions",
  "reviews",
  "branches",
  "faqs",
  "contactMessages",
  "reservations",
  "blogPosts",
] as const;
export type CollectionName = (typeof COLLECTIONS)[number];

/** Singleton documents keyed by the fixed id "singleton". */
export const SINGLETONS = ["settings", "siteSeo"] as const;
export type SingletonName = (typeof SINGLETONS)[number];

function db(): Firestore {
  return getFirestore(getFirebaseApp());
}

/** Recursively convert Firestore Timestamps back into JS Dates. */
function revive(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toDate();
  if (Array.isArray(value)) return value.map(revive);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(record)) out[key] = revive(record[key]);
    return out;
  }
  return value;
}

/** Document shape every stored record exposes (timestamps normalized to Date). */
export interface StoredDoc {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Allocate the next auto-increment id for a collection. Uses a Firestore
 * transaction on the `counters` document so concurrent creates never collide.
 */
export async function nextId(name: CollectionName): Promise<number> {
  const counterRef = db().collection("counters").doc(name);
  return db().runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const current = typeof snap.data()?.value === "number" ? (snap.data()?.value as number) : 0;
    const value = current + 1;
    tx.set(counterRef, { value });
    return value;
  });
}

/** All rows in a collection. */
export async function findAll<T>(name: CollectionName): Promise<T[]> {
  const snap = await db().collection(name).get();
  const rows: T[] = [];
  snap.forEach((doc) => {
    const value = revive(doc.data());
    if (value) rows.push(value as T);
  });
  return rows;
}

/** Find a single row by its numeric id. */
export async function findById<T>(name: CollectionName, id: number): Promise<T | null> {
  const snap = await db().collection(name).where("id", "==", id).limit(1).get();
  if (snap.empty) return null;
  return revive(snap.docs[0].data()) as T;
}

/** Create a row, storing the numeric id plus created/updated timestamps. */
export async function createDoc<T extends StoredDoc>(
  name: CollectionName,
  id: number,
  data: Record<string, unknown>
): Promise<T> {
  const ref = db().collection(name).doc();
  const now = new Date();
  await ref.set({
    id,
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return { id, ...data, createdAt: now, updatedAt: now } as unknown as T;
}

/** Update a row by its numeric id. Returns the refreshed row, or null if missing. */
export async function updateDoc<T extends StoredDoc>(
  name: CollectionName,
  id: number,
  data: Record<string, unknown>
): Promise<T | null> {
  const snap = await db().collection(name).where("id", "==", id).limit(1).get();
  const doc = snap.docs[0];
  if (!doc) return null;
  await doc.ref.update({ ...data, updatedAt: new Date() });
  return findById<T>(name, id);
}

/** Delete a row by its numeric id. Returns false when it does not exist. */
export async function deleteDoc(name: CollectionName, id: number): Promise<boolean> {
  const snap = await db().collection(name).where("id", "==", id).limit(1).get();
  const doc = snap.docs[0];
  if (!doc) return false;
  await doc.ref.delete();
  return true;
}

/** Atomically apply displayOrder (or any field) updates across rows. */
export async function updateMany(
  name: CollectionName,
  entries: { id: number; data: Record<string, unknown> }[]
): Promise<void> {
  if (entries.length === 0) return;
  await db().runTransaction(async (tx) => {
    const targets: { ref: DocumentReference; data: Record<string, unknown> }[] = [];
    for (const entry of entries) {
      const snap = await tx.get(db().collection(name).where("id", "==", entry.id).limit(1));
      if (!snap.empty) targets.push({ ref: snap.docs[0].ref, data: entry.data });
    }
    for (const target of targets) {
      tx.update(target.ref, { ...target.data, updatedAt: new Date() });
    }
  });
}

/** Read a singleton document (id "singleton"). */
export async function getSingleton<T>(name: SingletonName): Promise<T | null> {
  const doc = await db().collection(name).doc("singleton").get();
  if (!doc.exists) return null;
  return revive(doc.data()) as T;
}

/** Write a singleton document. Merges by default so partial updates are safe. */
export async function setSingleton(
  name: SingletonName,
  data: Record<string, unknown>
): Promise<void> {
  await db().collection(name).doc("singleton").set(
    { ...data, updatedAt: new Date() },
    { merge: true }
  );
}
