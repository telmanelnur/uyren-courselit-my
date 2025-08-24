"use client";

import {
  SITE_SETTINGS_PAGE_HEADING,
  SITE_SETTINGS_SECTION_GENERAL,
  SITE_SETTINGS_SECTION_PAYMENT,
  SITE_MAILS_HEADER,
  SITE_CUSTOMISATIONS_SETTING_HEADER,
  SITE_APIKEYS_SETTING_HEADER,
} from "@/lib/ui/config/strings";
import { Profile, UIConstants } from "@workspace/common-models";
import { checkPermission } from "@workspace/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { trpc } from "@/utils/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import {
  GeneralSettings,
  PaymentSettings,
  MailsSettings,
  CustomizationsSettings,
  ApiKeysSettings,
  DomainManagement,
} from "./_components";

interface SettingsProps {
  siteinfo: any;
  profile: Profile;
  dispatch: (...args: any[]) => void;
  address: any;
  loading: boolean;
  selectedTab:
  | typeof SITE_SETTINGS_SECTION_GENERAL
  | typeof SITE_SETTINGS_SECTION_PAYMENT
  | typeof SITE_MAILS_HEADER
  | typeof SITE_CUSTOMISATIONS_SETTING_HEADER
  | typeof SITE_APIKEYS_SETTING_HEADER
  | "Domain Management";
}

const Settings = (props: SettingsProps) => {
  const [settings, setSettings] = useState<Partial<any>>({});
  const [apikeys, setApikeys] = useState<any[]>([]);
  const selectedTab = [
    SITE_SETTINGS_SECTION_GENERAL,
    SITE_SETTINGS_SECTION_PAYMENT,
    SITE_MAILS_HEADER,
    SITE_CUSTOMISATIONS_SETTING_HEADER,
    SITE_APIKEYS_SETTING_HEADER,
    "Domain Management",
  ].includes(props.selectedTab)
    ? props.selectedTab
    : SITE_SETTINGS_SECTION_GENERAL;
  const router = useRouter();

  const loadSettingsQuery = trpc.siteModule.siteInfo.getSiteInfo.useQuery();
  const loadApiKeysQuery = trpc.siteModule.siteInfo.listApiKeys.useQuery();

  useEffect(() => {
    if (loadSettingsQuery.data) {
      setSettings(loadSettingsQuery.data.settings);
    }
  }, [loadSettingsQuery.data]);

  useEffect(() => {
    if (loadApiKeysQuery.data) {
      setApikeys(loadApiKeysQuery.data);
    }
  }, [loadApiKeysQuery.data]);

  const handleSettingsUpdate = (newSettings: any) => {
    setSettings(newSettings);
  };

  const handleApiKeyRemoved = () => {
    loadApiKeysQuery.refetch();
  };

  const items = [
    SITE_SETTINGS_SECTION_GENERAL,
    SITE_SETTINGS_SECTION_PAYMENT,
    SITE_MAILS_HEADER,
    SITE_CUSTOMISATIONS_SETTING_HEADER,
    SITE_APIKEYS_SETTING_HEADER,
    "Domain Management",
  ];

  return (
    <div>
      <div className="flex justify-between items-baseline">
        <h1 className="text-4xl font-semibold mb-4">
          {SITE_SETTINGS_PAGE_HEADING}
        </h1>
      </div>
      <Tabs
        value={selectedTab}
        onValueChange={(tab: string) => {
          router.replace(`/dashboard/settings?tab=${tab}`);
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-6">
          {items.map((item) => (
            <TabsTrigger key={item} value={item}>
              {item}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={SITE_SETTINGS_SECTION_GENERAL} className="flex flex-col gap-8">
          <GeneralSettings
            settings={settings}
            profile={props.profile}
            address={props.address}
            onSettingsUpdate={handleSettingsUpdate}
          />
        </TabsContent>

        <TabsContent value={SITE_SETTINGS_SECTION_PAYMENT} className="flex flex-col gap-8">
          <PaymentSettings
            settings={settings}
            onSettingsUpdate={handleSettingsUpdate}
          />
        </TabsContent>

        <TabsContent value={SITE_MAILS_HEADER} className="flex flex-col gap-8">
          <MailsSettings
            settings={settings}
            onSettingsUpdate={handleSettingsUpdate}
          />
        </TabsContent>

        <TabsContent value={SITE_CUSTOMISATIONS_SETTING_HEADER} className="flex flex-col gap-8">
          <CustomizationsSettings
            settings={settings}
            onSettingsUpdate={handleSettingsUpdate}
          />
        </TabsContent>

        <TabsContent value={SITE_APIKEYS_SETTING_HEADER} className="flex flex-col gap-8">
          <ApiKeysSettings
            apikeys={apikeys}
            loading={props.loading}
            onApiKeyRemoved={handleApiKeyRemoved}
          />
        </TabsContent>

        <TabsContent value="Domain Management" className="flex flex-col gap-8">
          {checkPermission(props.profile.permissions, [UIConstants.permissions.manageSettings]) && (
            <DomainManagement profile={props.profile} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
