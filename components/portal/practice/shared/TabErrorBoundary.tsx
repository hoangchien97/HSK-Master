"use client"

import { Component, type ReactNode } from "react"
import { Button, Card, CardBody } from "@heroui/react"
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
        <Card className="border border-danger-200 dark:border-danger-800/40">
          <CardBody className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 text-danger mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-danger mb-1">
              {L.error.headingTpl(this.props.tabName)}
            </h3>
            <p className="text-sm text-default-500 mb-1 max-w-sm mx-auto">
              {L.error.helpText}
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <p className="text-xs text-default-400 mb-4 font-mono max-w-md mx-auto truncate">
                {this.state.error.message}
              </p>
            )}
            <Button
              color="primary"
              variant="flat"
              onPress={this.handleRetry}
              startContent={<RotateCcw className="w-4 h-4" />}
              className="mt-2"
            >
              {L.error.retryBtn}
            </Button>
          </CardBody>
        </Card>
      )
    }

    return this.props.children
  }
}
