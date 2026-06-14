import React from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import LayoutWrapper from "@/layout/LayoutWrapper";

import { publicRoutes } from "./PublicRoutes";
import { authRoutes } from "./AuthRoutes";
import { privateRoutes } from "./PrivateRoutes";

export function RootLayout() {
  return (
    <>
      <LayoutWrapper>
        <Outlet />
      </LayoutWrapper>
      <Toaster richColors position="top-right" />
    </>
  );
}

export const routes = [
  {
    element: <RootLayout />,
    children: [
      ...publicRoutes,
      ...authRoutes,
      ...privateRoutes
    ]
  }
];

export default routes;
