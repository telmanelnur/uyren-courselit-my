import { verifyDomainFromHost } from "@/lib/domain-verification";

export async function GET(request: Request) {
    const host = request.headers.get("host");

    if (!host) {
        return Response.json(
            {
                message: "Domain is missing",
            },
            {
                status: 404,
            },
        );
    }

    const result = await verifyDomainFromHost(host);

    if (result.error) {
        return Response.json(
            {
                message: result.error,
            },
            {
                status: result.status || 404,
            },
        );
    }

    return Response.json({
        success: true,
        domain: result.domain!.name,
        logo: result.domain!.settings?.logo?.file,
    });
}
