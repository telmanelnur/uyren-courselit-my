"use client";

import PaymentPlanList from "@/components/admin/payments/payment-plan-list";
import { useAddress } from "@/components/contexts/address-context";
import { useProfile } from "@/components/contexts/profile-context";
import { useSiteInfo } from "@/components/contexts/site-info-context";
import { useCommunity } from "@/hooks/use-community";
import { useMembership } from "@/hooks/use-membership";
import {
  COMMUNITY_SETTINGS,
  DANGER_ZONE_HEADER,
  MEDIA_SELECTOR_REMOVE_BTN_CAPTION,
  MEDIA_SELECTOR_UPLOAD_BTN_CAPTION,
  TOAST_DESCRIPTION_CHANGES_SAVED,
  TOAST_TITLE_ERROR,
  TOAST_TITLE_SUCCESS,
} from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import {
  Constants,
  Media,
  PaymentPlan,
  PaymentPlanType,
} from "@workspace/common-models";
import {
  getSymbolFromCurrency,
  Image,
  Link,
  MediaSelector,
  useToast,
} from "@workspace/components-library";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Separator } from "@workspace/ui/components/separator";
import { Switch } from "@workspace/ui/components/switch";
import { Input } from "@workspace/ui/components/input";
import { FormItem, FormLabel, FormControl, FormMessage } from "@workspace/ui/components/form";
import { Edit, FlagTriangleRight, Users, X } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
const { PaymentPlanType: paymentPlanType, MembershipEntityType } = Constants;

