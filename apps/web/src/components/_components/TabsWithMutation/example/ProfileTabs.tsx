"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { useToast } from "@workspace/components-library";
import { TabsWithMutation, Tab } from "..";
import { TabContent } from "../TabContent";
import { TabForm } from "../TabForm";
import { useTabMutation } from "../useTabMutation";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";

export function ProfileTabsExample() {
  const { toast } = useToast();
  
  // Basic Info Tab State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Notification Tab State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  
  // Bio Tab State
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  
  // Example tRPC mutation for updating basic info
  const updateBasicInfoMutation = trpc.userModule.user.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Basic info updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Custom mutation for notifications (using our useTabMutation hook)
  const updateNotificationsMutation = useTabMutation(
    async (data: { emailNotifications: boolean; pushNotifications: boolean }) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Return updated data
      return data;
    },
    {
      onSuccess: (data) => {
        toast({
          title: "Success",
          description: "Notification preferences updated",
        });
      }
    }
  );
  
  // Another custom mutation for bio info
  const updateBioMutation = useTabMutation(
    async (data: { bio: string; website: string }) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Return updated data
      return data;
    },
    {
      onSuccess: (data) => {
        toast({
          title: "Success",
          description: "Bio information updated",
        });
      }
    }
  );
  
  // Form submit handlers
  const handleBasicInfoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updateBasicInfoMutation.mutateAsync({
      userId: "current-user-id", // In a real app, get this from context
      data: {
        name,
        email,
      },
    });
  };
  
  const handleNotificationsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updateNotificationsMutation.mutate({
      emailNotifications,
      pushNotifications,
    });
  };
  
  const handleBioSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updateBioMutation.mutate({
      bio,
      website,
    });
  };
  
  // Define tabs
  const tabs: Tab[] = [
    {
      id: "basic-info",
      label: "Basic Info",
      content: (
        <TabContent isLoading={updateBasicInfoMutation.isLoading}>
          <TabForm 
            onSubmit={handleBasicInfoSubmit}
            isLoading={updateBasicInfoMutation.isLoading}
            isValid={!!name && !!email}
          >
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                />
              </div>
            </div>
          </TabForm>
        </TabContent>
      ),
    },
    {
      id: "notifications",
      label: "Notifications",
      content: (
        <TabContent isLoading={updateNotificationsMutation.isLoading}>
          <TabForm 
            onSubmit={handleNotificationsSubmit}
            isLoading={updateNotificationsMutation.isLoading}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
            </div>
          </TabForm>
        </TabContent>
      ),
    },
    {
      id: "bio",
      label: "Bio",
      content: (
        <TabContent isLoading={updateBioMutation.isLoading}>
          <TabForm 
            onSubmit={handleBioSubmit}
            isLoading={updateBioMutation.isLoading}
          >
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  rows={4}
                />
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="Your website URL"
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
      <h2 className="text-2xl font-bold">Profile Settings</h2>
      <TabsWithMutation tabs={tabs} defaultTabId="basic-info" />
    </div>
  );
}
