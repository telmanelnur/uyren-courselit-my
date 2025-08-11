import { ThemeStyle } from "@workspace/page-models";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function SkeletonCard({ theme }: { theme?: ThemeStyle }) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative aspect-video">
        <Skeleton className="h-full w-full" />
      </div>
      <CardContent className="p-4">
        <Skeleton className="h-6 w-full mb-3" />
        <Skeleton className="h-6 w-full" />
      </CardContent>
    </Card>
  );
}
