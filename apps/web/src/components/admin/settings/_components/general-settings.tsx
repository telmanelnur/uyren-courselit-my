"use client";

import { MIMETYPE_IMAGE } from "@/lib/ui/config/constants";
import {
    APP_MESSAGE_SETTINGS_SAVED,
    BUTTON_SAVE,
    MEDIA_SELECTOR_REMOVE_BTN_CAPTION,
    MEDIA_SELECTOR_UPLOAD_BTN_CAPTION,
    SITE_SETTINGS_COURSELIT_BRANDING_CAPTION,
    SITE_SETTINGS_COURSELIT_BRANDING_SUB_CAPTION,
    SITE_SETTINGS_LOGO,
    SITE_SETTINGS_SUBTITLE,
    SITE_SETTINGS_TITLE,
    TOAST_TITLE_ERROR,
    TOAST_TITLE_SUCCESS
} from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Media, Profile } from "@workspace/common-models";
import { MediaSelector, useToast } from "@workspace/components-library";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const generalSettingsSchema = z.object({
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().optional(),
    hideCourseLitBranding: z.boolean(),
});

type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;

interface GeneralSettingsProps {
    settings: any;
    profile: Profile;
    address: any;
    onSettingsUpdate: (settings: any) => void;
}

export default function GeneralSettings({ settings, profile, address, onSettingsUpdate }: GeneralSettingsProps) {
    const { toast } = useToast();
    const [logo, setLogo] = useState(settings.logo || {});

    const form = useForm<GeneralSettingsFormData>({
        resolver: zodResolver(generalSettingsSchema),
        defaultValues: {
            title: settings.title || "",
            subtitle: settings.subtitle || "",
            hideCourseLitBranding: settings.hideCourseLitBranding || false,
        },
    });

    const updateSettingsMutation = trpc.siteModule.siteInfo.updateSiteInfo.useMutation({
        onSuccess: () => {
            toast({
                title: TOAST_TITLE_SUCCESS,
                description: APP_MESSAGE_SETTINGS_SAVED,
            });
            onSettingsUpdate(form.getValues());
        },
        onError: (error: any) => {
            toast({
                title: TOAST_TITLE_ERROR,
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const onSubmit = async (data: GeneralSettingsFormData) => {
        try {
            await updateSettingsMutation.mutateAsync({
                data: {
                    title: data.title,
                    subtitle: data.subtitle,
                    hideCourseLitBranding: data.hideCourseLitBranding,
                },
            });
        } catch (error) {
            // Error handling is done in the mutation
        }
    };

    const saveLogo = async (media?: Media) => {
        try {
            await updateSettingsMutation.mutateAsync({
                data: {
                    logo: media || null,
                },
            });
            if (media) {
                setLogo(media);
            } else {
                setLogo({});
            }
        } catch (error) {
            console.error("Error updating logo:", error);
        }
    };

    const isSubmitting = form.formState.isSubmitting;
    const isSaving = updateSettingsMutation.isPending;

    return (
        <div className="space-y-8">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{SITE_SETTINGS_TITLE}</FormLabel>
                                <FormControl>
                                    <Input {...field} required />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="subtitle"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{SITE_SETTINGS_SUBTITLE}</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="hideCourseLitBranding"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">
                                            {SITE_SETTINGS_COURSELIT_BRANDING_CAPTION}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {SITE_SETTINGS_COURSELIT_BRANDING_SUB_CAPTION}
                                        </p>
                                    </div>
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isSaving}
                                        />
                                    </FormControl>
                                </div>
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={isSaving || isSubmitting}
                        className="w-full sm:w-auto"
                    >
                        {isSaving || isSubmitting ? "Saving..." : BUTTON_SAVE}
                    </Button>
                </form>
            </Form>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                    {SITE_SETTINGS_LOGO}
                </h3>
                <MediaSelector
                    profile={profile}
                    address={address}
                    title=""
                    src={logo?.thumbnail || ""}
                    srcTitle={logo?.originalFileName || ""}
                    onSelection={(media?: Media) => {
                        if (media) {
                            saveLogo(media);
                        }
                    }}
                    mimeTypesToShow={[...MIMETYPE_IMAGE]}
                    access="public"
                    strings={{
                        buttonCaption: MEDIA_SELECTOR_UPLOAD_BTN_CAPTION,
                        removeButtonCaption: MEDIA_SELECTOR_REMOVE_BTN_CAPTION,
                    }}
                    mediaId={logo?.mediaId || ""}
                    onRemove={() => saveLogo()}
                    type="domain"
                />
            </div>
        </div>
    );
}
