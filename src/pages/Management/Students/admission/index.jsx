import { useState } from "react";
import { Formik } from "formik";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PrimaryButton, CancelButton } from "@/components/common/buttons";
import { cn } from "@/utils/utils";
import { toast } from "sonner";
import { useCreateStudentMutation } from "@/services/private/studentService";
import {
  User,
  BookOpen,
  Phone,
  Users as UsersIcon,
  HeartPulse,
  Bus,
  FileUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Save,
  Sparkles,
} from "lucide-react";
import { initialValues, validationSchema } from "./util/helpers";
import {
  PersonalInformation,
  AcademicInformation,
  ContactInformation,
  ParentInformation,
  HealthInformation,
  TransportHostel,
  Documents,
  ReviewSubmit,
} from "./stepcomponent";

const steps = [
  { id: 1, title: "Basic Info", icon: User, desc: "Personal details" },
  { id: 2, title: "Academic", icon: BookOpen, desc: "Class & history" },
  { id: 3, title: "Contact", icon: Phone, desc: "Address & phone" },
  { id: 4, title: "Guardian", icon: UsersIcon, desc: "Parent details" },
  { id: 5, title: "Health", icon: HeartPulse, desc: "Medical info" },
  { id: 6, title: "Transport", icon: Bus, desc: "Bus & hostel" },
  { id: 7, title: "Documents", icon: FileUp, desc: "Upload files" },
];

function AdmissionPage() {
  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState(false);
  const navigate = useNavigate();
  const [createStudent, { isLoading }] = useCreateStudentMutation();
  const progress = (step / steps.length) * 100;
  const next = () => setStep((s) => Math.min(s + 1, steps.length));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values, { resetForm }) => {
        try {
          const formData = new FormData();
          Object.entries(values).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              formData.append(key, value);
            }
          });
          await createStudent(formData).unwrap();
          toast.success("Admission submitted successfully!", {
            description: `${values.fullName || "Student"} has been enrolled.`,
          });
          setStep(1);
          setPreview(false);
          resetForm();
          navigate("/students");
        } catch (err) {
          toast.error(err?.data?.message || "Failed to submit admission.");
        }
      }}
    >
      {(formikProps) => {
        const handleDraft = () => {
          toast.success("Saved as draft", { description: "You can resume anytime." });
        };

        return (
          <div className="space-y-6">
            <PageHeader
              eyebrow="Admissions"
              title="New Student Admission"
              description="Complete the 7-step form to enroll a new student. All sections are validated before submission."
              actions={
                <>
                  <CancelButton onClick={handleDraft} startIcon={<Save className="h-4 w-4" />}>
                    Save Draft
                  </CancelButton>
                  <Badge className="gradient-primary border-0 text-primary-foreground gap-1">
                    <Sparkles className="h-3 w-3" /> Smart Form
                  </Badge>
                </>
              }
            />

            {/* Stepper */}
            <Card className="p-6 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">
                  Step {step} of {steps.length}
                </p>
                <p className="text-sm text-muted-foreground">{Math.round(progress)}% complete</p>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6">
                {steps.map((s) => {
                  const active = s.id === step;
                  const done = s.id < step;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStep(s.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-smooth border",
                        active &&
                          "gradient-primary text-primary-foreground border-transparent shadow-glow",
                        done && !active && "bg-success/10 text-success border-success/30",
                        !active && !done && "border-border hover:bg-muted/60",
                      )}
                    >
                      <div
                        className={cn(
                          "h-9 w-9 rounded-full flex items-center justify-center",
                          active ? "bg-white/20" : done ? "bg-success/20" : "bg-muted",
                        )}
                      >
                        {done ? <CheckCircle2 className="h-5 w-5" /> : <s.icon className="h-4 w-4" />}
                      </div>
                      <span className="text-xs font-semibold">{s.title}</span>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Form body */}
            {!preview ? (
              <Card className="p-6 md:p-8 shadow-card animate-fade-in-up">
                {step === 1 && <PersonalInformation {...formikProps} />}
                {step === 2 && <AcademicInformation {...formikProps} />}
                {step === 3 && <ContactInformation {...formikProps} />}
                {step === 4 && <ParentInformation {...formikProps} />}
                {step === 5 && <HealthInformation {...formikProps} />}
                {step === 6 && <TransportHostel {...formikProps} />}
                {step === 7 && <Documents {...formikProps} />}

                <div className="flex justify-between mt-8 pt-6 border-t">
                  <CancelButton
                    onClick={prev}
                    disabled={step === 1}
                    startIcon={<ChevronLeft className="h-4 w-4" />}
                  >
                    Back
                  </CancelButton>
                  {step < steps.length ? (
                    <PrimaryButton
                      onClick={next}
                      endIcon={<ChevronRight className="h-4 w-4" />}
                    >
                      Next Step
                    </PrimaryButton>
                  ) : (
                    <PrimaryButton
                      onClick={() => setPreview(true)}
                      endIcon={<ChevronRight className="h-4 w-4" />}
                    >
                      Preview
                    </PrimaryButton>
                  )}
                </div>
              </Card>
            ) : (
              <ReviewSubmit setPreview={setPreview} isLoading={isLoading} {...formikProps} />
            )}
          </div>
        );
      }}
    </Formik>
  );
}

export default AdmissionPage;
