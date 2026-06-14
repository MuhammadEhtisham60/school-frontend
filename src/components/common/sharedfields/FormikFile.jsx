import { useField } from "formik";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, File } from "lucide-react";
import { cn } from "@/utils/utils";

export function FormikFile({
  name,
  label,
  placeholder,
  required,
  disabled,
  helperText,
  full = true,
  accept,
  maxSizeText = "PNG, JPG up to 5MB",
  optional,
  compact = false,
  ...props
}) {
  const [field, meta, helpers] = useField(name);
  const isError = !!(meta.touched && meta.error);

  const file = field.value;

  const handleChange = (e) => {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      helpers.setValue(e.currentTarget.files[0]);
    }
  };

  return (
    <div className={cn("space-y-2", full && "md:col-span-2")}>
      {label && !compact && (
        <Label
          htmlFor={name}
          className={cn("text-sm font-medium", isError && "text-destructive")}
        >
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <label
        htmlFor={name}
        className={cn(
          "flex items-center gap-3 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/40 transition-smooth",
          compact ? "p-4" : "p-6 justify-center",
          isError && "border-destructive focus-within:ring-destructive",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div
          className={cn(
            "rounded-lg gradient-primary flex items-center justify-center text-white",
            compact ? "h-10 w-10 shrink-0" : "h-10 w-10 rounded-full shrink-0"
          )}
        >
          {file ? <File className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">
            {file
              ? typeof file === "string"
                ? file
                : file.name
              : placeholder || `Click to upload ${label || ""}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {file && typeof file !== "string"
              ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
              : maxSizeText}
          </p>
        </div>
        {optional && compact && <Badge variant="secondary">Optional</Badge>}
        <input
          id={name}
          type="file"
          accept={accept}
          disabled={disabled}
          onChange={handleChange}
          className="hidden"
          {...props}
        />
      </label>
      {helperText && !isError && (
        <p className="text-[0.8rem] text-muted-foreground">{helperText}</p>
      )}
      {isError && (
        <p className="text-[0.8rem] font-medium text-destructive">{meta.error}</p>
      )}
    </div>
  );
}
