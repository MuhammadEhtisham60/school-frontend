import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetClassRoutinesQuery,
  useCreateClassRoutineMutation,
  useUpdateClassRoutineMutation,
  useDeleteClassRoutineMutation,
} from "@/services/private/classRoutineService";
import { useGetClassesDropdownQuery } from "@/services/private/classService";
import { useGetTeachersDropdownQuery } from "@/services/private/teacherService";
import { useGetSubjectsQuery } from "@/services/private/subjectService";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  RefreshCw,
  Clock,
  MapPin,
  User,
  FileDown,
  FileSpreadsheet,
} from "lucide-react";
import { downloadClassRoutinePDF } from "@/utils/pdfGenerator";
import { downloadExcelFile } from "@/utils/excelExport";
import { toast } from "sonner";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DEFAULT_SLOTS = [
  { startTime: "08:00", endTime: "08:45" },
  { startTime: "08:45", endTime: "09:30" },
  { startTime: "09:45", endTime: "10:30" },
  { startTime: "10:30", endTime: "11:15" },
  { startTime: "11:30", endTime: "12:15" },
  { startTime: "12:15", endTime: "13:00" },
];

const DEFAULT_FORM = {
  className: "",
  section: "A",
  day: "Monday",
  subject: "",
  startTime: "08:00",
  endTime: "08:45",
  teacherId: "unassigned",
  room: "",
};

