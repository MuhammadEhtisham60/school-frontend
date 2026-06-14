import { useField } from "formik";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/utils/utils";

export function FormikRadio({
  name,
  label,
  required,
  disabled,
  helperText,
  full,
  options = [],
  className,
  ...props
}) {
  const [field, meta, helpers] = useField(name);
  const isError = !!(meta.touched && meta.error);

  return (
    <div className={cn("space-y-2", full && "md:col-span-2")}>
      {label && (
        <Label
          htmlFor={name}
          className={cn("text-sm font-medium", isError && "text-destructive")}
        >
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <RadioGroup
        id={name}
        value={field.value ?? ""}
        onValueChange={(v) => helpers.setValue(v)}
        disabled={disabled}
        className={cn("flex gap-4", className)}
        {...props}
      >
        {options.map((opt) => {
          const val = typeof opt === "object" ? opt.value : opt;
          const lbl = typeof opt === "object" ? opt.label : opt;
          return (
            <label key={val} className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value={val} />
              <span className="text-sm">{lbl}</span>
            </label>
          );
        })}
      </RadioGroup>
      {helperText && !isError && (
        <p className="text-[0.8rem] text-muted-foreground">{helperText}</p>
      )}
      {isError && (
        <p className="text-[0.8rem] font-medium text-destructive">{meta.error}</p>
      )}
    </div>
  );
}
