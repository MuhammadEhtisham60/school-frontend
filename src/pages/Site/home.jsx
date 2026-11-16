import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  GraduationCap,
  Users,
  BookOpen,
  Star,
  CheckCircle2,
  CalendarCheck,
  Wallet,
  Calculator,
  Clock,
  FileText,
  Award,
  Library,
  Bell,
  CalendarDays,
  BarChart3,
  FolderOpen,
  FileStack,
  Layers,
  BookOpenCheck,
  UserPlus,
  ShieldCheck,
  FileSpreadsheet,
  FileDown,
  Zap,
  LayoutDashboard,
} from "lucide-react";
import { useSiteContent } from "@/data/site-content";

const erpCategories = [
  { id: "all", label: "All ERP Modules (18)" },
  { id: "academics", label: "Academics & Exams" },
  { id: "operations", label: "Students & Daily Ops" },
  { id: "finance", label: "Finance & Payroll (PKR)" },
  { id: "admin", label: "Resources & Admin" },
];

const erpModules = [
  {
    title: "Dashboard & Live KPIs",
    category: "admin",
    icon: LayoutDashboard,
    url: "/backoffice",
    desc: "Executive command center with real-time counts for students, teachers, fee collection in PKR, and teacher distribution.",
    highlights: ["Real-time PKR collection charts", "Recent campus activity feed", "Quick-action overview"],
  },
  {
    title: "Admissions & Onboarding",
    category: "operations",
    icon: UserPlus,
    url: "/admission",
    desc: "Structured multi-step student admission workflow capturing personal, guardian, academic, and initial PKR fee details.",
    highlights: ["Multi-step digital form", "Auto roll-number readiness", "Instant student profile creation"],
  },
  {
    title: "Student Directory & 360° Profile",
    category: "operations",
    icon: GraduationCap,
    url: "/students",
    desc: "Complete student records with roll numbers, class placement, PKR fee history, and exam performance in one place.",
    highlights: ["Class & section filtering", "Fee & result history tabs", "Printable student profiles"],
  },
  {
    title: "Smart Attendance System",
    category: "operations",
    icon: CalendarCheck,
    url: "/attendance",
    desc: "Class-wise attendance cards, monthly register views, and one-click daily roll-call with Present (P), Absent (A), and Leave (L).",
    highlights: ["Class cards & monthly register", "Optional leave reason notes", "Live P / A / L summary cards"],
  },
  {
    title: "Classes & Active Sections",
    category: "academics",
    icon: Layers,
    url: "/classes",
    desc: "Manage active classes from Nursery to Class 10 with sidebar quick-navigation, capacity tracking, and direct attendance links.",
    highlights: ["Sidebar active-class dropdown", "Direct class attendance button", "Student roster per class"],
  },
  {
    title: "Subjects & Curriculum",
    category: "academics",
    icon: BookOpenCheck,
    url: "/subjects",
    desc: "Define subjects, codes, and class-teacher assignments with dedicated detail pages and downloadable reports.",
    highlights: ["Subject detail pages", "Teacher & class mapping", "PDF & Excel exports"],
  },
  {
    title: "Class Routine & Timetable",
    category: "academics",
    icon: Clock,
    url: "/class-routine",
    desc: "Organize weekly period schedules by class and teacher with conflict-aware time slots and printable routine sheets.",
    highlights: ["Day & period timetable grid", "Teacher & room assignment", "PDF & Excel routine export"],
  },
  {
    title: "Exams & Date-Sheets",
    category: "academics",
    icon: FileText,
    url: "/exam",
    desc: "Create term exams, configure subject schedules and max marks, and inspect full exam detail pages.",
    highlights: ["Term & board exam setup", "Detailed exam schedules", "Downloadable PDF & Excel"],
  },
  {
    title: "Results & Gradebooks",
    category: "academics",
    icon: Award,
    url: "/result",
    desc: "Real-time result tracking with automated percentage, grade calculation, and full class result ledgers.",
    highlights: ["Live marks & grade sync", "Class-wise result ledgers", "PDF & Excel mark sheets"],
  },
  {
    title: "Fee Management (PKR)",
    category: "finance",
    icon: Wallet,
    url: "/fees",
    desc: "End-to-end PKR fee management covering monthly tuition, paid/pending status, defaulters, and instant receipts.",
    highlights: ["100% PKR currency formatting", "Paid, pending & overdue tracking", "Fee voucher & receipt PDFs"],
  },
  {
    title: "Accountant & Staff Payroll",
    category: "finance",
    icon: Calculator,
    url: "/accountant",
    desc: "Manage teacher and staff salaries in PKR including basic pay, allowances, bonuses, deductions, and net payable.",
    highlights: ["PKR salary disbursement", "Allowance & deduction breakdown", "Monthly payroll ledger"],
  },
  {
    title: "Teachers & Faculty Portal",
    category: "operations",
    icon: BookOpen,
    url: "/teachers",
    desc: "Maintain faculty profiles, subject specialties, class assignments, and monthly PKR salary history.",
    highlights: ["Faculty directory & details", "Department distribution", "Payroll & assignment links"],
  },
  {
    title: "Analytics & Reports",
    category: "finance",
    icon: BarChart3,
    url: "/reports",
    desc: "Visual and tabular management reports for fees, attendance, admissions, and academic performance.",
    highlights: ["Real-time data visualizations", "Filterable report views", "Export-ready summaries"],
  },
  {
    title: "Notice Board & Circulars",
    category: "operations",
    icon: Bell,
    url: "/notice",
    desc: "Publish campus announcements and circulars with priority tags and target audience visibility.",
    highlights: ["Instant campus circulars", "Role-targeted notices", "Archive & search"],
  },
  {
    title: "Event Calendar",
    category: "operations",
    icon: CalendarDays,
    url: "/event-calendar",
    desc: "Plan academic milestones, parent-teacher meetings, holidays, and exams on a shared school calendar.",
    highlights: ["Monthly & upcoming views", "Exam & holiday sync", "Campus event tracking"],
  },
  {
    title: "Library Management",
    category: "academics",
    icon: Library,
    url: "/library",
    desc: "Catalog books, track student and faculty book issues, monitor due dates, and manage library inventory.",
    highlights: ["Book catalog & ISBNs", "Issue & return tracking", "Overdue alerts"],
  },
  {
    title: "File Manager & Paper Bank",
    category: "admin",
    icon: FolderOpen,
    url: "/file-manager",
    desc: "Centralized digital vault for school documents paired with a dedicated Question Paper Collection archive.",
    highlights: ["Organized school documents", "Past paper collection", "Quick class/subject lookup"],
  },
  {
    title: "Role-Based Access & Admin",
    category: "admin",
    icon: ShieldCheck,
    url: "/role-users",
    desc: "Granular user management for Admins, Teachers, Accountants, and Staff with secure authentication and settings.",
    highlights: ["Admin & user directories", "Role-based permissions", "System-wide configuration"],
  },
];

