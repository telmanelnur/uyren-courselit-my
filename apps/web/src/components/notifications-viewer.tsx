"use client";

import { useEffect, useState } from "react";
import {
    Bell,
    ChevronLeft,
    ChevronRight,
    Inbox,
    Check,
    TriangleAlert,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@workspace/ui/components/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
    Card,
    CardContent,
    CardHeader,
    CardFooter,
    CardTitle,
} from "@workspace/ui/components/card";
import { Notification } from "@workspace/common-models";
import { useRouter } from "next/navigation";
import { useProfile } from "./contexts/profile-context";
import { useServerConfig } from "./contexts/server-config-context";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

export function NotificationsViewer() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const router = useRouter();
    const { profile } = useProfile();
    const config = useServerConfig();

    // tRPC queries and mutations
    const {
        data: notificationsData,
        isLoading: notificationsLoading,
        refetch: refetchNotifications,
    } = trpc.userModule.notification.protectedGetMyNotifications.useQuery({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
    });

    const {
        data: unreadCountData,
        refetch: refetchUnreadCount,
    } = trpc.userModule.notification.protectedGetUnreadCount.useQuery();

    const markAsReadMutation = trpc.userModule.notification.protectedMarkAsRead.useMutation();
    const markAllAsReadMutation = trpc.userModule.notification.protectedMarkAllAsRead.useMutation();

    const notifications = notificationsData?.notifications || [];
    const total = notificationsData?.total || 0;
    const unreadCount = unreadCountData?.count || 0;

    // Update total pages when data changes
    useEffect(() => {
        setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));
    }, [total]);

    const nextPage = () =>
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

    // SSE for real-time notifications
    useEffect(() => {
        if (!profile?.userId || !config.config.queueServer) {
            return;
        }

        const eventSource = new EventSource(
            `${config.config.queueServer}/sse/${profile.userId}`,
        );

        eventSource.onmessage = async (event) => {
            const notificationId = JSON.parse(event.data);
            console.log(`[eventSource.onmessage] {notificationId: ${notificationId}}`);
            try {
                // Just refetch the list when new notification arrives
                refetchNotifications();
                refetchUnreadCount();
            } catch (error) {
                console.error("Error fetching new notification:", error);
            }
        };

        return () => {
            eventSource.close();
        };
    }, [profile, config, refetchNotifications, refetchUnreadCount]);

    const markAllAsRead = async () => {
        try {
            await markAllAsReadMutation.mutateAsync();
            refetchNotifications();
            refetchUnreadCount();
        } catch (error) {
            toast.error("Failed to mark all as read");
        }
    };

    const markReadAndNavigate = async (
        notificationId: string,
        href: string,
    ) => {
        try {
            await markAsReadMutation.mutateAsync({ notificationId });
            refetchNotifications();
            refetchUnreadCount();
            router.push(href);
        } catch (error) {
            toast.error("Failed to open the notification");
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 relative"
                >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
                    )}
                    <span className="sr-only">View notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <Card>
                    <CardHeader className="border-b py-2 px-4 flex flex-row justify-between items-center">
                        <CardTitle className="text-base text-left">
                            Notifications
                        </CardTitle>
                        {notifications.some((n) => !n.read) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="h-6 text-xs px-2 py-0"
                            >
                                <Check className="h-3 w-3 mr-1" />
                                <span className="sr-only sm:not-sr-only">
                                    Read all
                                </span>
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="p-0 max-h-96 overflow-y-auto">
                        {!config.config.queueServer && (
                            <div className="p-2 bg-yellow-100 text-red-500 text-xs flex items-center">
                                <TriangleAlert className="h-6 w-6 inline mr-2" />
                                Queue configuration is missing. Realtime
                                notifications will not work.
                            </div>
                        )}
                        {notificationsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-sm text-muted-foreground">
                                    Loading notifications...
                                </div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8">
                                <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-sm text-muted-foreground">
                                    No new notifications
                                </p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.notificationId}
                                    onClick={() =>
                                        markReadAndNavigate(
                                            notification.notificationId,
                                            notification.href,
                                        )
                                    }
                                    className={`p-3 border-b last:border-b-0 ${notification.read ? "bg-muted/50" : ""} hover:bg-accent cursor-pointer transition-colors duration-200`}
                                >
                                    <p className="text-xs text-muted-foreground">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDistanceToNow(
                                            new Date(notification.createdAt),
                                            { addSuffix: true },
                                        )}
                                    </p>
                                </div>
                            ))
                        )}
                    </CardContent>
                    {notifications.length > 0 && (
                        <CardFooter className="flex justify-between py-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className="text-xs"
                            >
                                <ChevronLeft className="h-3 w-3 mr-1" />{" "}
                                Previous
                            </Button>
                            <span className="text-xs text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                className="text-xs"
                            >
                                Next <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            </PopoverContent>
        </Popover>
    );
}
