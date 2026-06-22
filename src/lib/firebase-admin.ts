import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 
  ? initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId }) 
  : getApp();

export const adminAuth = getAuth(app);
