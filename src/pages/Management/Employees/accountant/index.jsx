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
import { Calculator, TrendingUp, TrendingDown, DollarSign, Plus } from "lucide-react";
import { toast } from "sonner";

const stats = [
  { label: "Total Income", value: "₹12,45,000", icon: TrendingUp, color: "text-emerald-500" },
  { label: "Total Expense", value: "₹8,32,000", icon: TrendingDown, color: "text-red-500" },
  { label: "Net Balance", value: "₹4,13,000", icon: DollarSign, color: "text-blue-500" },
  { label: "Pending Dues", value: "₹1,85,000", icon: Calculator, color: "text-amber-500" },
];
function AccountantPage() {
  const [open, setOpen] = useState(false);
  const [transactions, setTransactions] = useState([
    {
      title: "Fee Collection - Class X",
      type: "Income",
      amount: "₹45,000",
      date: "2026-05-01",
      category: "Fees",
    },
    {
      title: "Electricity Bill",
      type: "Expense",
      amount: "₹12,500",
      date: "2026-04-28",
      category: "Utility",
    },
    {
      title: "Lab Equipment Purchase",
      type: "Expense",
      amount: "₹35,000",
      date: "2026-04-25",
      category: "Purchase",
    },
  ]);
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setTransactions((prev) => [
      {
        title: fd.get("title"),
        type: fd.get("type"),
        amount: `₹${fd.get("amount")}`,
        date: fd.get("date"),
        category: fd.get("category"),
      },
      ...prev,
    ]);
    toast.success("Transaction added successfully");
    setOpen(false);
  };
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Accountant"
        description="Financial overview and transaction management"
        eyebrow="Finance"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-primary text-primary-foreground border-0 shadow-glow">
                <Plus className="h-4 w-4" /> Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" placeholder="Transaction title" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Income">Income</SelectItem>
                        <SelectItem value="Expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fees">Fees</SelectItem>
                        <SelectItem value="Salary">Salary</SelectItem>
                        <SelectItem value="Utility">Utility</SelectItem>
                        <SelectItem value="Purchase">Purchase</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Optional description"
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
                    className="gradient-primary text-primary-foreground border-0"
                  >
                    Save Transaction
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
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b last:border-0 border-border/50"
              >
                <div>
                  <p className="font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.date} · {t.category}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{t.amount}</span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${t.type === "Income" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}
                  >
                    {t.type}
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

export default AccountantPage;
