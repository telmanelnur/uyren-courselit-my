"use client";

import DashboardContent from "@/components/admin/dashboard-content";
import {
    DELETE_EMAIL_DIALOG_HEADER,
    PAGE_HEADER_EDIT_SEQUENCE,
    SEQUENCES,
    TOAST_SEQUENCE_SAVED,
    TOAST_TITLE_ERROR,
    TOAST_TITLE_SUCCESS,
} from "@/lib/ui/config/strings";
import { useContext, useState, useEffect, useCallback } from "react";
import { Tabbs, useToast } from "@workspace/components-library";
import EmailAnalytics from "@/components/admin/mails/email-analytics";
import { truncate } from "@workspace/utils";
import { Button } from "@workspace/ui/components/button";
import { Play, Pause, Plus, MoreVertical } from "lucide-react";
import {
    Form,
    FormField,
    Link,
    Select,
    Menu2,
    MenuItem,
    FormSubmit,
} from "@workspace/components-library";
import { Community, Course } from "@workspace/common-models";
import {
    COMPOSE_SEQUENCE_ENTRANCE_CONDITION,
    COMPOSE_SEQUENCE_ENTRANCE_CONDITION_DATA,
    COMPOSE_SEQUENCE_FORM_FROM,
    COMPOSE_SEQUENCE_FORM_TITLE,
    COMPOSE_SEQUENCE_FROM_PLC,
    DELETE_EMAIL_MENU,
    SEQUENCE_UNPUBLISHED_WARNING,
} from "@/lib/ui/config/strings";
import { ChangeEvent, FormEvent } from "react";
import { trpc } from "@/utils/trpc";
import { Badge } from "@workspace/ui/components/badge";

const breadcrumbs = [
    { label: SEQUENCES, href: "/dashboard/mails?tab=Sequences" },
    { label: PAGE_HEADER_EDIT_SEQUENCE, href: "#" },
];

interface TagWithDetails {
    tag: string;
}

