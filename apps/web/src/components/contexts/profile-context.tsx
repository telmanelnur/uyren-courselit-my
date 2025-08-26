"use client";

import { TOAST_TITLE_ERROR } from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import { Profile } from "@workspace/common-models";
import { useSession, signOut } from "next-auth/react";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { useToast } from "@workspace/components-library";
import { defaultState } from "./default-state";

type ProfileContextType = {
  profile: Profile;
  setProfile: Dispatch<SetStateAction<Profile>>;
};

export const ProfileContext = createContext<ProfileContextType>({
  profile: defaultState.profile,
  setProfile: () => {
    throw new Error("setProfile function not implemented");
  },
});

export const ProfileProvider = ({
  children,
}: PropsWithChildren<{
  // defaultProfile: ProfileType;
}>) => {
  const session = useSession();
  const [profile, setProfile] = useState<Profile>(defaultState.profile);
  const { toast } = useToast();

  const { data: userProfile, error } =
    trpc.userModule.user.getProfileProtected.useQuery(undefined, {
      retry: false,
      enabled: !!session.data?.user,
    });

  useEffect(() => {
    if (userProfile) {
      setProfile({
        name: userProfile.name || "",
        id: userProfile.id,
        fetched: true,
        purchases: userProfile.purchases,
        email: userProfile.email,
        bio: userProfile.bio || "",
        permissions: userProfile.permissions,
        userId: userProfile.userId,
        avatar: userProfile.avatar || {},
        subscribedToUpdates: userProfile.subscribedToUpdates,
      });
    }
  }, [userProfile]);

  useEffect(() => {
    if (error) {
      // Handle authentication errors (401/403) - trigger sign-out
      if (
        error.data?.code === "UNAUTHORIZED" ||
        error.data?.code === "FORBIDDEN"
      ) {
        toast({
          title: "Session expired",
          description: "Please log in again to continue",
          variant: "destructive",
        });

        // Sign out and redirect to login
        signOut({ callbackUrl: "/auth/login" });
        return;
      }

      // Handle other errors
      toast({
        title: TOAST_TITLE_ERROR,
        description: error.data?.message || error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
