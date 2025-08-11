"use client";

import { trpc } from "@/utils/trpc";

export function TenantInfoClient() {
  const query = trpc.siteModule.domain.getCurrentDomain.useQuery();

  if (query.isLoading) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
        <p className="text-yellow-800">Loading domain information...</p>
      </div>
    );
  }

  if (query.error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded">
        <p className="text-red-800">
          Error loading domain info: {query.error.message}
        </p>
      </div>
    );
  }

  const { domainHeaders, domainData } = query.data!;

  return (
    <div className="bg-green-50 border border-green-200 p-4 rounded">
      <h3 className="font-medium text-green-800 mb-2">
        Client-side Domain Info (via tRPC Hook):
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-3 rounded border">
          <h4 className="font-medium mb-2">Headers Data:</h4>
          <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
            {JSON.stringify(domainHeaders, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-3 rounded border">
          <h4 className="font-medium mb-2">Computed Properties:</h4>
          <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
            {JSON.stringify(domainData, null, 2)}
          </pre>
        </div>
      </div>

      <div className="text-sm text-green-700">
        <p>
          <strong>Usage:</strong> Use <code>useTenantInfo()</code> for raw data
          or <code>useTenantProperties()</code> for computed values.
        </p>
      </div>
    </div>
  );
}
