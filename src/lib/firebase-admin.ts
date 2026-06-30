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
        initializeApp({
          projectId: firebaseConfig.projectId,
        });
      }
      initialized = true;
    } catch (error) {
      console.warn("Firebase Admin SDK: Failed to initialize. Auth features may be unavailable.", error);
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
  return {} as any;
}

export function getAdminAuth() {
  init();
  const apps = getApps();
  return apps.length > 0 ? getAuth(apps[0]) : null;
}
