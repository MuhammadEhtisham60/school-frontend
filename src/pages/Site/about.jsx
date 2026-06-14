import { Card } from "@/components/ui/card";
import { Heart, Target, Eye, Award } from "lucide-react";

function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden gradient-hero text-primary-foreground">
        <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-mesh)" }} />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 py-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
            About Us
          </span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold">
            A school built on heart, rigor & curiosity.
          </h1>
          <p className="mt-4 max-w-2xl text-white/85">
            Founded in 1998, EduPulse Academy began as a single-room kindergarten and has grown into
            a thriving K-12 community of 2,400+ learners.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-16 grid gap-6 md:grid-cols-3">
        {[
          {
            icon: Target,
            t: "Our Mission",
            d: "To educate the whole child — mind, heart and hands — for a meaningful life.",
          },
          {
            icon: Eye,
            t: "Our Vision",
            d: "A generation of compassionate, creative leaders shaping a kinder world.",
          },
          {
            icon: Heart,
            t: "Our Values",
            d: "Curiosity, integrity, empathy, excellence and joy in learning.",
          },
        ].map((b) => (
          <Card key={b.t} className="p-7 shadow-card card-hover">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <b.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="mt-4 text-xl font-semibold">{b.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.d}</p>
          </Card>
        ))}
      </section>

      <section className="bg-accent/30 border-y">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-16">
          <h2 className="text-3xl font-bold">Our journey</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {[
              { y: "1998", t: "Founded", d: "Started with 22 students in a single building." },
              { y: "2008", t: "New Campus", d: "Moved to our current 12-acre flagship campus." },
              {
                y: "2016",
                t: "Cambridge Partner",
                d: "Authorized Cambridge International School.",
              },
              {
                y: "2024",
                t: "Top 10 Award",
                d: "Ranked among the region's best private schools.",
              },
            ].map((m) => (
              <Card key={m.y} className="p-6 shadow-card relative overflow-hidden">
                <Award className="absolute -top-3 -right-3 h-20 w-20 text-primary/10" />
                <div className="text-3xl font-bold text-gradient">{m.y}</div>
                <div className="mt-2 font-semibold">{m.t}</div>
                <div className="text-sm text-muted-foreground mt-1">{m.d}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
