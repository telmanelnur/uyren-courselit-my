import React from "react";
import useCourse from "../course-hook";
import Students from "./students";
import { Address } from "@workspace/common-models";
import { AppDispatch } from "@workspace/state-management";

interface CourseReportsProps {
    id: string;
    address: Address;
    loading?: boolean;
    dispatch?: AppDispatch;
}

export default function CourseReports({
    id,
    address,
    loading = false,
    dispatch,
}: CourseReportsProps) {
    let course = useCourse(id, address);

    if (!course) {
        return null;
    }

    return (
        <div>
            <Students
                course={course}
                address={address}
                loading={loading}
                dispatch={dispatch}
            />
        </div>
    );
}