const stakeholderRoles = [
  {
    id: "principal",
    label: "Principals & Admins",
    headline: "Complete institutional visibility in real time.",
    desc: "Monitor daily student attendance, track PKR fee collection vs. pending dues, review exam result ledgers, and govern user roles from one executive dashboard.",
    points: [
      "Live KPI dashboard with PKR revenue & payroll metrics",
      "Role-based access control across departments",
      "Instant PDF & Excel exports for board meetings",
    ],
  },
  {
    id: "teacher",
    label: "Teachers & Faculty",
    headline: "Spend less time on paperwork, more time teaching.",
    desc: "Mark class attendance in seconds with P / A / L buttons and optional leave reasons, check weekly class routines, and access past exam papers effortlessly.",
    points: [
      "Fast daily roll-call with roll numbers & summary cards",
      "Clear weekly class routine and subject schedules",
      "Exam marks entry & Question Paper Collection vault",
    ],
  },
  {
    id: "accountant",
    label: "Accountants & Finance",
    headline: "Zero-error PKR billing and staff payroll.",
    desc: "Automate monthly student fee tracking in PKR, generate clean receipts, and manage teacher basic pay, allowances, bonuses, and deductions accurately.",
    points: [
      "Consistent PKR currency formatting across all ledgers",
      "Paid, pending, and overdue fee filters",
      "Automated net-payable salary calculations",
    ],
  },
  {
    id: "parent",
    label: "Students & Parents",
    headline: "Transparent academics, attendance, and schedules.",
    desc: "Stay informed with real-time exam results, monthly attendance registers, school notices, event calendars, and clear PKR fee records.",
    points: [
      "Detailed term-wise exam schedules and results",
      "Transparent daily & monthly attendance records",
      "Up-to-date notices and academic event calendar",
    ],
  },
];

