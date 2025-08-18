"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { useToast } from "@workspace/components-library";
import { TabsWithMutation, Tab } from "..";
import { TabContent } from "../TabContent";
import { TabForm } from "../TabForm";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";

// Example site settings type
interface SiteSettings {
  title: string;
  description: string;
  language: string;
  supportEmail: string;
  headerCode: string;
  footerCode: string;
  privacyPolicy: string;
  termsOfService: string;
}

export function SettingsTabsExample() {
  const { toast } = useToast();
  
  // Initial settings state (in real app, this would come from an API call)
  const [settings, setSettings] = useState<SiteSettings>({
    title: "My Website",
    description: "A great website for users",
    language: "en",
    supportEmail: "support@example.com",
    headerCode: "<!-- Header code -->",
    footerCode: "<!-- Footer code -->",
    privacyPolicy: "Privacy policy content...",
    termsOfService: "Terms of service content...",
  });
  
  // Local form state for each tab
  const [generalSettings, setGeneralSettings] = useState({
    title: settings.title,
    description: settings.description,
    language: settings.language,
    supportEmail: settings.supportEmail,
  });
  
  const [codeSettings, setCodeSettings] = useState({
    headerCode: settings.headerCode,
    footerCode: settings.footerCode,
  });
  
  const [legalSettings, setLegalSettings] = useState({
    privacyPolicy: settings.privacyPolicy,
    termsOfService: settings.termsOfService,
  });
  
  // tRPC mutation for updating settings
  const updateSettingsMutation = trpc.siteModule.siteInfo.updateSiteInfo.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
      
      // In a real app, update the settings state with the response
      // setSettings(data.settings);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form event handlers
  const handleGeneralSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updateSettingsMutation.mutateAsync({
      data: generalSettings,
    });
    // Update local state
    setSettings(prev => ({ ...prev, ...generalSettings }));
  };
  
  const handleCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updateSettingsMutation.mutateAsync({
      data: codeSettings,
    });
    // Update local state
    setSettings(prev => ({ ...prev, ...codeSettings }));
  };
  
  const handleLegalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updateSettingsMutation.mutateAsync({
      data: legalSettings,
    });
    // Update local state
    setSettings(prev => ({ ...prev, ...legalSettings }));
  };
  
  // Field change handlers
  const handleGeneralChange = (field: string, value: string) => {
    setGeneralSettings(prev => ({ ...prev, [field]: value }));
  };
  
  const handleCodeChange = (field: string, value: string) => {
    setCodeSettings(prev => ({ ...prev, [field]: value }));
  };
  
  const handleLegalChange = (field: string, value: string) => {
    setLegalSettings(prev => ({ ...prev, [field]: value }));
  };
  
  // Define tabs
  const tabs: Tab[] = [
    {
      id: "general",
      label: "General",
      content: (
        <TabContent isLoading={updateSettingsMutation.isLoading}>
          <TabForm 
            onSubmit={handleGeneralSubmit}
            isLoading={updateSettingsMutation.isLoading}
            isValid={!!generalSettings.title}
          >
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="title">Site Title</Label>
                <Input
                  id="title"
                  value={generalSettings.title}
                  onChange={(e) => handleGeneralChange("title", e.target.value)}
                />
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="description">Site Description</Label>
                <Textarea
                  id="description"
                  value={generalSettings.description}
                  onChange={(e) => handleGeneralChange("description", e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="language">Language</Label>
                <Select 
                  value={generalSettings.language}
                  onValueChange={(value) => handleGeneralChange("language", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={generalSettings.supportEmail}
                  onChange={(e) => handleGeneralChange("supportEmail", e.target.value)}
                />
              </div>
            </div>
          </TabForm>
        </TabContent>
      ),
    },
    {
      id: "code-injection",
      label: "Code Injection",
      content: (
        <TabContent isLoading={updateSettingsMutation.isLoading}>
          <TabForm 
            onSubmit={handleCodeSubmit}
            isLoading={updateSettingsMutation.isLoading}
          >
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="headerCode">Header Code</Label>
                <Textarea
                  id="headerCode"
                  value={codeSettings.headerCode}
                  onChange={(e) => handleCodeChange("headerCode", e.target.value)}
                  rows={5}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  This code will be injected into the &lt;head&gt; section of your site.
                </p>
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="footerCode">Footer Code</Label>
                <Textarea
                  id="footerCode"
                  value={codeSettings.footerCode}
                  onChange={(e) => handleCodeChange("footerCode", e.target.value)}
                  rows={5}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  This code will be injected before the closing &lt;/body&gt; tag.
                </p>
              </div>
            </div>
          </TabForm>
        </TabContent>
      ),
    },
    {
      id: "legal",
      label: "Legal",
      content: (
        <TabContent isLoading={updateSettingsMutation.isLoading}>
          <TabForm 
            onSubmit={handleLegalSubmit}
            isLoading={updateSettingsMutation.isLoading}
          >
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="privacyPolicy">Privacy Policy</Label>
                <Textarea
                  id="privacyPolicy"
                  value={legalSettings.privacyPolicy}
                  onChange={(e) => handleLegalChange("privacyPolicy", e.target.value)}
                  rows={8}
                />
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="termsOfService">Terms of Service</Label>
                <Textarea
                  id="termsOfService"
                  value={legalSettings.termsOfService}
                  onChange={(e) => handleLegalChange("termsOfService", e.target.value)}
                  rows={8}
                />
              </div>
            </div>
          </TabForm>
        </TabContent>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Site Settings</h2>
      <TabsWithMutation tabs={tabs} defaultTabId="general" />
    </div>
  );
}
