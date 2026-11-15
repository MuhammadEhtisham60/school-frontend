import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetNoticeByIdQuery,
  useUpdateNoticeMutation,
  useDeleteNoticeMutation,
} from "@/services/private/resourceService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  Bell,
  Pin,
  Users,
  Eye,
  CalendarDays,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function NoticeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: res, isLoading, error } = useGetNoticeByIdQuery(id, { skip: !id });
  const notice = res?.data;

  const [updateNotice, { isLoading: isUpdating }] = useUpdateNoticeMutation();
  const [deleteNotice, { isLoading: isDeleting }] = useDeleteNoticeMutation();

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "General",
    audience: "All",
    description: "",
    pinned: false,
  });

  const handleOpenEdit = () => {
    if (!notice) return;
    setForm({
      title: notice.title || "",
      category: notice.category || "General",
      audience: notice.audience || "All",
      description: notice.description || "",
      pinned: !!notice.pinned,
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await updateNotice({ id: notice.id, body: form }).unwrap();
      toast.success("Notice updated successfully");
      setEditOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update notice");
    }
  };

  const handleTogglePin = async () => {
    if (!notice) return;
    try {
      await updateNotice({ id: notice.id, body: { pinned: !notice.pinned } }).unwrap();
      toast.success(notice.pinned ? "Notice unpinned" : "Notice pinned to top");
    } catch {
      toast.error("Failed to update pin status");
    }
  };

  const handleDelete = async () => {
    if (!notice) return;
    try {
      await deleteNotice(notice.id).unwrap();
      toast.success("Notice deleted");
      navigate("/notice");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete notice");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-9 w-9 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading notice details...</p>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/notice")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Notice Board
        </Button>
        <Card className="p-6 border-destructive/20 bg-destructive/5 flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Notice Not Found</p>
            <p className="text-sm opacity-90">
              {error?.data?.message || "We could not find this announcement."}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/notice")}
          className="gap-2 self-start"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Notice Board
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={handleTogglePin} className="gap-2">
            <Pin className={`h-4 w-4 ${notice.pinned ? "text-red-500" : ""}`} />
            {notice.pinned ? "Unpin" : "Pin Notice"}
          </Button>
          <Button variant="outline" onClick={handleOpenEdit} className="gap-2">
            <Pencil className="h-4 w-4" /> Edit Notice
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
              {notice.pinned ? <Pin className="h-7 w-7" /> : <Bell className="h-7 w-7" />}
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-0">{notice.category}</Badge>
                {notice.pinned && (
                  <Badge variant="destructive" className="text-[10px]">
                    Pinned
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground font-mono">Notice #{notice.id}</span>
              </div>
              <CardTitle className="text-2xl font-bold">{notice.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-primary" /> Published Date
              </p>
              <p className="font-semibold text-sm">{notice.date || notice.publishedDate}</p>
            </div>
            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" /> Target Audience
              </p>
              <p className="font-semibold text-sm">{notice.audience || "All"}</p>
            </div>
            <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-primary" /> Total Views
              </p>
              <p className="font-semibold text-sm">{Number(notice.views || 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Announcement Content
            </h3>
            <div className="p-5 rounded-xl border bg-card text-sm leading-relaxed whitespace-pre-line">
              {notice.description || "No additional announcement details provided."}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Notice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Event">Event</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Holiday">Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select
                  value={form.audience}
                  onValueChange={(v) => setForm({ ...form, audience: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Students">Students</SelectItem>
                    <SelectItem value="Teachers">Teachers</SelectItem>
                    <SelectItem value="Parents">Parents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="edit-pinned"
                checked={form.pinned}
                onCheckedChange={(checked) => setForm({ ...form, pinned: !!checked })}
              />
              <Label htmlFor="edit-pinned" className="cursor-pointer">
                Pin this notice to top
              </Label>
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

