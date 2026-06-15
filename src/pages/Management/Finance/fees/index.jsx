import { useState, useMemo } from "react";
import { PageHeader } from "@/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import {
  Wallet,
  TrendingUp,
  AlertCircle,
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ListToolbar, StatusBadge } from "@/components/shared/ListToolbar";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

// Private Service imports
import {
  useGetFeesQuery,
  useCreateFeeMutation,
  useUpdateFeeMutation,
  useDeleteFeeMutation,
} from "@/services/private/feeService";
import { useGetStudentsQuery } from "@/services/private/studentService";

const MONTHS_ORDER = [
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

function FeesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Dialog states
  const [selectedFee, setSelectedFee] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Forms
  const [addForm, setAddForm] = useState({
    studentId: "",
    month: "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "Cash",
    status: "Paid",
    remarks: "",
  });

  const [editForm, setEditForm] = useState({
    amount: "",
    paymentDate: "",
    paymentMethod: "Cash",
    status: "Paid",
    remarks: "",
  });

  const [payForm, setPayForm] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "Cash",
    remarks: "",
  });

  // Queries
  const {
    data: paginatedData,
    isLoading: isTableLoading,
    error: tableError,
  } = useGetFeesQuery({
    page,
    limit,
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    month: monthFilter !== "all" ? monthFilter : undefined,
  });

  // Get all fees for aggregated statistics and chart (max 1000 for realistic school size in demo)
  const { data: allFeesData, isLoading: isStatsLoading } = useGetFeesQuery({ limit: 1000 });
  const { data: studentsData } = useGetStudentsQuery({ limit: 1000 });

  // Mutations
  const [createFee, { isLoading: isCreating }] = useCreateFeeMutation();
  const [updateFee, { isLoading: isUpdating }] = useUpdateFeeMutation();
  const [deleteFee, { isLoading: isDeleting }] = useDeleteFeeMutation();

  // Computations
  const feeRecords = paginatedData?.data || [];
  const pagination = paginatedData?.pagination || { page: 1, pages: 1, total: 0 };

  const stats = useMemo(() => {
    const allFees = allFeesData?.data || [];
    const currentMonthName = new Date().toLocaleString("en-US", { month: "long" });
    const currentYear = new Date().getFullYear();

    // Collected (MTD)
    const collectedMtd = allFees
      .filter(
        (f) =>
          f.status?.toLowerCase() === "paid" &&
          f.month?.toLowerCase() === currentMonthName.toLowerCase(),
      )
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

    // Pending Total
    const pendingTotal = allFees
      .filter((f) => f.status?.toLowerCase() === "pending")
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

    // Average Ticket
    const paidFees = allFees.filter((f) => f.status?.toLowerCase() === "paid");
    const avgTicket =
      paidFees.length > 0
        ? Math.round(
            paidFees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0) / paidFees.length,
          )
        : 0;

    // Growth calculation (MTD vs Previous Month)
    const prevMonthIdx = (new Date().getMonth() - 1 + 12) % 12;
    const prevMonthName = MONTHS_ORDER[prevMonthIdx];
    const prevMonthCollected = allFees
      .filter(
        (f) =>
          f.status?.toLowerCase() === "paid" &&
          f.month?.toLowerCase() === prevMonthName.toLowerCase(),
      )
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

    const growth =
      prevMonthCollected > 0
        ? Math.round(((collectedMtd - prevMonthCollected) / prevMonthCollected) * 100)
        : 0;

    // Chart Collection grouping by month
    const chartData = MONTHS_ORDER.map((m) => {
      const collectedForMonth = allFees
        .filter(
          (f) => f.month?.toLowerCase() === m.toLowerCase() && f.status?.toLowerCase() === "paid",
        )
        .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
      return {
        month: m.slice(0, 3), // "January" -> "Jan"
        collected: collectedForMonth,
      };
    });

    return {
      collectedMtd,
      pendingTotal,
      avgTicket,
      growth,
      chartData,
    };
  }, [allFeesData]);

  // Modal Handlers
  const handleOpenEdit = (fee) => {
    setSelectedFee(fee);
    setEditForm({
      amount: fee.amount ?? 0,
      paymentDate: fee.paymentDate ?? new Date().toISOString().split("T")[0],
      paymentMethod: fee.paymentMethod ?? "Cash",
      status: fee.status ?? "Paid",
      remarks: fee.remarks ?? "",
    });
    setIsEditOpen(true);
  };

  const handleOpenPay = (fee) => {
    setSelectedFee(fee);
    setPayForm({
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "Cash",
      remarks: "",
    });
    setIsPayOpen(true);
  };

  // Mutator Submissions
  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!addForm.studentId) {
      toast.error("Please select a student");
      return;
    }
    if (!addForm.month) {
      toast.error("Please select a month");
      return;
    }
    try {
      await createFee({
        studentId: addForm.studentId,
        month: addForm.month,
        amount: Number(addForm.amount),
        paymentDate: addForm.paymentDate,
        paymentMethod: addForm.paymentMethod,
        status: addForm.status,
        remarks: addForm.remarks,
      }).unwrap();
      toast.success("Fee record created successfully!");
      setIsAddOpen(false);
      setAddForm({
        studentId: "",
        month: "",
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "Cash",
        status: "Paid",
        remarks: "",
      });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create fee record");
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await updateFee({
        id: selectedFee.id,
        body: {
          amount: Number(editForm.amount),
          paymentDate: editForm.paymentDate,
          paymentMethod: editForm.paymentMethod,
          status: editForm.status,
          remarks: editForm.remarks,
        },
        studentId: selectedFee.studentId?.id,
      }).unwrap();
      toast.success("Fee record updated successfully");
      setIsEditOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update fee record");
    }
  };

  const handleSavePay = async (e) => {
    e.preventDefault();
    try {
      await updateFee({
        id: selectedFee.id,
        body: {
          amount: selectedFee.amount,
          paymentDate: payForm.paymentDate,
          paymentMethod: payForm.paymentMethod,
          status: "Paid",
          remarks: payForm.remarks,
        },
        studentId: selectedFee.studentId?.id,
      }).unwrap();
      toast.success("Payment recorded successfully");
      setIsPayOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to record payment");
    }
  };

  const handleDeleteFee = async (feeId, studentId, monthName) => {
    if (!window.confirm(`Are you sure you want to delete the fee record for ${monthName}?`)) {
      return;
    }
    try {
      await deleteFee({ id: feeId, studentId }).unwrap();
      toast.success(`Fee record for ${monthName} deleted successfully`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete fee record");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Fees"
        description="Collection overview and student-wise fee status."
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Collected (MTD)"
          value={`Rs. ${stats.collectedMtd.toLocaleString()}`}
          icon={Wallet}
          variant="success"
          trend={stats.growth}
        />
        <StatCard
          label="Pending"
          value={`Rs. ${stats.pendingTotal.toLocaleString()}`}
          icon={AlertCircle}
          variant="warning"
        />
        <StatCard
          label="Avg Ticket"
          value={`Rs. ${stats.avgTicket.toLocaleString()}`}
          icon={CreditCard}
          variant="info"
        />
        <StatCard
          label="Growth"
          value={`${stats.growth >= 0 ? "+" : ""}${stats.growth}%`}
          icon={TrendingUp}
          variant="primary"
          trend={stats.growth}
        />
      </div>

      {/* Chart */}
      <Card className="p-6 shadow-card">
        <h3 className="font-semibold text-lg mb-4">Monthly Collection</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stats.chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
              }}
            />
            <Bar dataKey="collected" fill="oklch(0.55 0.22 280)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Toolbar */}
      <ListToolbar
        search={search}
        setSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onAdd={() => setIsAddOpen(true)}
        addLabel="Add Fee Record"
      >
        <div className="flex flex-wrap gap-2">
          {/* Month Filter */}
          <Select
            value={monthFilter}
            onValueChange={(val) => {
              setMonthFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {MONTHS_ORDER.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ListToolbar>

      {/* Main Table */}
      {isTableLoading ? (
        <Card className="p-12 flex justify-center items-center shadow-card">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium">Loading fee records...</p>
          </div>
        </Card>
      ) : tableError ? (
        <Card className="p-6 border-destructive/20 bg-destructive/5 flex items-center gap-3 text-destructive shadow-card">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Failed to load fee records</p>
            <p className="text-sm opacity-90">
              {tableError?.data?.message || "An unexpected error occurred."}
            </p>
          </div>
        </Card>
      ) : (
        <Card className="shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeRecords.map((fee) => (
                <TableRow key={fee.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{fee.studentId?.name || "N/A"}</TableCell>
                  <TableCell>
                    {fee.studentId?.class && fee.studentId?.section
                      ? `${fee.studentId.class}-${fee.studentId.section}`
                      : "—"}
                  </TableCell>
                  <TableCell className="font-semibold">{fee.month}</TableCell>
                  <TableCell className="font-medium">
                    Rs. {(fee.amount || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {fee.paymentDate || "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {fee.paymentMethod || "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={fee.status || "Pending"} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleOpenEdit(fee)}
                        title="Edit details"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-success hover:text-success"
                        onClick={() => handleOpenPay(fee)}
                        disabled={fee.status?.toLowerCase() === "paid"}
                        title="Collect Payment"
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteFee(fee.id, fee.studentId?.id, fee.month)}
                        disabled={isDeleting}
                        title="Delete record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {feeRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No fee records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t bg-muted/20">
              <span className="text-xs text-muted-foreground font-medium">
                Page {pagination.page} of {pagination.pages} ({pagination.total} records total)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages))}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Add Fee Record Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Configure Student Fee
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveAdd} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="add-student">Select Student</Label>
              <select
                id="add-student"
                value={addForm.studentId}
                onChange={(e) => setAddForm({ ...addForm, studentId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="" disabled>
                  Select Student...
                </option>
                {(studentsData?.students || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName || s.name} ({s.class}-{s.section})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-month">Select Month</Label>
              <select
                id="add-month"
                value={addForm.month}
                onChange={(e) => setAddForm({ ...addForm, month: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="" disabled>
                  Select a month...
                </option>
                {MONTHS_ORDER.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-amount">Total Fee Amount (Rs.)</Label>
              <Input
                id="add-amount"
                type="number"
                value={addForm.amount}
                onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })}
                placeholder="e.g. 5000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-status">Status</Label>
              <select
                id="add-status"
                value={addForm.status}
                onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-payment-date">Payment Date</Label>
              <Input
                id="add-payment-date"
                type="date"
                value={addForm.paymentDate}
                onChange={(e) => setAddForm({ ...addForm, paymentDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-payment-method">Payment Method</Label>
              <select
                id="add-payment-method"
                value={addForm.paymentMethod}
                onChange={(e) => setAddForm({ ...addForm, paymentMethod: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="JazzCash">JazzCash</option>
                <option value="Card">Card</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-remarks">Remarks</Label>
              <Textarea
                id="add-remarks"
                value={addForm.remarks}
                onChange={(e) => setAddForm({ ...addForm, remarks: e.target.value })}
                placeholder="Remarks, e.g. Monthly tuition fee"
                rows={3}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gradient-primary text-primary-foreground border-0 font-semibold"
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Fee Details Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" /> Edit{" "}
              {selectedFee ? selectedFee.month : ""} Fee Details
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Total Fee Amount (Rs.)</Label>
              <Input
                id="edit-amount"
                type="number"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                placeholder="e.g. 5000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-payment-date">Payment Date</Label>
              <Input
                id="edit-payment-date"
                type="date"
                value={editForm.paymentDate}
                onChange={(e) => setEditForm({ ...editForm, paymentDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-payment-method">Payment Method</Label>
              <select
                id="edit-payment-method"
                value={editForm.paymentMethod}
                onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="JazzCash">JazzCash</option>
                <option value="Card">Card</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-remarks">Remarks</Label>
              <Textarea
                id="edit-remarks"
                value={editForm.remarks}
                onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                placeholder="Remarks, e.g. Paid in cash"
                rows={3}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gradient-primary text-primary-foreground border-0 font-semibold"
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-success" /> Record{" "}
              {selectedFee ? selectedFee.month : ""} Fee Payment
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSavePay} className="space-y-4 py-2">
            <div className="bg-muted/40 p-3 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Student:</span>
                <span className="font-semibold">{selectedFee?.studentId?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Month:</span>
                <span className="font-semibold capitalize">{selectedFee?.month}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee Amount:</span>
                <span className="font-semibold">
                  Rs. {(selectedFee?.amount || 0).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay-date">Payment Date</Label>
              <Input
                id="pay-date"
                type="date"
                value={payForm.paymentDate}
                onChange={(e) => setPayForm({ ...payForm, paymentDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay-method">Payment Method</Label>
              <select
                id="pay-method"
                value={payForm.paymentMethod}
                onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="JazzCash">JazzCash</option>
                <option value="Card">Card</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay-remarks">Remarks / Description</Label>
              <Textarea
                id="pay-remarks"
                value={payForm.remarks}
                onChange={(e) => setPayForm({ ...payForm, remarks: e.target.value })}
                placeholder="Remarks, e.g. Paid in cash"
                rows={3}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPayOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gradient-primary text-primary-foreground border-0 font-semibold"
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Record Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FeesPage;
