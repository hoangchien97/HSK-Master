/**
 * Practice utility functions
 * Shared helpers used across practice tab components.
 */

import { getDisplayMeaning } from "@/enums/portal/common"
import type { IVocabularyItem } from "@/interfaces/portal/practice"

/* ───────── Generic shuffle (Fisher-Yates) ───────── */

export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/* ───────── Quiz question generation ───────── */

export interface QuizQuestion {
  vocab: IVocabularyItem
  type: "MCQ_MEANING" | "MCQ_HANZI" | "MCQ_PINYIN" | "MCQ_EXAMPLE"
  prompt: string
  promptSub?: string
  options: { key: string; label: string }[]
  correctKey: string
}

export function generateQuizQuestions(vocabs: IVocabularyItem[]): QuizQuestion[] {
  if (vocabs.length === 0) return []

  const questions: QuizQuestion[] = []
  const baseTypes: QuizQuestion["type"][] = ["MCQ_MEANING", "MCQ_HANZI", "MCQ_PINYIN"]
  const withExamples = vocabs.filter((v) => v.exampleSentence)
  const shuffledVocabs = shuffleArray(vocabs)

  for (const vocab of shuffledVocabs) {
    const availableTypes = [...baseTypes]
    if (vocab.exampleSentence && withExamples.length >= 2) {
      availableTypes.push("MCQ_EXAMPLE")
    }
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)]

    const others = vocabs.filter((v) => v.id !== vocab.id)
    const distractors = shuffleArray(others).slice(0, Math.min(3, others.length))

    let prompt: string
    let promptSub: string | undefined
    let correctLabel: string
    let distractorLabels: string[]

    switch (type) {
      case "MCQ_MEANING":
        prompt = vocab.word
        promptSub = "Chọn nghĩa tiếng Việt"
        correctLabel = getDisplayMeaning(vocab)
        distractorLabels = distractors.map((d) => getDisplayMeaning(d))
        break
      case "MCQ_HANZI":
        prompt = getDisplayMeaning(vocab)
        promptSub = "Chọn Hán tự tương ứng"
        correctLabel = vocab.word
        distractorLabels = distractors.map((d) => d.word)
        break
      case "MCQ_PINYIN":
        prompt = vocab.word
        promptSub = "Chọn phiên âm đúng"
        correctLabel = vocab.pinyin || ""
        distractorLabels = distractors.map((d) => d.pinyin || "")
        break
      case "MCQ_EXAMPLE":
        prompt = vocab.exampleSentence || vocab.word
        promptSub = vocab.examplePinyin || "Từ nào xuất hiện trong câu trên?"
        correctLabel = `${vocab.word} — ${getDisplayMeaning(vocab)}`
        distractorLabels = distractors.map((d) => `${d.word} — ${getDisplayMeaning(d)}`)
        break
    }

    questions.push({
      vocab,
      type,
      prompt,
      promptSub,
      options: shuffleArray([
        { key: "correct", label: correctLabel },
        ...distractorLabels.map((label, i) => ({ key: `d${i}`, label })),
      ]),
      correctKey: "correct",
    })
  }

  return questions
}

/* ───────── Listen question generation ───────── */

export interface ListenQuestion {
  vocab: IVocabularyItem
  options: { key: string; label: string }[]
  correctKey: string
}

export function generateListenQuestions(vocabs: IVocabularyItem[]): ListenQuestion[] {
  if (vocabs.length < 2) return []

  return shuffleArray(vocabs).map((vocab) => {
    const others = vocabs.filter((v) => v.id !== vocab.id)
    const distractors = shuffleArray(others).slice(0, Math.min(3, others.length))

    const allOptions = shuffleArray([
      { key: "correct", label: getDisplayMeaning(vocab) },
      ...distractors.map((d, i) => ({ key: `d${i}`, label: getDisplayMeaning(d) })),
    ])

    return { vocab, options: allOptions, correctKey: "correct" }
  })
}
