"use client";

import DashboardContent from "@/components/admin/dashboard-content";
import { useAddress } from "@/components/contexts/address-context";
import useProduct from "@/hooks/use-product";
import {
  BTN_CONTINUE,
  COURSE_CONTENT_HEADER,
  MANAGE_COURSES_PAGE_HEADING,
  NEW_SECTION_HEADER,
  TOAST_TITLE_ERROR,
} from "@/lib/ui/config/strings";
import { truncate } from "@workspace/utils";
import { trpc } from "@/utils/trpc";
import { useToast } from "@workspace/components-library";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SectionPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const productId = params.id as string;
  //   const sectionId = searchParams.get("id")
  //   const mode = searchParams.get("mode")
  // const afterSectionId = searchParams.get("after");
  const [loading, setLoading] = useState(false);

  const [sectionName, setSectionName] = useState("");
  //   const [enableDrip, setEnableDrip] = useState(false)
  //   const [dripType, setDripType] = useState<"date" | "days">("date")
  //   const [notifyUsers, setNotifyUsers] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { address } = useAddress();
  const { product } = useProduct(productId);
  const breadcrumbs = [
    { label: MANAGE_COURSES_PAGE_HEADING, href: "/dashboard/products" },
    {
      label: product ? truncate(product.title || "", 20) || "..." : "...",
      href: `/dashboard/product/${productId}`,
    },
    {
      label: COURSE_CONTENT_HEADER,
      href: `/dashboard/product/${productId}/content`,
    },
    { label: NEW_SECTION_HEADER, href: "#" },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!sectionName.trim()) {
      newErrors.sectionName = "Section name is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      createSection();
    }
  };

  const addGroupMutation = trpc.lmsModule.courseModule.course.addGroup.useMutation();

  const createSection = async () => {
    try {
      setLoading(true);
      const result = await addGroupMutation.mutateAsync({
        data: {
          courseId: product!.courseId,
          name: sectionName,
        },
      });
      if (result) {
        router.replace(`/dashboard/product/${productId}/content`);
      }
    } catch (err: any) {
      toast({
        title: TOAST_TITLE_ERROR,
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardContent breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-semibold">
            {NEW_SECTION_HEADER}
          </h1>
          <p className="text-muted-foreground mt-2">
            Add a new section to your course
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="space-y-4">
            <Label htmlFor="name">Section Name</Label>
            <Input
              id="name"
              placeholder="Enter section name"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              className={
                errors.sectionName ? "border-red-500" : ""
              }
            />
            {errors.sectionName && (
              <p className="text-sm text-red-500">
                {errors.sectionName}
              </p>
            )}
          </div>

          {/* <Separator />

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Content Release</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Control when this section becomes available to students</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable-drip">Scheduled Release</Label>
                <p className="text-sm text-muted-foreground">Release content gradually to your students</p>
              </div>
              <Switch id="enable-drip" checked={enableDrip} onCheckedChange={setEnableDrip} />
            </div>

            {enableDrip && (
              <div className="rounded-lg border p-4 space-y-6 animate-in fade-in-50">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Release Type</Label>
                    <Select value={dripType} onValueChange={(value: "date" | "days") => setDripType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select release type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Release on specific date</SelectItem>
                        <SelectItem value="days">Release days after previous section</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {dripType === "date" && (
                    <div className="space-y-2">
                      <Label htmlFor="releaseDate">Release Date & Time</Label>
                      <Input
                        id="releaseDate"
                        type="datetime-local"
                        className={errors.releaseDate ? "border-red-500" : ""}
                      />
                      {errors.releaseDate && <p className="text-sm text-red-500">{errors.releaseDate}</p>}
                    </div>
                  )}

                  {dripType === "days" && (
                    <div className="space-y-2">
                      <Label htmlFor="releaseDays">Days after previous section</Label>
                      <div className="flex items-center space-x-2 max-w-[200px]">
                        <Input
                          id="releaseDays"
                          type="number"
                          min="1"
                          placeholder="0"
                          className={errors.releaseDays ? "border-red-500" : ""}
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">days</span>
                      </div>
                      {errors.releaseDays && <p className="text-sm text-red-500">{errors.releaseDays}</p>}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notify-users">Email Notification</Label>
                      <p className="text-sm text-muted-foreground">Notify students when content becomes available</p>
                    </div>
                    <Switch id="notify-users" checked={notifyUsers} onCheckedChange={setNotifyUsers} />
                  </div>

                  {notifyUsers && <EmailEditor />}
                </div>
              </div>
            )}
          </div> */}

          <div className="flex items-center justify-end gap-4">
            <Button variant="outline" asChild>
              <Link
                href={`/dashboard/product/${productId}/content`}
              >
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {BTN_CONTINUE}
            </Button>
          </div>
        </form>
      </div>
    </DashboardContent>
  );
}
