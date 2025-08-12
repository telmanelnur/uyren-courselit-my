import { Metadata, ResolvingMetadata } from "next";
import MailHub from "./mail-hub";

export async function generateMetadata(
    {
        params,
        searchParams,
    }: {
        params: Promise<{ [key: string]: string | string[] | undefined }>;
        searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    },
    parent: ResolvingMetadata,
): Promise<Metadata> {
    const tab = (await searchParams)?.["tab"] || "Broadcasts";

    return {
        title: `${tab} | ${(await parent)?.title?.absolute}`,
    };
}

export default function Page() {
    return <MailHub />;
}
