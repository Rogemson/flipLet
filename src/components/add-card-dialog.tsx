"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus } from "lucide-react"
import type { Flashcard } from "@/app/page"

export type CardType = "basic" | "multiple-choice" | "true-false"

export interface ExtendedFlashcard extends Flashcard {
  type: CardType
  options?: string[]
  correctAnswer?: number | boolean
}

interface AddCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCard: (card: Omit<ExtendedFlashcard, "id" | "createdAt">) => void
}

export function AddCardDialog({ open, onOpenChange, onAddCard }: AddCardDialogProps) {
  const [cardType, setCardType] = useState<CardType>("basic")
  const [front, setFront] = useState("")
  const [back, setBack] = useState("")
  const [options, setOptions] = useState<string[]>(["", "", "", ""])
  const [correctAnswer, setCorrectAnswer] = useState<number>(0)
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean>(true)

  const resetForm = () => {
    setCardType("basic")
    setFront("")
    setBack("")
    setOptions(["", "", "", ""])
    setCorrectAnswer(0)
    setTrueFalseAnswer(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!front.trim()) return

    let cardData: Omit<ExtendedFlashcard, "id" | "createdAt">

    switch (cardType) {
      case "multiple-choice":
        if (options.some((opt) => !opt.trim())) return
        cardData = {
          front: front.trim(),
          back: options[correctAnswer],
          type: cardType,
          options: options.map((opt) => opt.trim()),
          correctAnswer,
        }
        break
      case "true-false":
        cardData = {
          front: front.trim(),
          back: trueFalseAnswer ? "True" : "False",
          type: cardType,
          correctAnswer: trueFalseAnswer,
        }
        break
      default:
        if (!back.trim()) return
        cardData = {
          front: front.trim(),
          back: back.trim(),
          type: cardType,
        }
    }

    onAddCard(cardData)
    resetForm()
    onOpenChange(false)
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
      if (correctAnswer >= newOptions.length) {
        setCorrectAnswer(newOptions.length - 1)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Flashcard</DialogTitle>
          <DialogDescription>Create a new flashcard with different question types.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Card Type Selection */}
            <div>
              <Label htmlFor="card-type">Card Type</Label>
              <Select value={cardType} onValueChange={(value: CardType) => setCardType(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select card type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (Question & Answer)</SelectItem>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="true-false">True or False</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Question/Front */}
            <div>
              <Label htmlFor="front">
                {cardType === "basic" ? "Question" : cardType === "multiple-choice" ? "Question" : "Statement"}
              </Label>
              <Textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder={
                  cardType === "basic"
                    ? "Enter your question..."
                    : cardType === "multiple-choice"
                      ? "Enter your multiple choice question..."
                      : "Enter a true or false statement..."
                }
                rows={3}
                className="mt-1"
                required
              />
            </div>

            {/* Card Type Specific Fields */}
            {cardType === "basic" && (
              <div>
                <Label htmlFor="back">Answer</Label>
                <Textarea
                  id="back"
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder="Enter the answer..."
                  rows={3}
                  className="mt-1"
                  required
                />
              </div>
            )}

            {cardType === "multiple-choice" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Answer Options</Label>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                      disabled={options.length >= 6}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="radio"
                          name="correct-answer"
                          checked={correctAnswer === index}
                          onChange={() => setCorrectAnswer(index)}
                          className="w-4 h-4"
                        />
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          required
                        />
                      </div>
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1">Select the correct answer by clicking the radio button</p>
              </div>
            )}

            {cardType === "true-false" && (
              <div>
                <Label>Correct Answer</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="true-false"
                      checked={trueFalseAnswer === true}
                      onChange={() => setTrueFalseAnswer(true)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">True</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="true-false"
                      checked={trueFalseAnswer === false}
                      onChange={() => setTrueFalseAnswer(false)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">False</span>
                  </label>
                </div>
              </div>
            )}

            {/* Preview */}
            <div>
              <Label className="text-sm font-medium">Preview</Label>
              <Card className="mt-2 bg-slate-50 dark:bg-slate-900/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {cardType === "basic"
                        ? "Basic"
                        : cardType === "multiple-choice"
                          ? "Multiple Choice"
                          : "True/False"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Question:</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {front || "Your question will appear here..."}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Answer:</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {cardType === "basic"
                          ? back || "Your answer will appear here..."
                          : cardType === "multiple-choice"
                            ? options[correctAnswer] || "Select correct option..."
                            : trueFalseAnswer
                              ? "True"
                              : "False"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Card</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
