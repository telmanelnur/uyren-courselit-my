import React from "react";
// import { connect } from "react-redux";
import {
  GENERIC_SIGNOUT_TEXT,
  GENERIC_SIGNIN_TEXT,
} from "@/lib/ui/config//strings";
import { Button } from "@workspace/components-library";
// import { AppState } from "@workspace/state-management";
import { signIn, signOut, useSession } from "next-auth/react";
import { useToast } from "@workspace/components-library";

export default function SessionButton() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      // NextAuth will automatically handle Firebase logout through the callback
      await signOut();

      toast({
        title: "Signed out successfully",
        description: "You have been logged out",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out error",
        description: "There was an issue signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (session) {
    return (
      <Button onClick={handleSignOut} component="button">
        {GENERIC_SIGNOUT_TEXT}
      </Button>
    );
  }

  return (
    <Button onClick={() => signIn()} component="button">
      {GENERIC_SIGNIN_TEXT}
    </Button>
  );
}

// const mapStateToProps = (state: AppState) => ({
//     auth: state.auth,
//     profile: state.profile,
// });

// export default connect(mapStateToProps)(SessionButton);
