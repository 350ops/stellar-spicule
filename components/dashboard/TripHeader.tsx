"use client";

import * as React from "react";
import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TripHeader() {
    return (
        <div className="flex flex-col gap-6 mb-6">
            <div className="h-48 w-full rounded-xl bg-muted overflow-hidden relative group">
                <img
                    src="https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=2070&auto=format&fit=crop"
                    alt="Japan"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4">
                    <Button variant="secondary" size="sm" className="bg-background/50 backdrop-blur hover:bg-background/80">
                        Change Cover
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Japan Trip</h1>
                    <div className="flex items-center gap-4 text-muted-foreground mt-2 text-sm">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Jan 12 - Jan 24, 2026</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>Tokyo, Niseko, Kyoto</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>Camille, Miguel</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline">Share</Button>
                    <Button>View on Map</Button>
                </div>
            </div>
        </div>
    );
}
