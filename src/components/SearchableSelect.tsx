"use client"
import { useState } from "react"
import { Popover,PopoverContent,PopoverTrigger,} from "@/components/ui/popover"
import { Command,CommandEmpty,CommandGroup,CommandInput,CommandItem,CommandList, }from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Option {
  label: string
  value: string
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {

  const [open, setOpen] = useState(false)

  const handleSelect = (val: string) => {
    onChange(val)
    setOpen(false) // ✅ close popover after selection
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {value
            ? options.find((o) => o.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                 onSelect={() => handleSelect(opt.value)} // ✅ use handleSelect
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      opt.value === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}