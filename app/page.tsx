"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { addNote, getAllNotes, deleteNote, clearAllNotes } from "@/lib/indexeddb";
import { Trash2, Database, Wifi, WifiOff } from "lucide-react";
import InstallPrompt from "@/components/InstallPrompt";

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load notes from IndexedDB
  const loadNotes = async () => {
    try {
      const allNotes = await getAllNotes();
      setNotes(allNotes);
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  // Handle online/offline status
  useEffect(() => {
    setMounted(true);
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    loadNotes();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <Database className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Add a new note
  const handleAddNote = async () => {
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    try {
      await addNote(title, content);
      setTitle("");
      setContent("");
      await loadNotes();
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete a note
  const handleDeleteNote = async (id: number) => {
    try {
      await deleteNote(id);
      await loadNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  // Clear all notes
  const handleClearAll = async () => {
    if (confirm("Are you sure you want to delete all notes?")) {
      try {
        await clearAllNotes();
        await loadNotes();
      } catch (error) {
        console.error("Error clearing notes:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Database className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Fully JS AI Model</h1>
          </div>
          <p className="text-muted-foreground">
            Testing shadcn/ui components with IndexedDB and PWA offline support
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant={isOnline ? "default" : "destructive"} className="gap-2">
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              {isOnline ? "Online" : "Offline"}
            </Badge>
            <Badge variant="outline">PWA Enabled</Badge>
            <Badge variant="outline">IndexedDB Active</Badge>
            <InstallPrompt />
          </div>
        </div>

        {/* Add Note Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Note</CardTitle>
            <CardDescription>
              Add a note that will be stored in IndexedDB and work offline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Enter note title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Input
                placeholder="Enter note content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={handleAddNote} disabled={loading || !title.trim() || !content.trim()}>
              {loading ? "Adding..." : "Add Note"}
            </Button>
            {notes.length > 0 && (
              <Button variant="destructive" onClick={handleClearAll}>
                Clear All
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Notes List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Database className="w-6 h-6" />
            Stored Notes ({notes.length})
          </h2>
          
          {notes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No notes yet. Create your first note above!
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <Card key={note.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{note.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteNote(note.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardDescription>
                      {new Date(note.createdAt).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{note.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Component Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>shadcn/ui Components Showcase</CardTitle>
            <CardDescription>Testing various installed components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Buttons</h3>
              <div className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Badges</h3>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Input</h3>
              <Input placeholder="Type something..." />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
