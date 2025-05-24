"use client";

import { CalendarIcon } from "lucide-react";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { TimePicker } from "./time-picker";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CalendarTimeProps {
  date: Date | null;
  onChange: (date: Date | null) => void;
}

export function CalendarTime({ date, onChange }: CalendarTimeProps) {
  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Preserve the current time when selecting a new date
      const newDate = new Date(selectedDate);
      if (date) {
        newDate.setHours(date.getHours());
        newDate.setMinutes(date.getMinutes());
      }
      onChange(newDate);
    } else {
      onChange(null);
    }
  };

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={handleSelect}
            initialFocus
          />
          {date && (
            <TimePicker
              date={date}
              onChange={(newDate) => onChange(newDate)}
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}