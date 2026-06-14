import { Card } from "@/components/ui/card";
import { Baby, BookOpen, Beaker, GraduationCap } from "lucide-react";

const programs = [
  {
    icon: Baby,
    t: "Early Years",
    g: "Pre-K – KG",
    d: "Play-based learning, phonics, motor skills and social-emotional foundations.",
  },
  {
    icon: BookOpen,
    t: "Primary School",
    g: "Grades 1 – 5",
    d: "Core literacy & numeracy, languages, arts, PE and inquiry-led STEM.",
  },
  {
    icon: Beaker,
    t: "Middle School",
    g: "Grades 6 – 8",
    d: "Integrated STEM, humanities, electives and leadership pathways.",
  },
  {
    icon: GraduationCap,
    t: "High School",
    g: "Grades 9 – 12",
    d: "Cambridge IGCSE & A-Levels, AP options, college counselling.",
  },
];
function AcademicsPage() {
  return (
    <div>
      <section className="relative overflow-hidden gradient-hero text-primary-foreground">
        <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-mesh)" }} />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 py-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Academics
          </span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">
            A curriculum that grows with your child.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-16 grid gap-6 md:grid-cols-2">
        {programs.map((p) => (
          <Card key={p.t} className="p-7 shadow-card card-hover relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full gradient-primary opacity-10 blur-2xl" />
            <div className="relative">
              <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <p.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <h3 className="text-xl font-bold">{p.t}</h3>
                <span className="text-xs text-primary font-semibold uppercase tracking-wider">
                  {p.g}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.d}</p>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}

export default AcademicsPage;
