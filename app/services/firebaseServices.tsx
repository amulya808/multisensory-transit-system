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
type FlameDetectionCallback = (flameDetected: boolean) => void;
type LocationCallback = (location: { latitude: number; longitude: number }) => void;
type AbnormalPositionCallback = (abnormal_position: boolean) => void;
type EnvironmentCallback = (environment: { temperature: number; humidity: number }) => void;


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

export const subscribeToFlameDetection = (callback: FlameDetectionCallback): Unsubscribe => {
  const flameDetectionRef = ref(
    database,
    "bus_data/bus_01/safety_info/flame_detected"
  );
  
  const unsubscribe = onValue(flameDetectionRef, (snapshot: DataSnapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(false); 
    }
  });
  
  return unsubscribe;
}

export const subscribeToLocation = (callback: LocationCallback, errorCallback: (error: Error) => void): Unsubscribe => {
  const locationRef = ref(database, "bus_data/bus_01/location");

  const unsubscribe = onValue(locationRef, (snapshot: DataSnapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        callback(data);
      } else {
        errorCallback(new Error("Invalid location data received."));
      }
    } else {
      errorCallback(new Error("No location data available."));
    }
  }, (error) => {
    errorCallback(error);
  });

  return unsubscribe;
}

export const subscribeToAbnormalPosition = (callback: AbnormalPositionCallback): Unsubscribe => {
  const abnormalPositionRef = ref(
    database,
    "bus_data/bus_01/safety_info/abnormal_position"
  );
  
  const unsubscribe = onValue(abnormalPositionRef, (snapshot: DataSnapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(false); 
    }
  });
  
  return unsubscribe;
}

export const subscribeToTemperature= (callback: (temperature:number) => void ): Unsubscribe => {
  const temperatureRef = ref(
    database,
    "bus_data/bus_01/environmental_data/"
  );
  
  const unsubscribe = onValue(temperatureRef, (snapshot: DataSnapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(0); 
    }
  });
  
  return unsubscribe;
}

  export const subscribeToHumidity = (callback: (humidity:number) => void ): Unsubscribe => {
    const humidityRef = ref(
      database,
      "bus_data/bus_01/environmental_data/"
    );
    
    const unsubscribe = onValue(humidityRef, (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(0); 
      }
    });
    
    return unsubscribe;
  }

  export const subscribeToEnvironmentalData = (callback: EnvironmentCallback): Unsubscribe => {
    const environmentalDataRef = ref(
      database,
      "bus_data/bus_01/environmental_data/"
    );
    
    const unsubscribe = onValue(environmentalDataRef, (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback({ temperature: 0, humidity: 0 }); 
      }
    });
    
    return unsubscribe;
  }

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
  subscribeToFlameDetection,
  subscribeToLocation,
  subscribeToAbnormalPosition,
  subscribeToTemperature,
  subscribeToHumidity,
  subscribeToEnvironmentalData,
};

export default firebaseService;
