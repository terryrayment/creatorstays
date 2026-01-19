import * as React from "react"
import { cn } from "@/lib/utils"

interface MetricProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number
  label: string
  caption?: string
  trend?: {
    value: string
    direction: "up" | "down" | "neutral"
  }
  size?: "sm" | "md" | "lg"
  align?: "left" | "center"
}

const Metric = React.forwardRef<HTMLDivElement, MetricProps>(
  ({ 
    className, 
    value, 
    label, 
    caption, 
    trend,
    size = "md",
    align = "center",
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: {
        value: "text-xl font-bold",
        label: "text-[10px]",
        caption: "text-[9px]",
      },
      md: {
        value: "text-3xl font-bold tracking-tight",
        label: "text-xs",
        caption: "text-[10px]",
      },
      lg: {
        value: "text-4xl font-bold tracking-tight md:text-5xl",
        label: "text-sm",
        caption: "text-xs",
      },
    }

    const alignClasses = {
      left: "items-start text-left",
      center: "items-center text-center",
    }

    const trendColors = {
      up: "text-emerald-600 bg-emerald-500/10",
      down: "text-red-600 bg-red-500/10",
      neutral: "text-muted-foreground bg-muted",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col justify-center rounded-xl border border-foreground/5 bg-white/70 p-4 backdrop-blur-sm transition-all duration-200 hover:border-foreground/10 hover:shadow-sm",
          alignClasses[align],
          className
        )}
        {...props}
      >
        <div className="flex items-baseline gap-2">
          <span className={cn("leading-none", sizeClasses[size].value)}>
            {value}
          </span>
          {trend && (
            <span className={cn(
              "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium",
              trendColors[trend.direction]
            )}>
              {trend.direction === "up" && "↑"}
              {trend.direction === "down" && "↓"}
              {trend.value}
            </span>
          )}
        </div>
        <span className={cn("mt-1 font-medium text-muted-foreground", sizeClasses[size].label)}>
          {label}
        </span>
        {caption && (
          <span className={cn("mt-0.5 text-muted-foreground/60", sizeClasses[size].caption)}>
            {caption}
          </span>
        )}
      </div>
    )
  }
)
Metric.displayName = "Metric"

// Compact inline metric for dense layouts
interface InlineMetricProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number
  label: string
}

const InlineMetric = React.forwardRef<HTMLDivElement, InlineMetricProps>(
  ({ className, value, label, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-baseline gap-1.5", className)}
        {...props}
      >
        <span className="text-lg font-bold leading-none">{value}</span>
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
    )
  }
)
InlineMetric.displayName = "InlineMetric"

export { Metric, InlineMetric }
