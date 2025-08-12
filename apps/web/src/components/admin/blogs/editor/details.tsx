import React, { FormEvent, useEffect, useState } from "react";
import {
    MediaSelector,
    TextEditor,
    TextEditorEmptyDoc,
    Form,
    FormField,
    Button,
    PageBuilderPropertyHeader,
    useToast,
} from "@workspace/components-library";
import useCourse from "./course-hook";
import { Address, Profile } from "@workspace/common-models";
import {
    APP_MESSAGE_COURSE_SAVED,
    BUTTON_SAVE,
    COURSE_CONTENT_HEADER,
    TOAST_TITLE_ERROR,
    FORM_FIELD_FEATURED_IMAGE,
    TOAST_TITLE_SUCCESS,
} from "@/lib/ui/config/strings";
import { MIMETYPE_IMAGE } from "@/lib/ui/config/constants";
import { Media } from "@workspace/common-models";
import { trpc } from "@/utils/trpc";

interface DetailsProps {
    id: string;
    address: Address;
    profile: Profile;
}

export function Details({ id, profile, address }: DetailsProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState(TextEditorEmptyDoc);
    const [featuredImage, setFeaturedImage] = useState<Partial<Media>>({});
    const [refreshDetails, setRefreshDetails] = useState(0);
    const course = useCourse(id);
    const { toast } = useToast();

    useEffect(() => {
        if (course) {
            setTitle(course.title || "");
            setDescription(
                course.description
                    ? JSON.parse(course.description)
                    : TextEditorEmptyDoc,
            );
            setFeaturedImage(course.featuredImage || {});
            setRefreshDetails(refreshDetails + 1);
        }
    }, [course]);

    const updateCourseMutation = trpc.lmsModule.courseModule.course.update.useMutation();

    const updateDetails = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await updateCourseMutation.mutateAsync({
                courseId: course!.courseId!,
                data: {
                    title: title,
                    description: JSON.stringify(JSON.stringify(description)),
                }
            });
            if (response) {
                toast({
                    title: TOAST_TITLE_SUCCESS,
                    description: APP_MESSAGE_COURSE_SAVED,
                });
            }
        } catch (err: any) {
            toast({
                title: TOAST_TITLE_ERROR,
                description: err.message,
                variant: "destructive",
            });
        }
    };

    const saveFeaturedImage = async (media?: Media) => {
        try {
            const response = await updateCourseMutation.mutateAsync({
                courseId: course!.courseId!,
                data: {
                    featuredImage: media || null,
                }
            });
            if (response) {
                toast({
                    title: TOAST_TITLE_SUCCESS,
                    description: APP_MESSAGE_COURSE_SAVED,
                });
            }
        } catch (err: any) {
            toast({
                title: TOAST_TITLE_ERROR,
                description: err.message,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <Form onSubmit={updateDetails} className="flex flex-col gap-4">
                <FormField
                    required
                    label="Title"
                    name="title"
                    value={title}
                    onChange={(e: any) => setTitle(e.target.value)}
                />
                <PageBuilderPropertyHeader label={COURSE_CONTENT_HEADER} />
                <TextEditor
                    initialContent={description}
                    refresh={refreshDetails}
                    onChange={(state: any) => setDescription(state)}
                    url={address.backend}
                />
                <div>
                    <Button type="submit">{BUTTON_SAVE}</Button>
                </div>
            </Form>
            <hr />
            <MediaSelector
                title={FORM_FIELD_FEATURED_IMAGE}
                src={(featuredImage && featuredImage.thumbnail) || ""}
                srcTitle={
                    (featuredImage && featuredImage.originalFileName) || ""
                }
                onSelection={(media?: Media) => {
                    media && setFeaturedImage(media);
                    saveFeaturedImage(media);
                }}
                mimeTypesToShow={[...MIMETYPE_IMAGE]}
                access="public"
                strings={{}}
                profile={profile}
                address={address}
                mediaId={(featuredImage && featuredImage.mediaId) || ""}
                onRemove={() => {
                    setFeaturedImage({});
                    saveFeaturedImage();
                }}
                type="course"
            />
        </div>
    );
}
