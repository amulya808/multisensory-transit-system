"use client";

import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Wifi, WifiOff } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";

const OFFLINE_THRESHOLD_MS = 1 * 60 * 1000; // 1 minute
const CHECK_INTERVAL_MS = 30 * 1000;        // 30 seconds

interface DeviceStatusProps {
  deviceId?: string | null;
}

export function DeviceStatus({ deviceId }: DeviceStatusProps) {
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  
    if (!deviceId || typeof window === 'undefined') {
      setIsLoading(false);
      setIsOnline(false);
      return;
    }

    setIsLoading(true);
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const checkStatus = (timestamp: number | null) => {
      if (!isMounted) return;
      
      if (timestamp === null) {
        setIsOnline(false);
        return;
      }
      
      const isCurrentlyOnline = (Date.now() - timestamp) < OFFLINE_THRESHOLD_MS;
      setIsOnline(isCurrentlyOnline);
    };

    try {
      const db = getDatabase();
      const lastUpdateRef = ref(db, `bus_data/${deviceId}/last_update`);

      // Sets up Firebase listener 
      const unsubscribe = onValue(lastUpdateRef, (snapshot) => {
        if (!isMounted) return;

        const timestamp = snapshot.val();
        setLastUpdateTimestamp(typeof timestamp === 'number' ? timestamp : null);
        checkStatus(typeof timestamp === 'number' ? timestamp : null);
        setIsLoading(false);
      }, (error) => {
        console.error(`Error listening to device ${deviceId} status:`, error);
        if (isMounted) {
          setIsLoading(false);
          setIsOnline(false);
        }
      });

      intervalId = setInterval(() => {
        checkStatus(lastUpdateTimestamp);
      }, CHECK_INTERVAL_MS);

      return () => {
        isMounted = false;
        unsubscribe(); 
        if (intervalId) clearInterval(intervalId);
      };

    } catch (error) {
      console.error("Failed to initialize Firebase listener:", error);
      if (isMounted) {
        setIsLoading(false);
        setIsOnline(false);
      }
    }
  }, [deviceId, lastUpdateTimestamp]);

  const lastSeenText = lastUpdateTimestamp
    ? formatDistanceToNow(new Date(lastUpdateTimestamp), { addSuffix: true })
    : 'never';

  const tooltipContent = isLoading
    ? "Loading status..."
    : `Status: ${isOnline ? 'Connected' : 'Disconnected'}\nLast seen: ${lastSeenText}`;

  if (!deviceId) {
    return <Badge variant="outline" className="text-xs">No Device</Badge>;
  }
  if (isLoading) {
    return (
      <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
        <span className="animate-pulse">...</span>
        <span>Loading</span>
      </Badge>
    );
  }
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={isOnline ? 'default' : 'destructive'}
            className={cn(
              "flex items-center gap-1 px-2 py-1 cursor-default transition-colors",
              isOnline ? "bg-green-500 hover:bg-green-600 border-transparent text-white" : ""
            )}
          >
            {isOnline ? (
              <Wifi className="h-3 w-3" aria-hidden="true" />
            ) : (
              <WifiOff className="h-3 w-3" aria-hidden="true" />
            )}
            <span>{isOnline ? "Online" : "Offline"}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm whitespace-pre-line">{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}