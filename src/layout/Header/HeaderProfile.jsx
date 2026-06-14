import React from "react";
import { Link } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function HeaderProfile({ user, onLogout }) {
  const name = user?.profile?.name || "Admin User";
  const role = user?.role || "User";
  const initials = name.substring(0, 2).toUpperCase() || "AU";

  return (
    <div className="flex items-center gap-3 pl-2 border-l">
      <div className="hidden sm:flex flex-col items-end leading-tight">
        <span className="text-sm font-semibold">{name}</span>
        <span className="text-[11px] text-muted-foreground">{role}</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="p-0 h-auto rounded-full cursor-pointer">
            <Avatar className="h-9 w-9 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
              <AvatarFallback className="gradient-primary text-primary-foreground font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/settings" className="flex items-center gap-2 cursor-pointer w-full">
              <User className="h-4 w-4" />
              <span>View Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onLogout}
            className="flex items-center gap-2 text-destructive cursor-pointer focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

HeaderProfile.displayName = "HeaderProfile";
