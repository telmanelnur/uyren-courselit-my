import { TenantInfoClient } from "@/components/TenantInfoClient";
import { getDomainData, getDomainHeaders } from "@/lib/domain";

export default async function Page() {
  // Get lightweight header info
  const domainHeaders = await getDomainHeaders();
  const domainData = await getDomainData();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Welcome to the Home Page</h1>
      <p className="text-lg mb-8">
        This is the main entry point of the application.
      </p>

      <div className="bg-gray-100 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Current Domain/Tenant Information
        </h2>

        <div className="grid gap-4">
          <div className="bg-white p-4 rounded border">
            <h3 className="font-medium text-gray-700 mb-2">
              Domain Headers (lightweight):
            </h3>
            <pre className="text-sm bg-gray-50 p-2 rounded overflow-auto">
              {JSON.stringify(domainHeaders, null, 2)}
            </pre>
          </div>

          <div className="bg-white p-4 rounded border">
            <h3 className="font-medium text-gray-700 mb-2">
              Domain Data (with DB lookup):
            </h3>
            <pre className="text-sm bg-gray-50 p-2 rounded overflow-auto">
              {JSON.stringify(domainData, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Client-side component for tRPC example */}
      <div className="mb-6">
        <TenantInfoClient />
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <h3 className="font-medium text-blue-800 mb-2">How this works:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            • <strong>Middleware</strong> analyzes the domain and sets headers
          </li>
          <li>
            • <strong>getDomainHeaders()</strong> - lightweight, headers only
          </li>
          <li>
            • <strong>getDomainData()</strong> - includes database lookup
          </li>
          <li>
            • <strong>Database lookup</strong> is only performed when needed
          </li>
          <li>
            • Everything is <strong>edge-compatible</strong> for optimal
            performance
          </li>
        </ul>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="font-medium mb-4">Usage Examples:</h3>
        <div className="space-y-3 text-sm">
          <div>
            <strong className="text-gray-700">Headers Only (fast):</strong>
            <code className="block bg-white p-2 mt-1 rounded border text-xs">
              {`const headers = await getDomainHeaders(); // No DB calls`}
            </code>
          </div>
          <div>
            <strong className="text-gray-700">Full Data (with DB):</strong>
            <code className="block bg-white p-2 mt-1 rounded border text-xs">
              {`const data = await getDomainData(); // Includes DB lookup`}
            </code>
          </div>
          <div>
            <strong className="text-gray-700">Client Components (tRPC):</strong>
            <code className="block bg-white p-2 mt-1 rounded border text-xs">
              {`const { data } = trpc.siteModule.domain.getCurrentDomain.useQuery();`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
