import { useState, useEffect } from "react";
import { IconFriends, IconTrendingUp } from "@tabler/icons-react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { subscribeToPassengerCount, getFirebaseInstance } from "../../app/services/firebaseServices";
import { getDatabase, onValue, ref } from "firebase/database";

export function PassengerCard() {
  const [passengerCount, setPassengerCount] = useState(0);
  const [lastPassengerUpdate, setLastPassengerUpdate] = useState(new Date());

  useEffect(() => {
    const unsubscribePassenger = subscribeToPassengerCount((count) => {
      setPassengerCount(count);
    });

    const database = getDatabase(getFirebaseInstance());
    const passengerTimestampRef = ref(database, "bus_data/bus_01/passenger_info/last_update");
    const unsubscribePassengerTimestamp = onValue(passengerTimestampRef, (snapshot) => {
      if (snapshot.exists()) {
        const timestamp = snapshot.val();
        setLastPassengerUpdate(new Date(timestamp));
      }
    });

    return () => {
      unsubscribePassenger();
      unsubscribePassengerTimestamp();
    };
  }, []);

  return (
    <Card className="@container/card">
      <CardHeader>
        <IconFriends className="!size-6" />
        <CardDescription className="text-xl font-bold">Passenger</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {passengerCount}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          Current Number of Passengers <IconTrendingUp className="size-4" />
        </div>
        <div className="text-muted-foreground">
          Last updated: {lastPassengerUpdate.toLocaleTimeString()}
        </div>
      </CardFooter>
    </Card>
  );
}
