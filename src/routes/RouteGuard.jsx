import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isTokenValid } from "@/store/slices/authSlice";
import { isRouteAllowedForUser } from "@/utils/roleAccess";

export function RouteGuard() {
  const { isAuthenticated, token, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated || !isTokenValid(token)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && !isRouteAllowedForUser(location.pathname, user)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default RouteGuard;
