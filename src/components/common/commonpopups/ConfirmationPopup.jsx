import * as React from "react";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { BaseDialog } from "./BaseDialog";
import { PrimaryButton, CancelButton } from "@/components/common/buttons";

export const ConfirmationPopup = ({
  open,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "primary", // error, warning, primary
  loading = false,
  onConfirm,
  onCancel,
  onClose,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) => {
  // Theme color styling mappings
  const themeMap = {
    error: {
      buttonColor: "error",
      iconColor: "text-destructive",
      iconBg: "bg-destructive/10 border-destructive/20",
    },
    warning: {
      buttonColor: "warning",
      iconColor: "text-warning",
      iconBg: "bg-warning/10 border-warning/20",
    },
    primary: {
      buttonColor: "primary",
      iconColor: "text-primary",
      iconBg: "bg-primary/10 border-primary/20",
    },
  };

  const currentTheme = themeMap[confirmColor] || themeMap.primary;

  const handleClose = () => {
    if (!loading) {
      if (onCancel) {
        onCancel();
      } else if (onClose) {
        onClose();
      }
    }
  };

  return (
    <BaseDialog
      open={open}
      onClose={handleClose}
      closeOnOverlayClick={closeOnOverlayClick && !loading}
      closeOnEscape={closeOnEscape && !loading}
      showCloseButton={!loading}
      size="sm"
    >
      <div className="flex flex-col items-center text-center p-2">
        {/* Visual context icon (warning or help) */}
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full mb-6 border shadow-sm ${currentTheme.iconBg} animate-fade-in-up`}
        >
          {confirmColor === "error" || confirmColor === "warning" ? (
            <AlertTriangle className={`h-8 w-8 ${currentTheme.iconColor}`} />
          ) : (
            <HelpCircle className={`h-8 w-8 ${currentTheme.iconColor}`} />
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">{title}</h3>

        {/* Message */}
        {message && (
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed max-w-xs">{message}</p>
        )}

        {/* Responsive footer buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 w-full mt-2">
          <CancelButton
            onClick={onCancel || onClose}
            disabled={loading}
            fullWidth
            className="sm:w-1/2 font-semibold"
          >
            {cancelText}
          </CancelButton>
          <PrimaryButton
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
            color={currentTheme.buttonColor}
            fullWidth
            className="sm:w-1/2 font-semibold"
          >
            {confirmText}
          </PrimaryButton>
        </div>
      </div>
    </BaseDialog>
  );
};

ConfirmationPopup.displayName = "ConfirmationPopup";
