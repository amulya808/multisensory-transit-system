import { useState, useEffect, useRef } from "react";
import { IconFlame, IconShieldCheck } from "@tabler/icons-react";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { subscribeToFlameDetection } from "../../app/services/firebaseServices";

export function FireDetectionCard() {
  const [flameDetected, setFlameDetected] = useState(false);
  const previousFire = useRef(false);

  useEffect(() => {
    const unsubscribeFlame = subscribeToFlameDetection((detected) => {
      setFlameDetected(detected);
      previousFire.current = detected;
    });
    return () => {
      unsubscribeFlame();
    };
  }, []);

  const fireCardClasses = flameDetected
    ? "border-destructive border-2 bg-destructive/10 animate-pulse"
    : "border-green-500/50";

  const fireTitleText = flameDetected ? "FIRE ALERT!" : "Normal";
  const fireTitleClasses = flameDetected
    ? "text-red-500 dark:text-red-400"
    : "text-green-500 dark:text-green-400";
  const fireIcon = flameDetected ? (
    <IconFlame className="size-7 text-destructive" />
  ) : (
    <IconShieldCheck className="size-6 text-green-600" />
  );

  return (
    <Card className={`shadow-sm transition-colors duration-300 ${fireCardClasses}`}>
      <CardHeader>
        {fireIcon}
        <CardDescription className="text-xl font-bold">Fire Detection Status</CardDescription>
        <CardTitle className={`text-2xl tabular-nums @[250px]/card:text-3xl ${fireTitleClasses}`}>
          {fireTitleText}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
