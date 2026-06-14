import { useState } from "react";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserCog, ShieldCheck, Users, Key, Plus } from "lucide-react";
import { toast } from "sonner";

function RoleUsersPage() {
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState([
    {
      name: "Super Admin",
      users: 2,
      permissions: "Full Access",
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      name: "Admin",
      users: 5,
      permissions: "Manage Users, Settings",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      name: "Teacher",
      users: 42,
      permissions: "Attendance, Grades, Library",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      name: "Accountant",
      users: 3,
      permissions: "Fees, Finance Reports",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      name: "Librarian",
      users: 2,
      permissions: "Library Management",
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      name: "Student",
      users: 485,
      permissions: "View Only",
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
    {
      name: "Parent",
      users: 320,
      permissions: "View Child Info, Fees",
      color: "text-teal-500",
      bg: "bg-teal-500/10",
    },
  ]);
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setRoles((prev) => [
      {
        name: fd.get("name"),
        users: 0,
        permissions: fd.get("permissions"),
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      },
      ...prev,
    ]);
    toast.success("Role added successfully");
    setOpen(false);
  };
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Role Based Users"
        description="Manage user roles and permissions"
        eyebrow="Access Control"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-primary text-primary-foreground border-0 shadow-glow">
                <Plus className="h-4 w-4" /> Add Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Role</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Role Name</Label>
                  <Input name="name" placeholder="e.g. Coordinator" required />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Access Level</Label>
                    <Select name="level" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full">Full Access</SelectItem>
                        <SelectItem value="Limited">Limited Access</SelectItem>
                        <SelectItem value="View">View Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select name="status">
                      <SelectTrigger>
                        <SelectValue placeholder="Active" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <Textarea
                    name="permissions"
                    placeholder="e.g. Attendance, Grades, Library"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea name="description" placeholder="Role description (optional)" />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    className="gradient-primary text-primary-foreground border-0"
                  >
                    Save Role
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="glass-card hover:shadow-lg transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Roles</CardTitle>
            <ShieldCheck className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{roles.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card hover:shadow-lg transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{roles.reduce((a, r) => a + r.users, 0)}</p>
          </CardContent>
        </Card>
        <Card className="glass-card hover:shadow-lg transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
            <UserCog className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">7</p>
          </CardContent>
        </Card>
        <Card className="glass-card hover:shadow-lg transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Permissions</CardTitle>
            <Key className="h-5 w-5 text-violet-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">24</p>
          </CardContent>
        </Card>
      </div>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Roles & Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {roles.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b last:border-0 border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${r.bg}`}>
                    <ShieldCheck className={`h-4 w-4 ${r.color}`} />
                  </div>
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.permissions}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-muted-foreground">{r.users} users</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RoleUsersPage;
