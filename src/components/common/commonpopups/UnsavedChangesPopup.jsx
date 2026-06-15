import * as React from "react";
import { AlertCircle } from "lucide-react";
import { BaseDialog } from "./BaseDialog";
import { PrimaryButton, CancelButton } from "@/components/common/buttons";

export const UnsavedChangesPopup = ({
  open,
  onStay,
  onLeave,
  title = "Unsaved Changes",
  message = "You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost.",
}) => {
  return (
    <BaseDialog
      open={open}
      onClose={onStay}
      closeOnOverlayClick={false}
      closeOnEscape={false}
      showCloseButton={false}
      size="sm"
    >
      <div className="flex flex-col items-center text-center p-2">
        {/* Pulsing warning icon container */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 text-warning mb-6 border border-warning/20 shadow-sm animate-pulse">
          <AlertCircle className="h-8 w-8" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">{title}</h3>

        {/* Message */}
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed max-w-xs">{message}</p>

        {/* Action buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 w-full mt-2">
          <CancelButton onClick={onStay} fullWidth className="sm:w-1/2 font-semibold">
            Stay
          </CancelButton>
          <PrimaryButton
            onClick={onLeave}
            color="warning"
            fullWidth
            className="sm:w-1/2 font-semibold"
          >
            Leave
          </PrimaryButton>
        </div>
      </div>
    </BaseDialog>
  );
};

UnsavedChangesPopup.displayName = "UnsavedChangesPopup";
