import { useMemo, useState } from "react";
import { PageHeader } from "@/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Folder,
  FolderPlus,
  FileText,
  FileUp,
  Download,
  ExternalLink,
  Trash2,
  Pencil,
  Search,
  ChevronRight,
  Home,
  File as FileIcon,
  Image as ImageIcon,
  FileSpreadsheet,
  FileArchive,
  Loader2,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { useGetClassesDropdownQuery } from "@/services/private/classService";
import { useGetSubjectsQuery } from "@/services/private/subjectService";
import {
  useGetLibraryFoldersQuery,
  useCreateLibraryFolderMutation,
  useUpdateLibraryFolderMutation,
  useDeleteLibraryFolderMutation,
  useGetLibraryItemsQuery,
  useCreateLibraryItemMutation,
  useDeleteLibraryItemMutation,
  useTrackLibraryDownloadMutation,
} from "@/services/private/libraryService";

function formatBytes(bytes) {
  const num = Number(bytes || 0);
  if (!num) return "—";
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileIcon(ext = "") {
  const e = String(ext).toUpperCase();
  if (["PNG", "JPG", "JPEG", "GIF", "WEBP", "SVG"].includes(e)) return ImageIcon;
  if (["XLS", "XLSX", "CSV"].includes(e)) return FileSpreadsheet;
  if (["ZIP", "RAR", "7Z", "TAR", "GZ"].includes(e)) return FileArchive;
  if (["PDF", "DOC", "DOCX", "TXT", "MD", "PPT", "PPTX"].includes(e)) return FileText;
  return FileIcon;
}

function PapersPage() {
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [search, setSearch] = useState("");

  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderForm, setFolderForm] = useState({ name: "", description: "" });

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    className: "",
    subjectName: "",
    notesContent: "",
    file: null,
  });

  const { data: classesData } = useGetClassesDropdownQuery();
  const { data: subjectsData } = useGetSubjectsQuery({ limit: 500 });
  const { data: foldersData, isLoading: foldersLoading } = useGetLibraryFoldersQuery({
    section: "papers",
  });
  const { data: itemsData, isLoading: itemsLoading } = useGetLibraryItemsQuery({
    itemType: "paper_file",
  });

  const [createFolder, { isLoading: isCreatingFolder }] = useCreateLibraryFolderMutation();
  const [updateFolder, { isLoading: isUpdatingFolder }] = useUpdateLibraryFolderMutation();
  const [deleteFolder] = useDeleteLibraryFolderMutation();
  const [createItem, { isLoading: isCreatingItem }] = useCreateLibraryItemMutation();
  const [deleteItem] = useDeleteLibraryItemMutation();
  const [trackDownload] = useTrackLibraryDownloadMutation();

  const classesList = useMemo(() => {
    const raw = classesData?.classes || classesData?.data || [];
    return raw.map((c) => ({
      id: String(c.id || c._id),
      name: c.name || c.label || `Class ${c.id}`,
    }));
  }, [classesData]);

  const subjectsList = useMemo(
    () => subjectsData?.subjects || subjectsData?.data || [],
    [subjectsData]
  );

  const allFolders = useMemo(() => foldersData?.folders || [], [foldersData]);
  const allPapers = useMemo(() => itemsData?.items || [], [itemsData]);

  const totalDownloads = useMemo(
    () => allPapers.reduce((sum, p) => sum + Number(p.downloads || 0), 0),
    [allPapers]
  );

  const breadcrumbs = useMemo(() => {
    const chain = [];
    let cursor = currentFolderId;
    const map = new Map(allFolders.map((f) => [String(f.id), f]));
    let guard = 0;
    while (cursor && map.has(String(cursor)) && guard < 20) {
      const folder = map.get(String(cursor));
      chain.unshift(folder);
      cursor = folder.parentId;
      guard += 1;
    }
    return chain;
  }, [allFolders, currentFolderId]);

  const visibleFolders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q) {
      return allFolders.filter((f) =>
        `${f.name} ${f.description}`.toLowerCase().includes(q)
      );
    }
    return allFolders.filter((f) =>
      currentFolderId ? String(f.parentId) === String(currentFolderId) : !f.parentId
    );
  }, [allFolders, currentFolderId, search]);

  const visiblePapers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q) {
      return allPapers.filter((p) =>
        `${p.title} ${p.className} ${p.subjectName} ${p.notesContent} ${p.fileName} ${p.fileExt}`
          .toLowerCase()
          .includes(q)
      );
    }
    return allPapers.filter((p) =>
      currentFolderId ? String(p.folderId) === String(currentFolderId) : !p.folderId
    );
  }, [allPapers, currentFolderId, search]);

  const openCreateFolderDialog = () => {
    setEditingFolder(null);
    setFolderForm({ name: "", description: "" });
    setFolderDialogOpen(true);
  };

  const openEditFolderDialog = (folder, e) => {
    e.stopPropagation();
    setEditingFolder(folder);
    setFolderForm({ name: folder.name || "", description: folder.description || "" });
    setFolderDialogOpen(true);
  };

  const handleSaveFolder = async (e) => {
    e.preventDefault();
    if (!folderForm.name.trim()) return toast.error("Folder name is required");
    try {
      if (editingFolder) {
        await updateFolder({
          id: editingFolder.id,
          name: folderForm.name.trim(),
          description: folderForm.description.trim(),
        }).unwrap();
        toast.success("Folder updated");
      } else {
        await createFolder({
          name: folderForm.name.trim(),
          description: folderForm.description.trim(),
          parentId: currentFolderId || null,
          section: "papers",
        }).unwrap();
        toast.success("Paper folder created");
      }
      setFolderDialogOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save folder");
    }
  };

  const handleDeleteFolder = async (folder, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete folder "${folder.name}" and all papers inside it?`)) return;
    try {
      await deleteFolder(folder.id).unwrap();
      if (String(currentFolderId) === String(folder.id)) {
        setCurrentFolderId(folder.parentId || null);
      }
      toast.success("Folder deleted");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete folder");
    }
  };

  const openUploadPaperDialog = () => {
    setUploadForm({
      title: "",
      className: "",
      subjectName: "",
      notesContent: "",
      file: null,
    });
    setUploadDialogOpen(true);
  };

  const handleUploadPaper = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) return toast.error("Please select a paper file to upload");

    const fd = new FormData();
    fd.append("itemType", "paper_file");
    fd.append(
      "title",
      uploadForm.title.trim() || uploadForm.file.name.replace(/\.[^/.]+$/, "")
    );
    if (uploadForm.className && uploadForm.className !== "none") {
      fd.append("className", uploadForm.className);
    }
    if (uploadForm.subjectName && uploadForm.subjectName !== "none") {
      fd.append("subjectName", uploadForm.subjectName);
    }
    fd.append("notesContent", uploadForm.notesContent.trim());
    if (currentFolderId) {
      fd.append("folderId", String(currentFolderId));
    }
    fd.append("file", uploadForm.file);

    try {
      await createItem(fd).unwrap();
      toast.success("Paper uploaded successfully");
      setUploadDialogOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to upload paper");
    }
  };

  const handleDeletePaper = async (paper) => {
    if (!window.confirm(`Delete paper "${paper.title}"?`)) return;
    try {
      await deleteItem(paper.id).unwrap();
      toast.success("Paper deleted");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete paper");
    }
  };

  const handleDownload = async (paper) => {
    if (!paper.fileUrl) return;
    try {
      await trackDownload(paper.id).unwrap();
    } catch {
      // Non-blocking
    }
    const link = document.createElement("a");
    link.href = paper.fileUrl;
    link.target = "_blank";
    link.download = paper.fileName || paper.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        eyebrow="Resources"
        title="Papers"
        description="Create folders and upload your exam & test papers of any file type."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={openCreateFolderDialog} className="gap-1.5">
              <FolderPlus className="h-4 w-4" /> New Folder
            </Button>
            <Button
              onClick={openUploadPaperDialog}
              className="gap-1.5 gradient-primary text-primary-foreground border-0 shadow-glow"
            >
              <FileUp className="h-4 w-4" /> Upload Paper
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Paper Folders"
          value={allFolders.length}
          icon={Folder}
          variant="info"
        />
        <StatCard
          label="Uploaded Papers"
          value={allPapers.length}
          icon={FileText}
          variant="primary"
        />
        <StatCard
          label="Total Downloads"
          value={totalDownloads}
          icon={Download}
          variant="success"
        />
      </div>

      {/* Breadcrumbs & Search */}
      <Card className="p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <button
              type="button"
              onClick={() => setCurrentFolderId(null)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                !currentFolderId
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              <Home className="h-3.5 w-3.5" /> Papers Root
            </button>
            {breadcrumbs.map((bc, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <div key={bc.id} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setCurrentFolderId(bc.id)}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      isLast
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {bc.name}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search folders or papers..."
              className="pl-9 h-9"
            />
          </div>
        </div>
      </Card>

      {foldersLoading || itemsLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading papers...
        </div>
      ) : (
        <>
          {/* Folders Grid */}
          {visibleFolders.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Folders ({visibleFolders.length})
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {visibleFolders.map((folder) => (
                  <Card
                    key={folder.id}
                    onClick={() => {
                      setSearch("");
                      setCurrentFolderId(folder.id);
                    }}
                    className="p-4 shadow-card card-hover cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Folder className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm truncate group-hover:text-primary">
                            {folder.name}
                          </h4>
                          <p className="text-[11px] text-muted-foreground">
                            {folder.subfolderCount || 0} folders • {folder.itemCount || 0} papers
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={(e) => openEditFolderDialog(folder, e)}
                          title="Rename folder"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={(e) => handleDeleteFolder(folder, e)}
                          title="Delete folder"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {folder.description && (
                      <p className="mt-2.5 text-xs text-muted-foreground line-clamp-2">
                        {folder.description}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Papers Grid */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Papers ({visiblePapers.length})
            </h3>
            {visiblePapers.length === 0 ? (
              <Card className="p-10 text-center shadow-card">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground/60 mb-3" />
                <h4 className="font-semibold">
                  {visibleFolders.length > 0
                    ? "No papers uploaded in this folder yet"
                    : "No folders or papers yet"}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a folder to organize by term, class, or subject, then upload your papers inside it.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Button variant="outline" onClick={openCreateFolderDialog} className="gap-1.5">
                    <FolderPlus className="h-4 w-4" /> New Folder
                  </Button>
                  <Button
                    onClick={openUploadPaperDialog}
                    className="gradient-primary text-primary-foreground border-0 shadow-glow gap-1.5"
                  >
                    <FileUp className="h-4 w-4" /> Upload Paper
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {visiblePapers.map((paper) => {
                  const PIcon = getFileIcon(paper.fileExt);
                  return (
                    <Card
                      key={paper.id}
                      className="p-4 shadow-card card-hover flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-11 w-11 rounded-xl gradient-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-glow">
                          <PIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-semibold text-sm truncate">{paper.title}</h4>
                            <Badge variant="secondary" className="text-[10px] shrink-0">
                              {paper.fileExt || "FILE"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {paper.fileName} • {formatBytes(paper.fileSize)}
                          </p>
                          {(paper.className || paper.subjectName) && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {paper.className && (
                                <Badge variant="outline" className="text-[10px]">
                                  <Layers className="h-2.5 w-2.5 mr-1" />
                                  {paper.className}
                                </Badge>
                              )}
                              {paper.subjectName && (
                                <Badge variant="outline" className="text-[10px]">
                                  {paper.subjectName}
                                </Badge>
                              )}
                            </div>
                          )}
                          {paper.notesContent && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {paper.notesContent}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t text-xs">
                        <span className="text-muted-foreground">
                          {paper.createdAt
                            ? new Date(paper.createdAt).toLocaleDateString()
                            : ""}
                        </span>
                        <div className="flex items-center gap-1">
                          {paper.fileUrl && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                asChild
                                className="h-8 px-2.5 text-xs gap-1"
                              >
                                <a href={paper.fileUrl} target="_blank" rel="noreferrer">
                                  <ExternalLink className="h-3.5 w-3.5" /> Open
                                </a>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDownload(paper)}
                                className="h-8 px-2.5 text-xs gap-1 text-primary"
                              >
                                <Download className="h-3.5 w-3.5" /> Save
                              </Button>
                            </>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeletePaper(paper)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* CREATE / RENAME FOLDER DIALOG */}
      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingFolder ? "Rename Folder" : "Create Paper Folder"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveFolder} className="space-y-4">
            <div className="space-y-2">
              <Label>Folder Name</Label>
              <Input
                value={folderForm.name}
                onChange={(e) =>
                  setFolderForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Final Term 2026, Class 9 Science"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                rows={3}
                value={folderForm.description}
                onChange={(e) =>
                  setFolderForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Optional notes about this folder..."
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isCreatingFolder || isUpdatingFolder}
                className="gradient-primary text-primary-foreground border-0 shadow-glow"
              >
                {editingFolder ? "Save Folder" : "Create Folder"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* UPLOAD PAPER DIALOG */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Upload Paper{" "}
              {breadcrumbs.length > 0
                ? `into "${breadcrumbs[breadcrumbs.length - 1].name}"`
                : "to Papers Root"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadPaper} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Select Paper File (Any Type: PDF, Word, Image, ZIP, etc.)</Label>
                <Input
                  type="file"
                  required
                  onChange={(e) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      file: e.target.files?.[0] || null,
                    }))
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Paper Title (Optional — defaults to filename)</Label>
                <Input
                  value={uploadForm.title}
                  onChange={(e) =>
                    setUploadForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. Mathematics Mid-Term Paper"
                />
              </div>
              <div className="space-y-2">
                <Label>Class (Optional)</Label>
                <Select
                  value={uploadForm.className}
                  onValueChange={(val) =>
                    setUploadForm((prev) => ({ ...prev, className: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {classesList.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject (Optional)</Label>
                <Select
                  value={uploadForm.subjectName}
                  onValueChange={(val) =>
                    setUploadForm((prev) => ({ ...prev, subjectName: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {subjectsList.map((s) => (
                      <SelectItem key={s.id || s.name} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Notes / Term Info (Optional)</Label>
                <Textarea
                  rows={2}
                  value={uploadForm.notesContent}
                  onChange={(e) =>
                    setUploadForm((prev) => ({ ...prev, notesContent: e.target.value }))
                  }
                  placeholder="e.g. Annual Exam 2026 - Morning Shift"
                />
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
                disabled={isCreatingItem}
                className="gradient-primary text-primary-foreground border-0 shadow-glow"
              >
                {isCreatingItem && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload Paper
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PapersPage;
