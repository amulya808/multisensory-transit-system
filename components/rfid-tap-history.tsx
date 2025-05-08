"use client";
import { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { getFirebaseInstance } from "../app/services/firebaseServices";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { IconCardsFilled, IconMapRoute,  } from "@tabler/icons-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

interface TapData {
  id: string;
  busId: string;
  cardId: string;
  timestamp: number;
  type: "in" | "out" | "rejected";
  fare?: number;
  reason?: string;
}

interface JourneyData {
  tapIn: TapData;
  tapOut?: TapData;
  duration?: number;
  fare?: number;
}

interface RejectedTapData {
  id: string;
  cardId: string;
  timestamp: number;
  reason: string;
}

export default function TapHistory() {
  const [journeys, setJourneys] = useState<JourneyData[]>([]);
  const [rejectedTaps, setRejectedTaps] = useState<RejectedTapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCardId, setFilterCardId] = useState("all");
  const [uniqueCards, setUniqueCards] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("successful");

  useEffect(() => {
    const database = getDatabase(getFirebaseInstance());
    
    return onValue(ref(database, "taps"), (snapshot) => {
      if (snapshot.exists()) {
        const tapsData: TapData[] = [];
        const rejectedData: RejectedTapData[] = [];
        
        snapshot.forEach((childSnapshot) => {
          const tapId = childSnapshot.key;
          const tapData = childSnapshot.val();
          
          if (tapId) {
            // checks if this is a rejected tap
            if (tapId.startsWith("rejected_") || tapData.type === "rejected") {
              rejectedData.push({
                id: tapId,
                cardId: tapData.cardId || "",
                timestamp: tapData.timestamp || 0,
                reason: tapData.reason || "Unknown"
              });
            } else {
              // normal tap for in and out
              tapsData.push({
                id: tapId,
                busId: tapData.busId || "",
                cardId: tapData.cardId || "",
                timestamp: tapData.timestamp || 0,
                type: tapData.type || "in",
                fare: tapData.fare
              });
            }
          }
        });
        
        // extracts unique cards from both successful and rejected taps
        const allCardIds = [...tapsData.map(tap => tap.cardId), ...rejectedData.map(tap => tap.cardId)];
        setUniqueCards([...new Set(allCardIds)]);
        
        // sorts rejected taps by timestamp (newest first)
        rejectedData.sort((a, b) => b.timestamp - a.timestamp);
        setRejectedTaps(rejectedData);
        
        // for successfull journey
        processJourneys(tapsData);
      }
      setLoading(false);
    });
  }, []);

  const processJourneys = (tapsData: TapData[]) => {
    // sort by timestamp
    const sortedTaps = [...tapsData].sort((a, b) => a.timestamp - b.timestamp);
    
    const journeyMap: Record<string, JourneyData> = {};
    const journeyList: JourneyData[] = [];
    
    sortedTaps.forEach(tap => {
      const key = tap.cardId;
      
      if (tap.type === "in") {
        journeyMap[key] = { tapIn: tap };
      } else if (tap.type === "out" && journeyMap[key]?.tapIn) {
        const journey = journeyMap[key];
        journey.tapOut = tap;
        journey.fare = tap.fare;
        journey.duration = (tap.timestamp - journey.tapIn.timestamp) / 1000; // seconds
        journeyList.push(journey);
        delete journeyMap[key];
      }
    });
    
    // adds incomplete journeys and sort by tap-in time
    Object.values(journeyMap).forEach(journey => journey.tapIn && journeyList.push(journey));
    setJourneys(journeyList.sort((a, b) => b.tapIn.timestamp - a.tapIn.timestamp));
  };

  // formats timestamp 
  const formatTime = (timestamp: number): string => 
    timestamp ? new Date(timestamp).toLocaleString("en-NP", {
      month: 'short', day: 'numeric', hour: '2-digit', 
      minute: '2-digit', second: '2-digit'
    }) : "N/A";

  // formats the duration
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return "In progress";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return min < 1 ? `${seconds.toFixed(1)} sec` : `${min} min ${sec} sec`;
  };

  // format reject taps from firebase
  const formatReason = (reason: string): string => {
    switch (reason) {
      case "unauthorized":
        return "Card is blocked";
      case "new_card_requires_auth":
        return "New card needs authorization";
      default:
        return reason.replace(/_/g, " ");
    }
  };

  const filteredJourneys = filterCardId === "all" 
    ? journeys 
    : journeys.filter(j => j.tapIn.cardId === filterCardId);

  const filteredRejectedTaps = filterCardId === "all"
    ? rejectedTaps
    : rejectedTaps.filter(t => t.cardId === filterCardId);

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconCardsFilled className="size-5 text-blue-600" />
            <CardTitle>Tap History</CardTitle>
          </div>
          <CardDescription>View passenger journey history</CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* filter */}
          <div className="mb-4">
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-4 md:space-y-0">
              <div className="space-y-1">
                <Label htmlFor="card-filter">Filter by Card</Label>
                <Select value={filterCardId} onValueChange={setFilterCardId}>
                  <SelectTrigger id="card-filter" className="w-[220px]">
                    <SelectValue placeholder="All Cards" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cards</SelectItem>
                    {uniqueCards.map(cardId => (
                      <SelectItem key={cardId} value={cardId}>{cardId}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="successful">Successful Taps</TabsTrigger>
              <TabsTrigger value="rejected">Rejected Taps</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === "successful" && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Card ID</TableHead>
                      <TableHead>Journey</TableHead>
                      <TableHead>Fare</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJourneys.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">No journey records found</TableCell>
                      </TableRow>
                    ) : (
                      filteredJourneys.map((journey, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{journey.tapIn.cardId}</TableCell>
                          <TableCell>
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center">
                                <Badge className="bg-teal-800 text-teal-100 hover:bg-teal-700 border-0 rounded-full px-3 mr-2">
                                  Enter
                                </Badge>
                                <span>{formatTime(journey.tapIn.timestamp)}</span>
                              </div>
                              
                              {journey.tapOut ? (
                                <div className="flex items-center">
                                  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0 rounded-full px-3 mr-2">
                                    Exit
                                  </Badge>
                                  <span>{formatTime(journey.tapOut.timestamp)}</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-amber-600">
                                  <IconMapRoute className="mr-2 h-4 w-4" />
                                  <span>Journey in progress</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {journey.fare ? (
                              <Badge variant="outline" className="font-mono">
                                रू {journey.fare}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={!journey.tapOut ? "text-amber-600" : ""}>
                              {formatDuration(journey.duration)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
              
              {activeTab === "rejected" && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Card ID</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRejectedTaps.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">No rejected taps found</TableCell>
                      </TableRow>
                    ) : (
                      filteredRejectedTaps.map((tap, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{tap.cardId}</TableCell>
                          <TableCell>{formatTime(tap.timestamp)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Badge className="bg-rose-900 text-white hover:bg-rose-800 border-0 rounded-full px-3 mr-2">
                                Rejected
                              </Badge>
                              <span>{formatReason(tap.reason)}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}