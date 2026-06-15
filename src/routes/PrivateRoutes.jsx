import React from "react";
import { DashboardPage } from "@/pages/Management/Dashboard";
import { AdmissionPage, StudentsPage, AttendancePage, StudentDetailsPage } from "@/pages/Management/Students";
import { TeachersPage, AccountantPage, AdminsPage, UsersPage, RoleUsersPage } from "@/pages/Management/Employees";
import { ClassRoutinePage, SubjectsPage, ExamPage, ResultPage } from "@/pages/Management/Academics";
import { FileManagerPage, LibraryPage, PaperCollectionPage, EventCalendarPage, NoticePage, ReportsPage } from "@/pages/Management/Resources";
import { FeesPage } from "@/pages/Management/Finance";
import { SettingsPage } from "@/pages/Management/Settings";
import RouteGuard from "./RouteGuard";

export const privateRoutes = [
  {
    element: <RouteGuard />,
    children: [
      {
        path: "/backoffice",
        element: <DashboardPage />
      },
      {
        path: "/admission",
        element: <AdmissionPage />
      },
      {
        path: "/admission/:id",
        element: <AdmissionPage />
      },
      {
        path: "/students",
        element: <StudentsPage />
      },
      {
        path: "/students/details/:id",
        element: <StudentDetailsPage />
      },
      {
        path: "/teachers",
        element: <TeachersPage />
      },
      {
        path: "/admins",
        element: <AdminsPage />
      },
      {
        path: "/users",
        element: <UsersPage />
      },
      {
        path: "/role-users",
        element: <RoleUsersPage />
      },
      {
        path: "/subjects",
        element: <SubjectsPage />
      },
      {
        path: "/class-routine",
        element: <ClassRoutinePage />
      },
      {
        path: "/exam",
        element: <ExamPage />
      },
      {
        path: "/result",
        element: <ResultPage />
      },
      {
        path: "/library",
        element: <LibraryPage />
      },
      {
        path: "/attendance",
        element: <AttendancePage />
      },
      {
        path: "/fees",
        element: <FeesPage />
      },
      {
        path: "/accountant",
        element: <AccountantPage />
      },
      {
        path: "/notice",
        element: <NoticePage />
      },
      {
        path: "/event-calendar",
        element: <EventCalendarPage />
      },
      {
        path: "/reports",
        element: <ReportsPage />
      },
      {
        path: "/file-manager",
        element: <FileManagerPage />
      },
      {
        path: "/paper-collection",
        element: <PaperCollectionPage />
      },
      {
        path: "/settings",
        element: <SettingsPage />
      }
    ]
  }
];

export default privateRoutes;
