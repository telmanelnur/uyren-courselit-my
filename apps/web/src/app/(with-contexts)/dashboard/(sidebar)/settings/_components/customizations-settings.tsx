"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@workspace/ui/components/form";
import { Textarea } from "@workspace/ui/components/textarea";
import { useToast } from "@workspace/components-library";
import {
  SITE_CUSTOMISATIONS_SETTING_CODEINJECTION_HEAD,
  SITE_CUSTOMISATIONS_SETTING_CODEINJECTION_BODY,
  BUTTON_SAVE,
  APP_MESSAGE_SETTINGS_SAVED,
  TOAST_TITLE_SUCCESS,
} from "@/lib/ui/config/strings";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSettingsContext } from "./settings-context";

const customizationsSettingsSchema = z.object({
  codeInjectionHead: z.string().optional(),
  codeInjectionBody: z.string().optional(),
});

type CustomizationsSettingsFormData = z.infer<
  typeof customizationsSettingsSchema
>;

export default function CustomizationsSettings() {
  const { settings, updateSettingsMutation, loadSettingsQuery } =
    useSettingsContext();
  const { toast } = useToast();

  const form = useForm<CustomizationsSettingsFormData>({
    resolver: zodResolver(customizationsSettingsSchema),
    defaultValues: {
      codeInjectionHead: "",
      codeInjectionBody: "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        codeInjectionHead: settings.codeInjectionHead || "",
        codeInjectionBody: settings.codeInjectionBody || "",
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: CustomizationsSettingsFormData) => {
    try {
      await updateSettingsMutation.mutateAsync({
        data: {
          codeInjectionHead: data.codeInjectionHead,
          codeInjectionBody: data.codeInjectionBody,
        },
      });
      toast({
        title: TOAST_TITLE_SUCCESS,
        description: APP_MESSAGE_SETTINGS_SAVED,
      });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const isSubmitting = form.formState.isSubmitting;
  const isSaving = updateSettingsMutation.isPending;
  const isLoading = loadSettingsQuery.isLoading;
  const isDisabled = isLoading || isSaving || isSubmitting;

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="codeInjectionHead"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {SITE_CUSTOMISATIONS_SETTING_CODEINJECTION_HEAD}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={10}
                    placeholder="Enter HTML code to inject in the head section..."
                    className="font-mono text-sm"
                    disabled={isDisabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="codeInjectionBody"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {SITE_CUSTOMISATIONS_SETTING_CODEINJECTION_BODY}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={10}
                    placeholder="Enter HTML code to inject in the body section..."
                    className="font-mono text-sm"
                    disabled={isDisabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isDisabled}
            className="w-full sm:w-auto"
          >
            {isSaving || isSubmitting ? "Saving..." : BUTTON_SAVE}
          </Button>
        </form>
      </Form>
    </div>
  );
}
