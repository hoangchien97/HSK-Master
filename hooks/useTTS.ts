"use client"

import { useCallback, useRef } from "react"

/**
 * Custom hook for Text-to-Speech using the Web Speech API.
 * Supports Chinese (zh-CN) pronunciation for vocabulary practice.
 *
 * Falls back to browser TTS when no audio URL is available.
 */

interface TTSOptions {
  /** Speech rate (0.1 - 10). Default 0.8 for clearer Chinese pronunciation */
  rate?: number
  /** Pitch (0 - 2). Default 1 */
  pitch?: number
  /** Volume (0 - 1). Default 1 */
  volume?: number
  /** BCP 47 language tag. Default "zh-CN" */
  lang?: string
}

const DEFAULT_OPTIONS: TTSOptions = {
  rate: 0.8,
  pitch: 1,
  volume: 1,
  lang: "zh-CN",
}

export function useTTS(options?: TTSOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  /** Stop any currently playing audio/speech */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [])

  /**
   * Speak text using browser TTS (Web Speech API).
   * Returns a Promise that resolves when speech ends.
   */
  const speakText = useCallback(
    (text: string, overrides?: TTSOptions): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (typeof window === "undefined" || !window.speechSynthesis) {
          reject(new Error("Speech synthesis not supported"))
          return
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel()

        const opts = { ...DEFAULT_OPTIONS, ...options, ...overrides }
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = opts.lang!
        utterance.rate = opts.rate!
        utterance.pitch = opts.pitch!
        utterance.volume = opts.volume!

        // Try to find a Chinese voice
        const voices = window.speechSynthesis.getVoices()
        const zhVoice = voices.find(
          (v) => v.lang === "zh-CN" || v.lang.startsWith("zh") || v.lang === "cmn-Hans-CN",
        )
        if (zhVoice) utterance.voice = zhVoice

        utterance.onend = () => resolve()
        utterance.onerror = (e) => reject(e)
        utteranceRef.current = utterance

        window.speechSynthesis.speak(utterance)
      })
    },
    [options],
  )

  /**
   * Play pronunciation: if audioUrl exists, play it;
   * otherwise, use TTS to speak the Chinese text.
   */
  const speak = useCallback(
    async (text: string, audioUrl?: string | null) => {
      stop()

      if (audioUrl) {
        // Play from audio URL
        return new Promise<void>((resolve, reject) => {
          const audio = new Audio(audioUrl)
          audioRef.current = audio
          audio.onended = () => {
            audioRef.current = null
            resolve()
          }
          audio.onerror = () => {
            audioRef.current = null
            // Fallback to TTS if audio fails
            speakText(text).then(resolve).catch(reject)
          }
          audio.play().catch(() => {
            // Fallback to TTS if play fails
            speakText(text).then(resolve).catch(reject)
          })
        })
      }

      // Use TTS directly
      return speakText(text)
    },
    [stop, speakText],
  )

  return { speak, speakText, stop }
}

/**
 * Standalone function to play audio or TTS.
 * Use this when you don't need the hook pattern.
 */
export function playAudioOrTTS(
  text: string,
  audioUrl?: string | null,
  lang = "zh-CN",
  rate = 0.8,
) {
  if (typeof window === "undefined") return

  // Stop ongoing speech
  window.speechSynthesis?.cancel()

  if (audioUrl) {
    const audio = new Audio(audioUrl)
    audio.play().catch(() => {
      // Fallback to TTS
      speakWithTTS(text, lang, rate)
    })
    return
  }

  speakWithTTS(text, lang, rate)
}

function speakWithTTS(text: string, lang: string, rate: number) {
  if (!window.speechSynthesis) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = rate

  const voices = window.speechSynthesis.getVoices()
  const zhVoice = voices.find(
    (v) => v.lang === "zh-CN" || v.lang.startsWith("zh") || v.lang === "cmn-Hans-CN",
  )
  if (zhVoice) utterance.voice = zhVoice

  window.speechSynthesis.speak(utterance)
}
