"use client";

import { useTheme } from "@/components/contexts/theme-context";
import { GeneralRouterOutputs } from "@/server/api/types";
import {
  ContentCard,
  ContentCardContent,
  ContentCardHeader,
  ContentCardImage,
} from "@workspace/components-library";
import {
  Badge,
  PageCardContent,
  PageCardHeader,
} from "@workspace/page-primitives";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { CheckCircle, CircleDashed, Eye, Users } from "lucide-react";

export function CommunityContentCard({
  community,
  publicView = true,
}: {
  community: GeneralRouterOutputs["communityModule"]["community"]["list"]["items"][number];
  publicView?: boolean;
}) {
  const { theme: uiTheme } = useTheme();
  const { theme } = uiTheme;

  return (
    <ContentCard
      className="overflow-hidden"
      href={`/dashboard/community/${community.communityId}`}
    >
      <ContentCardImage
        src={community.featuredImage?.url || "/courselit_backdrop_square.webp"}
        alt={community.name}
      />
      <ContentCardContent>
        <ContentCardHeader>{community.name}</ContentCardHeader>

        {!publicView && (
          <div className="flex items-center justify-between gap-2 mb-4">
            <Badge theme={theme} variant="outline">
              <Users className="h-4 w-4 mr-1" />
              Community
            </Badge>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Public</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {community.enabled ? (
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <CircleDashed className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    {community.enabled ? "Enabled" : "Draft"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            <span>{community.membersCount.toLocaleString()} members</span>
          </div>
          {!publicView && (
            <div className="flex items-center text-muted-foreground">
              <span>{community.categories.length} categories</span>
            </div>
          )}
        </div>
      </ContentCardContent>
    </ContentCard>
  );
}
