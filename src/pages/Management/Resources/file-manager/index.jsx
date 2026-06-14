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
import { Textarea } from "@/components/ui/textarea";
import { FolderOpen, File, Image, FileText, Download, Plus, Upload } from "lucide-react";
import { toast } from "sonner";

function FileManagerPage() {
  const [open, setOpen] = useState(false);
  const [folders, setFolders] = useState([
    {
      name: "Admission Forms",
      files: 24,
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      name: "Student Photos",
      files: 156,
      icon: Image,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
    {
      name: "Certificates",
      files: 89,
      icon: File,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    { name: "Reports", files: 45, icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
    {
      name: "Circulars",
      files: 32,
      icon: FileText,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    { name: "Exam Papers", files: 78, icon: File, color: "text-red-500", bg: "bg-red-500/10" },
  ]);
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setFolders((prev) => [
      {
        name: fd.get("name"),
        files: 0,
        icon: FolderOpen,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      },
      ...prev,
    ]);
    toast.success("Folder created successfully");
    setOpen(false);
  };
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="File Manager"
        description="Organize and manage all school documents and files"
        eyebrow="Resources"
        actions={
          <div className="flex gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 gradient-primary text-primary-foreground border-0 shadow-glow">
                  <Plus className="h-4 w-4" /> New Folder
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Folder / Upload File</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Folder Name</Label>
                    <Input name="name" placeholder="e.g. Annual Reports" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select name="category">
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Documents">Documents</SelectItem>
                        <SelectItem value="Photos">Photos</SelectItem>
                        <SelectItem value="Certificates">Certificates</SelectItem>
                        <SelectItem value="Reports">Reports</SelectItem>
                        <SelectItem value="Forms">Forms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea name="description" placeholder="Folder description (optional)" />
                  </div>
                  <div className="space-y-2">
                    <Label>Upload File (optional)</Label>
                    <Input name="file" type="file" />
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
                      Create Folder
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" /> Upload
            </Button>
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Files</CardTitle>
            <File className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{folders.reduce((a, f) => a + f.files, 0)}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Folders</CardTitle>
            <FolderOpen className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{folders.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Storage Used
            </CardTitle>
            <Download className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">2.4 GB</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {folders.map((f, i) => (
          <Card
            key={i}
            className="glass-card hover:shadow-lg transition-smooth cursor-pointer group"
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${f.bg} group-hover:scale-110 transition-smooth`}>
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <div>
                  <p className="font-semibold">{f.name}</p>
                  <p className="text-sm text-muted-foreground">{f.files} files</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default FileManagerPage;
