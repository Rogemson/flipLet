"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, RotateCcw, ChevronLeft, ChevronRight, Eye, EyeOff, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import type { Deck } from "@/app/page"
import type { ExtendedFlashcard } from "@/components/add-card-dialog"

interface StudyModeProps {
  deck: Deck
  onExit: () => void
  onUpdateDeck: (deck: Deck) => void
}

export function StudyMode({ deck, onExit, onUpdateDeck }: StudyModeProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [studiedCards, setStudiedCards] = useState<Set<string>>(new Set())
  const [selectedAnswer, setSelectedAnswer] = useState<number | boolean | null>(null)
  const [showResult, setShowResult] = useState(false)

  const currentCard = deck.cards[currentCardIndex] as ExtendedFlashcard
  const progress = ((currentCardIndex + 1) / deck.cards.length) * 100

  useEffect(() => {
    setIsFlipped(false)
    setSelectedAnswer(null)
    setShowResult(false)
  }, [currentCardIndex])

  const nextCard = () => {
    if (currentCardIndex < deck.cards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1)
      setStudiedCards((prev) => new Set([...prev, currentCard.id]))
    }
  }

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1)
    }
  }

  const resetStudy = () => {
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setStudiedCards(new Set())
    setSelectedAnswer(null)
    setShowResult(false)
  }

  const handleExit = () => {
    // Update the deck's last studied time
    const updatedDeck = { ...deck, lastStudied: new Date() }
    onUpdateDeck(updatedDeck)
    onExit()
  }

  const handleAnswerSelect = (answer: number | boolean) => {
    setSelectedAnswer(answer)
    setShowResult(true)
  }

  const handleFlip = () => {
    if (currentCard.type === "basic") {
      setIsFlipped(!isFlipped)
    }
  }

  const isCorrectAnswer = () => {
    if (currentCard.type === "multiple-choice") {
      return selectedAnswer === currentCard.correctAnswer
    }
    if (currentCard.type === "true-false") {
      return selectedAnswer === currentCard.correctAnswer
    }
    return false
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

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-950 dark:to-black flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">No cards to study</h2>
            <Button onClick={handleExit}>Back to Decks</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen dark:black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleExit} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{deck.name}</h1>
              <p className="text-slate-600 dark:text-slate-400">
                Card {currentCardIndex + 1} of {deck.cards.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" onClick={resetStudy} className="gap-2 bg-transparent">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Progress</span>
            <Badge variant="secondary">
              {studiedCards.size} / {deck.cards.length} studied
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Flashcard */}
        <div className="flex justify-center mb-8">
          <Card className="w-full max-w-2xl min-h-[400px] transition-all duration-300 hover:shadow-lg">
            <CardContent className="h-full flex flex-col p-8">
              <div className="flex items-center justify-between mb-6">
                <Badge variant="outline" className="text-xs">
                  {getCardTypeLabel(currentCard.type)}
                </Badge>
                {currentCard.type === "basic" && (
                  <div className="flex items-center gap-2">
                    <Badge variant={isFlipped ? "default" : "secondary"}>{isFlipped ? "Answer" : "Question"}</Badge>
                    <Button variant="ghost" size="sm" onClick={handleFlip}>
                      {isFlipped ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {/* Question */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3 text-slate-900 dark:text-slate-100">
                    {currentCard.type === "true-false" ? "Statement:" : "Question:"}
                  </h3>
                  <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">{currentCard.front}</p>
                </div>

                {/* Answer Section */}
                {currentCard.type === "basic" && (
                  <div className={`transition-opacity duration-300 ${isFlipped ? "opacity-100" : "opacity-0"}`}>
                    {isFlipped && (
                      <div>
                        <h3 className="text-lg font-medium mb-3 text-slate-900 dark:text-slate-100">Answer:</h3>
                        <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">{currentCard.back}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Multiple Choice Options */}
                {currentCard.type === "multiple-choice" && currentCard.options && (
                  <div>
                    <h3 className="text-lg font-medium mb-4 text-slate-900 dark:text-slate-100">Choose your answer:</h3>
                    <div className="space-y-3">
                      {currentCard.options.map((option, index) => (
                        <Button
                          key={index}
                          variant={
                            showResult
                              ? index === currentCard.correctAnswer
                                ? "default"
                                : selectedAnswer === index
                                  ? "destructive"
                                  : "outline"
                              : selectedAnswer === index
                                ? "default"
                                : "outline"
                          }
                          className="w-full justify-start text-left h-auto p-4 relative"
                          onClick={() => !showResult && handleAnswerSelect(index)}
                          disabled={showResult}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <span className="font-medium text-sm">{String.fromCharCode(65 + index)}.</span>
                            <span className="flex-1">{option}</span>
                            {showResult && index === currentCard.correctAnswer && (
                              <Check className="w-4 h-4 text-green-600" />
                            )}
                            {showResult && selectedAnswer === index && index !== currentCard.correctAnswer && (
                              <X className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                    {showResult && (
                      <div className="mt-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <p className="text-sm font-medium mb-2">
                          {isCorrectAnswer() ? (
                            <span className="text-green-600 dark:text-green-400">✓ Correct!</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">✗ Incorrect</span>
                          )}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          The correct answer is: <strong>
                            {typeof currentCard.correctAnswer === "number"
                              ? currentCard.options[currentCard.correctAnswer]
                              : ""}
                          </strong>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* True/False Options */}
                {currentCard.type === "true-false" && (
                  <div>
                    <h3 className="text-lg font-medium mb-4 text-slate-900 dark:text-slate-100">
                      Is this statement true or false?
                    </h3>
                    <div className="flex gap-4">
                      <Button
                        variant={
                          showResult
                            ? currentCard.correctAnswer === true
                              ? "default"
                              : selectedAnswer === true
                                ? "destructive"
                                : "outline"
                            : selectedAnswer === true
                              ? "default"
                              : "outline"
                        }
                        className="flex-1 h-16 text-lg relative"
                        onClick={() => !showResult && handleAnswerSelect(true)}
                        disabled={showResult}
                      >
                        True
                        {showResult && currentCard.correctAnswer === true && (
                          <Check className="w-5 h-5 text-green-600 absolute top-2 right-2" />
                        )}
                        {showResult && selectedAnswer === true && currentCard.correctAnswer !== true && (
                          <X className="w-5 h-5 text-red-600 absolute top-2 right-2" />
                        )}
                      </Button>
                      <Button
                        variant={
                          showResult
                            ? currentCard.correctAnswer === false
                              ? "default"
                              : selectedAnswer === false
                                ? "destructive"
                                : "outline"
                            : selectedAnswer === false
                              ? "default"
                              : "outline"
                        }
                        className="flex-1 h-16 text-lg relative"
                        onClick={() => !showResult && handleAnswerSelect(false)}
                        disabled={showResult}
                      >
                        False
                        {showResult && currentCard.correctAnswer === false && (
                          <Check className="w-5 h-5 text-green-600 absolute top-2 right-2" />
                        )}
                        {showResult && selectedAnswer === false && currentCard.correctAnswer !== false && (
                          <X className="w-5 h-5 text-red-600 absolute top-2 right-2" />
                        )}
                      </Button>
                    </div>
                    {showResult && (
                      <div className="mt-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <p className="text-sm font-medium mb-2">
                          {isCorrectAnswer() ? (
                            <span className="text-green-600 dark:text-green-400">✓ Correct!</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">✗ Incorrect</span>
                          )}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          The correct answer is: <strong>{currentCard.correctAnswer ? "True" : "False"}</strong>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Basic card instruction */}
                {currentCard.type === "basic" && !isFlipped && (
                  <p className="text-sm text-slate-500 mt-6 text-center">Click the eye icon to reveal the answer</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={prevCard}
            disabled={currentCardIndex === 0}
            className="gap-2 bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <span className="text-sm text-slate-600 dark:text-slate-400 px-4">
            {currentCardIndex + 1} / {deck.cards.length}
          </span>

          <Button onClick={nextCard} disabled={currentCardIndex === deck.cards.length - 1} className="gap-2">
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Study Complete */}
        {currentCardIndex === deck.cards.length - 1 && studiedCards.has(currentCard.id) && (
          <div className="text-center mt-8">
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Study Session Complete! 🎉</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  You`&apos;`ve reviewed all {deck.cards.length} cards in this deck.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={resetStudy} variant="outline">
                    Study Again
                  </Button>
                  <Button onClick={handleExit}>Back to Decks</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
