import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { PageHeader } from "@/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Download, UserPlus } from "lucide-react";

export function DashboardHeader() {
  const user = useSelector((state) => state.auth.user);
  const userName =
    user?.profile?.name ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.email?.split("@")[0] ||
    "User";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <PageHeader
      eyebrow="SCHOOL OVERVIEW · SESSION 2024–25"
      title={`${greeting}, ${userName} ✦`}
      // description="Real-time insights across admissions, academics, finance and people."
      // actions={
      //   <>
      //     <Button variant="outline" className="gap-2">
      //       <Download className="h-4 w-4" /> Export
      //     </Button>
      //     <Button
      //       asChild
      //       className="gap-2 gradient-primary text-primary-foreground shadow-glow border-0"
      //     >
      //       <Link to="/admission">
      //         <UserPlus className="h-4 w-4" /> New Admission
      //       </Link>
      //     </Button>
      //   </>
      // }
    />
  );
}

