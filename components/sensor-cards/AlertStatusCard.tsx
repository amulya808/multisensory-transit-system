import { useState, useEffect, useRef } from "react";
import { IconAlertHexagon } from "@tabler/icons-react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { subscribeToFlameDetection, getFirebaseInstance } from "../../app/services/firebaseServices";
import { getDatabase, onValue, ref } from "firebase/database";

export function AlertStatusCard() {
  const [alertCount, setAlertCount] = useState(0);
  const [lastSafetyUpdate, setLastSafetyUpdate] = useState(new Date());
  const previousFire = useRef(false);

  useEffect(() => {
    const unsubscribeFlame = subscribeToFlameDetection((detected) => {
      if (detected && !previousFire.current) {
        setAlertCount((prevCount) => prevCount + 1);
      }
      previousFire.current = detected;
    });

    const database = getDatabase(getFirebaseInstance());
    const safetyTimestampRef = ref(database, "bus_data/bus_01/safety_info/last_update");
    const unsubscribeSafetyTimestamp = onValue(safetyTimestampRef, (snapshot) => {
      if (snapshot.exists()) {
        const timestamp = snapshot.val();
        setLastSafetyUpdate(new Date(timestamp));
      }
    });

    return () => {
      unsubscribeFlame();
      unsubscribeSafetyTimestamp();
    };
  }, []);

  return (
    <Card className="@container/card">
      <CardHeader>
        <IconAlertHexagon className="!size-6" />
        <CardDescription className="text-xl font-bold">Alert Status</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {alertCount}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="text-muted-foreground">
          Last fire detected: {lastSafetyUpdate.toLocaleTimeString()}
        </div>
      </CardFooter>
    </Card>
  );
}
