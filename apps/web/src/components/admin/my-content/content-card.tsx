import {
  ContentCard,
  ContentCardContent,
  ContentCardHeader,
  ContentCardImage,
} from "@workspace/components-library";
import { Constants } from "@workspace/common-models";
import type { ContentItem } from "./content";
import { ProgressBar } from "./progress-bar";
import { Badge } from "@workspace/ui/components/badge";
import { BookOpen, Download } from "lucide-react";
import { capitalize } from "@workspace/utils";

interface ContentCardProps {
  item: ContentItem;
}

export function MyContentCard({ item }: ContentCardProps) {
  const { entity, entityType } = item;
  const progress =
    entity.totalLessons && entity.completedLessonsCount
      ? (entity.completedLessonsCount / entity.totalLessons) * 100
      : 0;

  const isCourse =
    entityType.toLowerCase() === Constants.MembershipEntityType.COURSE;

  return (
    <ContentCard
      key={item.entity.id}
      href={
        isCourse
          ? `/courses/${item.entity.id}`
          : `/dashboard/community/${item.entity.id}`
      }
    >
      <ContentCardImage
        src={item.entity.featuredImage?.file}
        alt={item.entity.title}
      />
      <ContentCardContent>
        <ContentCardHeader>{item.entity.title}</ContentCardHeader>
        <>
          <Badge variant="secondary">
            {entity.type === Constants.CourseType.COURSE ? (
              <BookOpen className="h-4 w-4 mr-1" />
            ) : (
              <Download className="h-4 w-4 mr-1" />
            )}
            {capitalize(entity.type)}
          </Badge>
        </>
        {isCourse && entity.totalLessons ? (
          <div className="space-y-2 mt-4">
            <ProgressBar value={progress} />
            <p className="text-sm text-muted-foreground flex justify-between">
              <span>{`${entity.completedLessonsCount} of ${entity.totalLessons} lessons completed`}</span>
              <span>{`${Math.round(progress)}%`}</span>
            </p>
          </div>
        ) : (
          <></>
        )}
      </ContentCardContent>
    </ContentCard>
  );
}
