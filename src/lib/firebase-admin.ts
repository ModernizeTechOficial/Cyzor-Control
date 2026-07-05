import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let initialized = false;

function init() {
  if (!initialized) {
    try {
      const apps = getApps();
      if (apps.length === 0) {
        console.log(`[FirebaseAdmin] Initializing app with projectId: ${firebaseConfig.projectId}`);
        initializeApp({
          projectId: firebaseConfig.projectId,
        });
      }
      initialized = true;
    } catch (error) {
      console.error("[FirebaseAdmin] Failed to initialize:", error);
      initialized = false;
    }
  }
}

export function getDb() {
  init();
  const apps = getApps();
  if (apps.length > 0) {
    const dbId = firebaseConfig.firestoreDatabaseId;
    if (dbId && dbId !== "(default)") {
      return getFirestore(apps[0], dbId);
    }
    return getFirestore(apps[0]);
  }
  console.error("[FirebaseAdmin] No Firebase app initialized");
  return {} as any;
}

export function getAdminAuth() {
  init();
  const apps = getApps();
  return apps.length > 0 ? getAuth(apps[0]) : null;
}
