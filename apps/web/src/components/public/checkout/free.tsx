import React, { useState } from "react";
import { ENROLL_BUTTON_TEXT, TOAST_TITLE_ERROR } from "@/lib/ui/config/strings";
import { connect } from "react-redux";
import { useRouter } from "next/router";
import { actionCreators } from "@workspace/state-management";
import type { Address, Course } from "@workspace/common-models";
import type { AppDispatch, AppState } from "@workspace/state-management";
import { FetchBuilder } from "@workspace/utils";
import { refreshUserProfile } from "@workspace/state-management/dist/action-creators";
import { Button2, useToast } from "@workspace/components-library";

const { networkAction } = actionCreators;

interface FreeProps {
  course: Course;
  dispatch: AppDispatch;
  address: Address;
}

const Free = ({ course, dispatch, address }: FreeProps) => {
  const router = useRouter();
  const [disabled, setDisabled] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    const payload = {
      courseid: course.courseId,
    };
    const fetch = new FetchBuilder()
      .setUrl(`${address.backend}/api/payment/initiate`)
      .setHeaders({
        "Content-Type": "application/json",
      })
      .setPayload(JSON.stringify(payload))
      .build();

    try {
      setDisabled(true);
      dispatch(networkAction(true));

      const response = await fetch.exec({
        redirectToOnUnAuth: router.asPath,
      });

      if (response.status === "success") {
        dispatch(refreshUserProfile());
        router.replace(`/dashboard/my-content`);
      } else if (response.status === "failed") {
        toast({
          title: TOAST_TITLE_ERROR,
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: TOAST_TITLE_ERROR,
        description: err.message,
        variant: "destructive",
      });
    } finally {
      dispatch(networkAction(false));
      setDisabled(false);
    }
  };

  return (
    <Button2 onClick={handleClick} disabled={disabled}>
      {ENROLL_BUTTON_TEXT}
    </Button2>
  );
};

const mapStateToProps = (state: AppState) => ({
  address: state.address,
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  dispatch: dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(Free);
