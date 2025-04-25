import { useState, useEffect } from "react";
import { IconAlertTriangle, IconCheck } from "@tabler/icons-react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { 
  subscribeToAbnormalPosition, 
  getFirebaseInstance 
} from "../../app/services/firebaseServices";
import { getDatabase, onValue, ref } from "firebase/database";

export function VehicleStatusCard() {
  const [abnormalPosition, setAbnormalPosition] = useState(false);
  const [lastStatusUpdate, setLastStatusUpdate] = useState(new Date());

  useEffect(() => {
    const unsubscribePosition = subscribeToAbnormalPosition((detected) => {
      setAbnormalPosition(detected);
    });

    const database = getDatabase(getFirebaseInstance());
    const safetyTimestampRef = ref(database, "bus_data/bus_01/safety_info/last_update");
    const unsubscribeSafetyTimestamp = onValue(safetyTimestampRef, (snapshot) => {
      if (snapshot.exists()) {
        const timestamp = snapshot.val();
        setLastStatusUpdate(new Date(timestamp));
      }
    });

    return () => {
      unsubscribePosition();
      unsubscribeSafetyTimestamp();
    };
  }, []);

  // Determine vehicle status styling and content based on accelerometer data
  const vehicleCardClasses = abnormalPosition
    ? "border-yellow-500 border-2 bg-yellow-500/10 animate-pulse"
    : "border-green-500/50";

  const vehicleStatusText = abnormalPosition ? "ABNORMAL POSITION" : "Good";
  const vehicleTitleClasses = abnormalPosition
    ? "text-yellow-500 dark:text-yellow-400"
    : "text-green-500 dark:text-green-400";
  const vehicleIcon = abnormalPosition ? (
    <IconAlertTriangle className="size-7 text-yellow-500" />
  ) : (
    <IconCheck className="size-6 text-green-600" />
  );

  return (
    <Card className={`@container/card shadow-sm transition-colors duration-300 ${vehicleCardClasses}`}>
      <CardHeader>
        {vehicleIcon}
        <CardDescription className="text-xl font-bold">Vehicle Status</CardDescription>
        <CardTitle
          className={`text-2xl tabular-nums @[250px]/card:text-3xl ${vehicleTitleClasses}`}
        >
          {vehicleStatusText}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="text-muted-foreground">
          Last updated: {lastStatusUpdate.toLocaleTimeString()}
        </div>
      </CardFooter>
    </Card>
  );
}

export default VehicleStatusCard;