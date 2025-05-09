"use client";
import { useState, useEffect } from "react";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { getFirebaseInstance } from "../app/services/firebaseServices";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "./ui/drawer";
import {IconWallet, IconLock, IconLockOpen, IconCreditCardPay } from "@tabler/icons-react";
import { Badge } from "./ui/badge";
import Image from "next/image";

// rfid card interface with authorization field
interface CardData {
  id: string;
  balance: number;
  dateRegistered: string;
  rfidId?: string;
  authorized?: boolean;
}

export default function CardManagement() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [topupAmount, setTopupAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // loads cards from Firebase
  useEffect(() => {
    const database = getDatabase(getFirebaseInstance());
    const cardsRef = ref(database, "cards");
    
    return onValue(cardsRef, (snapshot) => {
      if (snapshot.exists()) {
        const cardsData: CardData[] = [];
        snapshot.forEach((childSnapshot) => {
          const cardId = childSnapshot.key;
          const cardData = childSnapshot.val();
          if (cardId) {
            cardsData.push({
              id: cardId,
              balance: cardData.balance || 0,
              dateRegistered: cardData.dateRegistered || '',
              rfidId: cardData.rfidId || cardId,
              authorized: cardData.authorized === undefined ? true : cardData.authorized
            });
          }
        });
        setCards(cardsData);
      }
      setLoading(false);
    });
  }, []);

  // handle card balance top-up
  const handleTopup = () => {
    if (!selectedCard || topupAmount <= 0 || !selectedCard.authorized) return;
    
    const database = getDatabase(getFirebaseInstance());
    const cardRef = ref(database, `cards/${selectedCard.id}`);
    
    update(cardRef, {
      balance: Number(selectedCard.balance) + Number(topupAmount)
    }).then(() => {
      setTopupAmount(0);
      // Update local state for immediate UI feedback
      setCards(prevCards => prevCards.map(c => 
        c.id === selectedCard.id 
          ? {...c, balance: Number(c.balance) + Number(topupAmount)} 
          : c
      ));
    }).catch(error => console.error("Error updating balance:", error));
  };

  // toggle card authorization status
  const toggleAuthorization = (card: CardData) => {
    const database = getDatabase(getFirebaseInstance());
    const newAuthStatus = !card.authorized;
    
    console.log(`Changing card ${card.id} authorization to: ${newAuthStatus}`);
    
    update(ref(database, `cards/${card.id}`), {
      authorized: newAuthStatus
    }).then(() => {
      console.log(`Successfully updated authorization for card ${card.id}`);
      // Update the local state for immediate UI feedback
      setCards(prevCards => prevCards.map(c => 
        c.id === card.id ? {...c, authorized: newAuthStatus} : c
      ));
    }).catch(error => {
      console.error("Error updating authorization:", error);
    });
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconCreditCardPay className="size-5 text-purple-600" />
            <CardTitle>RFID Card Management</CardTitle>
          </div>
          <CardDescription>Manage passenger cards for Bus</CardDescription>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Card ID</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cards.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-4">No cards registered</TableCell></TableRow>
                ) : (
                  cards.map(card => (
                    <TableRow key={card.id}>
                      <TableCell className="font-medium">{card.rfidId || card.id}</TableCell>
                      <TableCell>
                        <Badge variant={card.balance < 50 ? "destructive" : "outline"} className="font-mono">
                          रू {card.balance}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={card.authorized 
                            ? "bg-green-800 text-white border-0 rounded-full px-3"
                            : "bg-red-900 text-white border-0 rounded-full px-3"
                          }
                        >
                          {card.authorized ? "Granted" : "Blocked"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant={card.authorized ? "outline" : "secondary"}
                            size="sm"
                            onClick={() => toggleAuthorization(card)}
                            className="h-8 w-8 p-0"
                          >
                            {card.authorized 
                              ? <IconLock className="h-4 w-4" /> 
                              : <IconLockOpen className="h-4 w-4" />}
                          </Button>
                          
                          <Drawer>
                            <DrawerTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={!card.authorized}
                                onClick={() => setSelectedCard(card)}
                              >
                                <IconWallet className="mr-1 size-4" />
                                Top-up
                              </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                              <div className="mx-auto w-full max-w-sm">
                                <DrawerHeader>
                                  <DrawerTitle className="text-center">
                                    Top-up Card: {selectedCard?.rfidId || selectedCard?.id}
                                  </DrawerTitle>
                                </DrawerHeader>
                              
                                <div className="p-4">
                                  <div className="flex flex-col items-center gap-2 text-center mb-4">
                                    <div className="rounded-full bg-green-100 p-3">
                                      <Image src="/image/RFIDPay.svg" alt="RFID Card" width={50} height={50} className="object-contain" />
                                      
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Current Balance</p>
                                      <p className="text-2xl font-bold">रू {selectedCard?.balance || 0}</p>
                                    </div>
                                  </div>
                                  
                                  {/* select amounts*/}
                                  <div className="space-y-3 w-full">
                                    <p className="text-sm font-medium">Top-up Amount (NPR)</p>
                                    <div className="grid grid-cols-3 gap-2">
                                      {[50, 100, 200].map(amount => (
                                        <Button 
                                          key={amount}
                                          variant="outline" 
                                          onClick={() => setTopupAmount(amount)}
                                        >
                                          रू{amount}
                                        </Button>
                                      ))}
                                    </div>
                                    
                                    <Input
                                      type="number"
                                      placeholder="Custom amount"
                                      value={topupAmount || ''}
                                      onChange={e => setTopupAmount(parseInt(e.target.value) || 0)}
                                      className="w-full"
                                    />
                                    <p className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">New Balance:</span>
                                      <span className="font-medium">
                                        रू {Number(selectedCard?.balance || 0) + Number(topupAmount)}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                
                                <DrawerFooter>
                                  <Button 
                                    onClick={handleTopup} 
                                    disabled={topupAmount <= 0 || !selectedCard?.authorized}
                                  >
                                    Confirm Top-up
                                  </Button>
                                  <DrawerClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DrawerClose>
                                </DrawerFooter>
                              </div>
                            </DrawerContent>
                          </Drawer>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}