"use client";

import * as React from "react";
import {
    ArrowLeftRight,
    Bus,
    Camera,
    Car,
    Home,
    Hotel,
    MapPin,
    Plane,
    PlaneLanding,
    PlaneTakeoff,
    Ship,
    Ticket,
    Train,
    Users,
    Utensils,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    useEditModal,
    useItinerary,
    ITEM_TYPES,
    ITEM_STATUSES,
    type ItineraryItem,
    type ItemType,
    type ItemStatus,
} from "@/lib/store";
import { cn } from "@/lib/utils";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Plane,
    Train,
    Bus,
    Ship,
    Car,
    Hotel,
    Home,
    Utensils,
    Ticket,
    Camera,
    PlaneLanding,
    PlaneTakeoff,
    ArrowLeftRight,
    Users,
    MapPin,
};

export function EditItemModal() {
    const { editModal, closeEditModal } = useEditModal();
    const { addItineraryItem, updateItineraryItem, itinerary } = useItinerary();

    const [formData, setFormData] = React.useState<Partial<ItineraryItem>>({
        title: "",
        type: "Flight",
        time: "",
        location: "",
        status: "pending",
        description: "",
        duration: "",
        assignees: [],
        confirmationNumber: "",
        carrier: "",
        flightNumber: "",
        departureTime: "",
        arrivalTime: "",
        departureLocation: "",
        arrivalLocation: "",
        seatClass: "",
        price: "",
        bookingUrl: "",
        notes: "",
    });

    // Reset form when modal opens
    React.useEffect(() => {
        if (editModal.isOpen) {
            if (editModal.mode === "edit" && editModal.item) {
                setFormData({ ...editModal.item });
            } else {
                setFormData({
                    title: "",
                    type: "Flight",
                    time: "",
                    location: "",
                    status: "pending",
                    description: "",
                    duration: "",
                    assignees: [],
                    confirmationNumber: "",
                    carrier: "",
                    flightNumber: "",
                    departureTime: "",
                    arrivalTime: "",
                    departureLocation: "",
                    arrivalLocation: "",
                    seatClass: "",
                    price: "",
                    bookingUrl: "",
                    notes: "",
                });
            }
        }
    }, [editModal.isOpen, editModal.mode, editModal.item]);

    const handleChange = (field: keyof ItineraryItem, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (!formData.title || editModal.dayIndex === null) return;

        if (editModal.mode === "create") {
            addItineraryItem(editModal.dayIndex, {
                title: formData.title,
                type: formData.type || "Other",
                time: formData.time || "TBD",
                location: formData.location || "",
                status: (formData.status as ItemStatus) || "pending",
                description: formData.description,
                duration: formData.duration,
                assignees: formData.assignees || [],
                confirmationNumber: formData.confirmationNumber,
                carrier: formData.carrier,
                flightNumber: formData.flightNumber,
                departureTime: formData.departureTime,
                arrivalTime: formData.arrivalTime,
                departureLocation: formData.departureLocation,
                arrivalLocation: formData.arrivalLocation,
                seatClass: formData.seatClass,
                price: formData.price,
                bookingUrl: formData.bookingUrl,
                notes: formData.notes,
            });
        } else if (editModal.item?.id) {
            updateItineraryItem(editModal.item.id, formData);
        }

        closeEditModal();
    };

    const isTransportType = ["Flight", "Train", "Bus", "Ferry", "RentalCar", "Taxi"].includes(formData.type || "");

    const getTypeIcon = (type: string) => {
        const typeConfig = ITEM_TYPES.find(t => t.value === type);
        if (typeConfig) {
            const IconComponent = iconMap[typeConfig.icon];
            return IconComponent ? <IconComponent className="h-4 w-4" /> : <MapPin className="h-4 w-4" />;
        }
        return <MapPin className="h-4 w-4" />;
    };

    return (
        <Dialog open={editModal.isOpen} onOpenChange={(open) => !open && closeEditModal()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {getTypeIcon(formData.type || "Other")}
                        {editModal.mode === "create" ? "Add New Item" : "Edit Item"}
                    </DialogTitle>
                    <DialogDescription>
                        {editModal.mode === "create"
                            ? `Adding to ${itinerary[editModal.dayIndex || 0]?.day} (${itinerary[editModal.dayIndex || 0]?.date})`
                            : "Update the details of this item"}
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="booking">Booking</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4 mt-4">
                        {/* Type Selection */}
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <div className="flex flex-wrap gap-2">
                                {ITEM_TYPES.map((type) => {
                                    const IconComponent = iconMap[type.icon];
                                    return (
                                        <Badge
                                            key={type.value}
                                            variant={formData.type === type.value ? "default" : "outline"}
                                            className={cn(
                                                "cursor-pointer transition-all hover:scale-105",
                                                formData.type === type.value && "ring-2 ring-primary ring-offset-2"
                                            )}
                                            onClick={() => handleChange("type", type.value)}
                                        >
                                            {IconComponent && <IconComponent className="h-3 w-3 mr-1" />}
                                            {type.label}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                placeholder={formData.type === "Flight" ? "e.g., Flight JL 005" : "e.g., Check-in at Hotel"}
                                value={formData.title}
                                onChange={(e) => handleChange("title", e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Time */}
                            <div className="space-y-2">
                                <Label htmlFor="time">Time</Label>
                                <Input
                                    id="time"
                                    placeholder="e.g., 11:45 AM"
                                    value={formData.time}
                                    onChange={(e) => handleChange("time", e.target.value)}
                                />
                            </div>

                            {/* Duration */}
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration</Label>
                                <Input
                                    id="duration"
                                    placeholder="e.g., 2h 30m"
                                    value={formData.duration}
                                    onChange={(e) => handleChange("duration", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                placeholder="e.g., JFK Terminal 8"
                                value={formData.location}
                                onChange={(e) => handleChange("location", e.target.value)}
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleChange("status", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ITEM_STATUSES.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    status.color === "green" && "bg-green-500",
                                                    status.color === "blue" && "bg-blue-500",
                                                    status.color === "yellow" && "bg-yellow-500",
                                                    status.color === "orange" && "bg-orange-500",
                                                    status.color === "gray" && "bg-gray-500",
                                                )} />
                                                {status.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Add any notes or details..."
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                rows={3}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-4 mt-4">
                        {isTransportType && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Carrier */}
                                    <div className="space-y-2">
                                        <Label htmlFor="carrier">
                                            {formData.type === "Flight" ? "Airline" : formData.type === "Train" ? "Train Company" : "Provider"}
                                        </Label>
                                        <Input
                                            id="carrier"
                                            placeholder={formData.type === "Flight" ? "e.g., Japan Airlines" : "e.g., JR East"}
                                            value={formData.carrier}
                                            onChange={(e) => handleChange("carrier", e.target.value)}
                                        />
                                    </div>

                                    {/* Flight/Train Number */}
                                    <div className="space-y-2">
                                        <Label htmlFor="flightNumber">
                                            {formData.type === "Flight" ? "Flight Number" : formData.type === "Train" ? "Train Number" : "Reference"}
                                        </Label>
                                        <Input
                                            id="flightNumber"
                                            placeholder={formData.type === "Flight" ? "e.g., JL 005" : "e.g., N700"}
                                            value={formData.flightNumber}
                                            onChange={(e) => handleChange("flightNumber", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Departure */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-sm flex items-center gap-2">
                                            <PlaneTakeoff className="h-4 w-4" />
                                            Departure
                                        </h4>
                                        <div className="space-y-2">
                                            <Label htmlFor="departureLocation">Location</Label>
                                            <Input
                                                id="departureLocation"
                                                placeholder="e.g., JFK Terminal 8"
                                                value={formData.departureLocation}
                                                onChange={(e) => handleChange("departureLocation", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="departureTime">Time</Label>
                                            <Input
                                                id="departureTime"
                                                placeholder="e.g., 11:45 AM"
                                                value={formData.departureTime}
                                                onChange={(e) => handleChange("departureTime", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Arrival */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-sm flex items-center gap-2">
                                            <PlaneLanding className="h-4 w-4" />
                                            Arrival
                                        </h4>
                                        <div className="space-y-2">
                                            <Label htmlFor="arrivalLocation">Location</Label>
                                            <Input
                                                id="arrivalLocation"
                                                placeholder="e.g., NRT Terminal 2"
                                                value={formData.arrivalLocation}
                                                onChange={(e) => handleChange("arrivalLocation", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="arrivalTime">Time</Label>
                                            <Input
                                                id="arrivalTime"
                                                placeholder="e.g., 3:30 PM (+1)"
                                                value={formData.arrivalTime}
                                                onChange={(e) => handleChange("arrivalTime", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Class/Seat */}
                                <div className="space-y-2">
                                    <Label htmlFor="seatClass">Class / Seat</Label>
                                    <Input
                                        id="seatClass"
                                        placeholder="e.g., Business Class, Seat 12A"
                                        value={formData.seatClass}
                                        onChange={(e) => handleChange("seatClass", e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {!isTransportType && (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Additional details specific to {ITEM_TYPES.find(t => t.value === formData.type)?.label || "this type"}.
                                </p>
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Additional Notes</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Add any additional notes..."
                                        value={formData.notes}
                                        onChange={(e) => handleChange("notes", e.target.value)}
                                        rows={5}
                                    />
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="booking" className="space-y-4 mt-4">
                        {/* Confirmation Number */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmationNumber">Confirmation / Booking Number</Label>
                            <Input
                                id="confirmationNumber"
                                placeholder="e.g., ABC123XYZ"
                                value={formData.confirmationNumber}
                                onChange={(e) => handleChange("confirmationNumber", e.target.value)}
                            />
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <Label htmlFor="price">Price</Label>
                            <Input
                                id="price"
                                placeholder="e.g., $1,200"
                                value={formData.price}
                                onChange={(e) => handleChange("price", e.target.value)}
                            />
                        </div>

                        {/* Booking URL */}
                        <div className="space-y-2">
                            <Label htmlFor="bookingUrl">Booking URL</Label>
                            <Input
                                id="bookingUrl"
                                type="url"
                                placeholder="https://..."
                                value={formData.bookingUrl}
                                onChange={(e) => handleChange("bookingUrl", e.target.value)}
                            />
                        </div>

                        {/* Assignees */}
                        <div className="space-y-2">
                            <Label>Assignees</Label>
                            <div className="flex gap-2">
                                {["C", "M"].map((person) => (
                                    <Badge
                                        key={person}
                                        variant={formData.assignees?.includes(person) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => {
                                            const current = formData.assignees || [];
                                            const updated = current.includes(person)
                                                ? current.filter(p => p !== person)
                                                : [...current, person];
                                            handleChange("assignees", updated);
                                        }}
                                    >
                                        {person === "C" ? "Camille" : "Miguel"}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={closeEditModal}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!formData.title}>
                        {editModal.mode === "create" ? "Add Item" : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
