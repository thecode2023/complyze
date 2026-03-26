"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

const jurisdictions = [
  { value: "all", label: "All Jurisdictions" },
  { value: "EU", label: "European Union" },
  { value: "US", label: "United States (Federal)" },
  { value: "US-TX", label: "United States — Texas" },
  { value: "US-CO", label: "United States — Colorado" },
  { value: "US-CA", label: "United States — California" },
  { value: "US-IL", label: "United States — Illinois" },
  { value: "CA", label: "Canada" },
  { value: "SG", label: "Singapore" },
  { value: "GB", label: "United Kingdom" },
  { value: "BR", label: "Brazil" },
  { value: "ID", label: "Indonesia" },
  { value: "INTL", label: "International" },
];

const statuses = [
  { value: "all", label: "All Statuses" },
  { value: "enacted", label: "Enacted" },
  { value: "in_effect", label: "In Effect" },
  { value: "proposed", label: "Proposed" },
  { value: "under_review", label: "Under Review" },
  { value: "repealed", label: "Repealed" },
];

const categories = [
  { value: "all", label: "All Categories" },
  { value: "legislation", label: "Legislation" },
  { value: "executive_order", label: "Executive Order" },
  { value: "framework", label: "Framework" },
  { value: "guidance", label: "Guidance" },
  { value: "standard", label: "Standard" },
];

export function FeedFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // Reset to page 1 on filter change
      router.push(`/feed?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("/feed");
  }, [router]);

  const hasFilters =
    searchParams.has("jurisdiction") ||
    searchParams.has("status") ||
    searchParams.has("category") ||
    searchParams.has("search");

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search regulations..."
          className="pl-9"
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => {
            const value = e.target.value;
            // Debounce search input
            const timeout = setTimeout(() => updateParams("search", value), 300);
            return () => clearTimeout(timeout);
          }}
        />
      </div>

      <Select
        value={searchParams.get("jurisdiction") || "all"}
        onValueChange={(value) => updateParams("jurisdiction", value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Jurisdiction" />
        </SelectTrigger>
        <SelectContent>
          {jurisdictions.map((j) => (
            <SelectItem key={j.value} value={j.value}>
              {j.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("status") || "all"}
        onValueChange={(value) => updateParams("status", value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("category") || "all"}
        onValueChange={(value) => updateParams("category", value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="w-full text-muted-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
