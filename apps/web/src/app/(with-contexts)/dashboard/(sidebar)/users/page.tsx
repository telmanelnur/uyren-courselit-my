import { Metadata, ResolvingMetadata } from "next";
import UsersHub from "./users-hub";

export async function generateMetadata(
    {
        params,
        searchParams,
    }: {
        params: any;
        searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    },
    parent: ResolvingMetadata,
): Promise<Metadata> {
    const tab = (await searchParams)?.["tab"] || "All users";

    return {
        title: `${tab} | ${(await parent)?.title?.absolute}`,
    };
}

export default function Page() {
    return <UsersHub />;
}
