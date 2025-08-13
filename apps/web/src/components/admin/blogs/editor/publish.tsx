import {
    BTN_PUBLISH,
    BTN_UNPUBLISH,
    PUBLISH_TAB_STATUS_SUBTITLE,
    PUBLISH_TAB_STATUS_TITLE,
    PUBLISH_TAB_VISIBILITY_SUBTITLE,
    PUBLISH_TAB_VISIBILITY_TITLE,
    TOAST_TITLE_ERROR,
} from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import { ProductAccessType } from "@workspace/common-models";
import { Button, Form, useToast } from "@workspace/components-library";
import { capitalize, } from "@workspace/utils";
import { FormEvent, useEffect, useState } from "react";
import useCourse from "./course-hook";

interface PublishProps {
    id: string;
    loading: boolean;
}

export function Publish({ id, loading }: PublishProps) {
    const course = useCourse(id);
    const [published, setPublished] = useState(course?.published);
    const [privacy, setPrivacy] = useState<ProductAccessType | undefined>(course?.privacy);
    const { toast } = useToast();

    useEffect(() => {
        if (course) {
            setPublished(course.published);
            setPrivacy(course.privacy);
        }
    }, [course]);

    const updatePublishingDetails = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    };

    const updateCourseMutation = trpc.lmsModule.courseModule.course.update.useMutation();

    const togglePublishedStatus = async () => {
        const response = await saveSettings();
        setPublished(response?.published);
    };

    const toggleVisibility = async () => {
        const response = await saveSettings();
        setPrivacy(response?.privacy);
    };

    const saveSettings = async () => {
        try {
            const response = await updateCourseMutation.mutateAsync({
                courseId: course!.courseId!,
                data: {
                    published: published,
                    privacy: privacy,
                }
            });
            return response;
        } catch (err: any) {
            toast({
                title: TOAST_TITLE_ERROR,
                description: err.message,
                variant: "destructive",
            });
        }
    };

    if (!course) {
        return <></>;
    }

    return (
        <Form
            onSubmit={updatePublishingDetails}
            className="flex flex-col gap-4"
        >
            <div className="flex justify-between items-center">
                <div>
                    <h2>{PUBLISH_TAB_STATUS_TITLE}</h2>
                    <p className="text-sm text-slate-400">
                        {PUBLISH_TAB_STATUS_SUBTITLE}
                    </p>
                </div>
                <Button
                    onClick={togglePublishedStatus}
                    variant="soft"
                    disabled={loading}
                >
                    {published ? BTN_UNPUBLISH : BTN_PUBLISH}
                </Button>
            </div>
            <div className="flex justify-between items-center">
                <div>
                    <h2>{PUBLISH_TAB_VISIBILITY_TITLE}</h2>
                    <p className="text-sm text-slate-400">
                        {PUBLISH_TAB_VISIBILITY_SUBTITLE}
                    </p>
                </div>
                <Button
                    onClick={toggleVisibility}
                    variant="soft"
                    disabled={loading}
                >
                    {capitalize(privacy || "")}
                </Button>
            </div>
        </Form>
    );
}
