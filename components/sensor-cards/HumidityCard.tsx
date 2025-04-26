"use client";

import { useState, useEffect } from "react";
import {IconDroplet } from "@tabler/icons-react";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { subscribeToEnvironmentalData } from "../../app/services/firebaseServices";

export function HumidityCard() {
  const [humidity, setHumidity] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToEnvironmentalData((data) => {
     
      setHumidity(data.humidity || 0);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const getHumidityClasses = (humidity: number) => {
    if (humidity < 30) return {
      card: "border-yellow-500/50 bg-yellow-500/10",
      text: "text-yellow-500 dark:text-yellow-400",
      status: "Dry"
    };
    if (humidity > 60) return {
      card: "border-blue-500/50 bg-blue-500/10",
      text: "text-blue-500 dark:text-blue-400",
      status: "Humid"
    };
    return {
      card: "border-green-500/50",
      text: "text-green-500 dark:text-green-400",
      status: "Normal"
    };
  };

  const humidityClasses = getHumidityClasses(humidity);

  return (
    <>
      <Card className={`shadow-sm transition-colors duration-300 ${humidityClasses.card}`}>
        <CardHeader>
          <IconDroplet className="size-6 text-blue-600" />
          <CardDescription className="text-xl font-bold">Humidity</CardDescription>
          <CardTitle className={`text-2xl tabular-nums @[250px]/card:text-3xl ${humidityClasses.text}`}>
            {humidity.toFixed(1)}%
          </CardTitle>
          <CardDescription className="text-xl font-bold">Status:</CardDescription>
          <CardTitle className={`text-2xl tabular-nums @[250px]/card:text-3xl ${humidityClasses.text}`}>【{humidityClasses.status}】</CardTitle>
        </CardHeader>
      </Card>
    </>
  );
}
export default HumidityCard;