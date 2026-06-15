import React from "react";
import Page from "@/pages/index";
import {
  SiteLayout,
  SiteIndex,
  SiteAbout,
  SiteAcademics,
  SiteAdmissions,
  SiteCampus,
  SiteContact,
  SiteManage,
} from "@/pages/Site";
import UnauthorizedPage from "@/pages/auth/unauthorized";

export const publicRoutes = [
  {
    path: "/",
    element: <Page />,
  },
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },
  {
    path: "/site-manage",
    element: <SiteManage />,
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
