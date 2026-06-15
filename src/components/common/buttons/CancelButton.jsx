import * as React from "react";
import Button from "@mui/material/Button";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/utils";

export const CancelButton = React.forwardRef(({
  children,
  onClick,
  type = "button",
  disabled = false,
  loading = false,
  fullWidth = false,
  size = "medium",
  variant = "outlined",
  color = "secondary",
  startIcon,
  endIcon,
  sx,
  className,
  ...props
}, ref) => {
  return (
    <Button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      variant={variant === "contained" ? "contained" : variant === "text" ? "text" : "outlined"}
      color={color === "primary" ? "primary" : color === "success" ? "success" : color === "error" ? "error" : "secondary"}
      size={size === "small" ? "small" : size === "large" ? "large" : "medium"}
      fullWidth={fullWidth}
      startIcon={loading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : startIcon}
      endIcon={!loading ? endIcon : undefined}
      className={cn("normal-case font-semibold rounded-md", className)}
      sx={{
        textTransform: "none",
        color: "text.secondary",
        borderColor: "divider",
        "&:hover": {
          color: "text.primary",
          borderColor: "text.secondary",
          backgroundColor: "action.hover",
        },
        borderRadius: '8px',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
});

CancelButton.displayName = "CancelButton";

