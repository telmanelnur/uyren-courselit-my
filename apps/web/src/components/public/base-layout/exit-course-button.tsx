import React from "react";
import { Button2, Tooltip } from "@workspace/components-library";
import Link from "next/link";
import { Exit } from "@workspace/icons";
import { BTN_EXIT_COURSE, BTN_EXIT_COURSE_TOOLTIP } from "@/lib/ui/config/strings";

function ExitCourseButton() {
    return (
        <Link href="/dashboard/my-content">
            <Tooltip title={BTN_EXIT_COURSE_TOOLTIP}>
                <Button2 variant="secondary" className="flex gap-2">
                    <Exit /> {BTN_EXIT_COURSE}
                </Button2>
            </Tooltip>
        </Link>
    );
}

export default ExitCourseButton;
