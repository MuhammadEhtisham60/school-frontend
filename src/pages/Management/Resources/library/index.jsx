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
import { Library as LibraryIcon, BookOpen, Users, Clock, Plus } from "lucide-react";
import { toast } from "sonner";

const stats = [
  { label: "Total Books", value: "3,450", icon: LibraryIcon, color: "text-blue-500" },
  { label: "Issued Books", value: "186", icon: BookOpen, color: "text-amber-500" },
  { label: "Active Members", value: "412", icon: Users, color: "text-emerald-500" },
  { label: "Overdue Returns", value: "14", icon: Clock, color: "text-red-500" },
];
function LibraryPage() {
  const [open, setOpen] = useState(false);
  const [books, setBooks] = useState([
    {
      title: "Advanced Mathematics",
      author: "R.D. Sharma",
      isbn: "978-0-123",
      category: "Science",
      copies: 12,
      status: "Available",
    },
    {
      title: "Physics for Class XII",
      author: "H.C. Verma",
      isbn: "978-0-456",
      category: "Science",
      copies: 2,
      status: "Low Stock",
    },
    {
      title: "English Literature",
      author: "William Shakespeare",
      isbn: "978-0-789",
      category: "Literature",
      copies: 8,
      status: "Available",
    },
    {
      title: "Computer Science",
      author: "Sumita Arora",
      isbn: "978-0-012",
      category: "Technology",
      copies: 0,
      status: "Out of Stock",
    },
  ]);
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const copies = parseInt(fd.get("copies")) || 0;
    setBooks((prev) => [
      {
        title: fd.get("title"),
        author: fd.get("author"),
        isbn: fd.get("isbn"),
        category: fd.get("category"),
        copies,
        status: copies > 5 ? "Available" : copies > 0 ? "Low Stock" : "Out of Stock",
      },
      ...prev,
    ]);
    toast.success("Book added successfully");
    setOpen(false);
  };
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Library"
        description="Manage books, members and issue/return records"
        eyebrow="Resources"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-primary text-primary-foreground border-0 shadow-glow">
                <Plus className="h-4 w-4" /> Add Book
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Book</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Book Title</Label>
                    <Input name="title" placeholder="Enter book title" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Author</Label>
                    <Input name="author" placeholder="Author name" required />
                  </div>
                  <div className="space-y-2">
                    <Label>ISBN</Label>
                    <Input name="isbn" placeholder="e.g. 978-0-123456" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Literature">Literature</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                        <SelectItem value="Arts">Arts</SelectItem>
                        <SelectItem value="Reference">Reference</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Total Copies</Label>
                    <Input name="copies" type="number" placeholder="Number of copies" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Publisher</Label>
                    <Input name="publisher" placeholder="Publisher name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Edition / Year</Label>
                    <Input name="edition" placeholder="e.g. 3rd Edition, 2024" />
                  </div>
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
                    Save Book
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((s) => (
          <Card key={s.label} className="glass-card hover:shadow-lg transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Book Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {books.map((b, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b last:border-0 border-border/50"
              >
                <div>
                  <p className="font-medium">{b.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.author} · {b.category}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{b.copies} copies</span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${b.status === "Available" ? "bg-emerald-500/10 text-emerald-500" : b.status === "Low Stock" ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"}`}
                  >
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LibraryPage;
