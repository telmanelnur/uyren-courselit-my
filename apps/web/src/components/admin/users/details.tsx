import {
  PAGE_HEADER_EDIT_USER,
  SWITCH_ACCOUNT_ACTIVE,
  TOAST_TITLE_ERROR,
  USER_BASIC_DETAILS_HEADER,
  USER_EMAIL_SUBHEADER,
  USER_NAME_SUBHEADER,
  USER_TAGS_SUBHEADER,
  USERS_MANAGER_PAGE_HEADING,
} from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import type { Address, UserWithAdminFields } from "@workspace/common-models";
import {
  Breadcrumbs,
  ComboBox,
  Link,
  Section,
  Switch,
  useToast,
} from "@workspace/components-library";
import { useCallback, useEffect, useState } from "react";
import PermissionsEditor from "./permissions-editor";

interface DetailsProps {
  userId: string;
  address: Address;
}

const Details = ({ userId, address }: DetailsProps) => {
  const [userData, setUserData] = useState<UserWithAdminFields>();
  //   const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [tags, setTags] = useState<string[]>([]);
  const { toast } = useToast();

  const getUserQuery = trpc.userModule.user.getByUserId.useQuery({ userId });

  useEffect(() => {
    if (getUserQuery.data) {
      setUserData(getUserQuery.data as any);
    }
  }, [getUserQuery.data]);

  useEffect(() => {
    if (getUserQuery.error) {
      toast({
        title: TOAST_TITLE_ERROR,
        description: getUserQuery.error.message,
        variant: "destructive",
      });
    }
  }, [getUserQuery.error]);

  const tagsQuery = trpc.userModule.tag.list.useQuery();
  useEffect(() => {
    if (tagsQuery.data) {
      setTags(tagsQuery.data);
    }
  }, [tagsQuery.data]);

  //   const enrolledCoursesQuery =
  //     trpc.courseModule.course.getEnrolledCourses.useQuery({ userId });
  //   useEffect(() => {
  //     if (enrolledCoursesQuery.data) {
  //       setEnrolledCourses(enrolledCoursesQuery.data);
  //     }
  //   }, [enrolledCoursesQuery.data]);

  // tRPC equivalent for active state
  const updateUserMutation = trpc.userModule.user.update.useMutation();
  const toggleActiveState = async (value: boolean) => {
    if (!userData) return;
    try {
      const response = await updateUserMutation.mutateAsync({
        userId: userData.userId,
        data: {
          active: value,
        },
      });
      if (response) {
        setUserData({
          ...response,
          tags: response.tags || [],
        });
      }
    } catch (err: any) {
      toast({
        title: TOAST_TITLE_ERROR,
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // tRPC equivalent for updating tags
  const updateTags = async (tags: string[]) => {
    if (!userData) return;
    try {
      const response = await updateUserMutation.mutateAsync({
        userId: userData.userId,
        data: {
          tags,
        },
      });
      if (response) {
        setUserData(response as any);
      }
    } catch (err: any) {
      toast({
        title: TOAST_TITLE_ERROR,
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if (!userData) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs aria-label="breakcrumb">
        <Link href="/dashboard/users">{USERS_MANAGER_PAGE_HEADING}</Link>

        <p>{PAGE_HEADER_EDIT_USER}</p>
      </Breadcrumbs>
      <h1 className="text-4xl font-semibold mb-4">
        {userData.name ? userData.name : userData.email}
      </h1>
      <div className="flex gap-2">
        <Section className="md:w-1/2" header={USER_BASIC_DETAILS_HEADER}>
          <div className="flex items-center justify-between">
            <p>{USER_NAME_SUBHEADER}</p>
            <p>{userData.name || "--"}</p>
          </div>
          <div className="flex items-center justify-between">
            <p>{USER_EMAIL_SUBHEADER}</p>
            <p>
              <Link href={`mailto:${userData.email}`}>{userData.email}</Link>
            </p>
          </div>
          <div className="flex items-center justify-between">
            {SWITCH_ACCOUNT_ACTIVE}
            <Switch
              checked={userData.active}
              onChange={(value) => toggleActiveState(value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p>{USER_TAGS_SUBHEADER}</p>
            <ComboBox
              options={tags}
              selectedOptions={new Set(userData.tags)}
              onChange={updateTags}
              side="bottom"
            />
          </div>
        </Section>
        {userData.permissions && <PermissionsEditor user={userData} />}
      </div>
    </div>
  );
};

export default Details;
