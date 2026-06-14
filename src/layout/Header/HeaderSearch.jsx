import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function HeaderSearch() {
  return (
    <div className="relative hidden md:block flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search students, teachers, classes…"
        className="pl-9 bg-secondary/50 border-transparent focus-visible:bg-card"
      />
    </div>
  );
}

HeaderSearch.displayName = "HeaderSearch";
