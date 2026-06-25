"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Product {
  id: string;
  name: string;
  price: number;
}

export default function StorePage() {
  const params = useParams();

  // Safe extraction for dynamic parameters strings or array fallbacks
  const storeId = Array.isArray(params?.storeId)
    ? params.storeId[0]
    : params?.storeId || "";

  // Local Component States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounce Effect: Delays the search execution until typing pauses
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 whenever search filters change
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Data Fetching Pipeline: Corrected with an ignore latch to block race conditions
  useEffect(() => {
    if (!storeId) return;

    let activeQueryThread = true; // Flag guard to track effect lifecycle

    const fetchProducts = async () => {
      setLoading(true);
      try {
        // 1. Simulate a 600ms network database latency delay
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Block stale execution context changes from updating states if a new one started
        if (!activeQueryThread) return;

        // 2. Structural mock inventory database state pool
        const mockInventoryPool: Product[] = [
          {
            id: "PROD-001",
            name: "Premium Wireless Headphones",
            price: 129.99,
          },
          { id: "PROD-002", name: "Mechanical Gaming Keyboard", price: 89.5 },
          { id: "PROD-003", name: "Ergonomic Office Chair", price: 249.0 },
          { id: "PROD-004", name: "UltraWide 4K Monitor", price: 399.99 },
          { id: "PROD-005", name: "Smart Fitness Watch", price: 59.95 },
          { id: "PROD-006", name: "USB-C Multi-Port Hub", price: 34.99 },
          { id: "PROD-007", name: "Portable SSD 1TB", price: 115.0 },
          { id: "PROD-008", name: "Minimalist Leather Wallet", price: 45.0 },
        ];

        // 3. Filter data based on active debounced input
        const filteredItems = mockInventoryPool.filter((item) =>
          item.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
        );

        // 4. Handle pagination segments math (3 items per segment)
        const itemsPerPage = 3;
        const computedTotalPages =
          Math.ceil(filteredItems.length / itemsPerPage) || 1;

        const startIndex = (page - 1) * itemsPerPage;
        const paginatedItems = filteredItems.slice(
          startIndex,
          startIndex + itemsPerPage,
        );

        // 5. Update local view state context safely if this remains the primary task thread
        if (activeQueryThread) {
          setProducts(paginatedItems);
          setTotalPages(computedTotalPages);
        }
      } catch (error) {
        console.error("Failed to fetch mock data array:", error);
      } finally {
        if (activeQueryThread) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    // Cleanup statement kills the capability of dead async closures updating parameters
    return () => {
      activeQueryThread = false;
    };
  }, [storeId, debouncedSearch, page]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Header Information Panel */}
      <header className="border-b pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Store Management Portal
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Active Store Code:{" "}
            <span className="font-mono bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-xs font-semibold">
              {storeId || "No active parameter found"}
            </span>
          </p>
        </div>
      </header>

      {/* Controller Section: Input Fields & Real-time Flags */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Inventory Search Filter
        </label>
        <input
          type="text"
          placeholder="Filter by product title (e.g., 'watch', 'keyboard')..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
        />
        <div className="flex justify-between items-center mt-2 text-xs text-gray-400 font-mono">
          <span>Typing State: &quot;{searchTerm}&quot;</span>
          <span>Debounced Server Query: &quot;{debouncedSearch}&quot;</span>
        </div>
      </div>

      {/* Main Content Area: Tabular Inventory Render */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden min-h-[300px] flex flex-col justify-between">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-semibold text-gray-700">
            Stock Inventory (Mock Backend)
          </h2>
        </div>

        <div className="p-4 flex-grow">
          {loading ? (
            <div className="h-48 flex items-center justify-center text-gray-400 space-x-2">
              <svg
                className="animate-spin h-5 w-5 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Querying local simulation state...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-md">
              <p className="text-gray-400 italic text-sm">
                No inventory records match your criteria.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="py-3 flex justify-between items-center hover:bg-gray-50 px-2 rounded-md transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800 text-sm">
                      {product.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      ID: {product.id}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer Element: Pagination Controls */}
        <div className="border-t border-gray-100 p-4 bg-gray-50/50 flex justify-between items-center text-sm">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1 || loading}
            className="px-4 py-1.5 border border-gray-200 rounded bg-white text-gray-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
          >
            Previous
          </button>

          <span className="text-gray-500 font-medium">
            Page <span className="text-gray-800">{page}</span> of{" "}
            <span className="text-gray-800">{totalPages}</span>
          </span>

          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages || loading}
            className="px-4 py-1.5 border border-gray-200 rounded bg-white text-gray-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
