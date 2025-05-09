"use client";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { subscribeToTrafficSigns } from "../../app/services/firebaseServices";
import { IconRoadSign } from "@tabler/icons-react";

export function TrafficSignCard() {
  const previousSign = useRef<string>(
    typeof window !== 'undefined' ? localStorage.getItem('lastTrafficSign') || "none" : "none"
  );

  useEffect(() => {
    const unsubscribe = subscribeToTrafficSigns((signData) => {
      if (signData.sign_detected) {
        const newSign = signData.sign_detected;
        if (newSign !== "none" && newSign !== previousSign.current) {
          toast.success(`Traffic Sign Detected: ${newSign}`, {
            description: `A new traffic sign has been detected by the camera`,
            icon: <IconRoadSign size={16} />,
            duration: 5000,
          });
          previousSign.current = newSign;
          if (typeof window !== 'undefined') {
            localStorage.setItem('lastTrafficSign', newSign);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);
  return null;
}