function HomePage() {
  const [content] = useSiteContent();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeRole, setActiveRole] = useState("principal");

  const filteredModules =
    activeCategory === "all"
      ? erpModules
      : erpModules.filter((m) => m.category === activeCategory);

  const selectedRole =
    stakeholderRoles.find((r) => r.id === activeRole) || stakeholderRoles[0];

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-95" />
        <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-mesh)" }} />
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 text-primary-foreground animate-fade-in-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3.5 py-1 text-xs font-medium border border-white/20">
              <Sparkles className="h-3.5 w-3.5" /> {content.hero.badge}
            </span>
            <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
              {content.hero.title}{" "}
              <span className="italic text-white/95">{content.hero.titleAccent}</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-white/85 max-w-xl leading-relaxed">
              {content.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-lg gap-2 font-semibold"
              >
                <a href="#erp-modules">
                  {content.hero.secondaryCta} <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 gap-2"
              >
                <Link to="/">
                  <LayoutDashboard className="h-4 w-4" /> Open ERP Backoffice
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs md:text-sm text-white/85">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" /> PKR Billing &amp; Payroll
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" /> Smart P / A / L Attendance
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" /> PDF &amp; Excel Exports
              </span>
            </div>
          </div>

          {/* Interactive Modern ERP Preview Card */}
          <div className="lg:col-span-6">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-white/15 blur-2xl" />
              <div className="relative rounded-3xl border border-white/25 bg-slate-950/60 backdrop-blur-xl p-5 md:p-6 text-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">EduPulse Live ERP Suite</div>
                      <div className="text-[11px] text-white/65">
                        Unified School Operations • 2025–26
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[11px]">
                    Real-Time Sync
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 border border-white/10 p-3.5">
                    <div className="text-[11px] text-white/70">Monthly Fee Collection</div>
                    <div className="mt-1 text-xl font-bold">PKR 1.48M</div>
                    <div className="mt-1 text-[11px] text-emerald-300">
                      Automated Vouchers &amp; Receipts
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/10 border border-white/10 p-3.5">
                    <div className="text-[11px] text-white/70">Today&apos;s Attendance</div>
                    <div className="mt-1 text-xl font-bold">96.4% Present</div>
                    <div className="mt-2 flex gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-200">
                        P
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/25 text-rose-200">
                        A
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-200">
                        L + Reason
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-white/10 border border-white/10 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/80 font-medium">
                      Included Core ERP Capabilities
                    </span>
                    <span className="text-white/60">18 Modules</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    {[
                      "Class Routines",
                      "Exams & Results",
                      "PKR Payroll",
                      "Admissions",
                      "Library & Papers",
                      "PDF / Excel Export",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between pt-2 text-xs text-white/75">
                  <span className="inline-flex items-center gap-1.5">
                    <FileDown className="h-3.5 w-3.5" /> Instant PDF
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <FileSpreadsheet className="h-3.5 w-3.5" /> Excel Ledgers
                  </span>
                  <Link
                    to="/site/admissions"
                    className="inline-flex items-center gap-1 font-semibold text-white hover:underline"
                  >
                    Apply Now <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 -mt-8 relative z-10">
        <Card className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 md:p-8 shadow-elegant border-primary/10">
          {content.stats.map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-gradient">{s.v}</div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </Card>
      </section>

      {/* COMPLETE ERP MODULES SHOWCASE */}
      <section id="erp-modules" className="mx-auto max-w-7xl px-4 md:px-6 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Complete School ERP Architecture
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold">
            Everything provided in our <span className="text-gradient">Modern School ERP</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Explore every module built into our platform — designed to eliminate manual registers,
            unify academics with PKR finance, and give every stakeholder real-time clarity.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {erpCategories.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <Button
                key={cat.id}
                variant={active ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className={
                  active
                    ? "gradient-primary text-primary-foreground border-0 shadow-glow"
                    : "hover:border-primary/40"
                }
              >
                {cat.label}
              </Button>
            );
          })}
        </div>

        {/* Module Cards Grid */}
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredModules.map((mod) => (
            <Card
              key={mod.title}
              className="p-6 card-hover shadow-card relative overflow-hidden group flex flex-col justify-between"
            >
              <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full opacity-10 blur-2xl gradient-primary group-hover:opacity-25 transition-smooth" />
              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="h-11 w-11 rounded-xl gradient-primary shadow-glow flex items-center justify-center shrink-0">
                    <mod.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                    {mod.category}
                  </Badge>
                </div>
                <h3 className="mt-4 font-semibold text-lg">{mod.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{mod.desc}</p>
                <ul className="mt-4 space-y-1.5">
                  {mod.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-center gap-2 text-xs text-foreground/80"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative mt-5 pt-4 border-t flex items-center justify-between">
                <Link
                  to={mod.url}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  Open Module <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <span className="text-[11px] text-muted-foreground">Live in ERP</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ROLE-BASED WORKFLOWS */}
      <section className="bg-accent/30 border-y">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-20">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Built For Every Role
              </span>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold">
                Tailored workflows for <span className="text-gradient">your entire campus</span>
              </h2>
              <p className="mt-3 text-muted-foreground text-sm md:text-base">
                Select a role to see how our ERP simplifies daily work for principals, teachers,
                accountants, and families.
              </p>

              <div className="mt-6 flex flex-col gap-2">
                {stakeholderRoles.map((role) => {
                  const active = role.id === activeRole;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setActiveRole(role.id)}
                      className={`text-left px-4 py-3 rounded-xl border transition-smooth flex items-center justify-between ${
                        active
                          ? "gradient-primary text-primary-foreground border-transparent shadow-glow"
                          : "bg-card hover:border-primary/40 text-foreground"
                      }`}
                    >
                      <span className="font-medium text-sm">{role.label}</span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-7">
              <Card className="p-7 md:p-9 shadow-elegant border-primary/15">
                <Badge variant="secondary" className="mb-3">
                  {selectedRole.label}
                </Badge>
                <h3 className="text-2xl md:text-3xl font-bold">{selectedRole.headline}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{selectedRole.desc}</p>
                <ul className="mt-6 space-y-3">
                  {selectedRole.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm font-medium">{pt}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    asChild
                    className="gradient-primary text-primary-foreground border-0 shadow-glow gap-2"
                  >
                    <Link to="/">
                      Launch ERP Dashboard <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/site/academics">Explore Academic Programs</Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* MODERN ERA PROMISE */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
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
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              icon: CalendarCheck,
              t: "Smart Attendance",
              d: "Class cards, monthly register & P / A / L quick marking.",
            },
            {
              icon: Wallet,
              t: "PKR Finance Engine",
              d: "Automated fee vouchers, receipts & payroll ledgers.",
            },
            {
              icon: FileSpreadsheet,
              t: "PDF & Excel Ready",
              d: "One-click exports for routines, exams & results.",
            },
            {
              icon: Users,
              t: "Connected Campus",
              d: "Notices, calendar, library & file vault in sync.",
            },
          ].map((c) => (
            <Card key={c.t} className="p-5 card-hover shadow-card">
              <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                <c.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h4 className="mt-3 font-semibold">{c.t}</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{c.d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-accent/20 border-t">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Community Trust
            </span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold">
              Trusted by educators, parents, and administrators.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                n: "Ayesha K.",
                r: "Parent, Class 7",
                q: "Attendance updates, exam results, and PKR fee receipts are always clear and accurate. It feels like a truly modern school.",
              },
              {
                n: "Sir Hamza R.",
                r: "Senior Science Teacher",
                q: "Marking attendance with P / A / L and leave reasons takes under a minute, and my class routines and exam papers are always organized.",
              },
              {
                n: "Tariq M.",
                r: "Campus Administrator",
                q: "Having admissions, PKR fee collection, payroll, and result ledgers in one ERP eliminated hours of manual spreadsheet work.",
              },
            ].map((t) => (
              <Card key={t.n} className="p-6 shadow-card card-hover">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mt-4 text-sm text-foreground/80 leading-relaxed">&ldquo;{t.q}&rdquo;</p>
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
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl gradient-hero p-10 md:p-14 text-center text-primary-foreground shadow-elegant">
          <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-mesh)" }} />
          <div className="relative">
            <h3 className="text-3xl md:text-4xl font-bold">
              Experience a modern school powered by smart ERP
            </h3>
            <p className="mt-3 text-white/85 max-w-2xl mx-auto">
              Admissions for the 2025–26 academic session are open. Explore our ERP backoffice or
              submit a student application online today.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-lg font-semibold"
              >
                <Link to="/site/admissions">Apply Online</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Link to="/">Open ERP Backoffice</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
