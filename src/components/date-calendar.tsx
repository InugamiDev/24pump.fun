"use client"

import { Calendar } from "@/components/ui/calendar"

interface DateCalendarProps {
  currentYear: number
  mintedDates: Date[]
}

export function DateCalendar({ currentYear, mintedDates }: DateCalendarProps) {
  return (
    <Calendar
      mode="single"
      selected={undefined}
      disabled={(date) => {
        // Only allow current year
        if (date.getFullYear() !== currentYear) return true
        
        // Check if date is already minted
        return mintedDates.some(
          (mintedDate) =>
            mintedDate.getMonth() === date.getMonth() &&
            mintedDate.getDate() === date.getDate()
        )
      }}
      className="rounded-md border"
      modifiers={{
        minted: mintedDates,
      }}
      modifiersStyles={{
        minted: {
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
        },
      }}
    />
  )
}