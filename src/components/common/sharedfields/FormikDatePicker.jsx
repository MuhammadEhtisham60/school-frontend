import * as React from "react";
import { useField } from "formik";
import { format, parseISO, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/utils/utils";

export function FormikDatePicker({
  name,
  label,
  placeholder = "Pick a date",
  required,
  disabled,
  readOnly,
  helperText,
  full,
  ...props
}) {
  const [field, meta, helpers] = useField(name);
  const isError = !!(meta.touched && meta.error);
  const [isOpen, setIsOpen] = React.useState(false);

  // Convert field value to Date object for the Calendar
  const dateValue = React.useMemo(() => {
    if (!field.value) return undefined;
    const parsed = parseISO(field.value);
    return isValid(parsed) ? parsed : undefined;
  }, [field.value]);

  const handleSelect = (date) => {
    if (date) {
      // Format as YYYY-MM-DD
      helpers.setValue(format(date, "yyyy-MM-dd"));
    } else {
      helpers.setValue("");
    }
    setIsOpen(false);
  };

  return (
    <div className={cn("space-y-2 flex flex-col", full && "md:col-span-2")}>
      {label && (
        <Label htmlFor={name} className={cn("text-sm font-medium text-foreground", isError && "text-destructive")}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id={name}
            type="button"
            variant="outline"
            disabled={disabled || readOnly}
            className={cn(
              "w-full h-9 px-3 text-left font-normal flex items-center justify-between border border-input rounded-md bg-card hover:bg-accent/50 transition-all",
              !field.value && "text-muted-foreground",
              isError && "border-destructive focus-visible:ring-destructive",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <span>
              {dateValue ? format(dateValue, "PPP") : placeholder}
            </span>
            <CalendarIcon className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border border-border bg-card rounded-md overflow-hidden shadow-glow" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleSelect}
            initialFocus
            captionLayout="dropdown"
            startMonth={new Date(1900, 0)}
            endMonth={new Date(new Date().getFullYear() + 5, 11)}
            disabled={(date) => date > new Date("2100-01-01") || date < new Date("1900-01-01")}
          />
        </PopoverContent>
      </Popover>
      {helperText && !isError && (
        <p className="text-[0.8rem] text-muted-foreground">{helperText}</p>
      )}
      {isError && <p className="text-[0.8rem] font-medium text-destructive">{meta.error}</p>}
    </div>
  );
}
