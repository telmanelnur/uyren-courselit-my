"use client";

import {
  MANAGE_COMMUNITIES_PAGE_HEADING,
  NEW_COMMUNITY_BUTTON,
} from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import {
  Button,
  Link,
  PaginatedTable,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Tooltip,
} from "@workspace/components-library";
import { Eye, Settings } from "lucide-react";
import { useState } from "react";

const communitiesResultsLimit = 10;

export default function List() {
  const [page, setPage] = useState(1);

  // Use tRPC query to fetch communities with pagination count
  const { data, isLoading } =
    trpc.communityModule.community.getCommunities.useQuery({
      pagination: {
        skip: (page - 1) * communitiesResultsLimit,
        take: communitiesResultsLimit,
      },
      options: {
        paginationCount: true,
      },
    });

  // Extract communities and total from the response
  // The response can be either an array (backward compatibility) or an object with items
  const communities = Array.isArray(data) ? data : data?.items || [];
  const total = Array.isArray(data) ? 0 : data?.total || 0;

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-semibold mb-4">
          {MANAGE_COMMUNITIES_PAGE_HEADING}
        </h1>
        <div>
          <Link href={`/dashboard/community/new`}>
            <Button>{NEW_COMMUNITY_BUTTON}</Button>
          </Link>
        </div>
      </div>
      <PaginatedTable
        page={page}
        totalPages={Math.ceil(total / communitiesResultsLimit)}
        onPageChange={setPage}
      >
        <Table aria-label="Communities" className="mb-4 w-full">
          <TableHead className="border-0 border-b border-slate-200">
            <td>Name</td>
            <td align="right">Members</td>
            <td align="right">Actions</td>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <td colSpan={3} className="py-4 text-center">
                  Loading communities...
                </td>
              </TableRow>
            ) : communities.length === 0 ? (
              <TableRow>
                <td colSpan={3} className="py-4 text-center">
                  No communities found
                </td>
              </TableRow>
            ) : (
              communities.map((community) => (
                <TableRow key={String(community._id || community.id)}>
                  <td className="py-4">
                    <Link
                      href={`/dashboard/community/${community._id || community.id}`}
                    >
                      {community.name}
                    </Link>
                  </td>
                  <td className="py-4" align="right">
                    {community.membersCount}
                  </td>
                  <td align="right">
                    <div className="flex space-x-2 justify-end">
                      <Link href={`/p/${community.pageId}`}>
                        <Tooltip title="View page">
                          <Button variant="soft">
                            <Eye width={16} />{" "}
                          </Button>
                        </Tooltip>
                      </Link>
                      <Link
                        href={`/dashboard/community/${community._id || community.id}/manage`}
                      >
                        <Tooltip title="Settings">
                          <Button variant="soft">
                            <Settings width={16} />{" "}
                          </Button>
                        </Tooltip>
                      </Link>
                    </div>
                  </td>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </PaginatedTable>
    </div>
  );
}
