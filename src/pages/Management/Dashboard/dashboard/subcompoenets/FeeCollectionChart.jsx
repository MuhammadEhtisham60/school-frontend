import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useGetFeesQuery } from "@/services/private/feeService";
import { Loader2, Calendar } from "lucide-react";

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

function resolveFeeDate(fee) {
  if (fee.paymentDate) {
    const d = new Date(fee.paymentDate + (fee.paymentDate.length === 10 ? "T00:00:00" : ""));
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (fee.month) {
    const idx = MONTHS_ORDER.findIndex(
      (m) => m.toLowerCase() === String(fee.month).trim().toLowerCase()
    );
    if (idx >= 0) {
      const yr = Number(fee.year) || new Date().getFullYear();
      return new Date(yr, idx, 1);
    }
  }
  if (fee.createdAt) {
    const d = new Date(fee.createdAt);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

function getDateRangeBounds(preset, customStart, customEnd) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  switch (preset) {
    case "this_month":
      return {
        start: new Date(y, m, 1, 0, 0, 0, 0),
        end: new Date(y, m + 1, 0, 23, 59, 59, 999),
      };
    case "last_month":
      return {
        start: new Date(y, m - 1, 1, 0, 0, 0, 0),
        end: new Date(y, m, 0, 23, 59, 59, 999),
      };
    case "this_quarter": {
      const qStartMonth = Math.floor(m / 3) * 3;
      return {
        start: new Date(y, qStartMonth, 1, 0, 0, 0, 0),
        end: new Date(y, qStartMonth + 3, 0, 23, 59, 59, 999),
      };
    }
    case "last_quarter": {
      const currentQStart = Math.floor(m / 3) * 3;
      return {
        start: new Date(y, currentQStart - 3, 1, 0, 0, 0, 0),
        end: new Date(y, currentQStart, 0, 23, 59, 59, 999),
      };
    }
    case "this_year":
      return {
        start: new Date(y, 0, 1, 0, 0, 0, 0),
        end: new Date(y, 11, 31, 23, 59, 59, 999),
      };
    case "last_year":
      return {
        start: new Date(y - 1, 0, 1, 0, 0, 0, 0),
        end: new Date(y - 1, 11, 31, 23, 59, 59, 999),
      };
    case "custom":
      return {
        start: customStart ? new Date(customStart + "T00:00:00") : null,
        end: customEnd ? new Date(customEnd + "T23:59:59.999") : null,
      };
    default:
      return { start: null, end: null };
  }
}

export function FeeCollectionChart() {
  const [dateFilter, setDateFilter] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const { data: feesData, isLoading } = useGetFeesQuery({ limit: 1000 });

  const { chartData, totalCollected, totalPending } = useMemo(() => {
    const fees = feesData?.data || [];
    const { start, end } = getDateRangeBounds(dateFilter, customStart, customEnd);

    const filteredFees = fees.filter((f) => {
      if (!start && !end) return true;
      const d = resolveFeeDate(f);
      if (!d) return false;
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });

    const byMonth = {};

    filteredFees.forEach((f) => {
      const rawMonth = String(f.month || "Other").trim();
      const normalizedMonth =
        MONTHS_ORDER.find((m) => m.toLowerCase() === rawMonth.toLowerCase()) || rawMonth;

      if (!byMonth[normalizedMonth]) {
        byMonth[normalizedMonth] = {
          month: normalizedMonth.slice(0, 3),
          fullMonth: normalizedMonth,
          collected: 0,
          pending: 0,
        };
      }

      const amount = Number(f.amount || 0);
      if (String(f.status || "").toLowerCase() === "paid") {
        byMonth[normalizedMonth].collected += amount;
      } else {
        byMonth[normalizedMonth].pending += amount;
      }
    });

    const sorted = Object.values(byMonth).sort((a, b) => {
      const idxA = MONTHS_ORDER.indexOf(a.fullMonth);
      const idxB = MONTHS_ORDER.indexOf(b.fullMonth);
      if (idxA === -1 && idxB === -1) return a.fullMonth.localeCompare(b.fullMonth);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

    const collectedSum = sorted.reduce((sum, item) => sum + item.collected, 0);
    const pendingSum = sorted.reduce((sum, item) => sum + item.pending, 0);

    return {
      chartData: sorted,
      totalCollected: collectedSum,
      totalPending: pendingSum,
    };
  }, [feesData, dateFilter, customStart, customEnd]);

  return (
    <Card className="lg:col-span-2 p-6 shadow-card">
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-lg">Fee Collection</h3>
            <p className="text-sm text-muted-foreground">
              Collected vs pending (PKR) · Paid: PKR {totalCollected.toLocaleString()} · Pending:
              PKR {totalPending.toLocaleString()}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[175px] h-9 text-xs">
                <Calendar className="h-3.5 w-3.5 mr-1.5 text-primary" />
                <SelectValue placeholder="Filter period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_quarter">This Quarter</SelectItem>
                <SelectItem value="last_quarter">Last Quarter</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
                <SelectItem value="last_year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Date Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {dateFilter === "custom" && (
          <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-muted/40 border">
            <span className="text-xs font-medium text-muted-foreground">From:</span>
            <Input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-[145px] h-8 text-xs"
            />
            <span className="text-xs font-medium text-muted-foreground">To:</span>
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-[145px] h-8 text-xs"
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-[260px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
          No fee records found for the selected period.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
            <Tooltip
              formatter={(value) => `PKR ${Number(value).toLocaleString()}`}
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
              }}
            />
            <Legend />
            <Bar
              dataKey="collected"
              name="Collected"
              fill="var(--chart-1)"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="pending"
              name="Pending"
              fill="var(--chart-3)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
