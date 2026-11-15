import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetEventByIdQuery,
  useUpdateEventMutation,
  useDeleteEventMutation,
} from "@/services/private/resourceService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  PartyPopper,
  GraduationCap,
  Trophy,
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

const TYPE_STYLES = {
  Sports: "bg-amber-100 text-amber-700",
  Academic: "bg-blue-100 text-blue-700",
  Cultural: "bg-pink-100 text-pink-700",
  Meeting: "bg-emerald-100 text-emerald-700",
  Holiday: "bg-orange-100 text-orange-700",
  Exam: "bg-red-100 text-red-700",
};

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: res, isLoading, error } = useGetEventByIdQuery(id, { skip: !id });
  const event = res?.data;

  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "Academic",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    description: "",
  });

  const handleOpenEdit = () => {
    if (!event) return;
    setForm({
      title: event.title || "",
      type: event.type || "Academic",
      date: event.date || "",
      startTime: event.startTime || "",
      endTime: event.endTime || "",
      venue: event.venue || "",
      description: event.description || "",
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await updateEvent({ id: event.id, body: form }).unwrap();
      toast.success("Event updated successfully");
      setEditOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update event");
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    try {
      await deleteEvent(event.id).unwrap();
      toast.success(`"${event.title}" deleted`);
      navigate("/event-calendar");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete event");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-9 w-9 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/event-calendar")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Event Calendar
        </Button>
        <Card className="p-6 border-destructive/20 bg-destructive/5 flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Event Not Found</p>
            <p className="text-sm opacity-90">
              {error?.data?.message || "We could not find this school event."}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const Icon = iconMap[event.type] || CalendarDays;
  const formattedDate = new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/event-calendar")}
          className="gap-2 self-start"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Event Calendar
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleOpenEdit} className="gap-2">
            <Pencil className="h-4 w-4" /> Edit Event
          </Button>
          <Button
            variant="destructive"
            disabled={isDeleting}
            onClick={handleDelete}
            className="gap-2"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete
          </Button>
        </div>
      </div>

      <Card className="shadow-card overflow-hidden">
        <CardHeader className="border-b bg-muted/20 pb-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
              <Icon className="h-7 w-7" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`border-0 ${TYPE_STYLES[event.type] || ""}`}>{event.type}</Badge>
                <span className="text-xs text-muted-foreground font-mono">Event #{event.id}</span>
              </div>
              <CardTitle className="text-2xl font-bold">{event.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{formattedDate}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-primary" /> Date
              </p>
              <p className="font-semibold text-sm">{event.date}</p>
            </div>
            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" /> Time
              </p>
              <p className="font-semibold text-sm">
                {event.startTime
                  ? `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ""}`
                  : "All Day"}
              </p>
            </div>
            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" /> Venue
              </p>
              <p className="font-semibold text-sm">{event.venue || "Main Campus"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Event Description & Details
            </h3>
            <div className="p-4 rounded-xl border bg-card text-sm leading-relaxed whitespace-pre-line">
              {event.description || "No additional description provided for this event."}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>Event Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Event Type *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
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
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="gradient-primary text-primary-foreground border-0"
              >
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

