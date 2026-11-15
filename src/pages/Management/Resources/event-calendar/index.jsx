import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} from "@/services/private/resourceService";
import {
  CalendarDays,
  PartyPopper,
  GraduationCap,
  Trophy,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const iconMap = {
  Sports: Trophy,
  Academic: GraduationCap,
  Cultural: PartyPopper,
  Meeting: CalendarDays,
  Holiday: PartyPopper,
  Exam: GraduationCap,
};

const colorMap = {
  Sports: { color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-300" },
  Academic: { color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-300" },
  Cultural: { color: "text-pink-600", bg: "bg-pink-100", border: "border-pink-300" },
  Meeting: { color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-300" },
  Holiday: { color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-300" },
  Exam: { color: "text-red-600", bg: "bg-red-100", border: "border-red-300" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const EMPTY_FORM = {
  title: "",
  type: "Academic",
  date: "",
  startTime: "",
  endTime: "",
  venue: "",
  description: "",
};

function EventCalendarPage() {
  const navigate = useNavigate();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [typeFilter, setTypeFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { data: eventsRes, isLoading } = useGetEventsQuery({
    type: typeFilter !== "all" ? typeFilter : undefined,
  });
  const events = eventsRes?.data || [];

  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

  const openAddModal = (presetDate = "") => {
    setEditingEvent(null);
    setForm({
      ...EMPTY_FORM,
      date:
        presetDate ||
        `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
    });
    setFormOpen(true);
  };

  const openEditModal = (ev) => {
    setEditingEvent(ev);
    setForm({
      title: ev.title || "",
      type: ev.type || "Academic",
      date: ev.date || "",
      startTime: ev.startTime || "",
      endTime: ev.endTime || "",
      venue: ev.venue || "",
      description: ev.description || "",
    });
    setSelectedEvent(null);
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await updateEvent({ id: editingEvent.id, body: form }).unwrap();
        toast.success("Event updated successfully");
      } else {
        await createEvent(form).unwrap();
        toast.success("Event added successfully");
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save event");
    }
  };

  const handleDelete = async (ev) => {
    try {
      await deleteEvent(ev.id).unwrap();
      toast.success(`"${ev.title}" deleted`);
      setSelectedEvent(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete event");
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  const goToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevDays = new Date(currentYear, currentMonth, 0).getDate();
    const cells = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevDays - i;
      const m = currentMonth === 0 ? 12 : currentMonth;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      cells.push({
        day: d,
        inMonth: false,
        dateStr: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        inMonth: true,
        dateStr: `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      });
    }
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 1 : currentMonth + 2;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      cells.push({
        day: d,
        inMonth: false,
        dateStr: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      });
    }
    return cells;
  }, [currentMonth, currentYear]);

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [events]);

  const monthEvents = useMemo(() => {
    const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    return events
      .filter((ev) => ev.date.startsWith(prefix))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, currentMonth, currentYear]);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Event Calendar"
        description="Upcoming school events, holidays and important dates"
        eyebrow="Schedule"
        actions={
          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Academic">Academic</SelectItem>
                <SelectItem value="Cultural">Cultural</SelectItem>
                <SelectItem value="Meeting">Meeting</SelectItem>
                <SelectItem value="Holiday">Holiday</SelectItem>
                <SelectItem value="Exam">Exam</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => openAddModal()}
              className="gap-2 gradient-primary text-primary-foreground border-0 shadow-glow"
            >
              <Plus className="h-4 w-4" /> Add Event
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        {/* Calendar - 8 columns */}
        <Card className="col-span-12 lg:col-span-8 glass-card overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToday}
                  className="text-xs font-semibold"
                >
                  Today
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-lg font-bold tracking-wide uppercase">
                {MONTHS[currentMonth]} {currentYear}
              </h2>
              <Badge variant="outline" className="text-xs">
                {monthEvents.length} {monthEvents.length === 1 ? "Event" : "Events"}
              </Badge>
            </div>

            <div className="grid grid-cols-7 border-b border-border/50">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider border-r border-border/30 last:border-r-0"
                >
                  {d}
                </div>
              ))}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-[420px]">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-7">
                {calendarDays.map((cell, idx) => {
                  const isToday = cell.dateStr === todayStr;
                  const cellEvents = eventsByDate[cell.dateStr] || [];
                  const isSat = idx % 7 === 6;
                  const isSun = idx % 7 === 0;
                  return (
                    <div
                      key={idx}
                      onDoubleClick={() => openAddModal(cell.dateStr)}
                      className={`min-h-[92px] border-b border-r border-border/30 p-1.5 relative transition-colors hover:bg-muted/20
                        ${!cell.inMonth ? "opacity-40" : ""}
                        ${isToday ? "bg-accent/30" : ""}
                        ${isSat ? "border-r-0" : ""}
                      `}
                    >
                      <span
                        className={`text-xs font-medium block text-right pr-1 ${isToday ? "text-primary font-bold" : isSun || isSat ? "text-destructive/70" : "text-foreground/70"}`}
                      >
                        {cell.day}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {cellEvents.slice(0, 2).map((ev) => {
                          const c = colorMap[ev.type] || {
                            bg: "bg-muted",
                            color: "text-foreground",
                            border: "border-border",
                          };
                          return (
                            <div
                              key={ev.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/event-calendar/${ev.id}`);
                              }}
                              className={`text-[10px] leading-tight px-1.5 py-0.5 rounded ${c.bg} ${c.color} font-medium truncate border ${c.border} cursor-pointer hover:opacity-80`}
                            >
                              {ev.title}
                            </div>
                          );
                        })}
                        {cellEvents.length > 2 && (
                          <div className="text-[10px] text-muted-foreground pl-1">
                            +{cellEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Events Panel - 4 columns */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <Card className="glass-card">
            <CardContent className="pt-5 pb-3 px-5">
              <h3 className="font-semibold text-base mb-1">Month Schedule</h3>
              <p className="text-xs text-muted-foreground">
                {MONTHS[currentMonth]} {currentYear} · Click an event to view or edit
              </p>
            </CardContent>
          </Card>

          <div
            className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1"
            style={{ scrollbarWidth: "thin" }}
          >
            {monthEvents.length === 0 && (
              <Card className="glass-card">
                <CardContent className="pt-6 text-center text-sm text-muted-foreground">
                  No events scheduled for {MONTHS[currentMonth]}.
                </CardContent>
              </Card>
            )}
            {monthEvents.map((ev) => {
              const Icon = iconMap[ev.type] || CalendarDays;
              const colors = colorMap[ev.type] || {
                color: "text-primary",
                bg: "bg-primary/10",
                border: "border-primary/20",
              };
              const d = new Date(ev.date + "T00:00:00");
              const formatted = d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              return (
                <Card
                  key={ev.id}
                  onClick={() => navigate(`/event-calendar/${ev.id}`)}
                  className="glass-card hover:shadow-lg transition-smooth cursor-pointer group"
                >
                  <CardContent className="py-4 px-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2.5 rounded-xl ${colors.bg} group-hover:scale-110 transition-smooth shrink-0`}
                      >
                        <Icon className={`h-5 w-5 ${colors.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm truncate">{ev.title}</p>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(ev);
                              }}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(ev);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatted}</p>
                        {(ev.startTime || ev.venue) && (
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                            {ev.startTime && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {ev.startTime}
                                {ev.endTime ? ` - ${ev.endTime}` : ""}
                              </span>
                            )}
                            {ev.venue && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {ev.venue}
                              </span>
                            )}
                          </div>
                        )}
                        <span
                          className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium ${colors.bg} ${colors.color}`}
                        >
                          {ev.type}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add / Edit Event Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Event Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Event name"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Event Type *</Label>
                <Select
                  value={form.type}
                  onValueChange={(val) => setForm({ ...form, type: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Cultural">Cultural</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Holiday">Holiday</SelectItem>
                    <SelectItem value="Exam">Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Venue</Label>
                <Input
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  placeholder="e.g. School Auditorium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Event details (optional)"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
                className="gradient-primary text-primary-foreground border-0"
              >
                {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingEvent ? "Update Event" : "Save Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(o) => !o && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEvent.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <Badge variant="secondary">{selectedEvent.type}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{selectedEvent.date}</span>
                </div>
                {(selectedEvent.startTime || selectedEvent.endTime) && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">
                      {selectedEvent.startTime}
                      {selectedEvent.endTime ? ` - ${selectedEvent.endTime}` : ""}
                    </span>
                  </div>
                )}
                {selectedEvent.venue && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Venue</span>
                    <span className="font-medium">{selectedEvent.venue}</span>
                  </div>
                )}
                {selectedEvent.description && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm leading-relaxed">{selectedEvent.description}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isDeleting}
                  onClick={() => handleDelete(selectedEvent)}
                >
                  <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                </Button>
                <Button type="button" onClick={() => openEditModal(selectedEvent)}>
                  <Pencil className="h-4 w-4 mr-1.5" /> Edit
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EventCalendarPage;
