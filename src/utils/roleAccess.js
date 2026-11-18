export function getNormalizedRole(user) {
  if (!user) return "";
  if (user.isSuperuser) return "super admin";
  return String(user.role || "").trim().toLowerCase();
}

export function isAdminOrSuperAdmin(user) {
  const role = getNormalizedRole(user);
  return role === "admin" || role === "super admin" || role === "superadmin";
}

const TEACHER_ALLOWED_PREFIXES = [
  "/backoffice",
  "/students",
  "/classes",
  "/subjects",
  "/class-routine",
  "/exam",
  "/result",
  "/library",
  "/attendance",
  "/notice",
  "/event-calendar",
  "/paper-collection",
  "/papers",
  "/site",
];

const STUDENT_ALLOWED_PREFIXES = [
  "/backoffice",
  "/students",
  "/class-routine",
  "/exam",
  "/result",
  "/library",
  "/attendance",
  "/notice",
  "/event-calendar",
  "/papers",
  "/site",
];

const PARENT_ALLOWED_PREFIXES = [
  "/backoffice",
  "/students",
  "/class-routine",
  "/exam",
  "/result",
  "/attendance",
  "/fees",
  "/notice",
  "/event-calendar",
  "/site",
];

export function isRouteAllowedForUser(pathname, user) {
  if (!user) return false;
  if (isAdminOrSuperAdmin(user)) return true;

  const role = getNormalizedRole(user);
  const path = String(pathname || "/").toLowerCase();

  let prefixes = null;
  if (role === "teacher") prefixes = TEACHER_ALLOWED_PREFIXES;
  else if (role === "student") prefixes = STUDENT_ALLOWED_PREFIXES;
  else if (role === "parent") prefixes = PARENT_ALLOWED_PREFIXES;
  else return true;

  return prefixes.some((p) => path === p || path.startsWith(`${p}/`));
}

export function filterSectionsByRole(sections, user) {
  if (!user || isAdminOrSuperAdmin(user)) return sections;
  const role = getNormalizedRole(user);

  return sections
    .map((sec) => {
      const items = sec.items
        .filter((item) => isRouteAllowedForUser(item.url, user))
        .map((item) => {
          if (role === "student" && item.url === "/students") {
            return {
              ...item,
              title: "My Profile",
              url: user.studentId ? `/students/${user.studentId}` : "/students",
            };
          }
          return item;
        });
      return { ...sec, items };
    })
    .filter((sec) => sec.items.length > 0);
}
