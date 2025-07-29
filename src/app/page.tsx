"use client"

import { useState, useEffect } from "react"
import { Plus, BookOpen, Edit, Trash2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateDeckDialog } from "@/components/create-deck-dialog"
import { StudyMode } from "@/components/study-mode"
import { EditDeckDialog } from "@/components/edit-deck-dialog"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import type { ExtendedFlashcard } from "@/components/add-card-dialog"
import { Github, Linkedin, Twitter, Facebook } from "lucide-react"

export interface Flashcard {
  id: string
  front: string
  back: string
  createdAt: Date
}

export interface Deck {
  id: string
  name: string
  description: string
  cards: ExtendedFlashcard[]
  createdAt: Date
  lastStudied?: Date
}

export default function Home() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [studyDeck, setStudyDeck] = useState<Deck | null>(null)

  // Load decks from localStorage on mount
  useEffect(() => {
    const savedDecks = localStorage.getItem("flashcard-decks")
    if (savedDecks) {
      const parsedDecks = JSON.parse(savedDecks).map((deck: any) => ({
        ...deck,
        createdAt: new Date(deck.createdAt),
        lastStudied: deck.lastStudied ? new Date(deck.lastStudied) : undefined,
        cards: deck.cards.map((card: any) => ({
          ...card,
          createdAt: new Date(card.createdAt),
          type: card.type || "basic",
        })),
      }))
      setDecks(parsedDecks)
    }
  }, [])

  // Save decks to localStorage whenever decks change
  useEffect(() => {
    localStorage.setItem("flashcard-decks", JSON.stringify(decks))
  }, [decks])

  const createDeck = (name: string, description: string) => {
    const newDeck: Deck = {
      id: crypto.randomUUID(),
      name,
      description,
      cards: [],
      createdAt: new Date(),
    }
    setDecks((prev) => [...prev, newDeck])
  }

  const updateDeck = (updatedDeck: Deck) => {
    setDecks((prev) => prev.map((deck) => (deck.id === updatedDeck.id ? updatedDeck : deck)))
  }

  const deleteDeck = (deckId: string) => {
    setDecks((prev) => prev.filter((deck) => deck.id !== deckId))
  }

  const startStudying = (deck: Deck) => {
    if (deck.cards.length === 0) return
    const updatedDeck = { ...deck, lastStudied: new Date() }
    updateDeck(updatedDeck)
    setStudyDeck(updatedDeck)
  }

  const editDeck = (deck: Deck) => {
    setSelectedDeck(deck)
    setIsEditDialogOpen(true)
  }

  if (studyDeck) {
    return <StudyMode deck={studyDeck} onExit={() => setStudyDeck(null)} onUpdateDeck={updateDeck} />
  }

  return (
    <div className="min-h-screen dark:black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Flashcard Reviewer</h1>
            <p className="text-slate-600 dark:text-slate-400">Create and study flashcards with ease</p>
          </div>

          {/* Buttons and Socials */}
          <div className="flex items-center gap-4 flex-wrap">
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2" size="lg">
              <Plus className="w-5 h-5" />
              Create Deck
            </Button>

            <Button variant="outline" size="lg" onClick={() => window.open("https://your-link.com", "_blank")}>
              Share App
            </Button>

            <div className="flex items-center gap-3 ml-2">
              <a
                href="https://github.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/in/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-300 hover:text-blue-700 transition"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-300 hover:text-blue-500 transition"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-300 hover:text-blue-500 transition"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {decks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No flashcard decks yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Create your first deck to start studying</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Deck
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <Card key={deck.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{deck.name}</CardTitle>
                      <CardDescription className="text-sm">{deck.description}</CardDescription>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button variant="ghost" size="sm" onClick={() => editDeck(deck)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDeck(deck.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="gap-1">
                      <BookOpen className="w-3 h-3" />
                      {deck.cards.length} cards
                    </Badge>
                    {deck.lastStudied && (
                      <span className="text-xs text-slate-500">
                        Last studied: {deck.lastStudied.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <Button
                    className="w-full gap-2"
                    onClick={() => startStudying(deck)}
                    disabled={deck.cards.length === 0}
                  >
                    <Play className="w-4 h-4" />
                    {deck.cards.length === 0 ? "No cards to study" : "Start Studying"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <CreateDeckDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onCreateDeck={createDeck} />

        {selectedDeck && (
          <EditDeckDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            deck={selectedDeck}
            onUpdateDeck={updateDeck}
          />
        )}
      </div>
    </div>
  )
}
