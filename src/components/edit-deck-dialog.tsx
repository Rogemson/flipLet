"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddCardDialog, type ExtendedFlashcard } from "@/components/add-card-dialog"
import type { Deck } from "@/app/page"

interface EditDeckDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deck: Deck
  onUpdateDeck: (deck: Deck) => void
}

export function EditDeckDialog({ open, onOpenChange, deck, onUpdateDeck }: EditDeckDialogProps) {
  const [name, setName] = useState(deck.name)
  const [description, setDescription] = useState(deck.description)
  const [cards, setCards] = useState<ExtendedFlashcard[]>(
    deck.cards.map((card: ExtendedFlashcard) => ({
      ...card,
      type: (card.type ?? "basic") as ExtendedFlashcard["type"],
      options: card.options ?? [],
      correctAnswer: card.correctAnswer ?? undefined,
    }))
  )
  const [editingCard, setEditingCard] = useState<ExtendedFlashcard | null>(null)
  const [isEditingDeckInfo, setIsEditingDeckInfo] = useState(false)
  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false)

  useEffect(() => {
    setName(deck.name)
    setDescription(deck.description)
    setCards(
      deck.cards.map((card: ExtendedFlashcard) => ({
        ...card,
        type: (card.type ?? "basic") as ExtendedFlashcard["type"],
        options: card.options ?? [],
        correctAnswer: card.correctAnswer ?? undefined,
      }))
    )
    setIsEditingDeckInfo(false)
  }, [deck])

  const handleSave = () => {
    const updatedDeck: Deck = {
      ...deck,
      name: name.trim(),
      description: description.trim(),
      cards,
    }
    onUpdateDeck(updatedDeck)
    onOpenChange(false)
  }

  const addCard = (cardData: Omit<ExtendedFlashcard, "id" | "createdAt">) => {
    const newCard: ExtendedFlashcard = {
      ...cardData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    }
    setCards((prev) => [...prev, newCard])
  }

  const updateCard = (cardId: string, front: string, back: string) => {
    setCards((prev) =>
      prev.map((card) => (card.id === cardId ? { ...card, front: front.trim(), back: back.trim() } : card)),
    )
    setEditingCard(null)
  }

  const deleteCard = (cardId: string) => {
    setCards((prev) => prev.filter((card) => card.id !== cardId))
  }

  const saveDeckInfo = () => {
    setIsEditingDeckInfo(false)
  }

  const cancelDeckInfoEdit = () => {
    setName(deck.name)
    setDescription(deck.description)
    setIsEditingDeckInfo(false)
  }

  const getCardTypeLabel = (type: string) => {
    switch (type) {
      case "multiple-choice":
        return "Multiple Choice"
      case "true-false":
        return "True/False"
      default:
        return "Basic"
    }
  }

  const getCardTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "multiple-choice":
        return "default"
      case "true-false":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Deck</DialogTitle>
            <DialogDescription>Modify your deck details and manage flashcards.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
              {/* Left Panel - Deck Info */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Deck Information</h3>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingDeckInfo(!isEditingDeckInfo)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>

                  {isEditingDeckInfo ? (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="edit-name" className="text-sm">
                          Deck Name
                        </Label>
                        <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="edit-description" className="text-sm">
                          Description
                        </Label>
                        <Textarea
                          id="edit-description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={saveDeckInfo} size="sm">
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                        <Button onClick={cancelDeckInfoEdit} variant="outline" size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs text-slate-500 dark:text-slate-400">NAME</Label>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{name}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500 dark:text-slate-400">DESCRIPTION</Label>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{description || "No description"}</p>
                      </div>
                      <div className="pt-2">
                        <Badge variant="secondary" className="text-xs">
                          {cards.length} cards
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                {/* Add Card Button */}
                <Button onClick={() => setIsAddCardDialogOpen(true)} className="w-full gap-2" variant="outline">
                  <Plus className="w-4 h-4" />
                  Add New Card
                </Button>
              </div>

              {/* Right Panel - Cards */}
              <div className="lg:col-span-3 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Flashcards</h3>
                  <Badge variant="secondary">{cards.length} cards</Badge>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {cards.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-8">
                        <p className="text-sm">No flashcards yet.</p>
                        <p className="text-xs mt-1">Click `&quot;`Add New Card`&quot;` to get started!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pr-2">
                      {cards.map((card) => (
                        <Card key={card.id} className="hover:shadow-md transition-shadow">
                          {editingCard?.id === card.id ? (
                            <EditCardForm card={card} onSave={updateCard} onCancel={() => setEditingCard(null)} />
                          ) : (
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <Badge variant={getCardTypeBadgeVariant(card.type)} className="text-xs">
                                  {getCardTypeLabel(card.type)}
                                </Badge>
                                <div className="flex gap-1">
                                  <Button
                                    onClick={() => setEditingCard(card)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    onClick={() => deleteCard(card.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-md p-3">
                                  <Label className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    {card.type === "true-false" ? "STATEMENT" : "QUESTION"}
                                  </Label>
                                  <p className="text-sm mt-1 text-slate-900 dark:text-slate-100 leading-relaxed">
                                    {card.front}
                                  </p>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-md p-3">
                                  <Label className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    ANSWER
                                  </Label>
                                  <p className="text-sm mt-1 text-slate-900 dark:text-slate-100 leading-relaxed">
                                    {card.back}
                                  </p>

                                  {card.type === "multiple-choice" && card.options && (
                                    <div className="mt-2 space-y-1">
                                      <Label className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        OPTIONS
                                      </Label>
                                      {card.options.map((option, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                          <div
                                            className={`w-2 h-2 rounded-full ${index === card.correctAnswer ? "bg-green-500" : "bg-slate-300"}`}
                                          />
                                          <span className="text-xs text-slate-600 dark:text-slate-400">{option}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddCardDialog open={isAddCardDialogOpen} onOpenChange={setIsAddCardDialogOpen} onAddCard={addCard} />
    </>
  )
}

interface EditCardFormProps {
  card: ExtendedFlashcard
  onSave: (cardId: string, front: string, back: string) => void
  onCancel: () => void
}

function EditCardForm({ card, onSave, onCancel }: EditCardFormProps) {
  const [front, setFront] = useState(card.front)
  const [back, setBack] = useState(card.back)

  const handleSave = () => {
    if (front.trim() && back.trim()) {
      onSave(card.id, front, back)
    }
  }

  return (
    <CardContent className="p-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor={`edit-front-${card.id}`} className="text-xs text-slate-500 font-medium">
            QUESTION
          </Label>
          <Textarea
            id={`edit-front-${card.id}`}
            value={front}
            onChange={(e) => setFront(e.target.value)}
            rows={3}
            className="mt-1 text-sm"
          />
        </div>

        <div>
          <Label htmlFor={`edit-back-${card.id}`} className="text-xs text-slate-500 font-medium">
            ANSWER
          </Label>
          <Textarea
            id={`edit-back-${card.id}`}
            value={back}
            onChange={(e) => setBack(e.target.value)}
            rows={3}
            className="mt-1 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end mt-4">
        <Button onClick={handleSave} size="sm" disabled={!front.trim() || !back.trim()}>
          <Save className="w-3 h-3 mr-1" />
          Save
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm">
          Cancel
        </Button>
      </div>
    </CardContent>
  )
}
