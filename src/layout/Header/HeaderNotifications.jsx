import React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeaderNotifications() {
  return (
    <Button variant="ghost" size="icon" className="relative cursor-pointer">
      <Bell className="h-5 w-5" />
      <span className="absolute top-2 right-2 h-2 w-2 rounded-full gradient-primary" />
    </Button>
  );
}

HeaderNotifications.displayName = "HeaderNotifications";
