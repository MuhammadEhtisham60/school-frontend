import React from "react";
import LoginPage from "@/pages/auth/login";
import {
  SiteLayout,
  SiteIndex,
  SiteAbout,
  SiteAcademics,
  SiteAdmissions,
  SiteCampus,
  SiteContact,
} from "@/pages/Site";
import UnauthorizedPage from "@/pages/auth/unauthorized";

export const publicRoutes = [
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },
  {
    path: "/site",
    element: <SiteLayout />,
    children: [
      {
        index: true,
        element: <SiteIndex />,
      },
      {
        path: "about",
        element: <SiteAbout />,
      },
      {
        path: "academics",
        element: <SiteAcademics />,
      },
      {
        path: "admissions",
        element: <SiteAdmissions />,
      },
      {
        path: "campus",
        element: <SiteCampus />,
      },
      {
        path: "contact",
        element: <SiteContact />,
      },
    ],
  },
];

export default publicRoutes;
