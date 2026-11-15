import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrimaryButton } from "@/components/common/buttons";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  useGetNoticesQuery,
  useCreateNoticeMutation,
  useUpdateNoticeMutation,
  useDeleteNoticeMutation,
} from "@/services/private/resourceService";
import { Bell, Pin, Clock, Eye, Plus, Pencil, Trash2, Loader2, Users } from "lucide-react";
import { toast } from "sonner";

const EMPTY_FORM = {
  title: "",
  category: "General",
  audience: "All",
  description: "",
  pinned: false,
};

function NoticePage() {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [viewingNotice, setViewingNotice] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: noticesRes, isLoading } = useGetNoticesQuery({
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    audience: audienceFilter !== "all" ? audienceFilter : undefined,
  });
  const notices = noticesRes?.data || [];

  const [createNotice, { isLoading: isCreating }] = useCreateNoticeMutation();
  const [updateNotice, { isLoading: isUpdating }] = useUpdateNoticeMutation();
  const [deleteNotice] = useDeleteNoticeMutation();

  const stats = useMemo(() => {
    const pinnedCount = notices.filter((n) => n.pinned).length;
    const totalViews = notices.reduce((sum, n) => sum + Number(n.views || 0), 0);
    const now = new Date();
    const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const thisWeekCount = notices.filter((n) => {
      if (!n.publishedDate) return false;
      return new Date(n.publishedDate) >= weekAgo;
    }).length;
    return { pinnedCount, totalViews, thisWeekCount };
  }, [notices]);

  const openAddModal = () => {
    setEditingNotice(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEditModal = (n) => {
    setEditingNotice(n);
    setForm({
      title: n.title || "",
      category: n.category || "General",
      audience: n.audience || "All",
      description: n.description || "",
      pinned: !!n.pinned,
    });
    setViewingNotice(null);
    setFormOpen(true);
  };

  const handleViewNotice = async (n) => {
    setViewingNotice(n);
    try {
      await updateNotice({ id: n.id, body: { incrementView: true } }).unwrap();
    } catch {
      // ignore view count failure
    }
  };

  const handleTogglePin = async (e, n) => {
    e.stopPropagation();
    try {
      await updateNotice({ id: n.id, body: { pinned: !n.pinned } }).unwrap();
      toast.success(n.pinned ? "Notice unpinned" : "Notice pinned to top");
    } catch {
      toast.error("Failed to update pin status");
    }
  };

  const handleDelete = async (e, n) => {
    if (e && e.stopPropagation) e.stopPropagation();
    try {
      await deleteNotice(n.id).unwrap();
      toast.success("Notice deleted");
      setViewingNotice(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete notice");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNotice) {
        await updateNotice({ id: editingNotice.id, body: form }).unwrap();
        toast.success("Notice updated successfully");
      } else {
        await createNotice(form).unwrap();
        toast.success("Notice published successfully");
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save notice");
    }
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Notice Board"
        description="Important announcements and notifications"
        eyebrow="Communication"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Event">Event</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Meeting">Meeting</SelectItem>
                <SelectItem value="Academic">Academic</SelectItem>
                <SelectItem value="Holiday">Holiday</SelectItem>
              </SelectContent>
            </Select>
            <Select value={audienceFilter} onValueChange={setAudienceFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Audience</SelectItem>
                <SelectItem value="All">Everyone</SelectItem>
                <SelectItem value="Students">Students</SelectItem>
                <SelectItem value="Teachers">Teachers</SelectItem>
                <SelectItem value="Parents">Parents</SelectItem>
              </SelectContent>
            </Select>
            <PrimaryButton onClick={openAddModal} startIcon={<Plus className="h-4 w-4" />}>
              Add Notice
            </PrimaryButton>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="glass-card hover:shadow-lg transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Notices
            </CardTitle>
            <Bell className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{notices.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card hover:shadow-lg transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pinned</CardTitle>
            <Pin className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.pinnedCount}</p>
          </CardContent>
        </Card>
        <Card className="glass-card hover:shadow-lg transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.thisWeekCount}</p>
          </CardContent>
        </Card>
        <Card className="glass-card hover:shadow-lg transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
            <Eye className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <Card className="p-12 flex justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </Card>
      ) : notices.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground text-sm">
          No notices found. Click "Add Notice" to publish an announcement.
        </Card>
      ) : (
        <div className="space-y-3">
          {notices.map((n) => (
            <Card
              key={n.id}
              onClick={() => navigate(`/notice/${n.id}`)}
              className="glass-card hover:shadow-lg transition-smooth cursor-pointer"
            >
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
                <div className="flex items-start gap-3 min-w-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className={`h-8 w-8 shrink-0 ${n.pinned ? "text-red-500" : "text-muted-foreground/40 hover:text-foreground"}`}
                    title={n.pinned ? "Unpin notice" : "Pin notice"}
                    onClick={(e) => handleTogglePin(e, n)}
                  >
                    <Pin className="h-4 w-4" />
                  </Button>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold truncate">{n.title}</p>
                      {n.pinned && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                          Pinned
                        </Badge>
                      )}
                    </div>
                    {n.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {n.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{n.date || n.publishedDate}</span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" /> {n.audience || "All"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {n.views || 0} views
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {n.category}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(n);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive"
                    onClick={(e) => handleDelete(e, n)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Notice Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingNotice ? "Edit Notice" : "Publish New Notice"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Notice title"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(val) => setForm({ ...form, category: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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
                  onValueChange={(val) => setForm({ ...form, audience: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
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
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Notice content"
                rows={4}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="pinned"
                checked={form.pinned}
                onCheckedChange={(checked) => setForm({ ...form, pinned: !!checked })}
              />
              <Label htmlFor="pinned" className="cursor-pointer">
                Pin this notice to top
              </Label>
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
                {editingNotice ? "Update Notice" : "Publish Notice"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Notice Details Dialog */}
      <Dialog open={!!viewingNotice} onOpenChange={(o) => !o && setViewingNotice(null)}>
        <DialogContent className="sm:max-w-lg">
          {viewingNotice && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {viewingNotice.pinned && <Pin className="h-4 w-4 text-red-500" />}
                  <DialogTitle>{viewingNotice.title}</DialogTitle>
                </div>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">{viewingNotice.category}</Badge>
                  <Badge variant="outline">Audience: {viewingNotice.audience || "All"}</Badge>
                  <span>Published: {viewingNotice.date || viewingNotice.publishedDate}</span>
                </div>
                <div className="p-4 rounded-xl bg-muted/40 text-sm leading-relaxed whitespace-pre-line">
                  {viewingNotice.description || "No additional details provided."}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={(e) => handleDelete(e, viewingNotice)}
                >
                  <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                </Button>
                <Button type="button" onClick={() => openEditModal(viewingNotice)}>
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

export default NoticePage;
