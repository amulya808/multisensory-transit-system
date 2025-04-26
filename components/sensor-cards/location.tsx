"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Skeleton } from "../ui/skeleton"
import { Terminal } from "lucide-react"
import { subscribeToLocation } from "@/app/services/firebaseServices"


export const description = ""

const LocationMap = dynamic(() =>
  import('./location-map').then((mod) => mod.LocationMap),
  {
    ssr: false, 
    loading: () => <Skeleton className="w-full h-full" /> 
  }
);

interface Coordinates {
  latitude: number;
  longitude: number;
}

export function Location() {
  const [coords, setCoords] = React.useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setIsLoading(true);
    setError(null);

    const handleData = (data: Coordinates | null) => {

      setCoords(data); 
      setError(null);
      setIsLoading(false);
    };

    const handleError = (err: Error) => {
      setError(`Failed to load location data: ${err.message}`);
      setIsLoading(false);
      setCoords(null);
    };

    const unsubscribe = subscribeToLocation(handleData, handleError);

    return () => {

      unsubscribe();
    };
  }, []); 

  return (
    <div className="flex justify-start gap-4 px-4 lg:px-6 mt-4">
      <Card className="w-full max-w-8xl h-100 @container/card flex flex-col overflow-hidden m-0 p-0">
        <CardContent className="flex-grow p-0 relative min-h-0">
          {isLoading && (
             <div className="flex items-center justify-center min-h-0">
               <Skeleton className="w-full h-full" />
             </div>
          )}
          {error && !isLoading && (
            <div className="p-6 h-full flex items-center justify-center">
                <Alert variant="destructive" className="w-auto">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
          )}
          {!isLoading && !error && coords && (
            <LocationMap latitude={coords.latitude} longitude={coords.longitude} />
          )}
           {!isLoading && !error && !coords && (
            <div className="p-6 h-full flex items-center justify-center">
                <p className="text-muted-foreground">Waiting for location data...</p>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
