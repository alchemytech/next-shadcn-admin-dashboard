"use client";
"use no memo";

import * as React from "react";

import { Download } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { recentLeadsColumns } from "./columns.crm";
import { recentLeadsData } from "./crm.config";
import { LeadsTableFilters } from "./leads-table-filters";

type Lead = (typeof recentLeadsData)[number];

function filterLeads(data: Lead[], searchQuery: string, statusFilter: string[], sourceFilter: string[]): Lead[] {
  const q = searchQuery.trim().toLowerCase();
  return data.filter((row) => {
    if (q) {
      const match =
        row.id.toLowerCase().includes(q) || row.name.toLowerCase().includes(q) || row.company.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter.length > 0 && !statusFilter.includes(row.status)) return false;
    if (sourceFilter.length > 0 && !sourceFilter.includes(row.source)) return false;
    return true;
  });
}

function countBy<K extends keyof Lead>(data: Lead[], key: K): { value: string; label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const row of data) {
    const v = String(row[key]);
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count);
}

export function TableCards() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);
  const [sourceFilter, setSourceFilter] = React.useState<string[]>([]);

  const clearFilters = React.useCallback(() => {
    setStatusFilter([]);
    setSourceFilter([]);
  }, []);

  const resetFilters = React.useCallback(() => {
    setSearchQuery("");
    setStatusFilter([]);
    setSourceFilter([]);
  }, []);

  const filteredData = React.useMemo(
    () => filterLeads(recentLeadsData, searchQuery, statusFilter, sourceFilter),
    [searchQuery, statusFilter, sourceFilter],
  );

  const statusOptions = React.useMemo(() => countBy(recentLeadsData, "status"), []);
  const sourceOptions = React.useMemo(() => countBy(recentLeadsData, "source"), []);

  const table = useDataTableInstance({
    data: filteredData,
    columns: recentLeadsColumns,
    getRowId: (row) => row.id.toString(),
  });

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs">
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
          <CardDescription>Track and manage your latest leads and their status.</CardDescription>
        </CardHeader>
        <CardContent className="flex size-full flex-col gap-4">
          <LeadsTableFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Filter leads..."
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            statusOptions={statusOptions}
            sourceFilter={sourceFilter}
            onSourceFilterChange={setSourceFilter}
            sourceOptions={sourceOptions}
            onClearFilters={clearFilters}
            onResetFilters={resetFilters}
            viewSlot={<DataTableViewOptions table={table} />}
            exportSlot={
              <Button variant="outline" size="sm">
                <Download />
                <span className="hidden lg:inline">Export</span>
              </Button>
            }
          />
          <div className="overflow-hidden rounded-md border">
            <DataTable table={table} columns={recentLeadsColumns} />
          </div>
          <DataTablePagination table={table} />
        </CardContent>
      </Card>
    </div>
  );
}
