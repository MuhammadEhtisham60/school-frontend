import React from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "./MainLayout";
import MinimalLayout from "./MinimalLayout";

export function LayoutWrapper({ children }) {
  const location = useLocation();
  const pathname = location.pathname;
  const normalizedPathname = pathname === "/" ? "/" : pathname.replace(/\/$/, "");

  const isLanding = normalizedPathname === "/";
  const isSite = normalizedPathname.startsWith("/site");
  const isLogin = normalizedPathname === "/login";
  const isSignup = normalizedPathname === "/signup" || normalizedPathname.startsWith("/auth");
  const isForgotPassword = normalizedPathname === "/forgot-password";
  const isUnauthorized = normalizedPathname === "/unauthorized";

  const isPublicLayout =
    isSite || isLogin || isSignup || isForgotPassword || isUnauthorized || isLanding;

  if (isPublicLayout) {
    return <MinimalLayout>{children}</MinimalLayout>;
  }

  return <MainLayout>{children}</MainLayout>;
}

LayoutWrapper.displayName = "LayoutWrapper";
export default LayoutWrapper;
