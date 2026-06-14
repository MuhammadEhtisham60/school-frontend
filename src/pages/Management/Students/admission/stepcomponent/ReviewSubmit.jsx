import { useFormikContext } from "formik";
import { Button } from "@/components/ui/button";
import { CancelButton, SubmitButton } from "@/components/common/buttons";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export function ReviewSubmit({ setPreview }) {
  const { values, submitForm } = useFormikContext();

  return (
    <Card className="p-6 md:p-8 shadow-card animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Review & Submit</h2>
          <p className="text-sm text-muted-foreground">
            Double-check the details before final submission.
          </p>
        </div>
        <CancelButton onClick={() => setPreview(false)}>
          Edit
        </CancelButton>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {Object.entries(values)
          .filter(([_, v]) => v !== "" && v !== null && v !== undefined)
          .map(([k, v]) => {
            let displayVal = "—";
            if (v instanceof File) {
              displayVal = v.name;
            } else if (typeof v === "boolean") {
              displayVal = v ? "Yes" : "No";
            } else if (v) {
              displayVal = String(v);
            }
            return (
              <div key={k} className="p-3 rounded-lg bg-muted/40 border">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{k}</p>
                <p className="font-medium mt-0.5 break-words">{displayVal}</p>
              </div>
            );
          })}
      </div>
      <div className="flex justify-end gap-2 mt-8">
        <CancelButton onClick={() => setPreview(false)}>
          Back
        </CancelButton>
        <SubmitButton
          onClick={submitForm}
          variant="contained"
          color="success"
          startIcon={<CheckCircle2 className="h-4 w-4" />}
        >
          Submit Admission
        </SubmitButton>
      </div>
    </Card>
  );
}
