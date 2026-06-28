import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseFunctions = getFunctions(firebaseApp);

const analyticsPromise = isSupported().then((supported) => {
  if (supported && firebaseConfig.measurementId) {
    return getAnalytics(firebaseApp);
  }

  return null;
});

export function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean | null | undefined>
) {
  void analyticsPromise.then((analytics) => {
    if (analytics) {
      logEvent(analytics, eventName, eventParams);
    }
  });
}
