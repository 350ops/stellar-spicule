"use client";

import * as React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Plus, MapPin, Navigation, Trash2, Edit2, X, Save, Filter, Route, Locate, Search, Eye, EyeOff, Layers } from "lucide-react";

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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// Fix for default marker icons in Leaflet with Next.js
const createIcon = (color: string, isHighlighted = false) => {
    const size = isHighlighted ? 32 : 24;
    const borderWidth = isHighlighted ? 3 : 2;
    return L.divIcon({
        className: "custom-marker",
        html: `<div style="
            background-color: ${color};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: ${borderWidth}px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,${isHighlighted ? 0.5 : 0.3});
            transition: all 0.2s ease;
            ${isHighlighted ? 'animation: pulse 1s ease-in-out infinite;' : ''}
        "></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
    });
};

// Create a numbered marker for route display
const createNumberedIcon = (color: string, number: number) => {
    return L.divIcon({
        className: "custom-marker",
        html: `<div style="
            background-color: ${color};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: 600;
        ">${number}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
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

// Component to center map on specific location
function CenterMap({ center, zoom }: { center: [number, number] | null; zoom?: number }) {
    const map = useMap();

    React.useEffect(() => {
        if (center) {
            map.setView(center, zoom || map.getZoom(), { animate: true });
        }
    }, [center, zoom, map]);

    return null;
}

// Extract unique days from pins (sorted numerically)
function extractDays(pins: MapPin[]): string[] {
    const days = new Set<string>();
    pins.forEach(p => {
        if (p.day) days.add(p.day);
    });
    return Array.from(days).sort((a, b) => {
        const dayA = parseInt(a.replace(/\D/g, '')) || 0;
        const dayB = parseInt(b.replace(/\D/g, '')) || 0;
        return dayA - dayB;
    });
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
    const [highlightedPinId, setHighlightedPinId] = React.useState<number | null>(null);
    
    // Filter state
    const [showRoute, setShowRoute] = React.useState(true);
    const [typeFilters, setTypeFilters] = React.useState<Record<string, boolean>>(() => {
        const filters: Record<string, boolean> = {};
        Object.keys(markerColors).filter(k => k !== "default").forEach(k => {
            filters[k] = true;
        });
        return filters;
    });
    const [dayFilter, setDayFilter] = React.useState<string>("all");
    
    // Search state
    const [searchQuery, setSearchQuery] = React.useState("");
    const [searchResults, setSearchResults] = React.useState<Array<{ name: string; lat: number; lng: number }>>([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [centerOnLocation, setCenterOnLocation] = React.useState<[number, number] | null>(null);

    // Extract available days
    const availableDays = React.useMemo(() => extractDays(pins), [pins]);

    // Filter pins
    const filteredPins = React.useMemo(() => {
        return pins.filter(pin => {
            // Filter by type
            if (!typeFilters[pin.type] && typeFilters[pin.type] !== undefined) {
                return false;
            }
            // Filter by day
            if (dayFilter !== "all" && pin.day !== dayFilter) {
                return false;
            }
            return true;
        });
    }, [pins, typeFilters, dayFilter]);

    // Sort filtered pins by day for route display
    const sortedFilteredPins = React.useMemo(() => {
        return [...filteredPins].sort((a, b) => {
            const dayA = a.day ? parseInt(a.day.replace(/\D/g, '')) : 999;
            const dayB = b.day ? parseInt(b.day.replace(/\D/g, '')) : 999;
            if (dayA !== dayB) return dayA - dayB;
            // Secondary sort by id for stable ordering within same day
            return a.id - b.id;
        });
    }, [filteredPins]);

    // Generate route polyline points (sorted by day)
    const routePoints = React.useMemo(() => {
        if (!showRoute) return [];
        return sortedFilteredPins.map(p => [p.lat, p.lng] as [number, number]);
    }, [sortedFilteredPins, showRoute]);

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

    // Search for locations using Nominatim (OpenStreetMap)
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
            );
            const data = await response.json();
            setSearchResults(data.map((item: { display_name: string; lat: string; lon: string }) => ({
                name: item.display_name,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
            })));
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectSearchResult = (result: { name: string; lat: number; lng: number }) => {
        setCenterOnLocation([result.lat, result.lng]);
        setSearchQuery("");
        setSearchResults([]);
        if (isAddingPin) {
            setNewPinLocation({ lat: result.lat, lng: result.lng });
            setNewPinForm(prev => ({ ...prev, location: result.name.split(',')[0] }));
        }
    };

    const toggleTypeFilter = (type: string) => {
        setTypeFilters(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const allTypesVisible = Object.values(typeFilters).every(v => v);
    const toggleAllTypes = () => {
        const newValue = !allTypesVisible;
        const newFilters: Record<string, boolean> = {};
        Object.keys(typeFilters).forEach(k => {
            newFilters[k] = newValue;
        });
        setTypeFilters(newFilters);
    };

    const handleCenterOnTrip = () => {
        // This will trigger FitBounds via the center effect
        setCenterOnLocation(null);
    };

    return (
        <div className="h-[600px] w-full rounded-xl overflow-hidden border relative">
            {/* Toolbar */}
            <div className="absolute top-4 left-4 z-[1001] flex gap-2">
                {editable && (
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
                )}

                {/* Filter Popover */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button size="sm" variant="secondary" className="shadow-md">
                            <Filter className="h-4 w-4 mr-1" />
                            Filter
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 z-[1002]" align="start">
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Label className="text-xs font-medium uppercase text-muted-foreground">Pin Types</Label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={toggleAllTypes}
                                    >
                                        {allTypesVisible ? "Hide All" : "Show All"}
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {Object.keys(markerColors).filter(k => k !== "default").map(type => (
                                        <div key={type} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`filter-${type}`}
                                                checked={typeFilters[type]}
                                                onCheckedChange={() => toggleTypeFilter(type)}
                                            />
                                            <div
                                                className="h-3 w-3 rounded-full"
                                                style={{ backgroundColor: markerColors[type] }}
                                            />
                                            <Label htmlFor={`filter-${type}`} className="text-sm cursor-pointer">
                                                {type}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {availableDays.length > 0 && (
                                <div>
                                    <Label className="text-xs font-medium uppercase text-muted-foreground mb-2 block">Day</Label>
                                    <Select value={dayFilter} onValueChange={setDayFilter}>
                                        <SelectTrigger className="h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Days</SelectItem>
                                            {availableDays.map(day => (
                                                <SelectItem key={day} value={day}>{day}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="flex items-center gap-2 pt-2 border-t">
                                <Checkbox
                                    id="show-route"
                                    checked={showRoute}
                                    onCheckedChange={(checked) => setShowRoute(checked as boolean)}
                                />
                                <Route className="h-4 w-4 text-muted-foreground" />
                                <Label htmlFor="show-route" className="text-sm cursor-pointer">
                                    Show Route Path
                                </Label>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Search Bar - positioned to avoid toolbar overlap */}
            <div className="absolute top-4 left-[180px] right-[120px] z-[1000] max-w-sm mx-auto">
                {isAddingPin ? (
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm shadow-lg text-center">
                        Click on the map to place a pin
                    </div>
                ) : (
                    <div className="relative">
                        <div className="flex gap-1">
                            <Input
                                placeholder="Search location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="h-9 bg-background/95 backdrop-blur-sm shadow-md border-0"
                            />
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={handleSearch}
                                disabled={isSearching}
                                className="h-9 px-3 shadow-md"
                            >
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                        {searchResults.length > 0 && (
                            <div className="absolute top-full mt-1 left-0 right-0 bg-background rounded-lg shadow-lg border overflow-hidden z-[1002]">
                                {searchResults.map((result, idx) => (
                                    <button
                                        key={idx}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition truncate"
                                        onClick={() => handleSelectSearchResult(result)}
                                    >
                                        <MapPin className="h-3 w-3 inline-block mr-2 text-muted-foreground" />
                                        {result.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-md border">
                <p className="text-xs font-medium mb-2 text-muted-foreground">Legend</p>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(markerColors).filter(([k]) => k !== "default").map(([type, color]) => (
                        <div
                            key={type}
                            className={cn(
                                "flex items-center gap-1 cursor-pointer transition-opacity",
                                !typeFilters[type] && "opacity-40"
                            )}
                            onClick={() => toggleTypeFilter(type)}
                        >
                            <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: color }}
                            />
                            <span className="text-xs">{type}</span>
                        </div>
                    ))}
                </div>
                {showRoute && routePoints.length > 1 && (
                    <div className="flex items-center gap-1 mt-2 pt-2 border-t">
                        <div className="h-0.5 w-4 bg-primary rounded" />
                        <span className="text-xs text-muted-foreground">Trip Route</span>
                    </div>
                )}
            </div>

            {/* Pin Count & Quick Actions */}
            <div className="absolute top-4 right-4 z-[1001] flex flex-col gap-2">
                <div className="bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{filteredPins.length} pins</span>
                        {filteredPins.length !== pins.length && (
                            <span className="text-xs text-muted-foreground">
                                (of {pins.length})
                            </span>
                        )}
                    </div>
                </div>
                <Button
                    size="sm"
                    variant="secondary"
                    className="shadow-md"
                    onClick={handleCenterOnTrip}
                    title="Center on trip"
                >
                    <Locate className="h-4 w-4" />
                </Button>
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
                {filteredPins.length > 1 && !centerOnLocation && <FitBounds pins={filteredPins} />}
                {centerOnLocation && <CenterMap center={centerOnLocation} zoom={14} />}

                {/* Route Polyline */}
                {showRoute && routePoints.length > 1 && (
                    <Polyline
                        positions={routePoints}
                        pathOptions={{
                            color: "hsl(var(--primary))",
                            weight: 3,
                            opacity: 0.7,
                            dashArray: "10, 10",
                        }}
                    />
                )}

                {/* Existing Pins - use sorted pins when showing route for correct numbering */}
                {(showRoute && routePoints.length > 1 ? sortedFilteredPins : filteredPins).map((pin, idx) => (
                    <Marker
                        key={pin.id}
                        position={[pin.lat, pin.lng]}
                        icon={showRoute && routePoints.length > 1
                            ? createNumberedIcon(markerColors[pin.type] || markerColors.default, idx + 1)
                            : createIcon(
                                markerColors[pin.type] || markerColors.default,
                                highlightedPinId === pin.id
                            )
                        }
                        eventHandlers={{
                            mouseover: () => setHighlightedPinId(pin.id),
                            mouseout: () => setHighlightedPinId(null),
                        }}
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
                                    <p className="text-xs text-primary mt-2 font-medium">{pin.day}</p>
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

            {/* CSS for marker animation */}
            <style jsx global>{`
                @keyframes pulse {
                    0%, 100% { transform: rotate(-45deg) scale(1); }
                    50% { transform: rotate(-45deg) scale(1.1); }
                }
            `}</style>
        </div>
    );
}
