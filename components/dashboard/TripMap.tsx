"use client";

import * as React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Plus, MapPin, Navigation, Trash2, Edit2, X, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Fix for default marker icons in Leaflet with Next.js
const createIcon = (color: string) => {
    return L.divIcon({
        className: "custom-marker",
        html: `<div style="
            background-color: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
    });
};

const markerColors: Record<string, string> = {
    Flight: "#3b82f6",
    Hotel: "#8b5cf6",
    Food: "#f97316",
    Activity: "#10b981",
    Sightseeing: "#ec4899",
    default: "#6b7280",
};

export interface MapPin {
    id: number;
    name: string;
    location: string;
    lat: number;
    lng: number;
    type: string;
    day?: string;
    notes?: string;
}

interface TripMapProps {
    pins: MapPin[];
    onAddPin?: (pin: Omit<MapPin, "id">) => void;
    onUpdatePin?: (id: number, updates: Partial<MapPin>) => void;
    onDeletePin?: (id: number) => void;
    editable?: boolean;
}

// Component to handle map click events
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// Component to fit bounds to markers
function FitBounds({ pins }: { pins: MapPin[] }) {
    const map = useMap();

    React.useEffect(() => {
        if (pins.length > 0) {
            const bounds = L.latLngBounds(pins.map(p => [p.lat, p.lng]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
        }
    }, [pins, map]);

    return null;
}

export function TripMap({ pins, onAddPin, onUpdatePin, onDeletePin, editable = true }: TripMapProps) {
    const [isAddingPin, setIsAddingPin] = React.useState(false);
    const [newPinLocation, setNewPinLocation] = React.useState<{ lat: number; lng: number } | null>(null);
    const [newPinForm, setNewPinForm] = React.useState({
        name: "",
        location: "",
        type: "Sightseeing",
        notes: "",
    });
    const [editingPin, setEditingPin] = React.useState<MapPin | null>(null);

    // Default center on Japan
    const defaultCenter: [number, number] = [35.6762, 139.6503];
    const center = pins.length > 0
        ? [pins[0].lat, pins[0].lng] as [number, number]
        : defaultCenter;

    const handleMapClick = (lat: number, lng: number) => {
        if (isAddingPin && editable) {
            setNewPinLocation({ lat, lng });
        }
    };

    const handleSaveNewPin = () => {
        if (newPinLocation && newPinForm.name && onAddPin) {
            onAddPin({
                name: newPinForm.name,
                location: newPinForm.location,
                lat: newPinLocation.lat,
                lng: newPinLocation.lng,
                type: newPinForm.type,
                notes: newPinForm.notes,
            });
            setNewPinLocation(null);
            setNewPinForm({ name: "", location: "", type: "Sightseeing", notes: "" });
            setIsAddingPin(false);
        }
    };

    const handleUpdatePin = () => {
        if (editingPin && onUpdatePin) {
            onUpdatePin(editingPin.id, {
                name: editingPin.name,
                location: editingPin.location,
                type: editingPin.type,
                notes: editingPin.notes,
            });
            setEditingPin(null);
        }
    };

    const handleDeletePin = (id: number) => {
        if (onDeletePin) {
            onDeletePin(id);
        }
    };

    return (
        <div className="h-[500px] w-full rounded-xl overflow-hidden border relative">
            {/* Toolbar */}
            {editable && (
                <div className="absolute top-4 left-4 z-[1000] flex gap-2">
                    <Button
                        size="sm"
                        variant={isAddingPin ? "default" : "secondary"}
                        onClick={() => setIsAddingPin(!isAddingPin)}
                        className="shadow-md"
                    >
                        {isAddingPin ? (
                            <>
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Pin
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Add Pin Instructions */}
            {isAddingPin && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm shadow-lg">
                    Click on the map to place a pin
                </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-md border">
                <p className="text-xs font-medium mb-2 text-muted-foreground">Legend</p>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(markerColors).filter(([k]) => k !== "default").map(([type, color]) => (
                        <div key={type} className="flex items-center gap-1">
                            <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: color }}
                            />
                            <span className="text-xs">{type}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pin Count */}
            <div className="absolute top-4 right-4 z-[1000] bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border">
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{pins.length} pins</span>
                </div>
            </div>

            <MapContainer
                center={center}
                zoom={pins.length > 0 ? 6 : 5}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {editable && <MapClickHandler onMapClick={handleMapClick} />}
                {pins.length > 1 && <FitBounds pins={pins} />}

                {/* Existing Pins */}
                {pins.map((pin) => (
                    <Marker
                        key={pin.id}
                        position={[pin.lat, pin.lng]}
                        icon={createIcon(markerColors[pin.type] || markerColors.default)}
                    >
                        <Popup>
                            <div className="min-w-[200px]">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h4 className="font-semibold text-sm">{pin.name}</h4>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                            <MapPin className="h-3 w-3" />
                                            {pin.location}
                                        </p>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px]">
                                        {pin.type}
                                    </Badge>
                                </div>
                                {pin.day && (
                                    <p className="text-xs text-primary mt-2">{pin.day}</p>
                                )}
                                {pin.notes && (
                                    <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                                        {pin.notes}
                                    </p>
                                )}
                                {editable && (
                                    <div className="flex gap-2 mt-3 pt-2 border-t">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 h-7 text-xs"
                                            onClick={() => setEditingPin(pin)}
                                        >
                                            <Edit2 className="h-3 w-3 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="h-7 text-xs"
                                            onClick={() => handleDeletePin(pin.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* New Pin Preview */}
                {newPinLocation && (
                    <Marker
                        position={[newPinLocation.lat, newPinLocation.lng]}
                        icon={createIcon(markerColors[newPinForm.type] || markerColors.default)}
                    >
                        <Popup>
                            <div className="text-sm text-muted-foreground">
                                New pin location selected
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>

            {/* New Pin Dialog */}
            <Dialog open={!!newPinLocation} onOpenChange={(open) => !open && setNewPinLocation(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Add New Pin
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="pin-name">Name *</Label>
                            <Input
                                id="pin-name"
                                placeholder="e.g., Tokyo Tower"
                                value={newPinForm.name}
                                onChange={(e) => setNewPinForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pin-location">Location</Label>
                            <Input
                                id="pin-location"
                                placeholder="e.g., Minato, Tokyo"
                                value={newPinForm.location}
                                onChange={(e) => setNewPinForm(prev => ({ ...prev, location: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={newPinForm.type}
                                onValueChange={(value) => setNewPinForm(prev => ({ ...prev, type: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(markerColors).filter(k => k !== "default").map((type) => (
                                        <SelectItem key={type} value={type}>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: markerColors[type] }}
                                                />
                                                {type}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pin-notes">Notes</Label>
                            <Input
                                id="pin-notes"
                                placeholder="Any additional notes..."
                                value={newPinForm.notes}
                                onChange={(e) => setNewPinForm(prev => ({ ...prev, notes: e.target.value }))}
                            />
                        </div>
                        {newPinLocation && (
                            <p className="text-xs text-muted-foreground">
                                Coordinates: {newPinLocation.lat.toFixed(4)}, {newPinLocation.lng.toFixed(4)}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNewPinLocation(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveNewPin} disabled={!newPinForm.name}>
                            <Save className="h-4 w-4 mr-1" />
                            Save Pin
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Pin Dialog */}
            <Dialog open={!!editingPin} onOpenChange={(open) => !open && setEditingPin(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit2 className="h-5 w-5" />
                            Edit Pin
                        </DialogTitle>
                    </DialogHeader>
                    {editingPin && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-pin-name">Name *</Label>
                                <Input
                                    id="edit-pin-name"
                                    value={editingPin.name}
                                    onChange={(e) => setEditingPin(prev => prev ? { ...prev, name: e.target.value } : null)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-pin-location">Location</Label>
                                <Input
                                    id="edit-pin-location"
                                    value={editingPin.location}
                                    onChange={(e) => setEditingPin(prev => prev ? { ...prev, location: e.target.value } : null)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={editingPin.type}
                                    onValueChange={(value) => setEditingPin(prev => prev ? { ...prev, type: value } : null)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(markerColors).filter(k => k !== "default").map((type) => (
                                            <SelectItem key={type} value={type}>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-3 w-3 rounded-full"
                                                        style={{ backgroundColor: markerColors[type] }}
                                                    />
                                                    {type}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-pin-notes">Notes</Label>
                                <Input
                                    id="edit-pin-notes"
                                    value={editingPin.notes || ""}
                                    onChange={(e) => setEditingPin(prev => prev ? { ...prev, notes: e.target.value } : null)}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingPin(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdatePin}>
                            <Save className="h-4 w-4 mr-1" />
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
