import React from "react";

export default function MinimalLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">{children}</main>
    </div>
  );
}

MinimalLayout.displayName = "MinimalLayout";
