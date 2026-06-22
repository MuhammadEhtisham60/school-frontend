import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Layers,
  GraduationCap,
  UserPlus,
  Users,
  ShieldCheck,
  BookOpen,
  Wallet,
  CalendarCheck,
  BarChart3,
  Settings,
  School,
  Globe,
  Calculator,
  FileText,
  Bell,
  Library,
  BookOpenCheck,
  Clock,
  CalendarDays,
  FolderOpen,
  UserCog,
  FileStack,
  Award,
} from "lucide-react";
import { DrawerHeader } from "./DrawerHeader";
import { DrawerContent } from "./DrawerContent";
import { DrawerFooter } from "./DrawerFooter";

const mainItems = [
  { title: "Dashboard", url: "/backoffice", icon: LayoutDashboard },
  { title: "Admissions", url: "/admission", icon: UserPlus },
  { title: "Students", url: "/students", icon: GraduationCap },
  // { title: "Teachers", url: "/teachers", icon: BookOpen },
  // { title: "Admins", url: "/admins", icon: ShieldCheck },
  // { title: "User Management", url: "/users", icon: Users },
  // { title: "Role Based Users", url: "/role-users", icon: UserCog },
];

const academicItems = [
  { title: "Classes", url: "/classes", icon: Layers },
  // { title: "Subjects", url: "/subjects", icon: BookOpenCheck },
  // { title: "Class Routine", url: "/class-routine", icon: Clock },
  // { title: "Exam", url: "/exam", icon: FileText },
  // { title: "Result", url: "/result", icon: Award },
  // { title: "Library", url: "/library", icon: Library },
];

// const operationItems = [
//   { title: "Attendance", url: "/attendance", icon: CalendarCheck },
//   { title: "Fees", url: "/fees", icon: Wallet },
//   { title: "Accountant", url: "/accountant", icon: Calculator },
//   { title: "Notice", url: "/notice", icon: Bell },
//   { title: "Event Calendar", url: "/event-calendar", icon: CalendarDays },
//   { title: "Reports", url: "/reports", icon: BarChart3 },
// ];

// const resourceItems = [
//   { title: "File Manager", url: "/file-manager", icon: FolderOpen },
//   { title: "Paper Collection", url: "/paper-collection", icon: FileStack },
//   { title: "Settings", url: "/settings", icon: Settings },
// ];

// const websiteItems = [
//   { title: "Site Manage", url: "/site-manage", icon: Globe },
//   { title: "Visit Website", url: "/site", icon: School },
// ];

const sections = [
  { label: "Main", items: mainItems },
  { label: "Academics", items: academicItems },
  // { label: "Operations", items: operationItems },
  // { label: "Resources", items: resourceItems },
  // { label: "Website", items: websiteItems },
];

export function DrawerNavigation() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const pathname = location.pathname;
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === "/backoffice") return pathname === "/backoffice";
    return pathname.startsWith(path);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <DrawerHeader collapsed={collapsed} />
      <DrawerContent sections={sections} collapsed={collapsed} isActive={isActive} />
      <DrawerFooter collapsed={collapsed} user={user} onLogout={handleLogout} />
    </Sidebar>
  );
}

DrawerNavigation.displayName = "DrawerNavigation";
