"use client";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { useToast } from "@workspace/components-library";
import { TOAST_TITLE_SUCCESS, TOAST_TITLE_ERROR } from "@/lib/ui/config/strings";
import { clearDomainManagerCache } from "@/server/actions/domain";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

interface DomainManagementProps {
  profile: any;
}

export default function DomainManagement({ profile }: DomainManagementProps) {
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      const result = await clearDomainManagerCache();
      if (result.success) {
        toast({
          title: TOAST_TITLE_SUCCESS,
          description: result.message,
        });
      } else {
        toast({
          title: TOAST_TITLE_ERROR,
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: TOAST_TITLE_ERROR,
        description: error.message || "Failed to clear domain cache",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Domain Management</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Cache Management</CardTitle>
          <CardDescription>
            Clear domain cache to refresh domain data and resolve any caching issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleClearCache}
            disabled={isClearing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isClearing ? 'animate-spin' : ''}`} />
            {isClearing ? "Clearing..." : "Clear Domain Cache"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
