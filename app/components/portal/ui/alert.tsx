import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/app/components/portal/ui/card"
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react"

type AlertVariant = "default" | "success" | "warning" | "error" | "info"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  title?: string
  closeable?: boolean
  onClose?: () => void
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", title, children, closeable, onClose, ...props }, ref) => {
    const icons = {
      default: Info,
      success: CheckCircle,
      warning: AlertTriangle,
      error: AlertCircle,
      info: Info,
    }

    const variants = {
      default: "border-gray-200 bg-gray-50 text-gray-900",
      success: "border-green-200 bg-green-50 text-green-900",
      warning: "border-yellow-200 bg-yellow-50 text-yellow-900",
      error: "border-red-200 bg-red-50 text-red-900",
      info: "border-blue-200 bg-blue-50 text-blue-900",
    }

    const iconColors = {
      default: "text-gray-500",
      success: "text-green-500",
      warning: "text-yellow-500",
      error: "text-red-500",
      info: "text-blue-500",
    }

    const Icon = icons[variant]

    return (
      <Card
        ref={ref}
        className={cn(
          "border-l-4",
          variants[variant],
          className
        )}
        {...props}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", iconColors[variant])} />
            <div className="flex-1">
              {title && <h5 className="font-semibold mb-1">{title}</h5>}
              <div className="text-sm">{children}</div>
            </div>
            {closeable && onClose && (
              <button
                onClick={onClose}
                className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
)
Alert.displayName = "Alert"

export { Alert }
export type { AlertVariant }
