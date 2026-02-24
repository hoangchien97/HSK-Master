"use client"

import { useCallback, useRef, useEffect, useState } from "react"

/**
 * Custom hook for Text-to-Speech using the Web Speech API.
 * Supports Chinese (zh-CN) pronunciation for vocabulary practice.
 *
 * This project uses Web Speech API exclusively — no audio files.
 */

interface SpeechOptions {
  /** Speech rate (0.1 - 10). Default 0.8 for clearer Chinese pronunciation */
  rate?: number
  /** Pitch (0 - 2). Default 1 */
  pitch?: number
  /** Volume (0 - 1). Default 1 */
  volume?: number
  /** BCP 47 language tag. Default "zh-CN" */
  lang?: string
}

const DEFAULT_OPTIONS: SpeechOptions = {
  rate: 0.8,
  pitch: 1,
  volume: 1,
  lang: "zh-CN",
}

/* ───────── Voice pre-loading ───────── */

let voicesReady = false
let cachedVoices: SpeechSynthesisVoice[] = []

function loadVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return
  cachedVoices = window.speechSynthesis.getVoices()
  if (cachedVoices.length > 0) voicesReady = true
}

// Eagerly try once at module load
if (typeof window !== "undefined") {
  loadVoices()
  if (!voicesReady && window.speechSynthesis) {
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices, { once: true })
  }
}

function getChineseVoice(): SpeechSynthesisVoice | null {
  if (!voicesReady) loadVoices()
  return (
    cachedVoices.find((v) => v.lang === "zh-CN") ??
    cachedVoices.find((v) => v.lang.startsWith("zh")) ??
    cachedVoices.find((v) => v.lang === "cmn-Hans-CN") ??
    null
  )
}

/* ───────── Hook ───────── */

export function useSpeech(options?: SpeechOptions) {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const [, setVoicesLoaded] = useState(voicesReady)

  // Ensure voices are loaded (Chrome fires voiceschanged async)
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    const handleVoicesChanged = () => {
      loadVoices()
      setVoicesLoaded(true)
    }
    if (!voicesReady) {
      window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged)
      // Safari workaround: try loading after a short delay
      const timer = setTimeout(() => {
        loadVoices()
        if (voicesReady) setVoicesLoaded(true)
      }, 100)
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged)
        clearTimeout(timer)
      }
    }
  }, [])

  /** Stop any currently playing speech */
  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [])

  /**
   * Speak text using browser TTS (Web Speech API).
   * Returns a Promise that resolves when speech ends.
   *
   * Must be called from a user gesture (click/tap) on most browsers.
   */
  const speak = useCallback(
    (text: string, overrides?: SpeechOptions): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (typeof window === "undefined" || !window.speechSynthesis) {
          reject(new Error("Speech synthesis not supported"))
          return
        }

        // Cancel any ongoing speech first
        window.speechSynthesis.cancel()

        const opts = { ...DEFAULT_OPTIONS, ...options, ...overrides }

        // Chrome bug: calling speak() immediately after cancel() can silently fail.
        // A short delay lets the engine reset.
        const startSpeaking = () => {
          const utterance = new SpeechSynthesisUtterance(text)
          utterance.lang = opts.lang!
          utterance.rate = opts.rate!
          utterance.pitch = opts.pitch!
          utterance.volume = opts.volume!

          const zhVoice = getChineseVoice()
          if (zhVoice) utterance.voice = zhVoice

          // Chrome workaround: resume stuck synthesis
          let resumeInterval: ReturnType<typeof setInterval> | null = null

          utterance.onend = () => {
            if (resumeInterval) clearInterval(resumeInterval)
            resolve()
          }
          utterance.onerror = (e) => {
            if (resumeInterval) clearInterval(resumeInterval)
            // "interrupted" and "canceled" are not real errors
            if (e.error === "interrupted" || e.error === "canceled") {
              resolve()
            } else {
              reject(e)
            }
          }
          utteranceRef.current = utterance

          window.speechSynthesis.speak(utterance)

          // Chrome bug: speechSynthesis can get "stuck" after ~15 seconds.
          resumeInterval = setInterval(() => {
            if (!window.speechSynthesis.speaking) {
              if (resumeInterval) clearInterval(resumeInterval)
            } else if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume()
            }
          }, 5000)
        }

        // Slight delay after cancel() to avoid Chrome silent failure
        setTimeout(startSpeaking, 50)
      })
    },
    [options],
  )

  return { speak, stop }
}

/* ───────── Standalone function ───────── */

/**
 * One-off TTS call outside of React components.
 * Use this when you don't need the hook pattern.
 */
export function speakText(text: string, lang = "zh-CN", rate = 0.8) {
  if (typeof window === "undefined" || !window.speechSynthesis) return

  window.speechSynthesis.cancel()

  // Delay after cancel() for Chrome compatibility
  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = rate

    const zhVoice = getChineseVoice()
    if (zhVoice) utterance.voice = zhVoice

    window.speechSynthesis.speak(utterance)
  }, 50)
}
