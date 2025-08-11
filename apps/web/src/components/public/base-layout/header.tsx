import React from "react";
import { IconButton } from "@workspace/components-library";
import { Menu } from "@workspace/icons";
import SessionButton from "../session-button";
import Branding from "./branding";
import ExitCourseButton from "./exit-course-button";
import { useRouter } from "next/router";

interface HeaderProps {
    onMenuClick?: (...args: any[]) => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
    const router = useRouter();
    const currentCoursePathName = router.pathname;

    const coursePathName = [
        "/course/[slug]/[id]",
        "/course/[slug]/[id]/[lesson]",
    ];

    return (
        <header className="flex w-full z-10 justify-between">
            {onMenuClick && (
                <IconButton
                    className="px-2 md:!hidden"
                    variant="soft"
                    onClick={onMenuClick}
                >
                    <Menu />
                </IconButton>
            )}
            <Branding />
            {coursePathName.includes(currentCoursePathName) ? (
                <ExitCourseButton />
            ) : (
                <SessionButton />
            )}
        </header>
    );
};

export default Header;
