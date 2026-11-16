import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Sparkles, Globe, Moon, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeaderSearch } from "./HeaderSearch";
import { HeaderNotifications } from "./HeaderNotifications";
import { HeaderProfile } from "./HeaderProfile";
import { getSavedColorMode, toggleColorMode } from "@/utils/themeManager";

export function Header() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [colorMode, setColorMode] = useState(() => getSavedColorMode());

  useEffect(() => {
    const sync = () => setColorMode(getSavedColorMode());
    window.addEventListener("edupulse-theme-change", sync);
    return () => window.removeEventListener("edupulse-theme-change", sync);
  }, []);

  const handleToggleColorMode = () => {
    setColorMode(toggleColorMode());
  };

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
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleToggleColorMode}
          title={colorMode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label={colorMode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="h-9 w-9 rounded-lg border-border/70 bg-background/60 hover:bg-accent cursor-pointer"
        >
          {colorMode === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        <HeaderNotifications />
        <HeaderProfile user={user} onLogout={handleLogout} />
      </div>
    </header>
  );
}

Header.displayName = "Header";
