import { useState } from "react";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrimaryButton, CancelButton, SubmitButton } from "@/components/common/buttons";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, Pin, Clock, Eye, Plus } from "lucide-react";
import { toast } from "sonner";

function NoticePage() {
  const [open, setOpen] = useState(false);
  const [notices, setNotices] = useState([
    {
      title: "Annual Day Celebration",
      date: "May 15, 2026",
      pinned: true,
      category: "Event",
      description: "",
    },
    {
      title: "Fee Payment Deadline Extended",
      date: "May 10, 2026",
      pinned: true,
      category: "Finance",
      description: "",
    },
    {
      title: "Summer Vacation Schedule",
      date: "May 5, 2026",
      pinned: false,
      category: "General",
      description: "",
    },
    {
      title: "Parent-Teacher Meeting",
      date: "May 3, 2026",
      pinned: false,
      category: "Meeting",
      description: "",
    },
  ]);
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setNotices((prev) => [
      {
        title: fd.get("title"),
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        pinned: fd.get("pinned") === "on",
        category: fd.get("category"),
        description: fd.get("description"),
      },
      ...prev,
    ]);
    toast.success("Notice published successfully");
    setOpen(false);
  };
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Notice Board"
        description="Important announcements and notifications"
        eyebrow="Communication"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <PrimaryButton startIcon={<Plus className="h-4 w-4" />}>
                Add Notice
              </PrimaryButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Publish New Notice</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input name="title" placeholder="Notice title" required />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select name="category" required>
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
                    <Select name="audience">
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
                  <Label>Description</Label>
                  <Textarea name="description" placeholder="Notice content" rows={4} required />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="pinned" name="pinned" />
                  <Label htmlFor="pinned" className="cursor-pointer">
                    Pin this notice
                  </Label>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <CancelButton>
                      Cancel
                    </CancelButton>
                  </DialogClose>
                  <SubmitButton>
                    Publish Notice
                  </SubmitButton>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
            <p className="text-2xl font-bold">{notices.filter((n) => n.pinned).length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card hover:shadow-lg transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">3</p>
          </CardContent>
        </Card>
        <Card className="glass-card hover:shadow-lg transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
            <Eye className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1,240</p>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-3">
        {notices.map((n, i) => (
          <Card key={i} className="glass-card hover:shadow-lg transition-smooth cursor-pointer">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                {n.pinned && <Pin className="h-4 w-4 text-red-500" />}
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.date}</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {n.category}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default NoticePage;
