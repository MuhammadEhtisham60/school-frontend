import { useState } from "react";
import { PageHeader } from "@/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ListToolbar, StatusBadge } from "@/components/shared/ListToolbar";
import {
  admins,
  teachers,
  students,
  roles,
  permissionModules,
  defaultPermissions,
} from "@/data/mock-data";
import { Users, Shield, ShieldCheck, Pencil, Trash2, Power } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { toast } from "sonner";

function UsersPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const allUsers = [
    ...admins.map((a) => ({
      id: a.id,
      name: a.name,
      role: a.role,
      email: a.email,
      status: a.status,
      type: "Admin",
    })),
    ...teachers.map((t) => ({
      id: t.id,
      name: t.name,
      role: "Teacher",
      email: t.email,
      status: t.status,
      type: "Teacher",
    })),
    ...students.map((s) => ({
      id: s.id,
      name: s.name,
      role: "Student",
      status: s.status,
      type: "Student",
    })),
  ];
  const filtered = allUsers
    .filter((u) => tab === "all" || u.type.toLowerCase() === tab)
    .filter((u) => `${u.name} ${u.role}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Access control"
        title="User Management"
        description="Centralised system to manage every user, role and permission."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={allUsers.length} icon={Users} variant="primary" />
        <StatCard
          label="Active Users"
          value={allUsers.filter((u) => u.status === "Active").length}
          icon={ShieldCheck}
          variant="success"
        />
        <StatCard label="Roles Defined" value={roles.length} icon={Shield} variant="info" />
        <StatCard
          label="Permissions"
          value={permissionModules.length * 4}
          icon={Shield}
          variant="warning"
          sub="across modules"
        />
      </div>

      <Tabs defaultValue="users">
        <TabsList className="bg-card border shadow-sm">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="permissions">Roles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4 mt-4">
          <ListToolbar
            search={search}
            setSearch={setSearch}
            onAdd={() => toast.info("Open create user dialog")}
            addLabel="Create User"
          >
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {["all", "admin", "teacher", "student"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-smooth ${tab === t ? "gradient-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-card"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </ListToolbar>

          <Card className="shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 25).map((u) => (
                  <TableRow key={`${u.type}-${u.id}`} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-semibold">
                            {u.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">ID #{u.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-accent text-accent-foreground border-0"
                      >
                        {u.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{u.role}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.email ?? "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={u.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            toast.success(
                              `${u.name} ${u.status === "Active" ? "deactivated" : "activated"}`,
                            )
                          }
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4 mt-4">
          <PermissionsMatrix />
        </TabsContent>
      </Tabs>
    </div>
  );
}
function PermissionsMatrix() {
  const [role, setRole] = useState("Admin");
  const [perms, setPerms] = useState(defaultPermissions);
  const toggle = (mod, action) => {
    setPerms((p) => ({
      ...p,
      [role]: { ...p[role], [mod]: { ...p[role][mod], [action]: !p[role][mod][action] } },
    }));
  };
  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Card className="p-4 shadow-card h-fit">
        <h3 className="font-semibold mb-1">Roles</h3>
        <p className="text-xs text-muted-foreground mb-4">Select a role to edit its permissions.</p>
        <div className="space-y-2">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-smooth text-left ${role === r ? "gradient-primary text-primary-foreground border-transparent shadow-glow" : "hover:bg-muted/60"}`}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">{r}</span>
              </div>
              {role === r && <Badge className="bg-white/20 text-white border-0">Editing</Badge>}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">
              Permissions for <span className="text-gradient">{role}</span>
            </h3>
            <p className="text-sm text-muted-foreground">Toggle CRUD access per module.</p>
          </div>
          <Button
            onClick={() => toast.success(`Permissions for ${role} saved`)}
            className="gradient-primary text-primary-foreground border-0 shadow-glow"
          >
            Save Changes
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Module</TableHead>
                <TableHead className="text-center">View</TableHead>
                <TableHead className="text-center">Create</TableHead>
                <TableHead className="text-center">Edit</TableHead>
                <TableHead className="text-center">Delete</TableHead>
                <TableHead className="text-right">Full Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissionModules.map((m) => {
                const p = perms[role][m];
                const all = p.view && p.create && p.edit && p.delete;
                return (
                  <TableRow key={m} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{m}</TableCell>
                    {["view", "create", "edit", "delete"].map((a) => (
                      <TableCell key={a} className="text-center">
                        <Checkbox checked={p[a]} onCheckedChange={() => toggle(m, a)} />
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <Switch
                        checked={all}
                        onCheckedChange={() => {
                          const next = !all;
                          ["view", "create", "edit", "delete"].forEach((a) => {
                            if (p[a] !== next) toggle(m, a);
                          });
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

export default UsersPage;
