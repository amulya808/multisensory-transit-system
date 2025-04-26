"use client";

import { useState, useEffect } from "react";
import { IconThermometer } from "@tabler/icons-react";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { subscribeToEnvironmentalData } from "../../app/services/firebaseServices";

export function TemperatureCard() {
  const [temperature, setTemperature] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToEnvironmentalData((data) => {
      setTemperature(data.temperature || 0);
     
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const getTempClasses = (temp: number) => {
    if (temp < 18) return {
      card: "border-blue-500/50 bg-blue-500/10",
      text: "text-blue-500 dark:text-blue-400",
      status: "Cold"
    };
    if (temp > 25) return {
      card: "border-pink-500/50 bg-rose-500/50",
      text: "text-red-500 dark:text-red-400",
      status: "Hot"
    };
    return {
      card: "border-green-500/50",
      text: "text-green-500 dark:text-green-400",
      status: "Normal"
    };
  };

  const tempClasses = getTempClasses(temperature);
  return (
    <>
      <Card className={`shadow-sm transition-colors duration-300 ${tempClasses.card}`}>
        <CardHeader>
          <IconThermometer className="size-6 text-red-600" />
          <CardDescription className="text-xl font-bold">Temperature</CardDescription>
          <CardTitle className={`text-2xl tabular-nums @[250px]/card:text-3xl ${tempClasses.text}`}>
            {temperature.toFixed(1)}°C 
          </CardTitle>
          <CardDescription className="text-xl font-bold">Status:</CardDescription>
          <CardTitle className={`text-2xl tabular-nums @[250px]/card:text-3xl ${tempClasses.text}`}>【{tempClasses.status}】</CardTitle>
          
        </CardHeader>
        
      </Card>
    </>
  );
}

export default TemperatureCard;