"use client";

import { useState, useEffect } from "react";
import { IconAlertHexagon, IconFlame, IconShieldCheck, IconTrendingUp } from "@tabler/icons-react";
import { IconFriends } from "@tabler/icons-react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { subscribeToPassengerCount, subscribeToFlameDetection } from "../app/services/firebaseServices";


export function SensorCards() {
  const [passengerCount, setPassengerCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [flameDetected, setFlameDetected] = useState(false);

  useEffect(() => {
    const unsubscribePassenger = subscribeToPassengerCount((count) => {
      setPassengerCount(count);
      setLastUpdated(new Date());
    });

    const unsubscribeFlame = subscribeToFlameDetection((detected) => {
      setFlameDetected(detected);
      setLastUpdated(new Date());
    });

    return () => {
      unsubscribePassenger();
      unsubscribeFlame();
    };
  }, []);
  const fireCardClasses = flameDetected
    ? "border-destructive border-2 bg-destructive/10 animate-pulse" 
    :  "border-green-500/50";
  
  const fireTitleText = flameDetected ? "FIRE ALERT!" : "Normal";

  const fireTitleClasses = flameDetected
    ? "text-red-500 dark:text-red-400"
    : "text-green-500 dark:text-green-400";

    const fireIcon = flameDetected ? (
      <IconFlame className="size-7 text-destructive" /> // Larger red flame icon
    ) : (
      <IconShieldCheck className="size-6 text-green-600" /> // Green shield/check icon
    );
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
      <Card className={`shadow-sm transition-colors duration-300 ${fireCardClasses}`}>
        <CardHeader>
          {fireIcon}
          <CardDescription>Fire Detection Status</CardDescription>
          
          <CardTitle
            className={`text-2xl tabular-nums @[250px]/card:text-3xl ${fireTitleClasses}`}
          >
            {fireTitleText}
          </CardTitle>
        </CardHeader>
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
