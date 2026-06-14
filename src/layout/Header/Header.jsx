import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Sparkles, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeaderSearch } from "./HeaderSearch";
import { HeaderNotifications } from "./HeaderNotifications";
import { HeaderProfile } from "./HeaderProfile";

export function Header() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex justify-between h-16 items-center gap-3 border-b glass px-4 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="shrink-0" />
        <HeaderSearch />
      </div>
      <div className="flex-1 md:hidden" />
      <div className="flex items-center gap-2 md:gap-3">
        <Badge
          variant="secondary"
          className="hidden sm:inline-flex gap-1 bg-accent text-accent-foreground border-0"
        >
          <Sparkles className="h-3 w-3" /> 2024-25
        </Badge>
        <Button
          asChild
          size="sm"
          className="gradient-primary text-primary-foreground border-0 shadow-glow gap-1.5 hidden sm:inline-flex"
        >
          <Link to="/site">
            <Globe className="h-4 w-4" /> Visit Website
          </Link>
        </Button>
        <HeaderNotifications />
        <HeaderProfile user={user} onLogout={handleLogout} />
      </div>
    </header>
  );
}

Header.displayName = "Header";