export default function Page({
    params,
}: {
    params: {
        id: string;
    };
}) {
    const { id } = params;
    const [activeTab, setActiveTab] = useState("Compose");
    const [buttonLoading, setButtonLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [from, setFrom] = useState("");
    const [fromEmail, setFromEmail] = useState("");
    const [triggerType, setTriggerType] = useState("SUBSCRIBER_ADDED");
    const [triggerData, setTriggerData] = useState<string | null>(null);
    const [emails, setEmails] = useState<any[]>([]);
    const [products, setProducts] = useState<
        Pick<Course, "title" | "courseId">[]
    >([]);
    const [communities, setCommunities] = useState<
        Pick<Community, "communityId" | "name">[]
    >([]);
    const [emailsOrder, setEmailsOrder] = useState<string[]>([]);
    const [status, setStatus] = useState<string | null>(null);
    const { toast } = useToast();

    // tRPC mutations
    const addMailMutation = trpc.mailModule.sequence.addMailToSequence.useMutation();
    const updateSequenceMutation = trpc.mailModule.sequence.update.useMutation();
    const deleteMailMutation = trpc.mailModule.sequence.deleteMailFromSequence.useMutation();
    const startSequenceMutation = trpc.mailModule.sequence.startSequence.useMutation();
    const pauseSequenceMutation = trpc.mailModule.sequence.pauseSequence.useMutation();

    // Load sequence data using tRPC
    const loadSequence = useCallback(async () => {
        try {
            const result = await trpc.mailModule.sequence.getById.query({ sequenceId: id });
            if (result) {
                setTitle(result.title || "");
                setFrom(result.from?.name || "");
                setFromEmail(result.from?.email || "");
                setTriggerType(result.trigger?.type || "SUBSCRIBER_ADDED");
                setTriggerData(result.trigger?.data || null);
                setEmails(result.emails || []);
                setEmailsOrder(result.emailsOrder || []);
                setStatus(result.status);
            }
        } catch (err: any) {
            toast({
                title: TOAST_TITLE_ERROR,
                description: err.message,
                variant: "destructive",
            });
        }
    }, [id, toast]);

    // Load sequence on mount
    useEffect(() => {
        loadSequence();
    }, [loadSequence]);

    const loadTagsWithDetails = trpc.userModule.tag.withDetails.useQuery();
    const tags = loadTagsWithDetails.data || [];

    const loadCommunities = trpc.communityModule.community.list.useQuery({});

    const getProducts = useCallback(async () => {
        try {
            const response = await trpc.lmsModule.course.list.query({
                pagination: { skip: 0, take: 1000 },
                filter: {},
            });
            if (response.items) {
                setProducts(response.items.map((course: any) => ({
                    title: course.title,
                    courseId: course.courseId,
                })));
            }
        } catch (err: any) {
            toast({
                title: TOAST_TITLE_ERROR,
                description: err.message,
                variant: "destructive",
            });
        }
    }, [toast]);

    const getCommunities = useCallback(async () => {
        try {
            const response = await trpc.communityModule.community.list.query({
                pagination: { skip: 0, take: 1000 },
                filter: {},
            });
            if (response.items) {
                setCommunities(response.items.map((community: any) => ({
                    communityId: community.communityId,
                    name: community.name,
                })));
            }
        } catch (err: any) {
            toast({
                title: TOAST_TITLE_ERROR,
                description: err.message,
                variant: "destructive",
            });
        }
    }, [toast]);

    useEffect(() => {
        if (
            (triggerType === "TAG_ADDED" || triggerType === "TAG_REMOVED") &&
            tags.length === 0
        ) {
            // Tags are already loaded via tRPC
        }
        if (triggerType === "PRODUCT_PURCHASED" && products.length === 0) {
            getProducts();
        }
        if (
            triggerType === "COMMUNITY_JOINED" ||
            (triggerType === "COMMUNITY_LEFT" && communities.length === 0)
        ) {
            getCommunities();
        }
    }, [triggerType, tags.length, products.length, communities.length, getProducts, getCommunities]);

    const addMailToSequence = useCallback(async () => {
        try {
            const response = await addMailMutation.mutateAsync({ sequenceId: id });
            if (response) {
                await loadSequence();
                toast({
                    title: TOAST_TITLE_SUCCESS,
                    description: "New email added to sequence",
                });
            }
        } catch (e: any) {
            toast({
                title: TOAST_TITLE_ERROR,
                description: e.message,
                variant: "destructive",
            });
        }
    }, [id, loadSequence, toast, addMailMutation]);

    const updateSequence = useCallback(async () => {
        try {
            const response = await updateSequenceMutation.mutateAsync({
                sequenceId: id,
                data: {
                    title,
                    fromName: from,
                    fromEmail,
                    triggerType,
                    triggerData,
                    emailsOrder,
                },
            });
            if (response) {
                await loadSequence();
                toast({
                    title: TOAST_TITLE_SUCCESS,
                    description: TOAST_SEQUENCE_SAVED,
                });
            }
        } catch (e: any) {
            toast({
                title: TOAST_TITLE_ERROR,
                description: e.message,
                variant: "destructive",
            });
        }
    }, [
        id,
        title,
        from,
        fromEmail,
        triggerType,
        triggerData,
        emailsOrder,
        loadSequence,
        toast,
        updateSequenceMutation,
    ]);

    const deleteMail = useCallback(
        async ({ emailId }: { emailId: string }) => {
            try {
                const response = await deleteMailMutation.mutateAsync({
                    sequenceId: id,
                    emailId,
                });
                if (response) {
                    await loadSequence();
                }
            } catch (e: any) {
                toast({
                    title: TOAST_TITLE_ERROR,
                    description: e.message,
                    variant: "destructive",
                });
            }
        },
        [id, loadSequence, toast, deleteMailMutation],
    );

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await updateSequence();
    };

    const startSequence = useCallback(
        async (action: "start" | "pause") => {
            setButtonLoading(true);
            try {
                let response;
                if (action === "start") {
                    response = await startSequenceMutation.mutateAsync({ sequenceId: id });
                } else {
                    response = await pauseSequenceMutation.mutateAsync({ sequenceId: id });
                }
                if (response) {
                    await loadSequence();
                }
            } catch (e: any) {
                toast({
                    title: TOAST_TITLE_ERROR,
                    description: e.message,
                    variant: "destructive",
                });
            } finally {
                setButtonLoading(false);
            }
        },
        [id, loadSequence, toast, startSequenceMutation, pauseSequenceMutation],
    );

    // Get sequence data for display
    const sequence = {
        title,
        from: { name: from, email: fromEmail },
        trigger: { type: triggerType, data: triggerData },
        emails,
        emailsOrder,
        status,
    };

    if (!sequence) {
        return null;
    }

    return (
        <DashboardContent breadcrumbs={breadcrumbs}>
            {status && (status === "draft" || status === "paused") && (
                <div className="bg-red-400 p-2 mb-4 text-sm text-white rounded-md">
                    {SEQUENCE_UNPUBLISHED_WARNING}{" "}
                </div>
            )}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-semibold">
                    {truncate(title || PAGE_HEADER_EDIT_SEQUENCE, 50)}
                </h1>
                <div className="flex gap-2">
                    {(sequence.status === "draft" ||
                        sequence.status === "paused") && (
                        <Button
                            disabled={buttonLoading}
                            onClick={() => startSequence("start")}
                        >
                            <Play /> Start
                        </Button>
                    )}
                    {sequence.status === "active" && (
                        <Button
                            variant="secondary"
                            disabled={buttonLoading}
                            onClick={() => startSequence("pause")}
                        >
                            <Pause /> Pause
                        </Button>
                    )}
                </div>
            </div>
            <Tabbs
                items={["Compose", "Analytics"]}
                value={activeTab}
                onChange={setActiveTab}
            >
                {activeTab === "Compose" && (
                    <div className="space-y-6">
                        <Form onSubmit={onSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    name="title"
                                    label={COMPOSE_SEQUENCE_FORM_TITLE}
                                    value={title}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        setTitle(e.target.value)
                                    }
                                    placeholder="Enter sequence title"
                                />
                                <FormField
                                    name="from"
                                    label={COMPOSE_SEQUENCE_FORM_FROM}
                                    value={from}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        setFrom(e.target.value)
                                    }
                                    placeholder={COMPOSE_SEQUENCE_FORM_FROM_PLC}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select
                                    label={COMPOSE_SEQUENCE_ENTRANCE_CONDITION}
                                    value={triggerType}
                                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                        setTriggerType(e.target.value)
                                    }
                                >
                                    <option value="SUBSCRIBER_ADDED">Subscriber Added</option>
                                    <option value="TAG_ADDED">Tag Added</option>
                                    <option value="TAG_REMOVED">Tag Removed</option>
                                    <option value="PRODUCT_PURCHASED">Product Purchased</option>
                                    <option value="COMMUNITY_JOINED">Community Joined</option>
                                    <option value="COMMUNITY_LEFT">Community Left</option>
                                </Select>
                                {triggerType === "TAG_ADDED" ||
                                triggerType === "TAG_REMOVED" ? (
                                    <Select
                                        label={COMPOSE_SEQUENCE_ENTRANCE_CONDITION_DATA}
                                        value={triggerData || ""}
                                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                            setTriggerData(e.target.value)
                                        }
                                    >
                                        <option value="">Select a tag</option>
                                        {tags.map((tag) => (
                                            <option key={tag.tag} value={tag.tag}>
                                                {tag.tag} ({tag.count})
                                            </option>
                                        ))}
                                    </Select>
                                ) : triggerType === "PRODUCT_PURCHASED" ? (
                                    <Select
                                        label={COMPOSE_SEQUENCE_ENTRANCE_CONDITION_DATA}
                                        value={triggerData || ""}
                                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                            setTriggerData(e.target.value)
                                        }
                                    >
                                        <option value="">Select a product</option>
                                        {products.map((product) => (
                                            <option key={product.courseId} value={product.courseId}>
                                                {product.title}
                                            </option>
                                        ))}
                                    </Select>
                                ) : triggerType === "COMMUNITY_JOINED" ||
                                  triggerType === "COMMUNITY_LEFT" ? (
                                    <Select
                                        label={COMPOSE_SEQUENCE_ENTRANCE_CONDITION_DATA}
                                        value={triggerData || ""}
                                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                            setTriggerData(e.target.value)
                                        }
                                    >
                                        <option value="">Select a community</option>
                                        {communities.map((community) => (
                                            <option key={community.communityId} value={community.communityId}>
                                                {community.name}
                                            </option>
                                        ))}
                                    </Select>
                                ) : null}
                            </div>
                            <FormSubmit>Save Sequence</FormSubmit>
                        </Form>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Emails</h2>
                                <div>
                                    <Button
                                        variant="outline"
                                        onClick={addMailToSequence}
                                        disabled={buttonLoading}
                                        size="sm"
                                    >
                                        <Plus />
                                        New mail
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {emails.map((email, index) => (
                                    <div
                                        key={email.emailId}
                                        className="flex gap-2 px-2 items-center border rounded hover:bg-accent"
                                    >
                                        <Badge variant="secondary">
                                            {Math.round(
                                                email.delayInMillis /
                                                    (1000 * 60 * 60 * 24),
                                            )}{" "}
                                            day
                                        </Badge>
                                        <Link
                                            href={`/dashboard/mails/sequence/${id}/${
                                                email.emailId
                                            }`}
                                            style={{
                                                flex: "1",
                                            }}
                                        >
                                            <div className="rounded px-3 py-1">
                                                {truncate(email.subject, 70)}
                                            </div>
                                        </Link>
                                        {!email.published && (
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                Draft
                                            </Badge>
                                        )}
                                        <Menu2
                                            trigger={
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical />
                                                </Button>
                                            }
                                        >
                                            <MenuItem
                                                onClick={() =>
                                                    deleteMail({ emailId: email.emailId })
                                                }
                                            >
                                                {DELETE_EMAIL_MENU}
                                            </MenuItem>
                                        </Menu2>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === "Analytics" && (
                    <EmailAnalytics sequenceId={id} />
                )}
            </Tabbs>
        </DashboardContent>
    );
}
