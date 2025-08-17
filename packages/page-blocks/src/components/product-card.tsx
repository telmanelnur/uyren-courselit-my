import { Image, Link } from "@workspace/components-library";
import { ThemeStyle } from "@workspace/page-models";
import { Badge, PageCard, PageCardContent, PageCardHeader, PageCardImage, Subheader1 } from "@workspace/page-primitives";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function ProductCard({
    title,
    user,
    theme,
    href,
    image,
    badgeChildren,
}: {
    title: string;
    user?: {
        name: string;
        thumbnail: string;
    };
    theme?: ThemeStyle;
    href: string;
    image: string;
    badgeChildren?: any;
}) {
    return (
        <Link href={href} className="flex">
            <PageCard
                isLink={true}
                className="flex flex-col overflow-hidden"
                theme={theme}
            >
                <PageCardImage
                    src={image}
                    alt={title}
                    className="aspect-video object-cover"
                    theme={theme}
                />
                <PageCardContent theme={theme} className="flex flex-col grow">
                    <PageCardHeader theme={theme} className="grow">
                        {title}
                    </PageCardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Image
                                src={user?.thumbnail || "/courselit_backdrop_square.webp"}
                                alt={user?.name || "User Avatar"}
                                width="w-8"
                                height="h-8"
                                className="rounded-full"
                                objectFit="cover"
                            />
                            <Subheader1 theme={theme}>{user?.name}</Subheader1>
                        </div>
                        {badgeChildren && (
                            <Badge theme={theme}>{badgeChildren}</Badge>
                        )}
                    </div>
                </PageCardContent>
            </PageCard>
        </Link>
    );
}

export function ProductCardSkeleton({ theme }: { theme?: ThemeStyle }) {
    return (
        <PageCard className="overflow-hidden" theme={theme}>
            <Skeleton className="aspect-video w-full" />
            <PageCardContent theme={theme}>
                <Skeleton className="h-6 w-3/4 mb-4" />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-6 w-24" />
                </div>
            </PageCardContent>
        </PageCard>
    );
}
