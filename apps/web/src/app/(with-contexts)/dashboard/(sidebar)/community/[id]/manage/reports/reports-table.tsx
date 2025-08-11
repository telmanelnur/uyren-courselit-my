"use client";

import { getNextStatusForCommunityReport } from "@/lib/ui/lib/utils";
import { GeneralRouterOutputs } from "@/server/api/types";
import { trpc } from "@/utils/trpc";
import { CommunityReportStatus, Constants } from "@workspace/common-models";
import { PaginatedTable, useToast } from "@workspace/components-library";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { RotateCcwIcon as RotateCCW } from "lucide-react";
import { useEffect, useState } from "react";
import { RejectionReasonDialog } from "./rejection-reason-dialog";

const itemsPerPage = 10;

type ReportType =
  GeneralRouterOutputs["communityModule"]["report"]["list"]["items"][number];

export function ReportsTable({ communityId }: { communityId: string }) {
  const [reports, setReports] = useState<ReportType[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [totalReports, setTotalReports] = useState(0);
  const { toast } = useToast();

  const loadReportsQuery = trpc.communityModule.report.list.useQuery({
    filter: {
      communityId,
      status: filter === "all" ? undefined : (filter.toUpperCase() as any),
    },
    pagination: {
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
    },
  });

  useEffect(() => {
    setPage(1);
    setTotalReports(0);
  }, [filter]);

  useEffect(() => {
    if (loadReportsQuery.data) {
      setReports(loadReportsQuery.data.items);
      setTotalReports(loadReportsQuery.data.total!);
    }
  }, [loadReportsQuery.data]);

  const handleStatusChange = (report: ReportType) => {
    const nextStatus = getNextStatusForCommunityReport(
      report.status.toLowerCase() as CommunityReportStatus
    );
    if (nextStatus === Constants.CommunityReportStatus.REJECTED) {
      setCurrentReportId(report.reportId);
      setRejectionDialogOpen(true);
    } else {
      updateReportStatus(report.reportId);
    }
  };

  const updateStatusMutation =
    trpc.communityModule.report.updateStatus.useMutation();

  const updateReportStatus = async (
    id: string,
    rejectionReason: string = ""
  ) => {
    updateStatusMutation
      .mutateAsync({
        data: {
          communityId,
          reportId: id,
          rejectionReason,
        },
      })
      .then((response) => {
        setReports((reports) =>
          reports.map((r) =>
            r.reportId === id
              ? {
                  ...r,
                  status: response.status,
                  rejectionReason: response.rejectionReason,
                }
              : r
          )
        );
      });
  };

  const handleRejectionConfirm = (reason: string) => {
    if (currentReportId) {
      updateReportStatus(currentReportId, reason);
    }
    setRejectionDialogOpen(false);
    setCurrentReportId(null);
  };

  const getStatusBadge = (status: CommunityReportStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
          >
            PENDING
          </Badge>
        );
      case "accepted":
        return (
          <Badge
            variant="default"
            className="bg-red-100 text-red-700 hover:bg-red-100"
          >
            ACCEPTED
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-700 hover:bg-gray-100"
          >
            REJECTED
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-md bg-white">
      <div className="py-4 pr-4 border-b">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto">
        <PaginatedTable
          page={page}
          totalPages={Math.ceil(totalReports / itemsPerPage)}
          onPageChange={setPage}
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="text-sm font-medium text-gray-500">
                  Content
                </TableHead>
                <TableHead className="text-sm font-medium text-gray-500">
                  Type
                </TableHead>
                <TableHead className="text-sm font-medium text-gray-500">
                  Reason
                </TableHead>
                <TableHead className="text-sm font-medium text-gray-500">
                  Status
                </TableHead>
                <TableHead className="text-sm font-medium text-gray-500">
                  Rejection Reason
                </TableHead>
                <TableHead className="text-sm font-medium text-gray-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.reportId} className="border-b">
                  <TableCell className="text-sm text-gray-600 max-w-[200px] truncate">
                    {report.content.content}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {report.type.charAt(0).toUpperCase() +
                      report.type.slice(1).toLowerCase()}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {report.reason}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(
                      report.status.toLowerCase() as CommunityReportStatus
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {report.rejectionReason || "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange(report)}
                    >
                      <RotateCCW className="mr-2 h-4 w-4" />
                      Change
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </PaginatedTable>
      </div>
      <RejectionReasonDialog
        isOpen={rejectionDialogOpen}
        onClose={() => setRejectionDialogOpen(false)}
        onConfirm={handleRejectionConfirm}
      />
    </div>
  );
}
