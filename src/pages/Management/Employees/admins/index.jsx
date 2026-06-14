import { useMemo, useState } from "react";
import { PageHeader } from "@/layout/PageHeader";
import { ListToolbar, StatusBadge } from "@/components/shared/ListToolbar";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { admins } from "@/data/mock-data";
import { Pencil, Trash2, ShieldCheck, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";

function AdminsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = useMemo(
    () => admins.filter((a) => `${a.name} ${a.role}`.toLowerCase().includes(search.toLowerCase())),
    [search],
  );
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Admin Users"
        description="Create and manage administrative accounts with system access."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Admins" value={admins.length} icon={ShieldCheck} variant="primary" />
        <StatCard
          label="Super Admins"
          value={admins.filter((a) => a.role === "Super Admin").length}
          icon={ShieldCheck}
          variant="info"
        />
        <StatCard
          label="Active"
          value={admins.filter((a) => a.status === "Active").length}
          icon={ShieldCheck}
          variant="success"
        />
        <StatCard
          label="Inactive"
          value={admins.filter((a) => a.status === "Inactive").length}
          icon={ShieldCheck}
          variant="warning"
        />
      </div>

      <ListToolbar
        search={search}
        setSearch={setSearch}
        onAdd={() => setOpen(true)}
        addLabel="Create Admin"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((a) => (
          <Card key={a.id} className="p-5 card-hover shadow-card relative overflow-hidden">
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full opacity-20 blur-2xl gradient-info" />
            <div className="relative flex items-start gap-4">
              <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                <AvatarFallback className="gradient-info text-white font-semibold">
                  {a.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold truncate">{a.name}</h3>
                    <p className="text-sm text-muted-foreground">@{a.username}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <Badge className="mt-2 gradient-primary text-primary-foreground border-0">
                  {a.role}
                </Badge>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t space-y-1 text-sm">
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> {a.email}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" /> {a.phone}
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1"
                onClick={() => toast.info(`Editing ${a.name}`)}
              >
                <Pencil className="h-3 w-3" /> Edit
              </Button>
              <Button size="icon" variant="ghost" onClick={() => toast.error(`Delete ${a.name}?`)}>
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Admin User</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input />
            </div>
            <div className="space-y-2">
              <Label>CNIC</Label>
              <Input />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Role</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Assign role" />
                </SelectTrigger>
                <SelectContent>
                  {["Super Admin", "Admin", "Accountant", "Staff"].map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gradient-primary text-primary-foreground border-0"
              onClick={() => {
                toast.success("Admin created");
                setOpen(false);
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminsPage;
