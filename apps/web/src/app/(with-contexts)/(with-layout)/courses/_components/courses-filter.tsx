"use client";

import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Search, Filter, X } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { Constants } from "@workspace/common-models";

interface CoursesFilterProps {
  searchQuery: string;
  selectedType: string;
  onFilterChange: (filters: { search?: string; type?: string }) => void;
}

export function CoursesFilter({
  searchQuery,
  selectedType,
  onFilterChange,
}: CoursesFilterProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [localType, setLocalType] = useState(selectedType);

  useEffect(() => {
    setLocalSearch(searchQuery);
    setLocalType(selectedType);
  }, [searchQuery, selectedType]);

  const handleSearch = useCallback(() => {
    onFilterChange({
      search: localSearch,
      type: localType,
    });
  }, [localSearch, localType, onFilterChange]);

  const handleClearFilters = useCallback(() => {
    setLocalSearch("");
    setLocalType("");
    onFilterChange({});
  }, [onFilterChange]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch],
  );

  const hasActiveFilters = searchQuery || selectedType;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border shadow-sm">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search courses..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={localType} onValueChange={setLocalType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={Constants.CourseType.COURSE}>
                Course
              </SelectItem>
              <SelectItem value={Constants.CourseType.DOWNLOAD}>
                Download
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Search
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{searchQuery}"
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFilterChange({ type: selectedType })}
              />
            </Badge>
          )}
          {selectedType && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {selectedType}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFilterChange({ search: searchQuery })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
