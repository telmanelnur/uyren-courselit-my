import React from "react";
import { Button, Link as PageLink } from "@workspace/page-primitives";
import { Link as AppLink } from "@workspace/components-library";
import { ThemeStyle } from "@workspace/page-models";

export default function Link({
    href,
    theme,
    linkFontWeight,
    onClick,
    isButton,
    label,
}: {
    href: string;
    theme: ThemeStyle;
    linkFontWeight: string;
    onClick?: () => void;
    isButton: boolean;
    label: string;
}) {
    return (
        <AppLink href={href} className={`${linkFontWeight}`} onClick={onClick}>
            {isButton && (
                <Button size="sm" theme={theme}>
                    {label}
                </Button>
            )}
            {!isButton && <PageLink theme={theme}>{label}</PageLink>}
        </AppLink>
    );
}
