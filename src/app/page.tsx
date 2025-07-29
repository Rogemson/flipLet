"use client"

import { useState, useEffect } from "react"
import { Plus, BookOpen, Edit, Trash2, Play, Github, Facebook, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateDeckDialog } from "@/components/create-deck-dialog"
import { StudyMode } from "@/components/study-mode"
import { EditDeckDialog } from "@/components/edit-deck-dialog"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import type { ExtendedFlashcard } from "@/components/add-card-dialog"

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

  useEffect(() => {
    const savedDecks = localStorage.getItem("flashcard-decks")
    if (savedDecks) {
      const parsedDecks = (JSON.parse(savedDecks) as Deck[]).map((deck: Deck) => ({
        ...deck,
        createdAt: new Date(deck.createdAt),
        lastStudied: deck.lastStudied ? new Date(deck.lastStudied) : undefined,
        cards: deck.cards.map((card: ExtendedFlashcard) => ({
          ...card,
          createdAt: new Date(card.createdAt),
          type: card.type || "basic",
          requiresTyping: card.requiresTyping || false,
        })),
      }))
      setDecks(parsedDecks)
    }
  }, [])

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
        <div className="mb-8">
          

          {/* Header section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">FlipLet</h1>
              <p className="text-slate-600 dark:text-slate-400">Create and study flashcards</p>
            </div>
            
            {/* Mobile: Social links on top */}
            <div className="flex justify-center mb-4 md:hidden">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://github.com/rogemson" target="_blank" rel="noopener noreferrer" title="GitHub">
                    <Github className="w-4 h-4" />
                  </a>
                </Button>
                
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://facebook.com/rgmsnmln" target="_blank" rel="noopener noreferrer" title="Twitter">
                    <Facebook className="w-4 h-4" />
                  </a>
                </Button>
                
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://www.linkedin.com/in/rogemson-molina/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                    <Linkedin className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-end gap-3">
              {/* Desktop: Social links inline */}
              <div className="hidden md:flex items-center gap-1">
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" title="GitHub">
                    <Github className="w-4 h-4" />
                  </a>
                </Button>
                
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" title="Twitter">
                    <Facebook className="w-4 h-4" />
                  </a>
                </Button>
                
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                    <Linkedin className="w-4 h-4" />
                  </a>
                </Button>
              </div>
              
              <ThemeToggle />
              
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2" size="lg">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Create Deck</span>
                <span className="sm:hidden">Create</span>
              </Button>
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