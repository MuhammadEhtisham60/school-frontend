import { useState, useMemo } from "react";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  CalendarDays,
  PartyPopper,
  GraduationCap,
  Trophy,
  Plus,
  ChevronLeft,
  ChevronRight,
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
function EventCalendarPage() {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState([
    { title: "Annual Function", date: "2026-05-02", type: "Cultural" },
    { title: "Teacher Meeting", date: "2026-05-04", type: "Meeting" },
    { title: "Activity - Training", date: "2026-05-07", type: "Academic" },
    { title: "Parents, Teacher Meet", date: "2026-05-07", type: "Meeting" },
    { title: "Admission Camp", date: "2026-05-10", type: "Academic" },
    { title: "Annual Sports Day", date: "2026-05-12", type: "Sports" },
    { title: "Science Exhibition", date: "2026-05-20", type: "Academic" },
    { title: "Mid-Term Exams", date: "2026-06-01", type: "Exam" },
    { title: "Independence Day", date: "2026-08-15", type: "Holiday" },
  ]);
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setEvents((prev) => [
      { title: fd.get("title"), date: fd.get("date"), type: fd.get("type") },
      ...prev,
    ]);
    toast.success("Event added successfully");
    setOpen(false);
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
  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevDays = new Date(currentYear, currentMonth, 0).getDate();
    const cells = [];
    // Previous month trailing days
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
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        inMonth: true,
        dateStr: `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      });
    }
    // Next month leading days
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
  // Events indexed by date
  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [events]);
  // Events for current month (for right panel)
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
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-primary text-primary-foreground border-0 shadow-glow">
                <Plus className="h-4 w-4" /> Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Event Title</Label>
                  <Input name="title" placeholder="Event name" required />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Event Type</Label>
                    <Select name="type" required>
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
                    <Label>Date</Label>
                    <Input name="date" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input name="start" type="time" />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input name="end" type="time" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Venue</Label>
                    <Input name="venue" placeholder="e.g. School Auditorium" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea name="description" placeholder="Event details (optional)" />
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
                    Save Event
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        {/* Calendar - 8 columns */}
        <Card className="col-span-12 lg:col-span-8 glass-card overflow-hidden">
          <CardContent className="p-0">
            {/* Calendar Header */}
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
              <div className="flex items-center gap-1">
                <Button variant="default" size="sm" className="text-xs h-7 px-3">
                  Month
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 px-3 text-muted-foreground"
                >
                  Week
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 px-3 text-muted-foreground"
                >
                  Day
                </Button>
              </div>
            </div>

            {/* Day Headers */}
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

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((cell, idx) => {
                const isToday = cell.dateStr === todayStr;
                const cellEvents = eventsByDate[cell.dateStr] || [];
                const isSat = idx % 7 === 6;
                const isSun = idx % 7 === 0;
                return (
                  <div
                    key={idx}
                    className={`min-h-[90px] border-b border-r border-border/30 p-1.5 relative transition-colors
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
                      {cellEvents.slice(0, 2).map((ev, ei) => {
                        const c = colorMap[ev.type] || {
                          bg: "bg-muted",
                          color: "text-foreground",
                          border: "border-border",
                        };
                        return (
                          <div
                            key={ei}
                            className={`text-[10px] leading-tight px-1.5 py-0.5 rounded ${c.bg} ${c.color} font-medium truncate border ${c.border}`}
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
          </CardContent>
        </Card>

        {/* Events Panel - 4 columns */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <Card className="glass-card">
            <CardContent className="pt-5 pb-3 px-5">
              <h3 className="font-semibold text-base mb-1">Upcoming Events</h3>
              <p className="text-xs text-muted-foreground">
                {MONTHS[currentMonth]} {currentYear}
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
                  No events this month
                </CardContent>
              </Card>
            )}
            {monthEvents.map((ev, i) => {
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
                  key={i}
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
                        <p className="font-semibold text-sm truncate">{ev.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatted}</p>
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
    </div>
  );
}

export default EventCalendarPage;
