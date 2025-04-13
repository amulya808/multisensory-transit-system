import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, Unsubscribe, DataSnapshot } from "firebase/database";

//Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};


const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


type PassengerCountCallback = (count: number) => void;


export const subscribeToPassengerCount = (callback: PassengerCountCallback): Unsubscribe => {
  const passengerCountRef = ref(
    database,
    "bus_data/bus_01/passenger_info/count"
  );
  
  const unsubscribe = onValue(passengerCountRef, (snapshot: DataSnapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(0); 
    }
  });
  
  return unsubscribe;
};

let firebaseInstance: ReturnType<typeof initializeApp> | null = null;

export const getFirebaseInstance = (): ReturnType<typeof initializeApp> => {
  if (!firebaseInstance) {
    firebaseInstance = app;
  }
  return firebaseInstance;
};


const firebaseService = {
  subscribeToPassengerCount,
  getFirebaseInstance,
};

export default firebaseService;