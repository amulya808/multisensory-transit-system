"use client";

import { PassengerCard } from "./sensor-cards/PassengerCard";
import { FireDetectionCard } from "./sensor-cards/FireDetectionCard";
import { AlertStatusCard } from "./sensor-cards/AlertStatusCard";
import { VehicleStatusCard } from "./sensor-cards/vehicle-status";
import {TemperatureCard} from "./sensor-cards/TemperatureCard";
import {HumidityCard} from "./sensor-cards/./HumidityCard";

export function SensorCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      <PassengerCard />
      <TemperatureCard />
      <HumidityCard />
      <AlertStatusCard />
      <FireDetectionCard />
      <VehicleStatusCard />
    </div>
  );
}
