"use client";

import {
    COMMUNITY_MEMBERSHIP_LIST_HEADER,
    COMMUNITY_MEMBERSHIP_LIST_SUBHEADER,
    TOAST_TITLE_ERROR,
} from "@/lib/ui/config/strings";
import { getNextStatusForCommunityMember } from "@/lib/ui/lib/utils";
import { GeneralRouterOutputs } from "@/server/api/types";
import { trpc } from "@/utils/trpc";
import {
    CommunityMemberStatus,
    Constants
} from "@workspace/common-models";
import {
    Link,
    PaginatedTable,
    Tooltip,
    useToast,
} from "@workspace/components-library";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { Label } from "@workspace/ui/components/label";
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
import { Textarea } from "@workspace/ui/components/textarea";
import { capitalize, truncate } from "@workspace/utils";
import { Copy, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAddress } from "../contexts/address-context";
import { useProfile } from "../contexts/profile-context";

interface MembershipRequest {
    id: string;
    name: string;
    email: string;
    avatar: string;
    reason: string;
    status: "pending" | "approved" | "rejected";
    rejectionReason?: string;
}

const itemsPerPage = 10;

type MemeberType = GeneralRouterOutputs["communityModule"]["community"]["getMembers"]["items"][number]

export function MembershipList({ id }: { id: string }) {
    const [requests, setRequests] = useState<MembershipRequest[]>([]);
    const [filter, setFilter] = useState<"all" | CommunityMemberStatus>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRequest, setSelectedMember] = useState<MemeberType | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [totalMembers, setTotalMembers] = useState(0);
    const [members, setMembers] = useState<MemeberType[]>([]);
    const { address } = useAddress();
    const { toast } = useToast();
    const [isUpdating, setIsUpdating] = useState(false);
    const { profile } = useProfile()
    const router = useRouter();

    const loadMembersQuery = trpc.communityModule.community.getMembers.useQuery({
        filter: {
            communityId: id,
            status: filter === "all" ? undefined : filter,
        },
        pagination: {
            take: itemsPerPage,
            skip: (page - 1) * itemsPerPage,
        }
    }, {
        enabled: !!id,
    })

    useEffect(() => {
        if (loadMembersQuery.data) {
            setMembers(loadMembersQuery.data.items);
            setTotalMembers(loadMembersQuery.data.total || 0);
        }
    }, [loadMembersQuery.data]);

    useEffect(() => {
        if (loadMembersQuery.error) {
            toast({
                title: TOAST_TITLE_ERROR,
                description: loadMembersQuery.error.message,
                variant: "destructive",
            });
        }
    }, [loadMembersQuery.error]);

    const updateMemberStatusMutation = trpc.communityModule.community.updateMemberStatus.useMutation();
    const updateMemberRoleMutation = trpc.communityModule.community.updateMemberRole.useMutation();


    const updateMemberStatus = async (userId: string) => {
        // const query = `
        //     mutation ($communityId: String!, $userId: String!, $rejectionReason: String) {
        //         member: updateMemberStatus(communityId: $communityId, userId: $userId, rejectionReason: $rejectionReason) {
        //             user {
        //                 userId
        //                 name
        //                 email
        //                 avatar {
        //                     mediaId
        //                     thumbnail
        //                 }
        //             }
        //             status
        //             rejectionReason
        //             joiningReason
        //             role
        //         }
        //     }`;
        try {
            const response = await updateMemberStatusMutation.mutateAsync({
                data: {
                    communityId: id,
                    userId,
                    rejectionReason,
                }
            }) as any;
            if (response) {
                // replace the member in members
                setMembers((members) =>
                    members.map((member) =>
                        member.user.userId === userId
                            ? response
                            : member,
                    ),
                );
            }
        } catch (e: any) {
            toast({
                title: TOAST_TITLE_ERROR,
                description: e.message,
                variant: "destructive",
            });
        }
    };

    const updateMemberRole = async (userId: string) => {
        // const query = `
        //     mutation ($communityId: String!, $userId: String!) {
        //         member: updateMemberRole(communityId: $communityId, userId: $userId) {
        //             user {
        //                 userId
        //                 name
        //                 email
        //                 avatar {
        //                     mediaId
        //                     thumbnail
        //                 }
        //             }
        //             status
        //             rejectionReason
        //             joiningReason
        //             role
        //         }
        //     }`;
        try {
            const response = await updateMemberRoleMutation.mutateAsync({
                data: {
                    communityId: id,
                    userId,
                }
            }) as any;
            if (response) {
                setMembers((members) =>
                    members.map((member) =>
                        member.user.userId === userId
                            ? response
                            : member,
                    ),
                );
            }
        } catch (e: any) {
            toast({
                title: TOAST_TITLE_ERROR,
                description: e.message,
                variant: "destructive",
            });
        }
    };

    const handleRoleChange = (member: MemeberType) => {
        setSelectedMember(member);
        updateMemberRole(member.user.userId);
    };

    const handleStatusChange = (member: MemeberType) => {
        const nextStatus = getNextStatusForCommunityMember(
            member.status as CommunityMemberStatus,
        );
        setSelectedMember(member);
        if (nextStatus === Constants.MembershipStatus.REJECTED) {
            setIsDialogOpen(true);
        } else {
            updateMemberStatus(member.user.userId);
        }
    };

    const handleDialogConfirm = async () => {
        if (selectedRequest && rejectionReason) {
            await updateMemberStatus(selectedRequest.user.userId);
            setIsDialogOpen(false);
            setSelectedMember(null);
            setRejectionReason("");
        }
    };

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Success",
            description: "Subscription ID is copied to clipboard",
        });
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">
                    {COMMUNITY_MEMBERSHIP_LIST_HEADER}
                </h2>
                <p className="text-muted-foreground">
                    {COMMUNITY_MEMBERSHIP_LIST_SUBHEADER}
                </p>
            </div>
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <Select
                        value={filter}
                        onValueChange={(value: any) => setFilter(value)}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {[
                                Constants.MembershipStatus.PENDING,
                                Constants.MembershipStatus.ACTIVE,
                                Constants.MembershipStatus.REJECTED,
                            ].map((status) => (
                                <SelectItem value={status} key={status}>
                                    {capitalize(status)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="overflow-x-auto">
                    <PaginatedTable
                        page={page}
                        totalPages={Math.ceil(totalMembers / itemsPerPage)}
                        onPageChange={setPage}
                    >
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">
                                        User
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="hidden lg:table-cell">
                                        Joining Reason
                                    </TableHead>
                                    <TableHead className="hidden xl:table-cell">
                                        Rejection Reason
                                    </TableHead>
                                    <TableHead>Subscription</TableHead>
                                    {/* <TableHead>Subscription Method</TableHead> */}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member) => (
                                    <TableRow key={member.user.email}>
                                        <TableCell className="font-medium">
                                            <Link
                                                href={`/dashboard/users/${member.user.userId}`}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage
                                                            src={
                                                                member.user
                                                                    .avatar
                                                                    ?.thumbnail ||
                                                                "/courselit_backdrop_square.webp"
                                                            }
                                                            alt={
                                                                member.user
                                                                    .name ||
                                                                member.user
                                                                    .email
                                                            }
                                                        />
                                                        <AvatarFallback>
                                                            {(
                                                                member.user
                                                                    .name ||
                                                                member.user
                                                                    .email
                                                            ).charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold">
                                                            {member.user.name ||
                                                                member.user
                                                                    .email}
                                                        </span>
                                                        {member.user.name && (
                                                            <span className="text-sm text-muted-foreground">
                                                                {
                                                                    member.user
                                                                        .email
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        </TableCell>
                                        {/* <TableCell className="hidden xl:table-cell max-w-xs truncate">
                                            {capitalize(
                                                member.subscriptionMethod,
                                            ) || "-"}
                                        </TableCell> */}
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Badge
                                                    variant={
                                                        member.status ===
                                                            "pending"
                                                            ? "default"
                                                            : member.status===
                                                                "active"
                                                                ? "default"
                                                                : "destructive"
                                                    }
                                                >
                                                    {member.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        member.status.slice(1)}
                                                </Badge>
                                                {member.user.userId !==
                                                    profile.userId && (
                                                        <Tooltip title="Change status">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        member,
                                                                    )
                                                                }
                                                                disabled={
                                                                    isUpdating
                                                                }
                                                            >
                                                                <RotateCcw className="h-3 w-3" />{" "}
                                                            </Button>
                                                        </Tooltip>
                                                    )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Badge>
                                                    {capitalize(member.role)}
                                                </Badge>
                                                {member.user.userId !==
                                                    profile.userId && (
                                                        <Tooltip title="Change role">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    handleRoleChange(
                                                                        member,
                                                                    )
                                                                }
                                                                disabled={
                                                                    isUpdating
                                                                }
                                                            >
                                                                <RotateCcw className="h-3 w-3" />
                                                            </Button>
                                                        </Tooltip>
                                                    )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell max-w-xs truncate">
                                            {member.joiningReason || "-"}
                                        </TableCell>
                                        <TableCell className="hidden xl:table-cell max-w-xs truncate">
                                            {member.rejectionReason || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Tooltip
                                                    title={`Subscription ID: ${member.subscriptionId}`}
                                                >
                                                    {member.subscriptionId
                                                        ? truncate(
                                                            member.subscriptionId,
                                                            10,
                                                        )
                                                        : "-"}
                                                </Tooltip>
                                                {member.subscriptionId && (
                                                    <Tooltip title="Copy Subscription ID">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={!member.subscriptionId}
                                                            onClick={() =>
                                                                member.subscriptionId && handleCopyToClipboard(
                                                                    member.subscriptionId,
                                                                )
                                                            }
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </PaginatedTable>
                </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Membership Request</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this
                            membership request.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-4">
                            <Label htmlFor="rejection-reason">Reason</Label>
                            <Textarea
                                id="rejection-reason"
                                value={rejectionReason}
                                onChange={(e) =>
                                    setRejectionReason(e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            onClick={handleDialogConfirm}
                            disabled={!rejectionReason}
                        >
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
