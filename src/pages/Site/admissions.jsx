import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, ClipboardCheck, MessageSquare, GraduationCap } from "lucide-react";

const steps = [
  { icon: FileText, t: "Submit Inquiry", d: "Tell us about your child and preferred grade level." },
  {
    icon: ClipboardCheck,
    t: "Online Application",
    d: "Complete the detailed admission form & upload documents.",
  },
  {
    icon: MessageSquare,
    t: "Assessment & Interview",
    d: "Age-appropriate evaluation and a friendly family chat.",
  },
  {
    icon: GraduationCap,
    t: "Welcome to EduPulse",
    d: "Receive offer letter, complete enrolment & onboarding.",
  },
];
function AdmissionsPage() {
  return (
    <div>
      <section className="relative overflow-hidden gradient-hero text-primary-foreground">
        <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-mesh)" }} />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 py-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Admissions 2025–26
          </span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">Begin your EduPulse journey.</h1>
          <p className="mt-4 max-w-2xl text-white/85">
            A simple, transparent four-step process designed to help us get to know your family.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-white text-primary hover:bg-white/90 shadow-lg gap-2"
          >
            <Link to="/admission">
              Start Application <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Card key={s.t} className="p-6 shadow-card card-hover relative">
              <div className="absolute top-4 right-4 text-5xl font-bold text-primary/10">
                0{i + 1}
              </div>
              <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <s.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mt-4 font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-12 p-8 shadow-elegant">
          <h3 className="text-xl font-bold">Required Documents</h3>
          <ul className="mt-4 grid gap-2 md:grid-cols-2 text-sm text-muted-foreground">
            {[
              "Birth certificate (copy)",
              "Previous school report card",
              "Passport-size photographs (4)",
              "Parent/guardian CNIC copies",
              "Vaccination record",
              "Transfer certificate (if applicable)",
            ].map((d) => (
              <li key={d} className="flex gap-2">
                <span className="text-primary">•</span>
                {d}
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}

export default AdmissionsPage;
