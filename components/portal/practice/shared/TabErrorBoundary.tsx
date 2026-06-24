"use client"

import { Component, type ReactNode } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"
import { PRACTICE_LABELS } from "@/constants/portal/practice"

const L = PRACTICE_LABELS

interface Props {
  children: ReactNode
  /** Display name for error message, e.g. "Flashcard" */
  tabName?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary for individual practice tabs.
 *
 * Catches runtime errors (e.g. hanzi-writer canvas crash) within a single tab
 * without breaking the rest of the practice view. Users can retry or switch tabs.
 */
export default class TabErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[TabErrorBoundary${this.props.tabName ? ` — ${this.props.tabName}` : ""}]`, error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-red-200 dark:border-red-800/40 bg-white p-4 shadow-sm">
          <div className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-1">
              {L.error.headingTpl(this.props.tabName)}
            </h3>
            <p className="text-sm text-(--color-muted) mb-1 max-w-sm mx-auto">
              {L.error.helpText}
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <p className="text-xs text-gray-400 mb-4 font-mono max-w-md mx-auto truncate">
                {this.state.error.message}
              </p>
            )}
            <button
              type="button"
              onClick={this.handleRetry}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-(--color-vermillion) text-white hover:bg-(--color-vermillion-hover) transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {L.error.retryBtn}
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
