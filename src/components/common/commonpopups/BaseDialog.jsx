import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/utils/utils";

export const BaseDialog = ({
  open,
  onClose,
  children,
  className,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  size = "md",
  ...props
}) => {
  // Map sizes to tailwind max-width classes
  const sizeClasses = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    full: "max-w-[95vw] h-[95vh]",
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(val) => { if (!val) onClose?.(); }}>
      <DialogPrimitive.Portal>
        {/* Backdrop overlay with blur and fade animations */}
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 transition-all duration-300"
        />
        {/* Dialog content box with zoom and slide animations */}
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] sm:w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background/95 backdrop-blur-md p-6 shadow-glow duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-[48%] data-[state=open]:slide-in-from-bottom-[48%] rounded-2xl border-border/80 focus:outline-none",
            sizeClasses[size] || sizeClasses.md,
            className
          )}
          onEscapeKeyDown={(event) => {
            if (!closeOnEscape) {
              event.preventDefault();
            }
          }}
          onPointerDownOutside={(event) => {
            if (!closeOnOverlayClick) {
              event.preventDefault();
            }
          }}
          {...props}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close 
              className="absolute right-4 top-4 rounded-full p-1.5 opacity-60 text-muted-foreground transition-all hover:bg-accent hover:opacity-100 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              aria-label="Close"
            >
              <X className="h-4.5 w-4.5" />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

BaseDialog.displayName = "BaseDialog";
