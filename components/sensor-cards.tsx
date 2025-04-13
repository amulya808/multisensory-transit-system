"use client";

import { useState, useEffect } from "react";
import { IconAlertHexagon, IconFlame, IconTrendingUp } from "@tabler/icons-react";
import { IconFriends } from "@tabler/icons-react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { subscribeToPassengerCount } from "@/app/services/firebaseServices";

export function SensorCards() {
  const [passengerCount, setPassengerCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const unsubscribe = subscribeToPassengerCount((count) => {
      setPassengerCount(count);
      setLastUpdated(new Date());
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <IconFriends className="!size-6" />
          <CardDescription>Passenger</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {passengerCount}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Current Number of Passengers <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <IconFlame className="!size-6" />
          <CardDescription>Fire Detected</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,234
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <IconAlertHexagon className="!size-6" />
          <CardDescription>Alert Status</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            4
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
        </CardFooter>
      </Card>
    </div>
  );
}
