import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, Download } from "lucide-react";
export function ListToolbar({ search, setSearch, onAdd, addLabel, children }) {
  return (
    <Card className="p-4 shadow-card">
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="pl-9"
          />
        </div>
        {children}
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filter
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export
        </Button>
        {onAdd && (
          <Button
            onClick={onAdd}
            className="gap-2 gradient-primary text-primary-foreground border-0 shadow-glow"
          >
            <Plus className="h-4 w-4" /> {addLabel ?? "Add New"}
          </Button>
        )}
      </div>
    </Card>
  );
}
export function StatusBadge({ status }) {
  const map = {
    Active: "bg-success/15 text-success border-success/30",
    Inactive: "bg-muted text-muted-foreground border-border",
    Paid: "bg-success/15 text-success border-success/30",
    Pending: "bg-warning/15 text-warning-foreground border-warning/30",
    Overdue: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
