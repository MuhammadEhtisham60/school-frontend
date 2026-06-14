import { Link, Outlet, useLocation } from "react-router-dom";
import {
  School,
  Menu,
  X,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSiteContent } from "@/data/site-content";

const nav = [
  { to: "/site", label: "Home" },
  { to: "/site/about", label: "About" },
  { to: "/site/academics", label: "Academics" },
  { to: "/site/admissions", label: "Admissions" },
  { to: "/site/campus", label: "Campus Life" },
  { to: "/site/contact", label: "Contact" },
];
function SiteLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;
  const [content] = useSiteContent();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 glass border-b">
        <div className="mx-auto max-w-7xl px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/site" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl gradient-primary shadow-glow flex items-center justify-center">
              <School className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-gradient text-base">{content.brand.name}</div>
              <div className="text-[10px] text-muted-foreground -mt-0.5">{content.brand.sub}</div>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((n) => {
              const active = n.to === "/site" ? pathname === "/site" : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`px-3.5 py-2 text-sm rounded-lg transition-smooth ${active ? "text-primary font-semibold bg-accent/60" : "text-foreground/70 hover:text-primary hover:bg-accent/40"}`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/">Backoffice</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="gradient-primary text-primary-foreground border-0 shadow-glow gap-1"
            >
              <Link to="/site/admissions">
                {content.hero.primaryCta} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {open && (
          <div className="lg:hidden border-t bg-card">
            <div className="px-4 py-3 flex flex-col gap-1">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 text-sm rounded-lg hover:bg-accent"
                >
                  {n.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-card/40 mt-12">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
                <School className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-gradient">{content.brand.name}</span>
            </div>
            <p className="text-sm text-muted-foreground">{content.footer.tagline}</p>
            <div className="flex gap-2 mt-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-9 w-9 rounded-lg border flex items-center justify-center hover:gradient-primary hover:text-primary-foreground transition-smooth"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {nav.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="hover:text-primary">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Programs</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Pre-Primary (Pre-K – KG)</li>
              <li>Primary (Grades 1–5)</li>
              <li>Middle School (6–8)</li>
              <li>High School (9–12)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary" /> {content.contact.address}
              </li>
              <li className="flex gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-primary" /> {content.contact.phone}
              </li>
              <li className="flex gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-primary" /> {content.contact.email}
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} EduPulse Academy. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default SiteLayout;
