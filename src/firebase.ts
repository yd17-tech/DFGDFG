import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { StudentProgress, LeaderboardEntry } from './types/game';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test server connection as per skill instructions
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore offline check:", error.message);
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Save student game session state to Firestore
 */
export async function saveStudentProgress(progress: StudentProgress): Promise<void> {
  const path = `students/${progress.studentCode}`;
  try {
    // Sanitize payload to match strict firestore rules
    const payload = {
      studentCode: progress.studentCode,
      studentName: progress.studentName,
      stage: progress.stage,
      oxygen: Math.max(0, Math.min(100, Math.round(progress.oxygen))),
      heartRate: Math.max(30, Math.min(250, Math.round(progress.heartRate))),
      monsterDistance: Math.round(progress.monsterDistance * 10) / 10,
      elements: progress.elements || {},
      craftedCompounds: progress.craftedCompounds || [],
      chemicalLog: (progress.chemicalLog || []).slice(0, 20),
      wallIntegrity: Math.max(0, Math.min(100, Math.round(progress.wallIntegrity))),
      monsterStunnedTime: Math.max(0, Math.round(progress.monsterStunnedTime)),
      monsterSlowedTime: Math.max(0, Math.round(progress.monsterSlowedTime)),
      monsterDistractedTime: Math.max(0, Math.round(progress.monsterDistractedTime)),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'students', progress.studentCode), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Load student game session state by PIN code
 */
export async function loadStudentProgress(studentCode: string): Promise<StudentProgress | null> {
  const cleanCode = studentCode.trim().replace(/[^a-zA-Z0-9_\-]/g, '');
  if (!cleanCode) return null;
  const path = `students/${cleanCode}`;
  try {
    const snap = await getDoc(doc(db, 'students', cleanCode));
    if (snap.exists()) {
      return snap.data() as StudentProgress;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Submit high score to the global leaderboard
 */
export async function submitLeaderboardScore(entry: LeaderboardEntry): Promise<void> {
  const entryId = `${entry.studentCode}_${Date.now()}`;
  const path = `leaderboard/${entryId}`;
  try {
    const payload = {
      studentCode: entry.studentCode,
      studentName: entry.studentName,
      escapeTimeSeconds: Math.round(entry.escapeTimeSeconds),
      remainingOxygen: Math.max(0, Math.min(100, Math.round(entry.remainingOxygen))),
      synthesizedCount: entry.synthesizedCount,
      score: Math.max(0, Math.round(entry.score)),
      compoundsUsed: entry.compoundsUsed || [],
      escapedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'leaderboard', entryId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Fetch top leaderboard entries
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const path = 'leaderboard';
  try {
    const q = query(collection(db, path), orderBy('score', 'desc'), limit(30));
    const querySnapshot = await getDocs(q);
    const results: LeaderboardEntry[] = [];
    querySnapshot.forEach((d) => {
      results.push(d.data() as LeaderboardEntry);
    });
    return results;
  } catch (error) {
    // If index or collection is initializing, return fallback graceful array
    console.warn("Leaderboard fetch error or empty:", error);
    return [];
  }
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
}

export async function logoutUser() {
  return await signOut(auth);
}
