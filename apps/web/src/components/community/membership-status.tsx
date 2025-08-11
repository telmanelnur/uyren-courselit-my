import {
  TOAST_TITLE_ERROR,
  TOAST_TITLE_SUCCESS,
} from "@/lib/ui/config/strings";
import { getPlanPrice } from "@/lib/ui/lib/utils";
import { trpc } from "@/utils/trpc";
import { Constants, Membership, PaymentPlan } from "@workspace/common-models";
import {
  CircularProgress,
  Form,
  FormField,
  getSymbolFromCurrency,
  Link,
  useToast,
} from "@workspace/components-library";
import { Clock } from "@workspace/icons";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { AlertCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { useProfile } from "../contexts/profile-context";
import { useSiteInfo } from "../contexts/site-info-context";

export default function MembershipStatus({
  id,
  membership,
  joiningReasonText,
  paymentPlan,
}: {
  id: string;
  membership?: Pick<Membership, "status" | "rejectionReason" | "role">;
  joiningReasonText?: string;
  paymentPlan: PaymentPlan;
}) {
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [joiningReason, setJoiningReason] = useState("");
  const [innerStatus, setInnerStatus] = useState(membership?.status);
  const { siteInfo } = useSiteInfo();
  const { toast } = useToast();
  const { profile } = useProfile();
  const { amount, period } = getPlanPrice(paymentPlan);
  const currencySymbol =
    getSymbolFromCurrency(siteInfo.currencyISOCode || "USD") || "$";

  const joinCommunityMutation = trpc.communityModule.community.join.useMutation(
    {
      onSuccess: () => {
        toast({
          title: TOAST_TITLE_SUCCESS,
          description: `You have successfully joined the community.`,
        });
        setInnerStatus(Constants.MembershipStatus.ACTIVE);
        setIsJoinDialogOpen(false);
      },
      onError: (error) => {
        toast({
          title: TOAST_TITLE_ERROR,
          description: error.message,
        });
      },
    }
  );

  const handleJoinSubmit = async (e: FormEvent) => {
    e.preventDefault();
    joinCommunityMutation.mutate({
      data: {
        communityId: id,
        joiningReason,
      },
    });
  };

  if (!membership) {
    return null;
  }

  if (!profile) {
    return null;
  }

  const loading = joinCommunityMutation.isPending;

  return (
    <div>
      {innerStatus?.toLowerCase() === Constants.MembershipStatus.PENDING && (
        <Alert>
          <Clock className="w-4 h-4" />
          <AlertTitle className="font-semibold">
            Membership {innerStatus?.toLowerCase()}
          </AlertTitle>
        </Alert>
      )}
      {innerStatus?.toLowerCase() === Constants.MembershipStatus.REJECTED && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-semibold">
            Membership {innerStatus?.toLowerCase()}
          </AlertTitle>
          <AlertDescription>
            Reason: {membership && membership.rejectionReason}
          </AlertDescription>
        </Alert>
      )}
      {!profile.name && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-semibold">Incomplete Profile</AlertTitle>
          <AlertDescription>
            Complete your{" "}
            <span className="underline">
              <Link href={"/dashboard/profile"}>profile</Link>
            </span>{" "}
            to join this community or post here
          </AlertDescription>
        </Alert>
      )}
      {!innerStatus && profile.name && (
        <>
          {amount > 0 && (
            <Link
              href={`/checkout?id=${id}&type=${Constants.MembershipEntityType.COMMUNITY}`}
            >
              <Button>
                Join {currencySymbol}
                {amount} {period}
              </Button>
            </Link>
          )}
          {amount <= 0 && (
            <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  Join {currencySymbol}
                  {amount} {period}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <Form onSubmit={handleJoinSubmit}>
                  <div className="space-y-4 mt-4">
                    <FormField
                      name="joiningReason"
                      label={
                        joiningReasonText ||
                        "Why do you want to join this community?"
                      }
                      value={joiningReason}
                      onChange={(e: any) => setJoiningReason(e.target.value)}
                      placeholder="Reason to join"
                      required
                    />
                    <Button type="submit" disabled={loading}>
                      {loading && <CircularProgress />}
                      Submit
                    </Button>
                  </div>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </div>
  );
}
