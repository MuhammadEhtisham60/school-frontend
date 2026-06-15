import { useField } from "formik";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/utils/utils";

export function FormikCheckBox({
  name,
  label,
  description,
  required,
  disabled,
  helperText,
  full,
  variant = "checkbox", // 'checkbox' or 'switch'
  className,
  ...props
}) {
  const [field, meta, helpers] = useField({ name, type: "checkbox" });
  const isError = !!(meta.touched && meta.error);

  if (variant === "switch") {
    return (
      <div
        className={cn(
          "flex items-center justify-between p-4 rounded-xl border bg-muted/30",
          full && "md:col-span-2",
          isError && "border-destructive",
          className,
        )}
      >
        <div className="space-y-0.5">
          {label && (
            <Label
              htmlFor={name}
              className={cn("text-sm font-semibold cursor-pointer", isError && "text-destructive")}
            >
              {label} {required && <span className="text-destructive">*</span>}
            </Label>
          )}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
          {helperText && !isError && (
            <p className="text-[0.8rem] text-muted-foreground">{helperText}</p>
          )}
          {isError && <p className="text-[0.8rem] font-medium text-destructive">{meta.error}</p>}
        </div>
        <Switch
          id={name}
          checked={!!field.value}
          onCheckedChange={(val) => helpers.setValue(val)}
          disabled={disabled}
          {...props}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", full && "md:col-span-2", className)}>
      <div className="flex items-start gap-2">
        <Checkbox
          id={name}
          checked={!!field.value}
          onCheckedChange={(val) => helpers.setValue(val)}
          disabled={disabled}
          {...props}
        />
        <div className="grid gap-1.5 leading-none">
          {label && (
            <Label
              htmlFor={name}
              className={cn("text-sm font-medium cursor-pointer", isError && "text-destructive")}
            >
              {label} {required && <span className="text-destructive">*</span>}
            </Label>
          )}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      {helperText && !isError && (
        <p className="text-[0.8rem] text-muted-foreground">{helperText}</p>
      )}
      {isError && <p className="text-[0.8rem] font-medium text-destructive">{meta.error}</p>}
    </div>
  );
}
