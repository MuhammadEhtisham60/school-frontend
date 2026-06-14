import { useMemo, useState } from "react";
import { PageHeader } from "@/layout/PageHeader";
import { ListToolbar, StatusBadge } from "@/components/shared/ListToolbar";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { students } from "@/data/mock-data";
import { Pencil, Trash2, Eye, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/ui/stat-card";

function StudentsPage() {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      students.filter((s) =>
        `${s.name} ${s.fatherName} ${s.class} ${s.rollNo}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search],
  );
  const total = students.length;
  const active = students.filter((s) => s.status === "Active").length;
  const fees = students.filter((s) => s.feeStatus === "Paid").length;
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Directory"
        title="Students"
        description="Browse, search and manage every enrolled student."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={total} icon={GraduationCap} variant="primary" />
        <StatCard label="Active" value={active} icon={GraduationCap} variant="success" />
        <StatCard label="Fees Paid" value={fees} icon={GraduationCap} variant="info" />
        <StatCard
          label="Pending Fees"
          value={total - fees}
          icon={GraduationCap}
          variant="warning"
        />
      </div>

      <ListToolbar
        search={search}
        setSearch={setSearch}
        onAdd={() => toast.info("Open admission form for new student")}
        addLabel="Admit Student"
      />

      <Card className="shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Student</TableHead>
              <TableHead>Roll No</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Father's Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                      <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-semibold">
                        {s.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.gender} · {s.dob}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">#{s.rollNo}</TableCell>
                <TableCell>
                  <span className="font-semibold">
                    {s.class}-{s.section}
                  </span>
                </TableCell>
                <TableCell>{s.fatherName}</TableCell>
                <TableCell className="text-sm">{s.contact}</TableCell>
                <TableCell>
                  <StatusBadge status={s.feeStatus} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={s.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toast.info(`Viewing ${s.name}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toast.info(`Editing ${s.name}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toast.error(`Delete ${s.name}?`)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No students found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default StudentsPage;
