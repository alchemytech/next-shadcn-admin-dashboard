"use client";
"use no memo";

import * as React from "react";

import { Plus, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface SectionsTableFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  typeFilter: string[];
  onTypeFilterChange: (value: string[]) => void;
  typeOptions: FilterOption[];
  statusFilter: string[];
  onStatusFilterChange: (value: string[]) => void;
  statusOptions: FilterOption[];
  onClearFilters: () => void;
  onResetFilters: () => void;
  rightSlot: React.ReactNode;
}

function filterOptionsBySearch(options: FilterOption[], search: string): FilterOption[] {
  if (!search.trim()) return options;
  const q = search.trim().toLowerCase();
  return options.filter((opt) => opt.label.toLowerCase().includes(q));
}

interface FilterDropdownProps {
  label: string;
  selected: string[];
  options: FilterOption[];
  onSelectionChange: (value: string[]) => void;
  onClear: () => void;
  triggerClassName?: string;
}

function FilterDropdown({
  label,
  selected,
  options,
  onSelectionChange,
  onClear,
  triggerClassName,
}: FilterDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const filteredOptions = React.useMemo(() => filterOptionsBySearch(options, search), [options, search]);

  const handleCheckedChange = (value: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selected, value]);
    } else {
      onSelectionChange(selected.filter((s) => s !== value));
    }
  };

  const handleClear = () => {
    setSearch("");
    onClear();
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setSearch("");
    setOpen(next);
  };

  const selectedLabels = React.useMemo(
    () => options.filter((o) => selected.includes(o.value)).map((o) => o.label),
    [options, selected],
  );

  const chips =
    selected.length === 0 ? null : selected.length <= 2 ? (
      selectedLabels.map((l) => (
        <Badge key={l} variant="secondary" className="h-6 shrink-0 font-normal">
          {l}
        </Badge>
      ))
    ) : (
      <Badge variant="secondary" className="h-6 shrink-0 font-normal tabular-nums">
        {selected.length} selected
      </Badge>
    );

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange} modal={false}>
      <div className="flex items-center gap-1.5">
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={cn("h-8 shrink-0", triggerClassName)}>
            <Plus className="size-4" />
            {label}
          </Button>
        </DropdownMenuTrigger>
        {chips}
      </div>
      <DropdownMenuContent align="start" className="w-56" onCloseAutoFocus={(e) => e.preventDefault()}>
        <div className="border-b border-border px-2 py-2">
          <div className="relative flex items-center">
            <Search className="text-muted-foreground pointer-events-none absolute left-2 size-4 shrink-0" />
            <Input
              type="search"
              placeholder={label}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 border-0 bg-transparent pl-8 pr-2 shadow-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              aria-label={`Search ${label.toLowerCase()}`}
            />
          </div>
        </div>
        <div className="max-h-56 overflow-y-auto py-1">
          {filteredOptions.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">No options match</div>
          ) : (
            filteredOptions.map((opt) => {
              const isChecked = selected.includes(opt.value);
              return (
                <DropdownMenuItem
                  key={opt.value}
                  onSelect={(e) => {
                    e.preventDefault();
                    handleCheckedChange(opt.value, !isChecked);
                  }}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) => handleCheckedChange(opt.value, !!checked)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={opt.label}
                  />
                  <span className="flex flex-1 items-center justify-between gap-2">
                    {opt.label}
                    <span className="tabular-nums text-muted-foreground">{opt.count}</span>
                  </span>
                </DropdownMenuItem>
              );
            })
          )}
        </div>
        <DropdownMenuSeparator />
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-full justify-center gap-2 text-muted-foreground"
            onClick={handleClear}
          >
            Clear filters
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SectionsTableFilters({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Filter sections...",
  typeFilter,
  onTypeFilterChange,
  typeOptions,
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  onClearFilters,
  onResetFilters,
  rightSlot,
}: SectionsTableFiltersProps) {
  const hasActiveFilters = searchQuery.trim() !== "" || typeFilter.length > 0 || statusFilter.length > 0;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-1.5">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 w-full pl-8"
            aria-label={searchPlaceholder}
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterDropdown
            label="Section Type"
            selected={typeFilter}
            options={typeOptions}
            onSelectionChange={onTypeFilterChange}
            onClear={() => onTypeFilterChange([])}
          />
          <FilterDropdown
            label="Status"
            selected={statusFilter}
            options={statusOptions}
            onSelectionChange={onStatusFilterChange}
            onClear={() => onStatusFilterChange([])}
          />
        </div>
        {hasActiveFilters ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 gap-2 text-muted-foreground"
            onClick={onResetFilters}
          >
            <X className="size-4" />
            Reset
          </Button>
        ) : null}
      </div>
      <div className="flex items-center gap-2">{rightSlot}</div>
    </div>
  );
}
