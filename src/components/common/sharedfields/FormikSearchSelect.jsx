import * as React from "react";
import { useField } from "formik";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/utils/utils";

export function FormikSearchSelect({
  name,
  label,
  placeholder = "Search...",
  required,
  disabled,
  helperText,
  full,
  options = [],
  ...props
}) {
  const [field, meta, helpers] = useField(name);
  const [open, setOpen] = React.useState(false);
  const isError = !!(meta.touched && meta.error);

  const selectedOption = options.find((opt) => {
    const val = typeof opt === "object" ? opt.value : opt;
    return val === field.value;
  });
  const displayLabel = selectedOption
    ? typeof selectedOption === "object"
      ? selectedOption.label
      : selectedOption
    : placeholder;

  return (
    <div className={cn("space-y-2 flex flex-col", full && "md:col-span-2")}>
      {label && (
        <Label
          htmlFor={name}
          className={cn("text-sm font-medium", isError && "text-destructive")}
        >
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={name}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between text-left font-normal h-9 border-input bg-transparent px-3 py-1 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              !field.value && "text-muted-foreground",
              isError && "border-destructive focus:ring-destructive"
            )}
            {...props}
          >
            <span className="truncate">{displayLabel}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList>
              <CommandEmpty>No item found.</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const val = typeof opt === "object" ? opt.value : opt;
                  const lbl = typeof opt === "object" ? opt.label : opt;
                  const isSelected = field.value === val;
                  return (
                    <CommandItem
                      key={val}
                      value={lbl}
                      onSelect={() => {
                        helpers.setValue(val);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {lbl}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {helperText && !isError && (
        <p className="text-[0.8rem] text-muted-foreground">{helperText}</p>
      )}
      {isError && (
        <p className="text-[0.8rem] font-medium text-destructive">{meta.error}</p>
      )}
    </div>
  );
}
