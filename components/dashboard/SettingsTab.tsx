"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Check, Bell, Globe, Calendar, DollarSign, Users, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TripSettings {
  id?: string;
  trip_id: string;
  timezone: string;
  currency: string;
  date_format: string;
  time_format: string;
  default_assignees: string[];
  collaborators: Array<{ name: string; email: string; role: string; avatar?: string }>;
  preferences: {
    theme?: string;
    notifications_enabled?: boolean;
    auto_save?: boolean;
  };
  notifications: {
    itinerary_changes?: boolean;
    budget_updates?: boolean;
    new_messages?: boolean;
  };
}

interface SettingsTabProps {
  tripId?: string;
  settings?: TripSettings;
  onSave?: (settings: TripSettings) => Promise<void>;
}

const DEFAULT_SETTINGS: TripSettings = {
  trip_id: 'default',
  timezone: 'Asia/Tokyo',
  currency: 'JPY',
  date_format: 'MM/DD/YYYY',
  time_format: '12h',
  default_assignees: ['C', 'M'],
  collaborators: [
    { name: 'Camille', email: 'camille@example.com', role: 'owner', avatar: 'C' },
    { name: 'Miguel', email: 'miguel@example.com', role: 'owner', avatar: 'M' }
  ],
  preferences: {
    theme: 'system',
    notifications_enabled: true,
    auto_save: true
  },
  notifications: {
    itinerary_changes: true,
    budget_updates: true,
    new_messages: true
  }
};

export function SettingsTab({ tripId = 'default', settings: initialSettings, onSave }: SettingsTabProps) {
  const [settings, setSettings] = useState<TripSettings>(initialSettings || DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("");

  const handleSave = async () => {
    setIsSaving(true);

    if (onSave) {
      try {
        await onSave(settings);
      } catch (error) {
        console.error("Failed to save settings:", error);
      }
    }

    setTimeout(() => {
      setIsSaving(false);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 2000);
    }, 500);
  };

  const updateSetting = <K extends keyof TripSettings>(key: K, value: TripSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updatePreference = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value }
    }));
  };

  const updateNotification = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }));
  };

  const addCollaborator = () => {
    if (!newCollaboratorEmail.trim()) return;

    const name = newCollaboratorEmail.split('@')[0];
    const newCollab = {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: newCollaboratorEmail,
      role: 'editor',
      avatar: name.charAt(0).toUpperCase()
    };

    setSettings(prev => ({
      ...prev,
      collaborators: [...prev.collaborators, newCollab]
    }));
    setNewCollaboratorEmail("");
  };

  const removeCollaborator = (email: string) => {
    setSettings(prev => ({
      ...prev,
      collaborators: prev.collaborators.filter(c => c.email !== email)
    }));
  };

  const toggleAssignee = (assignee: string) => {
    setSettings(prev => ({
      ...prev,
      default_assignees: prev.default_assignees.includes(assignee)
        ? prev.default_assignees.filter(a => a !== assignee)
        : [...prev.default_assignees, assignee]
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trip Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your trip preferences and collaboration settings
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>Saving...</>
          ) : savedMessage ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved
            </>
          ) : (
            <>Save Changes</>
          )}
        </Button>
      </div>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Regional Settings
          </CardTitle>
          <CardDescription>
            Configure timezone, currency, and date formats for your trip
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={settings.timezone} onValueChange={(val) => updateSetting('timezone', val)}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                  <SelectItem value="America/New_York">America/New York (EST)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">America/Los Angeles (PST)</SelectItem>
                  <SelectItem value="Australia/Sydney">Australia/Sydney (AEST)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={settings.currency} onValueChange={(val) => updateSetting('currency', val)}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                  <SelectItem value="AUD">AUD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-format">Date Format</Label>
              <Select value={settings.date_format} onValueChange={(val) => updateSetting('date_format', val)}>
                <SelectTrigger id="date-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time-format">Time Format</Label>
              <Select value={settings.time_format} onValueChange={(val) => updateSetting('time_format', val)}>
                <SelectTrigger id="time-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                  <SelectItem value="24h">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collaborators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Collaborators
          </CardTitle>
          <CardDescription>
            Manage who has access to this trip and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Collaborators */}
          <div className="space-y-2">
            {settings.collaborators.map((collab, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{collab.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{collab.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {collab.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{collab.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAssignee(collab.avatar || '')}
                  >
                    {settings.default_assignees.includes(collab.avatar || '') ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Default Assignee
                      </>
                    ) : (
                      <>Add as Default</>
                    )}
                  </Button>
                  {collab.role !== 'owner' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCollaborator(collab.email)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Collaborator */}
          <Separator />
          <div className="flex gap-2">
            <Input
              placeholder="Enter email address"
              value={newCollaboratorEmail}
              onChange={(e) => setNewCollaboratorEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCollaborator()}
            />
            <Button onClick={addCollaborator} disabled={!newCollaboratorEmail.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Choose what updates you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about trip updates
              </p>
            </div>
            <Switch
              checked={settings.preferences.notifications_enabled}
              onCheckedChange={(checked) => updatePreference('notifications_enabled', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Itinerary Changes</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when itinerary items are added or updated
                </p>
              </div>
              <Switch
                checked={settings.notifications.itinerary_changes}
                onCheckedChange={(checked) => updateNotification('itinerary_changes', checked)}
                disabled={!settings.preferences.notifications_enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Budget Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about new expenses and budget changes
                </p>
              </div>
              <Switch
                checked={settings.notifications.budget_updates}
                onCheckedChange={(checked) => updateNotification('budget_updates', checked)}
                disabled={!settings.preferences.notifications_enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about new messages and comments
                </p>
              </div>
              <Switch
                checked={settings.notifications.new_messages}
                onCheckedChange={(checked) => updateNotification('new_messages', checked)}
                disabled={!settings.preferences.notifications_enabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Customize your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-save</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save changes as you work
              </p>
            </div>
            <Switch
              checked={settings.preferences.auto_save}
              onCheckedChange={(checked) => updatePreference('auto_save', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={settings.preferences.theme}
              onValueChange={(val) => updatePreference('theme', val)}
            >
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
