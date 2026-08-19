"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useActiveStore } from "../hooks/useActiveStore";
import { Store, ChevronDown, Check, Plus, Building2 } from "lucide-react";

interface StoreItem {
  id: string;
  storeName: string;
}

interface StoreSelectorDropdownProps {
  stores?: StoreItem[];
  isLoading?: boolean;
}

export function StoreSelectorDropdown({
  stores = [],
  isLoading = false,
}: StoreSelectorDropdownProps) {
  const { activeStoreId, setActiveStoreId, clearActiveStore } =
    useActiveStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeStore = stores.find((s) => s.id === activeStoreId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-[var(--background-secondary)] hover:bg-[var(--background-elevated)] text-[var(--text-primary)] transition-all shadow-sm focus:outline-none"
        style={{ borderColor: "var(--border-light)" }}
        aria-expanded={isOpen}
      >
        <Store className="w-4 h-4 text-[var(--brand-core)] shrink-0" />
        <span className="text-xs font-semibold truncate max-w-[150px] sm:max-w-[200px]">
          {activeStore ? activeStore.storeName : "All Stores"}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[var(--text-tertiary)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 mt-2 w-64 rounded-2xl bg-[var(--background-elevated)] border shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          style={{ borderColor: "var(--border-default)" }}
        >
          <div className="px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Store Context
          </div>

          {/* All Stores Option */}
          <button
            type="button"
            onClick={() => {
              clearActiveStore();
              setIsOpen(false);
            }}
            className="w-full px-3.5 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-[var(--background-secondary)] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-sky-500 shrink-0" />
              <span className="text-[var(--text-primary)] font-semibold">
                All Stores (Combined)
              </span>
            </div>
            {!activeStoreId && (
              <Check className="w-3.5 h-3.5 text-[var(--brand-core)]" />
            )}
          </button>

          <div className="my-1 border-t border-[var(--border-light)]" />

          {/* Store List */}
          <div className="max-h-48 overflow-y-auto scrollbar-thin">
            {isLoading ? (
              <div className="px-3.5 py-2 text-xs text-[var(--text-secondary)]">
                Loading stores…
              </div>
            ) : stores && stores.length > 0 ? (
              stores.map((store) => {
                const isSelected = activeStoreId === store.id;
                return (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => {
                      setActiveStoreId(store.id);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-[var(--background-secondary)] transition-colors ${
                      isSelected ? "bg-[var(--background-secondary)]/60" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Store className="w-4 h-4 text-[var(--brand-core)] shrink-0" />
                      <span className="text-[var(--text-primary)] truncate">
                        {store.storeName}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[var(--brand-core)] shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3.5 py-2 text-xs text-[var(--text-secondary)]">
                No stores registered yet.
              </div>
            )}
          </div>

          <div className="my-1 border-t border-[var(--border-light)]" />

          {/* Add New Store */}
          <Link
            href="/seller/manage-stores"
            onClick={() => setIsOpen(false)}
            className="px-3.5 py-2 text-xs font-medium text-[var(--brand-core)] hover:bg-[var(--background-secondary)] flex items-center gap-2 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add or manage stores</span>
          </Link>
        </div>
      )}
    </div>
  );
}
