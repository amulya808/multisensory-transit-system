"use client";
import { useState, useEffect } from "react";
import { IconCar4wd, IconFlame } from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDatabase, ref, onValue } from "firebase/database";
import { getFirebaseInstance } from "@/app/services/firebaseServices";

type Report = {
  id: string;
  type: "fire" | "position";
  timestamp: number;
  gps_status?: string;
  latitude?: number;
  longitude?: number;
};

// firebase data structure
type FirebaseReportData = {
  timestamp?: number;
  gps_status?: string;
  latitude?: number;
  longitude?: number;
};

type FirebaseReportsData = {
  [key: string]: FirebaseReportData;
};

export function BusReportsTable() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const database = getDatabase(getFirebaseInstance());
    const reportsRef = ref(database, "bus_data/reports");

    const unsubscribe = onValue(reportsRef, (snapshot) => {
      if (snapshot.exists()) {
        const reportsData = snapshot.val() as FirebaseReportsData;
        const parsedReports: Report[] = [];
        
        Object.entries(reportsData).forEach(([id, data]) => {
          // extract the report type (fire or position) from the id
          const type = id.split('-')[0];
          
          // Only process fire and position reports
          if (type === 'fire' || type === 'position') {
            parsedReports.push({
              id,
              type: type as "fire" | "position",
              timestamp: data.timestamp || 0,
              gps_status: data.gps_status,
              latitude: data.latitude,
              longitude: data.longitude
            });
          }
        });
        
        setReports(parsedReports);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // format timestamp for readable date/time
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // handles location display
  const formatLocation = (report: Report) => {
    if (report.gps_status) return report.gps_status;
    if (report.latitude !== undefined && report.longitude !== undefined) {
      return `${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}`;
    }
    return "No location data";
  };

  // for icon display
  const getEventIcon = (type: "fire" | "position") => {
    return type === "fire" 
      ? <IconFlame className="text-red-500 size-5" />
      : <IconCar4wd className="text-amber-500 size-5" />;
  };

  // event name display
  const getEventName = (type: "fire" | "position") => {
    return type === "fire" ? "Fire Alert" : "Abnormal Position";
  };

  const getRowClassName = (type: "fire" | "position") => {
    return type === "fire"
      ? "bg-red-50 dark:bg-red-700/10"
      : "bg-amber-50 dark:bg-amber-700/10";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>A list of all safety alerts detected on the bus.</TableCaption>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[100px]">Alert</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                Loading reports...
              </TableCell>
            </TableRow>
          ) : reports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                No safety alerts detected
              </TableCell>
            </TableRow>
          ) : (
            reports
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((report) => (
                <TableRow key={report.id} className={getRowClassName(report.type)}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {getEventIcon(report.type)}
                  </TableCell>
                  <TableCell>{getEventName(report.type)}</TableCell>
                  <TableCell>{formatLocation(report)}</TableCell>
                  <TableCell className="text-right">{formatTimestamp(report.timestamp)}</TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}