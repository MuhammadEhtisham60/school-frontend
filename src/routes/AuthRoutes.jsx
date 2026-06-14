import React from "react";
import LoginPage from "@/pages/auth/login";
import SignupPage from "@/pages/auth/signup";
import ForgotPasswordFlow from "@/pages/auth/ForgotPasswordFlow";

export const authRoutes = [
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/signup",
    element: <SignupPage />
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordFlow />
  }
];

export default authRoutes;
