import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import type { FirebaseOptions } from 'firebase/app';

import config from '../../firebase-applet-config.json';

const firebaseConfig: FirebaseOptions = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
  measurementId: config.measurementId,
};

const app = initializeApp(firebaseConfig);
const firestoreDatabaseId = config.firestoreDatabaseId || '(default)';
export const db = getFirestore(app, firestoreDatabaseId);
export const auth = getAuth(app);
