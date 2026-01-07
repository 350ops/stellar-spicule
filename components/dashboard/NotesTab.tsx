"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Star, Trash2, Edit2, Check, X, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  color?: string | null;
  icon?: string | null;
  is_favorite: boolean;
  created_by?: string | null;
  last_edited_by?: string | null;
  note_order: number;
  created_at: string;
  updated_at: string;
}

interface NotesTabProps {
  tripId?: string;
  notes: Note[];
  onAddNote: (note: Partial<Note>) => Promise<void>;
  onUpdateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
}

const DEFAULT_NOTES: Note[] = [
  {
    id: '1',
    title: 'Packing List',
    content: `# Packing List

## Essentials
- Passport
- Travel insurance documents
- Credit cards & cash
- Phone & chargers

## Clothing
- Winter coat & layers
- Comfortable walking shoes
- Snow boots (for Niseko)
- Formal outfit for nice restaurants

## Electronics
- Power adapter (Type A for Japan)
- Camera & extra batteries
- Portable charger

## Other
- Medications
- Toiletries
- JR Pass voucher`,
    category: 'planning',
    is_favorite: true,
    note_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Food Research',
    content: `# Must-Try Foods in Japan

## Tokyo
- Tsukiji Outer Market - fresh sushi breakfast
- Omoide Yokocho - yakitori street
- Ichiran Ramen - solo ramen experience
- Nakameguro - trendy cafes

## Kyoto
- Nishiki Market - food hall
- Kaiseki dinner - traditional multi-course
- Matcha everything

## Osaka
- Dotonbori - street food heaven
- Takoyaki & Okonomiyaki
- Kushikatsu (fried skewers)`,
    category: 'food',
    is_favorite: true,
    note_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Travel Insurance',
    content: `# Travel Insurance Info

Provider: World Nomads
Policy #: WN-2026-123456

Coverage:
- Medical: $100,000
- Trip cancellation: $5,000
- Baggage loss: $2,000
- Emergency evacuation: $500,000

Emergency Contact: +1-555-TRAVEL-HELP`,
    category: 'documents',
    is_favorite: false,
    note_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function NotesTab({ tripId, notes: initialNotes = [], onAddNote, onUpdateNote, onDeleteNote }: NotesTabProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes.length > 0 ? initialNotes : DEFAULT_NOTES);
  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0] || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  // Sync with parent state
  useEffect(() => {
    if (initialNotes.length > 0) {
      setNotes(initialNotes);
      if (!selectedNote && initialNotes.length > 0) {
        setSelectedNote(initialNotes[0]);
      }
    }
  }, [initialNotes]);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectNote = (note: Note) => {
    if (isEditing) {
      handleSaveEdit();
    }
    setSelectedNote(note);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    if (selectedNote) {
      setEditedTitle(selectedNote.title);
      setEditedContent(selectedNote.content);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    if (selectedNote && (editedTitle !== selectedNote.title || editedContent !== selectedNote.content)) {
      const updates = {
        title: editedTitle,
        content: editedContent,
        last_edited_by: "You",
        updated_at: new Date().toISOString()
      };

      // Update local state immediately for responsiveness
      const updatedNotes = notes.map(note =>
        note.id === selectedNote.id ? { ...note, ...updates } : note
      );
      setNotes(updatedNotes);
      setSelectedNote({ ...selectedNote, ...updates });

      // Call parent handler if provided
      if (onUpdateNote) {
        try {
          await onUpdateNote(selectedNote.id, updates);
        } catch (error) {
          console.error("Failed to update note:", error);
        }
      }
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTitle(selectedNote?.title || "");
    setEditedContent(selectedNote?.content || "");
  };

  const handleToggleFavorite = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      const updatedNotes = notes.map(n =>
        n.id === noteId ? { ...n, is_favorite: !n.is_favorite } : n
      );
      setNotes(updatedNotes);

      if (selectedNote?.id === noteId) {
        setSelectedNote({ ...selectedNote, is_favorite: !selectedNote.is_favorite });
      }

      if (onUpdateNote) {
        try {
          await onUpdateNote(noteId, { is_favorite: !note.is_favorite });
        } catch (error) {
          console.error("Failed to toggle favorite:", error);
        }
      }
    }
  };

  const handleAddNote = async () => {
    if (!newNoteTitle.trim()) return;

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: newNoteTitle,
      content: "",
      category: "general",
      is_favorite: false,
      note_order: notes.length,
      created_by: "You",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setNotes([...notes, newNote]);
    setSelectedNote(newNote);
    setIsAddDialogOpen(false);
    setNewNoteTitle("");
    setIsEditing(true);
    setEditedTitle(newNote.title);
    setEditedContent("");

    if (onAddNote) {
      try {
        await onAddNote(newNote);
      } catch (error) {
        console.error("Failed to add note:", error);
      }
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const updatedNotes = notes.filter(n => n.id !== noteId);
    setNotes(updatedNotes);

    if (selectedNote?.id === noteId) {
      setSelectedNote(updatedNotes[0] || null);
    }

    if (onDeleteNote) {
      try {
        await onDeleteNote(noteId);
      } catch (error) {
        console.error("Failed to delete note:", error);
      }
    }

    setDeleteNoteId(null);
  };

  return (
    <div className="border rounded-xl h-[700px] flex overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r bg-muted/10 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notes</h3>
            <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notes found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotes.map(note => (
                <button
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg transition-colors group",
                    "hover:bg-muted",
                    selectedNote?.id === note.id && "bg-primary/10 hover:bg-primary/15"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {note.is_favorite && (
                          <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                        )}
                        <h4 className="font-medium text-sm truncate">{note.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {note.content.substring(0, 60)}...
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(note.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Star className={cn(
                        "h-4 w-4",
                        note.is_favorite ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                      )} />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {!selectedNote ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Select a note or create a new one</p>
            </div>
          </div>
        ) : (
          <>
            {/* Note Header */}
            <div className="p-6 border-b flex items-start justify-between">
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-2xl font-bold border-0 p-0 h-auto focus-visible:ring-0"
                    placeholder="Note title"
                  />
                ) : (
                  <h2 className="text-3xl font-bold">{selectedNote.title}</h2>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedNote.last_edited_by && `Last edited by ${selectedNote.last_edited_by} • `}
                  {new Date(selectedNote.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit}>
                      <Check className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => handleToggleFavorite(selectedNote.id)}>
                      <Star className={cn(
                        "h-4 w-4",
                        selectedNote.is_favorite && "fill-yellow-500 text-yellow-500"
                      )} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleStartEdit}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteNoteId(selectedNote.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Note Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isEditing ? (
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[500px] font-mono text-sm resize-none"
                  placeholder="Write your note here... (Markdown supported)"
                />
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {selectedNote.content.split('\n').map((line, idx) => {
                    // Simple markdown rendering
                    if (line.startsWith('# ')) {
                      return <h1 key={idx} className="text-2xl font-bold mt-6 mb-4">{line.substring(2)}</h1>;
                    } else if (line.startsWith('## ')) {
                      return <h2 key={idx} className="text-xl font-bold mt-4 mb-3">{line.substring(3)}</h2>;
                    } else if (line.startsWith('### ')) {
                      return <h3 key={idx} className="text-lg font-bold mt-3 mb-2">{line.substring(4)}</h3>;
                    } else if (line.startsWith('- ')) {
                      return <li key={idx} className="ml-4">{line.substring(2)}</li>;
                    } else if (line.trim() === '') {
                      return <br key={idx} />;
                    } else {
                      return <p key={idx} className="mb-2">{line}</p>;
                    }
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Note Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
            <DialogDescription>
              Add a new note to organize your trip information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Note Title</label>
              <Input
                placeholder="e.g., Restaurant Recommendations"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={!newNoteTitle.trim()}>
              Create Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteNoteId} onOpenChange={() => setDeleteNoteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this note. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteNoteId && handleDeleteNote(deleteNoteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
