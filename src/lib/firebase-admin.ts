import admin from 'firebase-admin';

let initialized = false;

function init() {
  if (!initialized) {
    if (!admin.apps || admin.apps.length === 0) {
      try {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
        initialized = true;
      } catch (error) {
        console.warn("Firebase Admin SDK: Failed to initialize. Auth features may be unavailable.", error);
      }
    } else {
      initialized = true;
    }
  }
}

export function getDb() {
  init();
  return admin.apps.length > 0 ? admin.firestore() : {} as any;
}

export function getAuth() {
  init();
  return admin.apps.length > 0 ? admin.auth() : {} as any;
}

export function getAdminAuth() {
  init();
  return admin.apps.length > 0 ? admin.auth() : {} as any;
}
