"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  date: Date | null;
  onChange: (date: Date) => void;
  className?: string;
}

export function TimePicker({ date, onChange, className }: TimePickerProps) {
  const [hours, setHours] = useState(date?.getHours() || 0);
  const [minutes, setMinutes] = useState(date?.getMinutes() || 0);

  const handleTimeChange = (newHours: number, newMinutes: number) => {
    if (newHours >= 0 && newHours < 24 && newMinutes >= 0 && newMinutes < 60) {
      const newDate = new Date(date || Date.now());
      newDate.setHours(newHours);
      newDate.setMinutes(newMinutes);
      onChange(newDate);
      setHours(newHours);
      setMinutes(newMinutes);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-start text-left font-normal"
          >
            <Clock className="mr-2 h-4 w-4 opacity-50" />
            {date ? (
              date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            ) : (
              <span>Pick a time</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex p-2">
            <div className="flex flex-col">
              <Label>Hour</Label>
              <Input
                type="number"
                min={0}
                max={23}
                value={hours}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) {
                    handleTimeChange(val, minutes);
                  }
                }}
                className="w-16"
              />
            </div>
            <div className="flex items-end pb-2 px-2">:</div>
            <div className="flex flex-col">
              <Label>Minute</Label>
              <Input
                type="number"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) {
                    handleTimeChange(hours, val);
                  }
                }}
                className="w-16"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}