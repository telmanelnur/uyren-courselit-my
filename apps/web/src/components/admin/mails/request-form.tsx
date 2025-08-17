"use client";

import {
    MAIL_REQUEST_FORM_REASON_FIELD,
    MAIL_REQUEST_FORM_REASON_PLACEHOLDER,
    MAIL_REQUEST_FORM_SUBMIT_INITIAL_REQUEST_TEXT,
    MAIL_REQUEST_FORM_SUBMIT_UPDATE_REQUEST_TEXT,
    MAIL_REQUEST_RECEIVED,
    TOAST_TITLE_ERROR,
    TOAST_TITLE_SUCCESS,
} from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import {
    Form,
    FormField,
    FormSubmit,
    useToast,
} from "@workspace/components-library";
import { capitalize } from "@workspace/utils";
import { ChangeEvent, useEffect, useState } from "react";



const RequestForm = () => {
    const [reason, setReason] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("");
    const { toast } = useToast();

    const loadMailRequestStatusQuery = trpc.mailModule.mailRequest.getMailRequestStatus.useQuery();
    const updateMailRequestMutation = trpc.mailModule.mailRequest.updateMailRequest.useMutation();

    useEffect(() => {
        if (loadMailRequestStatusQuery.data) {
            setReason(loadMailRequestStatusQuery.data.reason);
            setMessage(loadMailRequestStatusQuery.data.message);
            setStatus(loadMailRequestStatusQuery.data.status);
        }
    }, [loadMailRequestStatusQuery.data]);

    useEffect(() => {
        if (loadMailRequestStatusQuery.error) {
            toast({
                title: TOAST_TITLE_ERROR,
                description: loadMailRequestStatusQuery.error.message,
                variant: "destructive",
            });
        }
    }, [loadMailRequestStatusQuery.error]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!reason) {
            return;
        }
        try {
            const response = await updateMailRequestMutation.mutateAsync({
                data: {
                    reason,
                },
            });
            if (response) {
                toast({
                    title: TOAST_TITLE_SUCCESS,
                    description: MAIL_REQUEST_RECEIVED,
                });
            }
        } catch (e: any) {
            toast({
                title: TOAST_TITLE_ERROR,
                description: e.message,
                variant: "destructive",
            });
        }
    };

    const loading = loadMailRequestStatusQuery.isLoading || updateMailRequestMutation.isPending;

    return (
        <div className="flex flex-col gap-8">
            <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <FormField
                    name="reason"
                    component="textarea"
                    value={reason}
                    rows={5}
                    label={MAIL_REQUEST_FORM_REASON_FIELD}
                    placeholder={MAIL_REQUEST_FORM_REASON_PLACEHOLDER}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setReason(e.target.value)
                    }
                />
                <div>
                    <FormSubmit
                        text={
                            !status
                                ? MAIL_REQUEST_FORM_SUBMIT_INITIAL_REQUEST_TEXT
                                : MAIL_REQUEST_FORM_SUBMIT_UPDATE_REQUEST_TEXT
                        }
                        disabled={loading || !reason}
                    />
                </div>
            </Form>
            <div>
                {status && (
                    <p>
                        <span className="font-semibold">Status:</span>{" "}
                        {capitalize(status)}
                    </p>
                )}
                {message && (
                    <p>
                        <span className="font-semibold">Our response:</span>{" "}
                        {capitalize(message)}
                    </p>
                )}
            </div>
        </div>
    );
};

export default RequestForm;
