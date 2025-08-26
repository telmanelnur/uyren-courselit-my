"use client";

import { useTheme } from "@/components/contexts/theme-context";
import { Subheader1, Text2, Button } from "@workspace/page-primitives";
import { Search, BookOpen } from "lucide-react";

interface EmptyStateProps {
  searchQuery?: string;
  onClearSearch?: () => void;
}

export function EmptyState({ searchQuery, onClearSearch }: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {searchQuery ? (
        <>
          <Search className="w-12 h-12 text-muted-foreground mb-4" />
          <Subheader1 theme={theme.theme} className="mb-2">
            No courses found
          </Subheader1>
          <Text2 theme={theme.theme} className="mb-4 max-w-md">
            No courses match "{searchQuery}". Try adjusting your search terms or
            filters.
          </Text2>
          {onClearSearch && (
            <Button
              size="sm"
              theme={theme.theme}
              onClick={onClearSearch}
              className="mt-2"
            >
              Clear filters
            </Button>
          )}
        </>
      ) : (
        <>
          <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
          <Subheader1 theme={theme.theme} className="mb-2">
            No courses available
          </Subheader1>
          <Text2 theme={theme.theme} className="mb-4 max-w-md">
            There are no courses available at the moment. Check back later for
            new content.
          </Text2>
        </>
      )}
    </div>
  );
}
