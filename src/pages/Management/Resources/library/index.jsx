import { useMemo, useState } from "react";
import { PageHeader } from "@/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  BookOpen,
  Folder,
  FolderPlus,
  FileText,
  FileUp,
  Download,
  ExternalLink,
  Trash2,
  Pencil,
  Search,
  Plus,
  ChevronRight,
  Home,
  Eye,
  Layers,
  BookMarked,
  File as FileIcon,
  Image as ImageIcon,
  FileSpreadsheet,
  FileArchive,
  Loader2,
  Paperclip,
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
  useUpdateLibraryItemMutation,
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

function LibraryPage() {
  const [activeTab, setActiveTab] = useState("notes"); // "notes" | "vault"

  // Notes filters
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("all");
  const [notesSearch, setNotesSearch] = useState("");

  // Vault folder navigation & search
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [vaultSearch, setVaultSearch] = useState("");

  // Dialogs
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteForm, setNoteForm] = useState({
    title: "",
    className: "",
    subjectName: "",
    notesContent: "",
    file: null,
  });
  const [viewNote, setViewNote] = useState(null);

  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderForm, setFolderForm] = useState({ name: "", description: "" });

  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [fileForm, setFileForm] = useState({ title: "", notesContent: "", file: null });

  // Data queries
  const { data: classesData } = useGetClassesDropdownQuery();
  const { data: subjectsData } = useGetSubjectsQuery({ limit: 500 });
  const { data: foldersData, isLoading: foldersLoading } = useGetLibraryFoldersQuery({
    section: "vault",
  });
  const { data: itemsData, isLoading: itemsLoading } = useGetLibraryItemsQuery();

  // Mutations
  const [createFolder, { isLoading: isCreatingFolder }] = useCreateLibraryFolderMutation();
  const [updateFolder, { isLoading: isUpdatingFolder }] = useUpdateLibraryFolderMutation();
  const [deleteFolder] = useDeleteLibraryFolderMutation();
  const [createItem, { isLoading: isCreatingItem }] = useCreateLibraryItemMutation();
  const [updateItem, { isLoading: isUpdatingItem }] = useUpdateLibraryItemMutation();
  const [deleteItem] = useDeleteLibraryItemMutation();
  const [trackDownload] = useTrackLibraryDownloadMutation();

  const classesList = useMemo(() => {
    const raw = classesData?.classes || classesData?.data || [];
    return raw.map((c) => ({
      id: String(c.id || c._id),
      name: c.name || c.label || `Class ${c.id}`,
    }));
  }, [classesData]);

  const subjectsList = useMemo(() => {
    return subjectsData?.subjects || subjectsData?.data || [];
  }, [subjectsData]);

  const allFolders = useMemo(() => foldersData?.folders || [], [foldersData]);
  const allItems = useMemo(() => itemsData?.items || [], [itemsData]);

  // Subjects available for the selected class in filter or form
  const getSubjectsForClass = (clsName) => {
    if (!clsName || clsName === "all") return subjectsList;
    const normalized = clsName.toLowerCase();
    const matched = subjectsList.filter((s) =>
      Array.isArray(s.classes) &&
      s.classes.some((c) => String(c).toLowerCase() === normalized)
    );
    return matched.length > 0 ? matched : subjectsList;
  };

  const filterSubjects = useMemo(
    () => getSubjectsForClass(selectedClassFilter),
    [selectedClassFilter, subjectsList]
  );

  const formSubjects = useMemo(
    () => getSubjectsForClass(noteForm.className),
    [noteForm.className, subjectsList]
  );

  // Split items into notes and general vault files
  const allNotes = useMemo(
    () => allItems.filter((item) => item.itemType === "note"),
    [allItems]
  );
  const allVaultFiles = useMemo(
    () => allItems.filter((item) => item.itemType === "file"),
    [allItems]
  );

  const totalDownloads = useMemo(
    () => allItems.reduce((sum, item) => sum + Number(item.downloads || 0), 0),
    [allItems]
  );

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    const q = notesSearch.trim().toLowerCase();
    return allNotes.filter((n) => {
      if (
        selectedClassFilter !== "all" &&
        String(n.className || "").toLowerCase() !== selectedClassFilter.toLowerCase()
      ) {
        return false;
      }
      if (
        selectedSubjectFilter !== "all" &&
        String(n.subjectName || "").toLowerCase() !== selectedSubjectFilter.toLowerCase()
      ) {
        return false;
      }
      if (q) {
        const hay = `${n.title} ${n.className} ${n.subjectName} ${n.notesContent} ${n.fileName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allNotes, selectedClassFilter, selectedSubjectFilter, notesSearch]);

  // Vault Breadcrumbs
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

  // Current folder's subfolders & files
  const visibleFolders = useMemo(() => {
    const q = vaultSearch.trim().toLowerCase();
    if (q) {
      return allFolders.filter((f) =>
        `${f.name} ${f.description}`.toLowerCase().includes(q)
      );
    }
    return allFolders.filter((f) =>
      currentFolderId ? String(f.parentId) === String(currentFolderId) : !f.parentId
    );
  }, [allFolders, currentFolderId, vaultSearch]);

  const visibleFiles = useMemo(() => {
    const q = vaultSearch.trim().toLowerCase();
    if (q) {
      return allVaultFiles.filter((f) =>
        `${f.title} ${f.notesContent} ${f.fileName} ${f.fileExt}`.toLowerCase().includes(q)
      );
    }
    return allVaultFiles.filter((f) =>
      currentFolderId ? String(f.folderId) === String(currentFolderId) : !f.folderId
    );
  }, [allVaultFiles, currentFolderId, vaultSearch]);

  // Handlers: Notes
  const openAddNoteDialog = () => {
    setEditingNote(null);
    setNoteForm({
      title: "",
      className: selectedClassFilter !== "all" ? selectedClassFilter : classesList[0]?.name || "",
      subjectName:
        selectedSubjectFilter !== "all" ? selectedSubjectFilter : subjectsList[0]?.name || "",
      notesContent: "",
      file: null,
    });
    setNoteDialogOpen(true);
  };

  const openEditNoteDialog = (note) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title || "",
      className: note.className || "",
      subjectName: note.subjectName || "",
      notesContent: note.notesContent || "",
      file: null,
    });
    setNoteDialogOpen(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!noteForm.title.trim()) return toast.error("Please enter a note title");
    if (!noteForm.className) return toast.error("Please select a class");
    if (!noteForm.subjectName) return toast.error("Please select a subject");

    const fd = new FormData();
    fd.append("itemType", "note");
    fd.append("title", noteForm.title.trim());
    fd.append("className", noteForm.className);
    fd.append("subjectName", noteForm.subjectName);
    fd.append("notesContent", noteForm.notesContent || "");
    if (noteForm.file) {
      fd.append("file", noteForm.file);
    }

    try {
      if (editingNote) {
        await updateItem({ id: editingNote.id, data: fd }).unwrap();
        toast.success("Study note updated");
      } else {
        await createItem(fd).unwrap();
        toast.success("Study note added to library");
      }
      setNoteDialogOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save study note");
    }
  };

  // Handlers: Folders
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
          section: "vault",
        }).unwrap();
        toast.success("Folder created");
      }
      setFolderDialogOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save folder");
    }
  };

  const handleDeleteFolder = async (folder, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete folder "${folder.name}" and everything inside it?`)) return;
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

  // Handlers: General Vault Files
  const openUploadFileDialog = () => {
    setFileForm({ title: "", notesContent: "", file: null });
    setFileDialogOpen(true);
  };

  const handleUploadFile = async (e) => {
    e.preventDefault();
    if (!fileForm.file) return toast.error("Please select a file to upload");

    const fd = new FormData();
    fd.append("itemType", "file");
    fd.append(
      "title",
      fileForm.title.trim() || fileForm.file.name.replace(/\.[^/.]+$/, "")
    );
    fd.append("notesContent", fileForm.notesContent.trim());
    if (currentFolderId) {
      fd.append("folderId", String(currentFolderId));
    }
    fd.append("file", fileForm.file);

    try {
      await createItem(fd).unwrap();
      toast.success("File saved to folder");
      setFileDialogOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to upload file");
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      await deleteItem(item.id).unwrap();
      toast.success("Deleted from library");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete item");
    }
  };

  const handleDownload = async (item) => {
    if (!item.fileUrl) return;
    try {
      await trackDownload(item.id).unwrap();
    } catch {
      // Non-blocking download tracking
    }
    const link = document.createElement("a");
    link.href = item.fileUrl;
    link.target = "_blank";
    link.download = item.fileName || item.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        eyebrow="Resources & Knowledge Base"
        title="Digital Library & Notes Vault"
        description="Save class & subject study notes, or create folders to store any general files."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setActiveTab("vault");
                openCreateFolderDialog();
              }}
              className="gap-1.5"
            >
              <FolderPlus className="h-4 w-4" /> New Folder
            </Button>
            <Button
              onClick={() => {
                if (activeTab === "vault") openUploadFileDialog();
                else openAddNoteDialog();
              }}
              className="gap-1.5 gradient-primary text-primary-foreground border-0 shadow-glow"
            >
              {activeTab === "vault" ? (
                <>
                  <FileUp className="h-4 w-4" /> Upload File
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Add Subject Note
                </>
              )}
            </Button>
          </div>
        }
      />

      {/* KPI Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Subject Notes"
          value={allNotes.length}
          icon={BookOpen}
          variant="primary"
        />
        <StatCard
          label="Vault Folders"
          value={allFolders.length}
          icon={Folder}
          variant="info"
        />
        <StatCard
          label="General Files"
          value={allVaultFiles.length}
          icon={FileText}
          variant="success"
        />
        <StatCard
          label="Total Downloads"
          value={totalDownloads}
          icon={Download}
          variant="warning"
        />
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "notes" ? "default" : "outline"}
            onClick={() => setActiveTab("notes")}
            className={
              activeTab === "notes"
                ? "gradient-primary text-primary-foreground border-0 shadow-glow gap-2"
                : "gap-2"
            }
          >
            <BookMarked className="h-4 w-4" />
            Class &amp; Subject Notes
            <Badge variant="secondary" className="ml-1 text-[11px]">
              {allNotes.length}
            </Badge>
          </Button>
          <Button
            variant={activeTab === "vault" ? "default" : "outline"}
            onClick={() => setActiveTab("vault")}
            className={
              activeTab === "vault"
                ? "gradient-primary text-primary-foreground border-0 shadow-glow gap-2"
                : "gap-2"
            }
          >
            <Folder className="h-4 w-4" />
            General Vault &amp; Folders
            <Badge variant="secondary" className="ml-1 text-[11px]">
              {allFolders.length}
            </Badge>
          </Button>
        </div>
      </div>

      {/* TAB 1: CLASS & SUBJECT NOTES */}
      {activeTab === "notes" && (
        <div className="space-y-5">
          {/* Filters */}
          <Card className="p-4 shadow-card">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="relative md:col-span-2">
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={notesSearch}
                  onChange={(e) => setNotesSearch(e.target.value)}
                  placeholder="Search notes by title, content, class, subject or file..."
                  className="pl-9"
                />
              </div>
              <Select
                value={selectedClassFilter}
                onValueChange={(val) => {
                  setSelectedClassFilter(val);
                  setSelectedSubjectFilter("all");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classesList.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedSubjectFilter}
                onValueChange={setSelectedSubjectFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {filterSubjects.map((s) => (
                    <SelectItem key={s.id || s.name} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Notes List */}
          {itemsLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading study notes...
            </div>
          ) : filteredNotes.length === 0 ? (
            <Card className="p-12 text-center shadow-card">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/60 mb-3" />
              <h3 className="font-semibold text-lg">No subject notes found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Add study notes or attach files against any specific class and subject.
              </p>
              <Button
                onClick={openAddNoteDialog}
                className="mt-4 gradient-primary text-primary-foreground border-0 shadow-glow gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add Subject Note
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map((note) => (
                <Card
                  key={note.id}
                  className="p-5 shadow-card card-hover flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge className="gradient-primary text-primary-foreground border-0 text-[11px]">
                          <Layers className="h-3 w-3 mr-1" />
                          {note.className || "General"}
                        </Badge>
                        <Badge variant="secondary" className="text-[11px]">
                          {note.subjectName || "Subject"}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {note.createdAt
                          ? new Date(note.createdAt).toLocaleDateString()
                          : ""}
                      </span>
                    </div>

                    <h3 className="font-semibold text-base line-clamp-1">{note.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">
                      {note.notesContent || "No written summary provided."}
                    </p>

                    {note.fileUrl && (
                      <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border bg-accent/30 px-3 py-2 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <Paperclip className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate font-medium">
                            {note.fileName || "Attached file"}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {note.fileExt || "FILE"} • {formatBytes(note.fileSize)}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setViewNote(note)}
                        className="h-8 px-2.5 text-xs gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" /> Read
                      </Button>
                      {note.fileUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(note)}
                          className="h-8 px-2.5 text-xs gap-1 text-primary"
                        >
                          <Download className="h-3.5 w-3.5" /> Download
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditNoteDialog(note)}
                        className="h-8 w-8"
                        title="Edit Note"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteItem(note)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Delete Note"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GENERAL VAULT & FOLDERS */}
      {activeTab === "vault" && (
        <div className="space-y-5">
          {/* Breadcrumbs + Search + Actions */}
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
                  <Home className="h-3.5 w-3.5" /> Vault Root
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

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={vaultSearch}
                    onChange={(e) => setVaultSearch(e.target.value)}
                    placeholder="Search folders or files..."
                    className="pl-9 h-9"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={openCreateFolderDialog} className="gap-1.5">
                  <FolderPlus className="h-4 w-4" /> New Folder
                </Button>
                <Button
                  size="sm"
                  onClick={openUploadFileDialog}
                  className="gap-1.5 gradient-primary text-primary-foreground border-0 shadow-glow"
                >
                  <FileUp className="h-4 w-4" /> Upload Any File
                </Button>
              </div>
            </div>
          </Card>

          {/* Folders Section */}
          {foldersLoading || itemsLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading vault...
            </div>
          ) : (
            <>
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
                          setVaultSearch("");
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
                                {folder.subfolderCount || 0} folders • {folder.itemCount || 0} files
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

              {/* Files Section */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Files ({visibleFiles.length})
                </h3>
                {visibleFiles.length === 0 ? (
                  <Card className="p-10 text-center shadow-card">
                    <FileUp className="h-10 w-10 mx-auto text-muted-foreground/60 mb-3" />
                    <h4 className="font-semibold">
                      {visibleFolders.length > 0
                        ? "No files in this folder yet"
                        : "This folder is empty"}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create a folder or upload any type of file (PDF, Word, Excel, Images, ZIP, TXT, etc.).
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <Button variant="outline" onClick={openCreateFolderDialog} className="gap-1.5">
                        <FolderPlus className="h-4 w-4" /> New Folder
                      </Button>
                      <Button
                        onClick={openUploadFileDialog}
                        className="gradient-primary text-primary-foreground border-0 shadow-glow gap-1.5"
                      >
                        <FileUp className="h-4 w-4" /> Upload Any File
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {visibleFiles.map((file) => {
                      const FIcon = getFileIcon(file.fileExt);
                      return (
                        <Card
                          key={file.id}
                          className="p-4 shadow-card card-hover flex flex-col justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-11 w-11 rounded-xl gradient-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-glow">
                              <FIcon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-semibold text-sm truncate">{file.title}</h4>
                                <Badge variant="secondary" className="text-[10px] shrink-0">
                                  {file.fileExt || "FILE"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {file.fileName} • {formatBytes(file.fileSize)}
                              </p>
                              {file.notesContent && (
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                  {file.notesContent}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t text-xs">
                            <span className="text-muted-foreground">
                              {file.createdAt
                                ? new Date(file.createdAt).toLocaleDateString()
                                : ""}
                            </span>
                            <div className="flex items-center gap-1">
                              {file.fileUrl && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className="h-8 px-2.5 text-xs gap-1"
                                  >
                                    <a href={file.fileUrl} target="_blank" rel="noreferrer">
                                      <ExternalLink className="h-3.5 w-3.5" /> Open
                                    </a>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDownload(file)}
                                    className="h-8 px-2.5 text-xs gap-1 text-primary"
                                  >
                                    <Download className="h-3.5 w-3.5" /> Save
                                  </Button>
                                </>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteItem(file)}
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
        </div>
      )}

      {/* ADD / EDIT SUBJECT NOTE DIALOG */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingNote ? "Edit Subject Note" : "Add Class & Subject Note"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveNote} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select
                  value={noteForm.className}
                  onValueChange={(val) =>
                    setNoteForm((prev) => ({ ...prev, className: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classesList.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select
                  value={noteForm.subjectName}
                  onValueChange={(val) =>
                    setNoteForm((prev) => ({ ...prev, subjectName: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {formSubjects.map((s) => (
                      <SelectItem key={s.id || s.name} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Note Title</Label>
                <Input
                  value={noteForm.title}
                  onChange={(e) =>
                    setNoteForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. Chapter 3: Quadratic Equations Summary"
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Study Notes / Description</Label>
                <Textarea
                  rows={5}
                  value={noteForm.notesContent}
                  onChange={(e) =>
                    setNoteForm((prev) => ({ ...prev, notesContent: e.target.value }))
                  }
                  placeholder="Write detailed study notes, key formulas, or instructions..."
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Attach File (Optional — Any File Type)</Label>
                <Input
                  type="file"
                  onChange={(e) =>
                    setNoteForm((prev) => ({
                      ...prev,
                      file: e.target.files?.[0] || null,
                    }))
                  }
                />
                {editingNote?.fileName && !noteForm.file && (
                  <p className="text-xs text-muted-foreground">
                    Current attachment: {editingNote.fileName}
                  </p>
                )}
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
                disabled={isCreatingItem || isUpdatingItem}
                className="gradient-primary text-primary-foreground border-0 shadow-glow"
              >
                {(isCreatingItem || isUpdatingItem) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingNote ? "Update Note" : "Save Note"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* READ FULL NOTE DIALOG */}
      <Dialog open={!!viewNote} onOpenChange={(o) => !o && setViewNote(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className="gradient-primary text-primary-foreground border-0">
                {viewNote?.className}
              </Badge>
              <Badge variant="secondary">{viewNote?.subjectName}</Badge>
            </div>
            <DialogTitle>{viewNote?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl border bg-accent/20 p-4 text-sm whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto">
              {viewNote?.notesContent || "No written notes added."}
            </div>
            {viewNote?.fileUrl && (
              <div className="flex items-center justify-between rounded-xl border p-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Paperclip className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{viewNote.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {viewNote.fileExt} • {formatBytes(viewNote.fileSize)}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleDownload(viewNote)}
                  className="gradient-primary text-primary-foreground border-0 gap-1.5"
                >
                  <Download className="h-4 w-4" /> Download
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* CREATE / RENAME FOLDER DIALOG */}
      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingFolder ? "Rename Folder" : "Create New Folder"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveFolder} className="space-y-4">
            <div className="space-y-2">
              <Label>Folder Name</Label>
              <Input
                value={folderForm.name}
                onChange={(e) =>
                  setFolderForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Science Lab Manuals, Circulars, Templates"
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
                placeholder="What is stored in this folder?"
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

      {/* UPLOAD ANY FILE TO VAULT DIALOG */}
      <Dialog open={fileDialogOpen} onOpenChange={setFileDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Upload Any File{" "}
              {breadcrumbs.length > 0
                ? `to "${breadcrumbs[breadcrumbs.length - 1].name}"`
                : "to Vault Root"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadFile} className="space-y-4">
            <div className="space-y-2">
              <Label>Select File (Any Type: PDF, Word, Excel, Image, ZIP, etc.)</Label>
              <Input
                type="file"
                required
                onChange={(e) =>
                  setFileForm((prev) => ({
                    ...prev,
                    file: e.target.files?.[0] || null,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Title (Optional — defaults to filename)</Label>
              <Input
                value={fileForm.title}
                onChange={(e) =>
                  setFileForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter display title"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes / Description (Optional)</Label>
              <Textarea
                rows={3}
                value={fileForm.notesContent}
                onChange={(e) =>
                  setFileForm((prev) => ({ ...prev, notesContent: e.target.value }))
                }
                placeholder="Add any context or notes about this file..."
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
                disabled={isCreatingItem}
                className="gradient-primary text-primary-foreground border-0 shadow-glow"
              >
                {isCreatingItem && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save File
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LibraryPage;
