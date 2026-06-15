import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Drawer } from "./Drawer";
import { Header } from "./Header";
import { Footer } from "./Footer";

export default function MainLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Drawer />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}

MainLayout.displayName = "MainLayout";
