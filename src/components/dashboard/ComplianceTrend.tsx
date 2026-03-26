"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PostureSnapshot {
  id: string;
  overall_score: number;
  jurisdiction_scores: Record<string, number> | string;
  snapshot_date: string;
  active_regulations: number;
  open_findings: number;
}

interface ComplianceTrendProps {
  snapshots: PostureSnapshot[];
}

export function ComplianceTrend({ snapshots }: ComplianceTrendProps) {
  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime()
  );

  // Calculate week-over-week change
  const latest = sorted[sorted.length - 1];
  const weekAgo = sorted.length >= 7 ? sorted[sorted.length - 7] : sorted[0];
  const change = latest && weekAgo ? latest.overall_score - weekAgo.overall_score : 0;

  const data = sorted.map((s) => ({
    date: s.snapshot_date,
    score: s.overall_score,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Compliance Score Over Time</h3>
        {latest && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              change > 0
                ? "text-emerald-500"
                : change < 0
                  ? "text-red-500"
                  : "text-muted-foreground"
            )}
          >
            {change > 0 ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : change < 0 ? (
              <TrendingDown className="h-3.5 w-3.5" />
            ) : (
              <Minus className="h-3.5 w-3.5" />
            )}
            {change > 0 ? "+" : ""}
            {change} pts this week
          </div>
        )}
      </div>

      {data.length < 2 ? (
        <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
          Chart will appear after a few days of data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              tickFormatter={(v: string) => format(parseISO(v), "MMM d")}
              tick={{ fontSize: 11 }}
              className="text-muted-foreground"
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={30} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelFormatter={(v) => format(parseISO(String(v)), "MMM d, yyyy")}
              formatter={(value) => [`${value}`, "Score"]}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
