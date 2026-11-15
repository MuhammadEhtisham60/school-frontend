import React from "react";
import { Navigate } from "react-router-dom";
import LoginPage from "@/pages/auth/login";
import ForgotPasswordFlow from "@/pages/auth/ForgotPasswordFlow";

export const authRoutes = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordFlow />,
  },
];

export default authRoutes;
