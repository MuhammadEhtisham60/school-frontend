import React from "react";

export function Footer() {
  return (
    <footer className="w-full border-t py-4 px-6 text-center text-xs text-muted-foreground mt-auto bg-card/30 backdrop-blur-sm">
      <p>&copy; {new Date().getFullYear()} EPS. All rights reserved.</p>
    </footer>
  );
}

Footer.displayName = "Footer";
