import * as React from "react";
import { Check } from "lucide-react";
import { BaseDialog } from "./BaseDialog";
import { PrimaryButton } from "@/components/common/buttons";

export const SuccessConfirmationPopup = ({
  open,
  title = "Success!",
  message,
  confirmText = "OK",
  onConfirm,
  onClose,
  loading = false,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else if (onClose) {
      onClose();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (onConfirm) {
      onConfirm();
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
        {/* Animated Success Icon container with gradient background and border glow */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success mb-6 border border-success/20 shadow-sm animate-fade-in-up">
          <Check className="h-8 w-8 stroke-[3]" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">{title}</h3>

        {/* Message */}
        {message && (
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed max-w-xs">{message}</p>
        )}

        {/* Action Button */}
        <PrimaryButton
          onClick={handleConfirm}
          loading={loading}
          fullWidth
          color="success"
          size="medium"
          className="mt-2"
        >
          {confirmText}
        </PrimaryButton>
      </div>
    </BaseDialog>
  );
};

SuccessConfirmationPopup.displayName = "SuccessConfirmationPopup";