export const ManageClientView = ({ id }: { id: string }) => {
  const { profile } = useProfile();
  const { address } = useAddress();
  const { siteInfo } = useSiteInfo();

  const [name, setName] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [autoAcceptMembers, setAutoAcceptMembers] = useState(false);
  const [banner, setBanner] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [refresh, setRefresh] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [joiningReasonText, setJoiningReasonText] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [migrationCategory, setMigrationCategory] = useState<string>("");
  const [pageId, setPageId] = useState("");
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [featuredImage, setFeaturedImage] = useState<Media | null>(null);
  const { toast } = useToast();
  const { community, error, loaded: communityLoaded } = useCommunity(id);
  const { membership, loaded: membershipLoaded } = useMembership(id);
  const [defaultPaymentPlan, setDefaultPaymentPlan] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (communityLoaded && community) {
      setCommunity(community);
    }
  }, [community, communityLoaded]);

  const deleteCommunityMutation =
    trpc.communityModule.community.delete.useMutation({
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Community deleted successfully",
        });
        router.replace("/dashboard/communities");
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  useEffect(() => {
    if (
      communityLoaded &&
      membershipLoaded &&
      (community === null ||
        membership === null ||
        (membership && membership.role !== Constants.MembershipRole.MODERATE))
    ) {
      redirect(`/dashboard/community/${id}`);
    }
  }, [community, communityLoaded, membership, membershipLoaded]);

  const handleDeleteConfirm = async () => {
    deleteCommunityMutation.mutate({ communityId: id });
  };

  const setCommunity = (community: any) => {
    setName(community.name);
    if (community.description) {
      setDescription(community.description);
    }
    setEnabled(community.enabled);
    if (community.banner) {
      setBanner(community.banner);
    }
    setCategories(community.categories);
    setAutoAcceptMembers(community.autoAcceptMembers);
    setJoiningReasonText(community.joiningReasonText);
    setPageId(community.pageId);
    setPaymentPlans(community.paymentPlans);
    setDefaultPaymentPlan(community.defaultPaymentPlan);
    setFeaturedImage(community.featuredImage);
    setRefresh(refresh + 1);
  };

  const updateCommunityMutation =
    trpc.communityModule.community.update.useMutation({
      onSuccess: (data) => {
        toast({
          title: TOAST_TITLE_SUCCESS,
          description: TOAST_DESCRIPTION_CHANGES_SAVED,
        });
        setCommunity(data);
      },
      onError: (error) => {
        console.log(error.message);
        toast({
          title: TOAST_TITLE_ERROR,
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateCommunityMutation.mutate({
      data: {
        name,
        description: JSON.stringify(description),
        enabled,
        autoAcceptMembers,
        joiningReasonText,
      },
      communityId: id,
    });
  };

  const updateFeaturedImage = async (media?: Media) => {
    updateCommunityMutation.mutate({
      data: {
        // featuredImage: media || null,
      },
      communityId: id,
    });
  };

  const addCategoryMutation =
    trpc.communityModule.community.addCategory.useMutation({
      onSuccess: (response) => {
        setCategories(response.categories);
        setNewCategory("");
        toast({
          title: "Category Added",
          description: `Category "${newCategory}" has been added successfully.`,
        });
      },
      onError: (error) => {
        toast({
          title: TOAST_TITLE_ERROR,
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      addCategoryMutation.mutate({
        data: {
          communityId: id,
          category: newCategory.trim(),
        },
      });
    }
  };

  const handleDeleteCategory = (category: any) => {
    setDeletingCategory(category);
    setMigrationCategory("");
  };

  const deleteCategoryMutation =
    trpc.communityModule.community.deleteCategory.useMutation({
      onSuccess: (response) => {
        setCategories(response.categories);
        toast({
          title: "Category Deleted",
          description: `The category "${deletingCategory}" has been removed.`,
        });
        setDeletingCategory(null);
        setMigrationCategory("");
      },
      onError: (error) => {
        toast({
          title: TOAST_TITLE_ERROR,
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const confirmDeleteCategory = async () => {
    if (deletingCategory) {
      deleteCategoryMutation.mutate({
        data: {
          communityId: id,
          category: deletingCategory,
          migrateToCategory: migrationCategory || undefined,
        },
      });
    }
  };

  const createPlanMutation =
    trpc.communityModule.community.createPaymentPlan.useMutation({
      onSuccess: (response) => {
        setPaymentPlans([...paymentPlans, response]);
        toast({
          title: "Plan Created",
          description: `The plan "${response.name}" has been created successfully.`,
        });
      },
      onError: (error) => {
        toast({
          title: TOAST_TITLE_ERROR,
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const onPlanSubmitted = async (plan: Omit<PaymentPlan, "planId">) => {
    createPlanMutation.mutateAsync({
      data: {
        name: plan.name,
        type: plan.type,
        entityId: id,
        entityType: MembershipEntityType.COMMUNITY,
        oneTimeAmount: plan.oneTimeAmount,
        emiAmount: plan.emiAmount,
        emiTotalInstallments: plan.emiTotalInstallments,
        subscriptionMonthlyAmount: plan.subscriptionMonthlyAmount,
        subscriptionYearlyAmount: plan.subscriptionYearlyAmount,
      },
    });
  };

  const archivePlanMutation =
    trpc.communityModule.community.archivePaymentPlan.useMutation();

  const onPlanArchived = async (planId: string) => {
    try {
      const response = await archivePlanMutation.mutateAsync({
        data: {
          planId,
          entityId: id,
          entityType: MembershipEntityType.COMMUNITY,
        },
      });

      setPaymentPlans(paymentPlans.filter((p) => p.planId !== planId));
      toast({
        title: "Plan Archived",
        description: `The plan "${response.name}" has been archived successfully.`,
      });
    } catch (error: any) {
      toast({
        title: TOAST_TITLE_ERROR,
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const changeDefaultPlanMutation =
    trpc.communityModule.community.changeDefaultPaymentPlan.useMutation({
      onSuccess: (data) => {
        setDefaultPaymentPlan(data.planId);
      },
      onError: (error) => {
        toast({
          title: TOAST_TITLE_ERROR,
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const onDefaultPlanChanged = async (planId: string) => {
    changeDefaultPlanMutation.mutateAsync({
      data: {
        planId,
        entityId: id,
        entityType: MembershipEntityType.COMMUNITY,
      },
    });
  };

  return (
    <>
      <Form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between mb-8">
            <h1 className="text-4xl font-semibold ">{COMMUNITY_SETTINGS}</h1>
            <div className="flex gap-2">
              <Link href={`/dashboard/community/${id}/manage/memberships`}>
                <Button variant="outline" className="">
                  <Users className="w-4 h-4" /> Memberships
                </Button>
              </Link>
              <Link href={`/dashboard/community/${id}/manage/reports`}>
                <Button variant="outline" className="">
                  <FlagTriangleRight className="w-4 h-4" /> Reported content
                </Button>
              </Link>
            </div>
          </div>
          <p className="text-muted-foreground">
            Manage your community settings.
          </p>
        </div>
        <div className="space-y-6">
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input
                value={name}
                name="name"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                placeholder="Community name"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
          <div>
            <h2 className="font-semibold">Description</h2>
            {/* <TextEditor
              initialContent={description}
              onChange={(state: any) => setDescription(state)}
              showToolbar={false}
              url={address.backend}
              refresh={refresh}
            /> */}
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled" className="font-semibold">
                Community Enabled
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow users to join your community
              </p>
            </div>
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="default" className="font-semibold">
                Auto accept members
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically accept new members
              </p>
            </div>
            <Switch
              id="autoAcceptMembers"
              checked={autoAcceptMembers}
              onCheckedChange={setAutoAcceptMembers}
            />
          </div>
          <FormItem>
            <FormLabel>Joining reason text</FormLabel>
            <FormControl>
              <Input
                value={joiningReasonText}
                name="joiningReasonText"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setJoiningReasonText(e.target.value)
                }
                placeholder="Text to show when users request to join a free community"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </div>
        <Button type="submit">Save Changes</Button>
      </Form>
      <Separator className="my-8" />
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-base font-semibold">Featured image</Label>
          <p className="text-sm text-muted-foreground mb-4">
            The hero image for your community
          </p>
          {featuredImage && (
            <div className="w-32 rounded overflow-hidden border">
              <Image
                src={
                  featuredImage?.thumbnail || "/courselit-backdrop-square.webp"
                }
                alt={name}
              />
            </div>
          )}
          {profile ? (
            <MediaSelector
              title=""
              profile={profile as any}
              address={address}
              mediaId={featuredImage?.mediaId}
              src={featuredImage?.thumbnail || ""}
              srcTitle={featuredImage?.originalFileName || ""}
              onSelection={(media?: Media) => {
                if (media) {
                  updateFeaturedImage(media);
                }
              }}
              onRemove={() => {
                updateFeaturedImage();
              }}
              access="public"
              strings={{
                buttonCaption: MEDIA_SELECTOR_UPLOAD_BTN_CAPTION,
                removeButtonCaption: MEDIA_SELECTOR_REMOVE_BTN_CAPTION,
              }}
              type="community"
              hidePreview={true}
            />
          ) : null}
        </div>
      </div>
      <Separator className="my-8" />
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-base font-semibold">Categories</Label>
          <p className="text-sm text-muted-foreground">
            Add and manage community categories
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {category}
              <button
                type="button"
                onClick={() => handleDeleteCategory(category)}
                className="ml-1 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {category} category</span>
              </button>
            </Badge>
          ))}
        </div>
        <form onSubmit={handleAddCategory} className="flex gap-2">
          <FormItem className="flex-1">
            <FormControl>
              <Input
                name="name"
                value={newCategory}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCategory(e.target.value)}
                placeholder="Enter category name"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
          <Button type="submit" variant="secondary">
            Add Category
          </Button>
        </form>
      </div>
      <Separator className="my-8" />
      <div className="space-y-4 flex flex-col md:flex-row md:items-start md:justify-between w-full">
        <div className="space-y-2">
          <Label className="text-base font-semibold">Pricing</Label>
          <p className="text-sm text-muted-foreground">
            Manage your community pricing plans
          </p>
        </div>
        <PaymentPlanList
          paymentPlans={paymentPlans.map((plan) => ({
            ...plan,
            type: plan.type.toLowerCase() as PaymentPlanType,
          }))}
          onPlanSubmit={onPlanSubmitted}
          onPlanArchived={onPlanArchived}
          allowedPlanTypes={[
            paymentPlanType.SUBSCRIPTION,
            paymentPlanType.FREE,
            paymentPlanType.ONE_TIME,
            paymentPlanType.EMI,
          ]}
          currencySymbol={getSymbolFromCurrency(
            siteInfo.currencyISOCode || "USD",
          )}
          currencyISOCode={siteInfo.currencyISOCode?.toUpperCase() || "USD"}
          onDefaultPlanChanged={onDefaultPlanChanged}
          defaultPaymentPlanId={defaultPaymentPlan}
          paymentMethod={siteInfo.paymentMethod}
        />
      </div>
      <Separator className="my-8" />
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-destructive">
          {DANGER_ZONE_HEADER}
        </h3>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete Community</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action is irreversible. All community data will be
                permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {/* <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <FormField
                    label={COMMUNITY_FIELD_NAME}
                    name="name"
                    value={name || ""}
                    onChange={setName}
                    required
                />
                <div>
                    <Button type="submit">{BUTTON_SAVE}</Button>
                </div>
            </Form> */}
      <Dialog
        open={!!deletingCategory}
        onOpenChange={() => setDeletingCategory(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Please select a category to migrate the posts from &quot;
              {deletingCategory}&quot; before deleting.
            </DialogDescription>
          </DialogHeader>
          <Select
            value={migrationCategory}
            onValueChange={setMigrationCategory}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories
                .filter((c) => c !== deletingCategory)
                .map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCategory(null)}>
              Cancel
            </Button>
            <Button
              className="!bg-red-500 text-white hover:!bg-red-600"
              variant="destructive"
              onClick={confirmDeleteCategory}
            >
              {`Delete and migrate existing content to ${migrationCategory || "'None'"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
