"use client";

import { PaginationControls } from "@/components/public/pagination";
import {
    MAIL_TABLE_HEADER_ENTRANTS,
    MAIL_TABLE_HEADER_STATUS,
    MAIL_TABLE_HEADER_SUBJECT,
    TOAST_TITLE_ERROR,
} from "@/lib/ui/config/strings";
import { GeneralRouterOutputs } from "@/server/api/types";
import { trpc } from "@/utils/trpc";
import {
    SequenceStatus,
    SequenceType
} from "@workspace/common-models";
import { Chip, Link, useToast } from "@workspace/components-library";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table";
import { capitalize } from "@workspace/utils";
import { useEffect, useState } from "react";
import { isDateInFuture } from "../../../lib/utils";

// Type guard functions for better type safety
const isActiveStatus = (status: SequenceStatus): status is "active" => status === "active";
const isDraftOrPausedStatus = (status: SequenceStatus): status is "draft" | "paused" =>
    status === "draft" || status === "paused";
const hasEmails = (emails: any[]): emails is [any, ...any[]] => emails.length > 0;

interface SequencesListProps {
    type: SequenceType;
}

type SequenceItemType = GeneralRouterOutputs["mailModule"]["sequence"]["list"]["items"][number];

const SequencesList = ({
    type,
}: SequencesListProps) => {
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const [sequences, setSequences] = useState<SequenceItemType[]>([]);
    const { toast } = useToast();

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const loadSequencesQuery = trpc.mailModule.sequence.list.useQuery({
        pagination: {
            skip: (page - 1) * 10,
            take: 10,
        },
        filter: {
            type: type,
        },
    });
    useEffect(() => {
        if (loadSequencesQuery.data) {
            setSequences(loadSequencesQuery.data.items);
            setCount(loadSequencesQuery.data.total!);
        }
    }, [loadSequencesQuery.data]);
    useEffect(() => {
        if (loadSequencesQuery.error) {
            toast({
                title: TOAST_TITLE_ERROR,
                description: loadSequencesQuery.error.message,
                variant: "destructive",
            });
        }
    }, [loadSequencesQuery.error]);


    const totalPages = Math.ceil(count / 10); // 10 items per page

    const isLoading = loadSequencesQuery.isLoading;

    return (
        <div className="space-y-4">
            <Table aria-label="Broadcasts" className="w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead>{MAIL_TABLE_HEADER_SUBJECT}</TableHead>
                        <TableHead className="text-right">
                            {MAIL_TABLE_HEADER_STATUS}
                        </TableHead>
                        {type === "sequence" && (
                            <TableHead className="text-right">
                                {MAIL_TABLE_HEADER_ENTRANTS}
                            </TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading
                        ? Array.from({ length: 10 }).map((_, idx) => (
                            <TableRow key={"skeleton-" + idx}>
                                <TableCell className="py-4">
                                    <Skeleton className="h-5 w-40" />
                                </TableCell>
                                <TableCell className="py-4 text-right">
                                    <Skeleton className="h-5 w-24 ml-auto" />
                                </TableCell>
                                {type === "sequence" && (
                                    <TableCell className="py-4 text-right">
                                        <Skeleton className="h-5 w-12 ml-auto" />
                                    </TableCell>
                                )}
                            </TableRow>
                        ))
                        : sequences.map((broadcast) => (
                            <TableRow key={broadcast.sequenceId}>
                                <TableCell className="py-4">
                                    {
                                        broadcast.emails.length === 0 ? (
                                            <p>--</p>
                                        ) : (
                                            <Link
                                                href={`/dashboard/mails/${type}/${broadcast.sequenceId}`}
                                                className="flex"
                                            >
                                                {type === "broadcast" &&
                                                    (broadcast.emails[0]!.subject ===
                                                        " "
                                                        ? "--"
                                                        : broadcast.emails[0]!
                                                            .subject)}
                                                {type === "sequence" &&
                                                    (broadcast.title === " "
                                                        ? "Untitled Sequence"
                                                        : broadcast.title)}
                                            </Link>
                                        )
                                    }
                                </TableCell>
                                <TableCell className="text-right">
                                    {type === "broadcast" && (
                                        <>
                                            {isActiveStatus(broadcast.status) &&
                                                hasEmails(broadcast.emails) &&
                                                !isDateInFuture(
                                                    new Date(
                                                        broadcast.emails[0].delayInMillis,
                                                    ),
                                                ) && (
                                                    <Chip className="!bg-black text-white !border-black">
                                                        Sent
                                                    </Chip>
                                                )}
                                            {isActiveStatus(broadcast.status) &&
                                                hasEmails(broadcast.emails) &&
                                                isDateInFuture(
                                                    new Date(
                                                        broadcast.emails[0].delayInMillis,
                                                    ),
                                                ) && <Chip>Scheduled</Chip>}
                                            {isDraftOrPausedStatus(broadcast.status) && (
                                                <Chip>Draft</Chip>
                                            )}
                                        </>
                                    )}
                                    {type === "sequence" && (
                                        <>
                                            {isDraftOrPausedStatus(broadcast.status) && (
                                                <Chip>
                                                    {capitalize(broadcast.status)}
                                                </Chip>
                                            )}
                                            {isActiveStatus(broadcast.status) && (
                                                <Chip className="!bg-black text-white !border-black">
                                                    {capitalize(broadcast.status)}
                                                </Chip>
                                            )}
                                        </>
                                    )}
                                </TableCell>
                                {type === "sequence" && (
                                    <TableCell className="text-right">
                                        {broadcast.entrantsCount}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
            {
                totalPages > 1 && (
                    <PaginationControls
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        disabled={isLoading}
                    />
                )
            }
        </div >
    );
};

export default SequencesList;
