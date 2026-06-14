import { Card } from "@/components/ui/card";
import { Trophy, Music, Palette, Users, Globe2, Heart } from "lucide-react";

const items = [
  {
    icon: Trophy,
    t: "Sports & Athletics",
    d: "Football, cricket, basketball, swimming, athletics, badminton & more.",
  },
  {
    icon: Music,
    t: "Music & Performing Arts",
    d: "School orchestra, choir, drama club and our annual main-stage musical.",
  },
  {
    icon: Palette,
    t: "Visual Arts & Design",
    d: "Studios for painting, ceramics, photography and digital design.",
  },
  {
    icon: Users,
    t: "Student Council",
    d: "Student-led governance, debates and Model United Nations.",
  },
  {
    icon: Globe2,
    t: "Global Exchanges",
    d: "Partnerships in 14 countries — language immersion & service trips.",
  },
  {
    icon: Heart,
    t: "Community Service",
    d: "Every student contributes 30+ hours of service per year.",
  },
];
function CampusPage() {
  return (
    <div>
      <section className="relative overflow-hidden gradient-hero text-primary-foreground">
        <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-mesh)" }} />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 py-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Campus Life
          </span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">Beyond the classroom.</h1>
          <p className="mt-4 max-w-2xl text-white/85">
            A vibrant calendar of sports, arts, leadership and service.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <Card key={i.t} className="p-6 shadow-card card-hover">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <i.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="mt-4 font-semibold">{i.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{i.d}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}

export default CampusPage;
