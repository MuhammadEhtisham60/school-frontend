import { cn } from "@/utils/utils";

export function getButtonStyles({ variant = "contained", color = "primary", size = "medium", className }) {
  const variantStyles = {
    contained: {
      primary: "gradient-primary text-primary-foreground border-0 shadow-glow hover:opacity-90",
      secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80",
      success: "gradient-success text-white border-0 shadow-glow hover:opacity-90",
      error: "bg-destructive text-destructive-foreground border-0 hover:bg-destructive/90",
      warning: "bg-warning text-warning-foreground border-0 hover:opacity-90",
      info: "bg-info text-info-foreground border-0 hover:opacity-90",
    },
    shadow: {
      primary: "gradient-primary text-primary-foreground shadow-glow hover:shadow-none hover:opacity-95",
      secondary: "bg-secondary text-secondary-foreground shadow-sm hover:shadow-none hover:bg-secondary/90",
      success: "gradient-success text-white shadow-glow hover:shadow-none hover:opacity-95",
      error: "bg-destructive text-destructive-foreground shadow-sm hover:shadow-none hover:bg-destructive/90",
      warning: "bg-warning text-warning-foreground shadow-sm hover:shadow-none hover:opacity-95",
      info: "bg-info text-info-foreground shadow-sm hover:shadow-none hover:opacity-95",
    },
    outlined: {
      primary: "border border-primary text-primary bg-transparent hover:bg-primary/10",
      secondary: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
      success: "border border-success text-success bg-transparent hover:bg-success/10",
      error: "border border-destructive text-destructive bg-transparent hover:bg-destructive/10",
      warning: "border border-warning text-warning bg-transparent hover:bg-warning/10",
      info: "border border-info text-info bg-transparent hover:bg-info/10",
    },
    dashed: {
      primary: "border border-dashed border-primary text-primary bg-primary/5 hover:bg-primary/15",
      secondary: "border border-dashed border-input bg-muted/20 text-muted-foreground hover:bg-muted/40",
      success: "border border-dashed border-success text-success bg-success/5 hover:bg-success/15",
      error: "border border-dashed border-destructive text-destructive bg-destructive/5 hover:bg-destructive/15",
      warning: "border border-dashed border-warning text-warning bg-warning/5 hover:bg-warning/15",
      info: "border border-dashed border-info text-info bg-info/5 hover:bg-info/15",
    },
    faded: {
      primary: "text-primary border border-primary/20 bg-muted/40 hover:bg-primary/10",
      secondary: "text-secondary-foreground border border-input bg-muted/20 hover:bg-muted/40",
      success: "text-success border border-success/20 bg-muted/40 hover:bg-success/10",
      error: "text-destructive border border-destructive/20 bg-muted/40 hover:bg-destructive/10",
      warning: "text-warning border border-warning/20 bg-muted/40 hover:bg-warning/10",
      info: "text-info border border-info/20 bg-muted/40 hover:bg-info/10",
    },
    text: {
      primary: "text-primary bg-transparent hover:bg-primary/10",
      secondary: "text-secondary-foreground bg-transparent hover:bg-muted/50",
      success: "text-success bg-transparent hover:bg-success/10",
      error: "text-destructive bg-transparent hover:bg-destructive/10",
      warning: "text-warning bg-transparent hover:bg-warning/10",
      info: "text-info bg-transparent hover:bg-info/10",
    }
  };

  const sizeStyles = {
    small: "h-8 rounded-md px-3 text-xs",
    medium: "h-9 px-4 py-2 text-sm",
    large: "h-10 rounded-md px-8 text-base",
  };

  const baseStyles = variantStyles[variant]?.[color] || variantStyles.contained.primary;
  const sizeStyle = sizeStyles[size] || sizeStyles.medium;

  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 normal-case transition-smooth shrink-0",
    baseStyles,
    sizeStyle,
    className
  );
}
