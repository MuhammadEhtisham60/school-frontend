import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getButtonStyles } from "@/theme/overridebutton";
import { cn } from "@/utils/utils";

export const PrimaryButton = React.forwardRef(
  (
    {
      children,
      onClick,
      type = "button",
      disabled = false,
      loading = false,
      fullWidth = false,
      size = "medium",
      variant = "contained",
      color = "primary",
      startIcon,
      endIcon,
      sx,
      className,
      ...props
    },
    ref,
  ) => {
    const buttonClass = getButtonStyles({ variant, color, size, className });

    return (
      <Button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        style={sx}
        className={cn(buttonClass, fullWidth && "w-full")}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : startIcon}
        {children}
        {!loading && endIcon}
      </Button>
    );
  },
);

PrimaryButton.displayName = "PrimaryButton";
