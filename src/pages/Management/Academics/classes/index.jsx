import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Layers, GraduationCap, Users, School, BookOpen, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { useGetClassesDropdownQuery } from "@/services/private/classService";
import { useGetStudentsQuery } from "@/services/private/studentService";

function ClassesPage() {
  const navigate = useNavigate();

  // Queries
  const { data: classesResponse, isLoading: isClassesLoading, error: classesError } = useGetClassesDropdownQuery();
  const { data: studentsResponse, isLoading: isStudentsLoading } = useGetStudentsQuery({ limit: 1000 });

  const classesList = classesResponse?.data || [];
  const studentsList = studentsResponse?.students || [];

  // Enrolled students mapped by class name
  const classStudentCounts = useMemo(() => {
    const counts = {};
    studentsList.forEach((student) => {
      const className = student.class;
      if (className) {
        counts[className] = (counts[className] || 0) + 1;
      }
    });
    return counts;
  }, [studentsList]);

  // Derive level description based on name
  const getLevelDetails = (name) => {
    const cleanName = name.toLowerCase().trim();
    if (cleanName === "nursery" || cleanName === "kg") {
      return {
        type: "Early Childhood Education",
        desc: "Foundation-level pre-school curriculum focusing on developmental milestones and basic cognitive skills.",
        color: "from-pink-500/10 to-rose-500/10 text-pink-600 dark:text-pink-400",
      };
    }
    const num = parseInt(cleanName, 10);
    if (!isNaN(num)) {
      if (num >= 1 && num <= 5) {
        return {
          type: "Primary Education",
          desc: `Elementary curriculum for class ${name} focusing on core numeracy, literacy, and introductory sciences.`,
          color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400",
        };
      }
      if (num >= 6 && num <= 8) {
        return {
          type: "Middle School",
          desc: `Middle school program for class ${name} bridging elementary learning with advanced secondary studies.`,
          color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400",
        };
      }
      if (num >= 9 && num <= 10) {
        return {
          type: "High School (Matriculation)",
          desc: `Secondary matriculation board prep class ${name} with focus on elective majors (Science/Arts/Commerce).`,
          color: "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400",
        };
      }
      if (num >= 11 && num <= 12) {
        return {
          type: "Higher Secondary (Intermediate)",
          desc: `Intermediate pre-university class ${name} specializing in Pre-Medical, Pre-Engineering, or Humanities.`,
          color: "from-violet-500/10 to-fuchsia-500/10 text-violet-600 dark:text-violet-400",
        };
      }
    }
    return {
      type: "General Academics",
      desc: `Academic level curriculum for class ${name} aligned with national education board standards.`,
      color: "from-blue-500/10 to-violet-500/10 text-blue-600 dark:text-blue-400",
    };
  };

  const totalClasses = classesList.length;
  const totalStudents = studentsList.length;
  const avgStudents = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;
  
  const earlyChildhoodCount = classesList.filter(
    (c) => c.name.toLowerCase() === "nursery" || c.name.toLowerCase() === "kg"
  ).length;

  if (isClassesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading academic levels...</p>
      </div>
    );
  }

  if (classesError) {
    return (
      <Card className="p-8 border-destructive/20 bg-destructive/5 flex items-center gap-4 text-destructive shadow-card max-w-2xl mx-auto my-12">
        <AlertCircle className="h-8 w-8 animate-bounce" />
        <div>
          <h3 className="font-semibold text-lg">Failed to retrieve classes</h3>
          <p className="text-sm opacity-90 mt-1">
            {classesError?.data?.message || "Verify your connection or contact the administrator."}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        eyebrow="Academics"
        title="Classes Management"
        description="View and configure core academic classes, sections and student distributions."
      />

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Classes"
          value={totalClasses}
          icon={Layers}
          variant="primary"
          sub="Configured levels"
        />
        <StatCard
          label="Total Enrolled"
          value={totalStudents}
          icon={GraduationCap}
          variant="success"
          sub="Across all classes"
        />
        <StatCard
          label="Avg Student Density"
          value={`${avgStudents} Students`}
          icon={Users}
          variant="info"
          sub="Per academic level"
        />
        <StatCard
          label="Early Childhood"
          value={earlyChildhoodCount}
          icon={School}
          variant="warning"
          sub="Nursery & KG levels"
        />
      </div>

      <Card className="glass-card border-0 shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Academic Levels & Divisions</CardTitle>
              <CardDescription>
                Currently active classes sorted by system-defined display order
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {classesList.map((c, idx) => {
              const details = getLevelDetails(c.name);
              const studentCount = classStudentCounts[c.name] || 0;

              return (
                <div
                  key={c._id}
                  className="flex flex-col justify-between p-5 rounded-2xl glass-card border border-border/50 card-hover relative group"
                >
                  {/* Subtle Background Glow on Hover */}
                  <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300 pointer-events-none" />
                  
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${details.color} border-0 shadow-sm`}>
                        {details.type}
                      </span>
                      <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        Index #{c._id}
                      </span>
                    </div>

                    {/* Class Name */}
                    <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" /> Class {c.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                      {details.desc}
                    </p>
                  </div>

                  {/* Footer Stats and Action */}
                  <div className="border-t border-border/50 pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                        Enrolled Students
                      </p>
                      <p className="text-lg font-extrabold text-foreground mt-0.5">
                        {studentCount} {studentCount === 1 ? "Student" : "Students"}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary-glow font-semibold text-xs gap-1 group-hover:translate-x-1 transition-all duration-300 px-2.5 h-8"
                      onClick={() => navigate(`/students?class=${encodeURIComponent(c.name)}`)}
                    >
                      View Students <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ClassesPage;
