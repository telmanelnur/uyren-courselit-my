import { useTheme } from "@/components/contexts/theme-context";
import { Subheader1, Text2 } from "@workspace/page-primitives";
import { BookOpen } from "lucide-react";

export function EmptyState({ publicView = true }: { publicView?: boolean }) {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
      <Subheader1 theme={theme.theme}>No Products Found</Subheader1>
      <div>
        <Text2 theme={theme.theme}>
          {publicView ? "The team has " : "You have "} not added any products
          yet.
        </Text2>
      </div>
    </div>
  );
}
