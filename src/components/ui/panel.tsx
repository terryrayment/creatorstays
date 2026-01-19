import * as React from "react"
import { cn } from "@/lib/utils"

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "inset"
  children: React.ReactNode
}

interface PanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  actions?: React.ReactNode
}

const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "panel-surface",
      elevated: "panel-surface-elevated",
      inset: "bg-foreground/[0.02] border-0 rounded-lg",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-xl transition-all duration-300 ease-out",
          variants[variant],
          className
        )}
        {...props}
      >
        {/* Hover glow pseudo-element via CSS */}
        {variant !== "inset" && <div className="panel-glow" aria-hidden="true" />}
        <div className="relative z-10">{children}</div>
      </div>
    )
  }
)
Panel.displayName = "Panel"

const PanelHeader = React.forwardRef<HTMLDivElement, PanelHeaderProps>(
  ({ className, title, description, actions, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-start justify-between gap-4 border-b border-foreground/[0.04] px-5 py-4",
          className
        )}
        {...props}
      >
        <div className="min-w-0 flex-1">
          {title && (
            <h3 className="text-sm font-semibold leading-none tracking-tight">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
          {children}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    )
  }
)
PanelHeader.displayName = "PanelHeader"

const PanelContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5", className)} {...props} />
))
PanelContent.displayName = "PanelContent"

const PanelFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("border-t border-foreground/[0.04] px-5 py-3", className)}
    {...props}
  />
))
PanelFooter.displayName = "PanelFooter"

export { Panel, PanelHeader, PanelContent, PanelFooter }
