import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Name Function: Card
 * Description: Top-level card container with border styling, card background, and subtle shadow.
 * Reason: Encapsulates related content such as metric cards and data tables into distinct visual blocks.
 **/
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

/**
 * Name Function: CardHeader
 * Description: Card header container hosting CardTitle and CardDescription with consistent padding.
 * Reason: Provides a standardized header area across all card layouts.
 **/
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * Name Function: CardTitle
 * Description: Primary card heading with bold typography and tight tracking.
 * Reason: Highlights section titles such as 'Meeting Rooms Directory' or 'Room Bookings List'.
 **/
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * Name Function: CardDescription
 * Description: Explanatory secondary text below CardTitle in muted-foreground color.
 * Reason: Supplies brief context about the data or actions inside the card.
 **/
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * Name Function: CardContent
 * Description: Main body container of the card holding tables, lists, or input forms.
 * Reason: Provides flexible padding for card contents.
 **/
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * Name Function: CardFooter
 * Description: Bottom card footer for placing action buttons or footnote notes.
 * Reason: Aligns card action controls cleanly along the bottom margin.
 **/
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
