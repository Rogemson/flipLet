"use client"

import type React from "react"
import Image from "next/image"

import { useState, useRef } from "react"
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
import { Plus, Minus, Upload, X, ImageIcon } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import type { Flashcard } from "@/app/page"
import { MathRenderer } from "@/components/math-renderer"

export type CardType = "basic" | "multiple-choice" | "true-false"

export interface ExtendedFlashcard extends Flashcard {
  type: CardType
  options?: string[]
  correctAnswer?: number | boolean
  frontImage?: string
  backImage?: string
  requiresTyping?: boolean
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
  const [frontImage, setFrontImage] = useState<string>("")
  const [backImage, setBackImage] = useState<string>("")
  const [requiresTyping, setRequiresTyping] = useState(false)

  const frontImageRef = useRef<HTMLInputElement>(null)
  const backImageRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setCardType("basic")
    setFront("")
    setBack("")
    setOptions(["", "", "", ""])
    setCorrectAnswer(0)
    setTrueFalseAnswer(true)
    setFrontImage("")
    setBackImage("")
    setRequiresTyping(false)
  }

  const handleImageUpload = (file: File, side: "front" | "back") => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (side === "front") {
        setFrontImage(result)
      } else {
        setBackImage(result)
      }
    }
    reader.readAsDataURL(file)
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
          frontImage: frontImage || undefined,
          backImage: backImage || undefined,
        }
        break
      case "true-false":
        cardData = {
          front: front.trim(),
          back: trueFalseAnswer ? "True" : "False",
          type: cardType,
          correctAnswer: trueFalseAnswer,
          frontImage: frontImage || undefined,
          backImage: backImage || undefined,
        }
        break
      default:
        if (!back.trim()) return
        cardData = {
          front: front.trim(),
          back: back.trim(),
          type: cardType,
          frontImage: frontImage || undefined,
          backImage: backImage || undefined,
          requiresTyping: requiresTyping,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Flashcard</DialogTitle>
          <DialogDescription>
            Create a new flashcard with different question types. You can add images and use LaTeX for formulas (e.g.,
            $$E = mc^2$$).
          </DialogDescription>
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
                    ? "Enter your question... (Use $$formula$$ for math)"
                    : cardType === "multiple-choice"
                      ? "Enter your multiple choice question... (Use $$formula$$ for math)"
                      : "Enter a true or false statement... (Use $$formula$$ for math)"
                }
                rows={3}
                className="mt-1"
                required
              />

              {/* Front Image Upload */}
              <div className="mt-2 flex items-center gap-2">
                <input
                  ref={frontImageRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "front")}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => frontImageRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="w-3 h-3" />
                  Add Image
                </Button>
                {frontImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFrontImage("")}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                    Remove
                  </Button>
                )}
              </div>

              {frontImage && (
                <div className="mt-2">
                  <Image
                    src={frontImage || "/placeholder.svg"}
                    alt="Front side preview"
                    width={200}
                    height={120}
                    objectFit="contain"
                    className="max-w-full h-32 object-contain rounded border"
                    unoptimized
                  />
                </div>
              )}
            </div>

            {/* Card Type Specific Fields */}
            {cardType === "basic" && (
              <div>
                <Label htmlFor="back">Answer</Label>
                <Textarea
                  id="back"
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder="Enter the answer... (Use $$formula$$ for math)"
                  rows={3}
                  className="mt-1"
                  required
                />

                {/* Back Image Upload */}
                <div className="mt-2 flex items-center gap-2">
                  <input
                    ref={backImageRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "back")}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => backImageRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="w-3 h-3" />
                    Add Image
                  </Button>
                  {backImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setBackImage("")}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                      Remove
                    </Button>
                  )}
                </div>

                {backImage && (
                  <div className="mt-2">
                    <Image
                      src={backImage || "/placeholder.svg"}
                      alt="Back side preview"
                      width={200}
                      height={120}
                      objectFit="contain"
                      className="max-w-full h-32 object-contain rounded border"
                      unoptimized
                    />
                  </div>
                )}

                {/* Requires Typing Checkbox */}
                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox
                    id="requires-typing"
                    checked={requiresTyping}
                    onCheckedChange={(checked) => setRequiresTyping(!!checked)}
                  />
                  <Label
                    htmlFor="requires-typing"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Require typed answer in study mode
                  </Label>
                </div>
              </div>
            )}

            {cardType === "multiple-choice" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Answer Options (Use $$formula$$ for math)</Label>
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
                    {(frontImage || backImage) && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <ImageIcon className="w-3 h-3" />
                        Has Images
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Question:</p>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        <MathRenderer content={front || "Your question will appear here..."} />
                        {frontImage && (
                          <Image
                            src={frontImage || "/placeholder.svg"}
                            alt="Question preview"
                            width={150}
                            height={90}
                            objectFit="contain"
                            className="mt-2 max-w-full h-20 object-contain rounded"
                            unoptimized
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Answer:</p>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        <MathRenderer
                          content={
                            cardType === "basic"
                              ? back || "Your answer will appear here..."
                              : cardType === "multiple-choice"
                                ? options[correctAnswer] || "Select correct option..."
                                : trueFalseAnswer
                                  ? "True"
                                  : "False"
                          }
                        />
                        {backImage && cardType === "basic" && (
                          <Image
                            src={backImage || "/placeholder.svg"}
                            alt="Answer preview"
                            width={150} 
                            height={90} 
                            objectFit="contain"
                            className="mt-2 max-w-full h-20 object-contain rounded"
                            unoptimized
                          />
                        )}
                      </div>
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
