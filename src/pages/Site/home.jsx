import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Sparkles,
  GraduationCap,
  Trophy,
  Users,
  BookOpen,
  Microscope,
  Palette,
  Music,
  Globe2,
  Star,
  CheckCircle2,
} from "lucide-react";
import { useSiteContent } from "@/data/site-content";

const features = [
  {
    icon: Microscope,
    title: "STEM Labs",
    desc: "State-of-the-art science, robotics and computing labs.",
  },
  {
    icon: Palette,
    title: "Creative Arts",
    desc: "Studios for visual arts, design and performance.",
  },
  {
    icon: Music,
    title: "Music & Theatre",
    desc: "Choir, orchestra and an annual main-stage production.",
  },
  { icon: Globe2, title: "Global Curriculum", desc: "Cambridge & national board pathways." },
  {
    icon: Trophy,
    title: "Sports Excellence",
    desc: "12+ sports with certified coaches and inter-school leagues.",
  },
  {
    icon: BookOpen,
    title: "Modern Library",
    desc: "30,000+ titles, e-books and quiet study zones.",
  },
];
function HomePage() {
  const [content] = useSiteContent();
  const stats = content.stats;
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-mesh)" }} />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 py-20 md:py-28 grid lg:grid-cols-2 gap-10 items-center">
          <div className="text-primary-foreground animate-fade-in-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-medium border border-white/20">
              <Sparkles className="h-3.5 w-3.5" /> {content.hero.badge}
            </span>
            <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              {content.hero.title} <span className="italic">{content.hero.titleAccent}</span>
            </h1>
            <p className="mt-5 text-lg text-white/85 max-w-xl">{content.hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-lg gap-2"
              >
                <Link to="/site/admissions">
                  {content.hero.primaryCta} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Link to="/site/about">{content.hero.secondaryCta}</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-white/80">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-9 w-9 rounded-full border-2 border-white bg-gradient-to-br from-white/40 to-white/10"
                  />
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                ))}
                <span className="ml-1.5">Rated 4.9 by 800+ parents</span>
              </div>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute -inset-4 rounded-3xl bg-white/10 blur-2xl" />
            <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl aspect-[4/5] bg-gradient-to-br from-white/20 to-white/5 backdrop-blur">
              <div className="absolute inset-0 grid grid-cols-2 gap-2 p-2">
                {[GraduationCap, BookOpen, Microscope, Palette].map((Icon, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/10"
                  >
                    <Icon className="h-12 w-12 text-white/90" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 -mt-10 relative z-10">
        <Card className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 md:p-8 shadow-elegant">
          {stats.map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gradient">{s.v}</div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </Card>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            What Sets Us Apart
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold">
            A campus designed for <span className="text-gradient">whole-child growth</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Six pillars that shape every EduPulse experience — from kindergarten to graduation.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card
              key={f.title}
              className="p-6 card-hover shadow-card relative overflow-hidden group"
            >
              <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full opacity-10 blur-2xl gradient-primary group-hover:opacity-25 transition-smooth" />
              <div className="relative">
                <div className="h-12 w-12 rounded-xl gradient-primary shadow-glow flex items-center justify-center">
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* WHY EDUPULSE */}
      <section className="bg-accent/30 border-y">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              {content.promise.eyebrow}
            </span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold">
              {content.promise.title}{" "}
              <span className="text-gradient">{content.promise.titleAccent}</span>
            </h2>
            <p className="mt-4 text-muted-foreground">{content.promise.description}</p>
            <ul className="mt-6 space-y-3">
              {content.promise.bullets.map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">{t}</span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="mt-8 gradient-primary text-primary-foreground border-0 shadow-glow gap-2"
            >
              <Link to="/site/academics">
                Explore Academics <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Users, t: "Tight Community", d: "Family-style houses & mentors." },
              { icon: Trophy, t: "Award Winning", d: "Top 10 in regional rankings." },
              { icon: Globe2, t: "Globally Minded", d: "Partners across 14 countries." },
              { icon: GraduationCap, t: "Ivy Pathway", d: "Dedicated college-counselling team." },
            ].map((c) => (
              <Card key={c.t} className="p-5 card-hover shadow-card">
                <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                  <c.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h4 className="mt-3 font-semibold">{c.t}</h4>
                <p className="text-xs text-muted-foreground mt-1">{c.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Voices
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold">
            Loved by parents. Trusted by students.
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              n: "Ayesha K.",
              r: "Parent, Grade 7",
              q: "The teachers genuinely know my child. The growth in just one year has been incredible.",
            },
            {
              n: "Daniyal M.",
              r: "Alumni, Class of '23",
              q: "EduPulse gave me the confidence to apply to NUS — and a community that still feels like home.",
            },
            {
              n: "Sarah R.",
              r: "Parent, KG",
              q: "From the warm welcome to the modern campus, every detail screams care and quality.",
            },
          ].map((t) => (
            <Card key={t.n} className="p-6 shadow-card card-hover">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mt-4 text-sm text-foreground/80 leading-relaxed">"{t.q}"</p>
              <div className="mt-4 flex items-center gap-3 pt-4 border-t">
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                  {t.n[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.n}</div>
                  <div className="text-xs text-muted-foreground">{t.r}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl gradient-hero p-10 md:p-14 text-center text-primary-foreground shadow-elegant">
          <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-mesh)" }} />
          <div className="relative">
            <h3 className="text-3xl md:text-4xl font-bold">Ready to join the EduPulse family?</h3>
            <p className="mt-3 text-white/85 max-w-xl mx-auto">
              Limited seats available for the 2025–26 session. Schedule a campus tour or apply
              online today.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-lg"
              >
                <Link to="/site/admissions">Apply Online</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Link to="/site/contact">Book a Tour</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
