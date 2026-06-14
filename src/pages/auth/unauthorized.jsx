import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <Lock className="h-10 w-10 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Access Denied
      </h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        You are currently unauthenticated. Please log in to your account to access this page and
        manage your school operations.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="gradient-primary text-primary-foreground shadow-glow">
          <Link to="/login">Go to Login</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/site">Visit Main Site</Link>
        </Button>
      </div>
    </div>
  );
}
export default UnauthorizedPage;
