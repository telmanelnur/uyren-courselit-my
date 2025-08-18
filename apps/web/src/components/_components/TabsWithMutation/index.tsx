"use client";

import { useState, ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/tabs";
import { cn } from "@workspace/ui/lib/utils";

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsWithMutationProps {
  tabs: Tab[];
  defaultTabId?: string;
  className?: string;
  onChange?: (tabId: string) => void;
}

export function TabsWithMutation({ 
  tabs, 
  defaultTabId, 
  className,
  onChange 
}: TabsWithMutationProps) {
  const [activeTab, setActiveTab] = useState(defaultTabId || tabs[0]?.id || "");

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  return (
    <Tabs
      defaultValue={activeTab}
      onValueChange={handleTabChange}
      className={cn("w-full", className)}
    >
      <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-4">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
