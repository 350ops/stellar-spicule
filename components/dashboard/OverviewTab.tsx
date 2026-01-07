"use client";

import { AlertCircle, Calendar, CheckCircle2, ChevronRight, MapPin, Plane } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function OverviewTab() {
    return (
        <div className="space-y-8 pb-10">

            {/* Top Section: Next Up & Decisions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Next Up */}
                <Card className="col-span-2 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Next Up</CardTitle>
                        <CardDescription>Upcoming items on your itinerary</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-4 items-start p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
                                <div className="bg-orange-100 text-orange-600 p-2 rounded-md h-10 w-10 flex items-center justify-center font-bold text-xs flex-col leading-none">
                                    <span>JAN</span>
                                    <span className="text-sm">12</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-sm">Flight to Tokyo (JL 005)</h4>
                                    <p className="text-xs text-muted-foreground">Departing JFK 11:45 AM • Terminal 8</p>
                                </div>
                                <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">In 5 days</Badge>
                            </div>

                            <div className="flex gap-4 items-start p-3 rounded-lg hover:bg-muted/50 transition">
                                <div className="bg-muted text-muted-foreground p-2 rounded-md h-10 w-10 flex items-center justify-center font-bold text-xs flex-col leading-none">
                                    <span>JAN</span>
                                    <span className="text-sm">13</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-sm">Transfer to Shinjuku Hotel</h4>
                                    <p className="text-xs text-muted-foreground">Narita Express • 2 Tickets Confirmed</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Decisions Needed */}
                <Card className="shadow-sm border-blue-200 dark:border-blue-900/50 bg-blue-50/20 dark:bg-blue-950/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-blue-600" />
                            Decisions Needed
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                            <div>
                                <p className="text-sm font-medium">Pick Niseko Resort</p>
                                <p className="text-xs text-muted-foreground mb-2">Hilton vs Green Leaf</p>
                                <div className="flex gap-2">
                                    <Avatar className="h-6 w-6"><AvatarFallback>M</AvatarFallback></Avatar>
                                    <Avatar className="h-6 w-6"><AvatarFallback>C</AvatarFallback></Avatar>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                            <div>
                                <p className="text-sm font-medium">Confirm Dinner Day 3</p>
                                <p className="text-xs text-muted-foreground">Ramen vs Sushi reservation</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* Places Shortlist */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Places Shortlist</h3>
                    <Button variant="ghost" size="sm" className="gap-1">View all <ChevronRight className="h-4 w-4" /></Button>
                </div>
                <ScrollArea className="w-full whitespace-nowrap pb-4">
                    <div className="flex w-max space-x-4">
                        {[
                            { name: "Niseko Village", loc: "Hokkaido", img: "https://images.unsplash.com/photo-1551817958-e1f0ed286379?q=80&w=2070&auto=format&fit=crop", tag: "Skiing" },
                            { name: "Fushimi Inari", loc: "Kyoto", img: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?q=80&w=2070&auto=format&fit=crop", tag: "Sightseeing" },
                            { name: "Omoide Yokocho", loc: "Tokyo", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094&auto=format&fit=crop", tag: "Food" },
                            { name: "Hakone Onsen", loc: "Kanagawa", img: "https://images.unsplash.com/photo-1515542622106-78bda8ba30c8?q=80&w=2048&auto=format&fit=crop", tag: "Relax" },
                        ].map((place) => (
                            <div key={place.name} className="w-[200px] group relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">
                                <div className="h-32 w-full overflow-hidden">
                                    <img src={place.img} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                </div>
                                <div className="p-3 bg-card border border-t-0">
                                    <h4 className="font-semibold text-sm truncate">{place.name}</h4>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <MapPin className="h-3 w-3" /> {place.loc}
                                    </div>
                                    <Badge variant="secondary" className="mt-2 text-[10px] h-5">{place.tag}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>

            {/* Bookings */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Bookings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="flex items-center p-3 gap-4 hover:bg-muted/50 cursor-pointer transition">
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Plane className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">JAL Flights</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-500" /> Confirmed
                            </p>
                        </div>
                    </Card>
                    <Card className="flex items-center p-3 gap-4 hover:bg-muted/50 cursor-pointer transition">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Ritz Kyoto</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-500" /> Booked
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

        </div>
    );
}
