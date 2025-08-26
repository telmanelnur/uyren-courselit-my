"use client";

import {
  BROADCASTS,
  BTN_NEW_MAIL,
  BTN_NEW_SEQUENCE,
  PAGE_HEADER_ALL_MAILS,
  SEQUENCES,
  TOAST_TITLE_ERROR,
} from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import { Constants, Domain, SequenceType } from "@workspace/common-models";
import {
  Button,
  // Button,
  Tabbs,
  useToast,
} from "@workspace/components-library";
// import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import RequestForm from "./request-form";
import SequencesList from "./sequences-list";

interface MailsProps {
  selectedTab: typeof BROADCASTS | typeof SEQUENCES;
  loading: boolean;
}

export default function Mails({ selectedTab }: MailsProps) {
  const router = useRouter();
  const { toast } = useToast();

  const loadSettingsQuery = trpc.siteModule.siteInfo.getSiteInfo.useQuery();
  const createSequenceMutation = trpc.mailModule.sequence.create.useMutation();
  const siteInfo = loadSettingsQuery.data;

  const createSequence = async (type: SequenceType): Promise<void> => {
    try {
      const response = await createSequenceMutation.mutateAsync({
        data: {
          type: type,
        },
      });
      if (response && response.sequenceId) {
        router.push(
          `/dashboard/mails/${
            selectedTab === BROADCASTS ? "broadcast" : "sequence"
          }/${response.sequenceId}`,
        );
      }
    } catch (err: any) {
      toast({
        title: TOAST_TITLE_ERROR,
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const onPrimaryButtonClick = (): void => {
    if (selectedTab === BROADCASTS) {
      createSequence("broadcast");
    } else if (selectedTab === SEQUENCES) {
      createSequence("sequence");
    } else {
    }
  };

  if ((siteInfo && !siteInfo?.quota) || !siteInfo?.settings?.mailingAddress) {
    return (
      <div className="flex flex-col">
        <h1 className="text-4xl font-semibold mb-8">{PAGE_HEADER_ALL_MAILS}</h1>
        <div className="flex flex-col gap-4 mb-8">
          <h2 className="text-2xl font-semibold">Before you start!</h2>
          <p className="text-slate-500">
            There a few things you need to do in order to start sending
            marketing emails.
          </p>
        </div>
        {!siteInfo?.settings?.mailingAddress && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Set your mailing address</CardTitle>
              <CardDescription>
                We need this in order to comply with the CAN-SPAM Act.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <div className="w-[120px]">
                <Button
                  component="button"
                  href={`/dashboard/settings?tab=Mails`}
                >
                  Go to settings
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
        {!siteInfo?.quota?.mail && (
          <Card>
            <CardHeader>
              <CardTitle>Request access</CardTitle>
              <CardDescription>
                Please fill in the form to request access to the mailing
                feature. We need to review your use case so as to keep our
                services clean.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RequestForm />
            </CardContent>
          </Card>
        )}
        <div></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-semibold mb-4">{PAGE_HEADER_ALL_MAILS}</h1>
        <div className="flex gap-2">
          <Button onClick={onPrimaryButtonClick}>
            {selectedTab === BROADCASTS ? BTN_NEW_MAIL : BTN_NEW_SEQUENCE}
          </Button>
        </div>
      </div>
      <Tabbs
        items={[BROADCASTS, SEQUENCES]}
        value={selectedTab}
        onChange={(tab) => {
          router.replace(`/dashboard/mails?tab=${tab}`);
        }}
      >
        <SequencesList type={Constants.mailTypes[0] as SequenceType} />
        <SequencesList type={Constants.mailTypes[1] as SequenceType} />
      </Tabbs>
    </div>
  );
}
