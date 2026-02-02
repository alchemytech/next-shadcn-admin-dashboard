"use client";
"use no memo";

import * as React from "react";

import { Plus } from "lucide-react";
import type { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { DataTable as DataTableNew } from "../../../../../components/data-table/data-table";
import { DataTablePagination } from "../../../../../components/data-table/data-table-pagination";
import { DataTableViewOptions } from "../../../../../components/data-table/data-table-view-options";
import { withDndColumn } from "../../../../../components/data-table/table-utils";
import { dashboardColumns } from "./columns";
import type { sectionSchema } from "./schema";
import { SectionsTableFilters } from "./sections-table-filters";

type Section = z.infer<typeof sectionSchema>;

function filterSections(data: Section[], searchQuery: string, typeFilter: string[], statusFilter: string[]): Section[] {
  const q = searchQuery.trim().toLowerCase();
  return data.filter((row) => {
    if (q) {
      const match =
        row.header.toLowerCase().includes(q) ||
        row.type.toLowerCase().includes(q) ||
        row.status.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (typeFilter.length > 0 && !typeFilter.includes(row.type)) return false;
    if (statusFilter.length > 0 && !statusFilter.includes(row.status)) return false;
    return true;
  });
}

function countBy(data: Section[], key: "type" | "status"): { value: string; label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const row of data) {
    const v = row[key];
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count);
}

export function DataTable({ data: initialData }: { data: Section[] }) {
  const [data, setData] = React.useState(() => initialData);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);

  const filteredData = React.useMemo(
    () => filterSections(data, searchQuery, typeFilter, statusFilter),
    [data, searchQuery, typeFilter, statusFilter],
  );

  const typeOptions = React.useMemo(() => countBy(data, "type"), [data]);
  const statusOptions = React.useMemo(() => countBy(data, "status"), [data]);

  const clearFilters = React.useCallback(() => {
    setTypeFilter([]);
    setStatusFilter([]);
  }, []);

  const resetFilters = React.useCallback(() => {
    setSearchQuery("");
    setTypeFilter([]);
    setStatusFilter([]);
  }, []);

  const columns = withDndColumn(dashboardColumns);
  const table = useDataTableInstance({
    data: filteredData,
    columns,
    getRowId: (row) => row.id.toString(),
  });

  return (
    <Tabs defaultValue="outline" className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="outline">
          <SelectTrigger className="flex @4xl/main:hidden w-fit" size="sm" id="view-selector">
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="outline">Outline</SelectItem>
            <SelectItem value="past-performance">Past Performance</SelectItem>
            <SelectItem value="key-personnel">Key Personnel</SelectItem>
            <SelectItem value="focus-documents">Focus Documents</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="@4xl/main:flex hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1">
          <TabsTrigger value="outline">Outline</TabsTrigger>
          <TabsTrigger value="past-performance">
            Past Performance <Badge variant="secondary">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="key-personnel">
            Key Personnel <Badge variant="secondary">2</Badge>
          </TabsTrigger>
          <TabsTrigger value="focus-documents">Focus Documents</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Plus />
            <span className="hidden lg:inline">Add Section</span>
          </Button>
        </div>
      </div>
      <TabsContent value="outline" className="relative flex flex-col gap-4 overflow-auto">
        <SectionsTableFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Filter sections..."
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          typeOptions={typeOptions}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={statusOptions}
          onClearFilters={clearFilters}
          onResetFilters={resetFilters}
          rightSlot={
            <>
              <DataTableViewOptions table={table} />
            </>
          }
        />
        <div className="overflow-hidden rounded-lg border">
          <DataTableNew
            dndEnabled
            table={table}
            columns={columns}
            onReorder={
              searchQuery.trim() === "" && typeFilter.length === 0 && statusFilter.length === 0 ? setData : undefined
            }
          />
        </div>
        <DataTablePagination table={table} />
      </TabsContent>
      <TabsContent value="past-performance" className="flex flex-col">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed" />
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed" />
      </TabsContent>
      <TabsContent value="focus-documents" className="flex flex-col">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed" />
      </TabsContent>
    </Tabs>
  );
}
