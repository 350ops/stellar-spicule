"use client";

import dynamic from "next/dynamic";
import { useMapPins } from "@/lib/store";
import { Loader2 } from "lucide-react";

// Dynamically import TripMap to avoid SSR issues with Leaflet
const TripMap = dynamic(() => import("./TripMap").then(mod => ({ default: mod.TripMap })), {
    ssr: false,
    loading: () => (
        <div className="h-[600px] w-full bg-muted/20 rounded-xl flex items-center justify-center border">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Loading map...</p>
            </div>
        </div>
    ),
});

export function MapTab() {
    const { mapPins, addMapPin, updateMapPin, deleteMapPin } = useMapPins();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Trip Map</h2>
                    <p className="text-sm text-muted-foreground">
                        View and manage all locations for your trip. Click "Add Pin" then click on the map to add a new location.
                    </p>
                </div>
            </div>
            <TripMap
                pins={mapPins}
                onAddPin={addMapPin}
                onUpdatePin={updateMapPin}
                onDeletePin={deleteMapPin}
                editable={true}
            />
        </div>
    );
}

export function CalendarTab() {
    return (
        <div className="border rounded-xl p-4 bg-background">
            <div className="grid grid-cols-7 gap-4 mb-4 text-center text-sm font-medium text-muted-foreground">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-4 h-[400px]">
                {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-2 min-h-[60px] bg-card hover:bg-muted/50 transition">
                        <span className="text-xs text-muted-foreground">{i + 1}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function NotesTab() {
    return (
        <div className="border rounded-xl h-[500px] flex overflow-hidden bg-background">
            <div className="w-64 border-r bg-muted/10 p-4 space-y-2">
                <div className="font-semibold text-sm px-2 mb-4">Pages</div>
                {["Packing List", "Food Research", "Travel Insurance"].map(note => (
                    <div key={note} className="px-2 py-1.5 rounded-md text-sm hover:bg-muted cursor-pointer">{note}</div>
                ))}
            </div>
            <div className="flex-1 p-8 space-y-4">
                <h2 className="text-3xl font-bold">Packing List</h2>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Passport</li>
                    <li>Power Adapter (Type A)</li>
                    <li>Snow Gear</li>
                </ul>
            </div>
        </div>
    )
}

export function BudgetTab() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2 border rounded-xl overflow-hidden bg-background">
                    <div className="p-4 border-b flex justify-between items-center bg-muted/50">
                        <h3 className="font-semibold">Expenses</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Split equally</span>
                            <div className="w-9 h-5 bg-primary rounded-full relative cursor-pointer"><div className="absolute right-0.5 top-0.5 h-4 w-4 bg-background rounded-full shadow-sm" /></div>
                        </div>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-muted/20">
                            <tr className="border-b">
                                <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                                <th className="text-left p-3 font-medium text-muted-foreground">Description</th>
                                <th className="text-right p-3 font-medium text-muted-foreground">Cost</th>
                                <th className="text-right p-3 font-medium text-muted-foreground">Paid By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { cat: "Flights", desc: "JFK - NRT Roundtrip", cost: "$2,400", paid: "Miguel" },
                                { cat: "Hotel", desc: "Hyatt Regency (3 nights)", cost: "$850", paid: "Camille" },
                                { cat: "Transport", desc: "JR Pass (7 days)", cost: "$600", paid: "Camille" },
                                { cat: "Food", desc: "Dinner at Omoide Yokocho", cost: "$120", paid: "Miguel" },
                            ].map((item, i) => (
                                <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                                    <td className="p-3">{item.cat}</td>
                                    <td className="p-3">{item.desc}</td>
                                    <td className="p-3 text-right font-mono">{item.cost}</td>
                                    <td className="p-3 text-right"><span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">{item.paid}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="space-y-4">
                    <div className="border rounded-xl p-4 bg-background shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Budget</h3>
                        <p className="text-3xl font-bold">$3,970</p>
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Camille paid</span>
                                <span className="font-medium">$1,450</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Miguel paid</span>
                                <span className="font-medium">$2,520</span>
                            </div>
                            <div className="h-px bg-border my-2" />
                            <div className="flex justify-between text-sm text-primary font-medium">
                                <span>Camille owes Miguel</span>
                                <span>$535</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function FilesTab() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">All</span>
                    <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm hover:bg-muted/80 cursor-pointer">Images</span>
                    <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm hover:bg-muted/80 cursor-pointer">Documents</span>
                    <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm hover:bg-muted/80 cursor-pointer">Links</span>
                </div>
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90">Upload File</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[
                    { name: "Flight Confirmation.pdf", type: "PDF", size: "1.2 MB" },
                    { name: "Hotel Booking.pdf", type: "PDF", size: "850 KB" },
                    { name: "Inspiration_1.jpg", type: "IMG", size: "3.4 MB" },
                    { name: "Inspiration_2.jpg", type: "IMG", size: "2.1 MB" },
                    { name: "Visa Requirements.docx", type: "DOC", size: "15 KB" },
                ].map((file, i) => (
                    <div key={i} className="group border rounded-xl p-4 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-primary/50 transition cursor-pointer bg-background relative aspect-square">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="h-6 w-6 rounded-md hover:bg-muted flex items-center justify-center">...</div>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center font-bold text-muted-foreground">
                            {file.type}
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium truncate w-32">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{file.size}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