function ClassRoutinePage() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("A");
  const [teacherFilter, setTeacherFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: classesRes } = useGetClassesDropdownQuery();
  const { data: teachersRes } = useGetTeachersDropdownQuery();
  const { data: subjectsRes } = useGetSubjectsQuery();

  const classesList = useMemo(() => classesRes?.data || [], [classesRes]);
  const teachersList = useMemo(() => teachersRes?.data || [], [teachersRes]);
  const subjectsList = useMemo(
    () => (subjectsRes?.data || subjectsRes?.subjects || []).filter((s) => s.isActive !== false),
    [subjectsRes]
  );

  // Initialize default class & section once classes load
  useEffect(() => {
    if (!selectedClass && classesList.length > 0) {
      const first = classesList[0];
      setSelectedClass(String(first.name));
      const firstSec = Array.isArray(first.sections) && first.sections.length > 0 ? first.sections[0] : "A";
      setSelectedSection(String(firstSec));
    }
  }, [classesList, selectedClass]);

  const activeClassObj = useMemo(
    () => classesList.find((c) => String(c.name) === String(selectedClass)),
    [classesList, selectedClass]
  );

  const availableSections = useMemo(() => {
    if (Array.isArray(activeClassObj?.sections) && activeClassObj.sections.length > 0) {
      return activeClassObj.sections.map(String);
    }
    return ["A", "B", "C", "D"];
  }, [activeClassObj]);

  const queryParams = useMemo(() => {
    const params = {};
    if (selectedClass) params.className = selectedClass;
    if (selectedSection) params.section = selectedSection;
    if (teacherFilter !== "all") params.teacherId = teacherFilter;
    return params;
  }, [selectedClass, selectedSection, teacherFilter]);

  const { data: routinesRes, isLoading, isError, refetch } = useGetClassRoutinesQuery(queryParams);

  const [createRoutine, { isLoading: isCreating }] = useCreateClassRoutineMutation();
  const [updateRoutine, { isLoading: isUpdating }] = useUpdateClassRoutineMutation();
  const [deleteRoutine, { isLoading: isDeleting }] = useDeleteClassRoutineMutation();

  const routines = useMemo(
    () => routinesRes?.data || routinesRes?.routines || [],
    [routinesRes]
  );

  // Build sorted unique time slots from routines (or fallback to DEFAULT_SLOTS)
  const timeSlots = useMemo(() => {
    if (routines.length === 0) return DEFAULT_SLOTS;
    const map = new Map();
    routines.forEach((r) => {
      const key = `${r.startTime}-${r.endTime}`;
      if (!map.has(key)) {
        map.set(key, { startTime: r.startTime, endTime: r.endTime });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [routines]);

  // Lookup map: `${day}__${startTime}-${endTime}` -> routine object
  const slotMap = useMemo(() => {
    const map = new Map();
    routines.forEach((r) => {
      map.set(`${r.day}__${r.startTime}-${r.endTime}`, r);
    });
    return map;
  }, [routines]);

  const formClassObj = useMemo(
    () => classesList.find((c) => String(c.name) === String(form.className)),
    [classesList, form.className]
  );
  const formSections = useMemo(() => {
    if (Array.isArray(formClassObj?.sections) && formClassObj.sections.length > 0) {
      return formClassObj.sections.map(String);
    }
    return ["A", "B", "C", "D"];
  }, [formClassObj]);

  const openCreateDialog = (prefill = {}) => {
    setEditingPeriod(null);
    setForm({
      ...DEFAULT_FORM,
      className: prefill.className || selectedClass || (classesList[0]?.name ? String(classesList[0].name) : "10"),
      section: prefill.section || selectedSection || "A",
      day: prefill.day || "Monday",
      startTime: prefill.startTime || "08:00",
      endTime: prefill.endTime || "08:45",
      subject: subjectsList[0]?.name || "",
      teacherId: "unassigned",
      room: "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (period) => {
    setEditingPeriod(period);
    setForm({
      className: period.className || selectedClass,
      section: period.section || selectedSection,
      day: period.day || "Monday",
      subject: period.subject || "",
      startTime: period.startTime || "08:00",
      endTime: period.endTime || "08:45",
      teacherId: period.teacherId ? String(period.teacherId) : "unassigned",
      room: period.room || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.className || !form.section || !form.day || !form.subject.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    if (form.startTime >= form.endTime) {
      toast.error("End time must be after start time");
      return;
    }

    const payload = {
      className: form.className,
      section: form.section,
      day: form.day,
      subject: form.subject.trim(),
      startTime: form.startTime,
      endTime: form.endTime,
      teacherId: form.teacherId === "unassigned" ? null : form.teacherId,
      room: form.room.trim(),
    };

    try {
      if (editingPeriod) {
        await updateRoutine({ id: editingPeriod.id, body: payload }).unwrap();
        toast.success("Routine period updated successfully");
      } else {
        await createRoutine(payload).unwrap();
        toast.success("Routine period added successfully");
      }
      setSelectedClass(form.className);
      setSelectedSection(form.section);
      setDialogOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save routine period");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRoutine(deleteTarget.id).unwrap();
      toast.success("Routine period deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete routine period");
    }
  };

  const isSaving = isCreating || isUpdating;

  const handleExportExcel = () => {
    downloadExcelFile({
      filename: `Class_Routine_${selectedClass || "All"}_${selectedSection || "A"}`,
      sheetName: `Class_${selectedClass}_${selectedSection}`,
      title: `Weekly Class Routine — Class ${selectedClass}-${selectedSection}`,
      headers: ["Day", ...timeSlots.map((s) => `${s.startTime} - ${s.endTime}`)],
      rows: DAYS.map((day) => [
        day,
        ...timeSlots.map((slot) => {
          const p = slotMap.get(`${day}__${slot.startTime}-${slot.endTime}`);
          if (!p) return "—";
          const teacher = p.teacher || p.teacherName || "";
          const room = p.room ? ` [${p.room}]` : "";
          return `${p.subject}${teacher ? ` (${teacher})` : ""}${room}`;
        }),
      ]),
    });
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader
        title="Class Routine"
        description="Weekly class schedule and period management"
        eyebrow="Academics"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-1.5">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadClassRoutinePDF(selectedClass, selectedSection, timeSlots, routines)
              }
              className="gap-1.5"
            >
              <FileDown className="h-4 w-4 text-primary" /> PDF
            </Button>
            <Button
              onClick={() => openCreateDialog()}
              className="gap-2 gradient-primary text-primary-foreground border-0 shadow-glow"
            >
              <Plus className="h-4 w-4" /> Add Period
            </Button>
          </div>
        }
      />

      <Card className="glass-card overflow-hidden">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>
              Weekly Schedule — {selectedClass ? `Class ${selectedClass}` : "All Classes"}
              {selectedSection ? `-${selectedSection}` : ""}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {routines.length} scheduled {routines.length === 1 ? "period" : "periods"} · Click
              any empty slot to assign a period
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={selectedClass}
              onValueChange={(val) => {
                setSelectedClass(val);
                const cls = classesList.find((c) => String(c.name) === val);
                if (cls?.sections?.length) {
                  setSelectedSection(String(cls.sections[0]));
                }
              }}
            >
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classesList.map((c) => (
                  <SelectItem key={c.id || c.name} value={String(c.name)}>
                    Class {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-[120px] h-9 text-xs">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                {availableSections.map((sec) => (
                  <SelectItem key={sec} value={sec}>
                    Section {sec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={teacherFilter} onValueChange={setTeacherFilter}>
              <SelectTrigger className="w-[165px] h-9 text-xs">
                <SelectValue placeholder="All Teachers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {teachersList.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.fullName || t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <p>Failed to load class routine.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground min-w-[110px]">
                      Day
                    </th>
                    {timeSlots.map((slot) => (
                      <th
                        key={`${slot.startTime}-${slot.endTime}`}
                        className="text-center px-3 py-3 font-medium text-muted-foreground text-xs min-w-[155px]"
                      >
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3 text-primary" />
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => (
                    <tr
                      key={day}
                      className="border-b last:border-0 border-border/50 hover:bg-muted/10 transition-smooth"
                    >
                      <td className="px-4 py-3 font-semibold text-foreground">{day}</td>
                      {timeSlots.map((slot) => {
                        const key = `${day}__${slot.startTime}-${slot.endTime}`;
                        const period = slotMap.get(key);
                        if (!period) {
                          return (
                            <td key={key} className="text-center px-2 py-2.5">
                              <button
                                type="button"
                                onClick={() =>
                                  openCreateDialog({
                                    day,
                                    startTime: slot.startTime,
                                    endTime: slot.endTime,
                                  })
                                }
                                className="w-full rounded-lg border border-dashed border-border/60 py-3 text-xs text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-colors"
                              >
                                + Assign
                              </button>
                            </td>
                          );
                        }

                        return (
                          <td key={key} className="px-2 py-2.5 align-top">
                            <div className="group relative rounded-xl border border-primary/20 bg-primary/5 p-2.5 text-left hover:border-primary/40 transition-colors">
                              <div className="flex items-start justify-between gap-1">
                                <span className="font-semibold text-xs text-primary leading-tight">
                                  {period.subject}
                                </span>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => openEditDialog(period)}
                                    className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground"
                                    title="Edit period"
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteTarget(period)}
                                    className="p-1 rounded hover:bg-background text-muted-foreground hover:text-destructive"
                                    title="Delete period"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>

                              <div className="mt-1.5 space-y-0.5 text-[11px] text-muted-foreground">
                                {period.teacherId ? (
                                  <Link
                                    to={`/teachers/details/${period.teacherId}`}
                                    className="flex items-center gap-1 hover:text-primary truncate"
                                  >
                                    <User className="h-2.5 w-2.5 shrink-0" />
                                    <span className="truncate">
                                      {period.teacher || period.teacherName}
                                    </span>
                                  </Link>
                                ) : (
                                  <p className="flex items-center gap-1 truncate">
                                    <User className="h-2.5 w-2.5 shrink-0" />
                                    <span className="truncate">
                                      {period.teacher || period.teacherName || "Unassigned"}
                                    </span>
                                  </p>
                                )}

                                {period.room && (
                                  <Badge
                                    variant="secondary"
                                    className="mt-1 h-4 px-1.5 text-[10px] font-normal gap-1"
                                  >
                                    <MapPin className="h-2.5 w-2.5" />
                                    {period.room}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Period Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPeriod ? "Edit Period" : "Add New Period"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select
                  value={form.className}
                  onValueChange={(val) => {
                    const cls = classesList.find((c) => String(c.name) === val);
                    const sec =
                      cls?.sections?.length > 0 ? String(cls.sections[0]) : form.section || "A";
                    setForm((p) => ({ ...p, className: val, section: sec }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classesList.map((c) => (
                      <SelectItem key={c.id || c.name} value={String(c.name)}>
                        Class {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Section</Label>
                <Select
                  value={form.section}
                  onValueChange={(val) => setForm((p) => ({ ...p, section: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {formSections.map((s) => (
                      <SelectItem key={s} value={s}>
                        Section {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Day</Label>
                <Select
                  value={form.day}
                  onValueChange={(val) => setForm((p) => ({ ...p, day: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                {subjectsList.length > 0 ? (
                  <Select
                    value={form.subject}
                    onValueChange={(val) => setForm((p) => ({ ...p, subject: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectsList.map((s) => (
                        <SelectItem key={s.id} value={s.name}>
                          {s.name} ({s.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={form.subject}
                    onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                    placeholder="e.g. Mathematics"
                    required
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Teacher</Label>
                <Select
                  value={form.teacherId}
                  onValueChange={(val) => setForm((p) => ({ ...p, teacherId: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {teachersList.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.fullName || t.name} {t.subject ? `(${t.subject})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Room / Hall</Label>
                <Input
                  value={form.room}
                  onChange={(e) => setForm((p) => ({ ...p, room: e.target.value }))}
                  placeholder="e.g. Room 101"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="gradient-primary text-primary-foreground border-0"
              >
                {isSaving ? "Saving..." : editingPeriod ? "Update Period" : "Save Period"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Period</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.subject}</span> on{" "}
              {deleteTarget?.day} ({deleteTarget?.startTime} - {deleteTarget?.endTime})?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ClassRoutinePage;
