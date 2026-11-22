import React from "react";
import { Link } from "react-router-dom";
import { School } from "lucide-react";
import { SidebarHeader } from "@/components/ui/sidebar";

export function DrawerHeader({ collapsed }) {
  return (
    <SidebarHeader className="border-b border-sidebar-border">
      <Link to="/" className="flex items-center gap-3 px-2 py-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-glow">
          <School className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-sm font-bold text-sidebar-foreground truncate">
              The Force School
            </span>
            <span className="text-[11px] text-sidebar-foreground/70 truncate">
              The Force School System
            </span>
          </div>
        )}
      </Link>
    </SidebarHeader>
  );
}

DrawerHeader.displayName = "DrawerHeader";
