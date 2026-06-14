import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Globe, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="max-w-4xl w-full space-y-12 text-center">
        <div className="space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-white shadow-glow mb-4">
            <GraduationCap className="h-10 w-10" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            EduPulse <span className="text-gradient">Portal</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your destination to continue. Access the administration backoffice or visit the
            public school website.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="group relative overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-300 p-8 hover:shadow-glow cursor-pointer">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <LayoutDashboard className="h-32 w-32" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto group-hover:scale-110 transition-transform">
                <LayoutDashboard className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Backoffice</h2>
                <p className="text-muted-foreground">
                  Manage admissions, students, teachers, fees and all school operations.
                </p>
              </div>
              <Button asChild size="lg" className="w-full gradient-primary text-white shadow-glow">
                <Link to="/login">Open Dashboard</Link>
              </Button>
            </div>
          </Card>

          <Card className="group relative overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-300 p-8 hover:shadow-glow cursor-pointer">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Globe className="h-32 w-32" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto group-hover:scale-110 transition-transform">
                <Globe className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Public Site</h2>
                <p className="text-muted-foreground">
                  Visit the main school website, academics, about page and contact info.
                </p>
              </div>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-2 hover:bg-accent"
              >
                <Link to="/site">Visit Site</Link>
              </Button>
            </div>
          </Card>
        </div>

        <p className="text-sm text-muted-foreground">
          Academic Session 2024 – 2025 · Secured by EduPulse Auth
        </p>
      </div>
    </div>
  );
}

export default LandingPage;
