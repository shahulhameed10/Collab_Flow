import { useState, useRef } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options",
}: MultiSelectProps) {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selected.length > 0
            ? `${selected.length} selected`
            : placeholder}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] max-h-[200px] overflow-y-auto p-2 space-y-1">
        {options.map((option) => (
          <div
            key={option.value}
            className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-muted cursor-pointer"
            onClick={() => handleToggle(option.value)}
          >
            <Checkbox
              checked={selected.includes(option.value)}
              onCheckedChange={() => handleToggle(option.value)}
            />
            <span className="text-sm">{option.label}</span>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}
