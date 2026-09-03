"use client";

import React, { useState, useMemo } from "react";
import {
  Store,
  Search,
  Plus,
  Pencil,
  Eye,
  Pause,
  Play,
  AlertTriangle,
  TicketCheck,
  DollarSign,
  type LucideIcon,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────
type StoreStatus = "online" | "offline" | "issue";

interface StoreRecord {
  id: string;
  name: string;
  status: StoreStatus;
  sales: string;
  traffic: string;
}

interface Kpi {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
  icon: LucideIcon;
}

interface StatusConfigEntry {
  label: string;
  dotStyle: React.CSSProperties;
  pillStyle: React.CSSProperties;
  ping: boolean;
}

// ── Mock data (swap for real fetches) ───────────────────────────────────
const MOCK_KPIS: Kpi[] = [
  {
    id: "active-stores",
    label: "Active Stores",
    value: "128",
    delta: "+4 this week",
    trend: "up",
    icon: Store,
  },
  {
    id: "daily-sales",
    label: "Total Daily Sales",
    value: "$84,210",
    delta: "+12.3% vs yesterday",
    trend: "up",
    icon: DollarSign,
  },
  {
    id: "support-tickets",
    label: "Open Support Tickets",
    value: "17",
    delta: "3 unassigned",
    trend: "flat",
    icon: TicketCheck,
  },
  {
    id: "system-alerts",
    label: "System Alerts",
    value: "5",
    delta: "2 critical",
    trend: "down",
    icon: AlertTriangle,
  },
];

const MOCK_STORES: StoreRecord[] = [
  {
    id: "STR-1042",
    name: "Riverside Market",
    status: "online",
    sales: "$2,140",
    traffic: "312 visits",
  },
  {
    id: "STR-1043",
    name: "Northgate Outlet",
    status: "online",
    sales: "$1,870",
    traffic: "289 visits",
  },
  {
    id: "STR-1044",
    name: "Harbor Point",
    status: "issue",
    sales: "$640",
    traffic: "94 visits",
  },
  {
    id: "STR-1045",
    name: "Cedar & Vine",
    status: "offline",
    sales: "$0",
    traffic: "0 visits",
  },
  {
    id: "STR-1046",
    name: "Union Square Kiosk",
    status: "online",
    sales: "$3,015",
    traffic: "455 visits",
  },
  {
    id: "STR-1047",
    name: "Lakeside Annex",
    status: "online",
    sales: "$1,220",
    traffic: "201 visits",
  },
];

const STATUS_CONFIG: Record<StoreStatus, StatusConfigEntry> = {
  online: {
    label: "Online",
    dotStyle: { background: "var(--md-sys-color-primary)" },
    pillStyle: {
      background: "var(--md-sys-color-primary-container)",
      color: "var(--md-sys-color-on-primary-container)",
    },
    ping: true,
  },
  issue: {
    label: "Issue",
    dotStyle: { background: "var(--md-sys-color-error)" },
    pillStyle: {
      background: "var(--md-sys-color-error-container)",
      color: "var(--md-sys-color-on-error-container)",
    },
    ping: true,
  },
  offline: {
    label: "Offline",
    dotStyle: { background: "var(--border-strong)" },
    pillStyle: {
      background: "var(--background-tertiary)",
      color: "var(--text-secondary)",
    },
    ping: false,
  },
};

// ── Top bar: search, primary action ─────────────────────────────────────
interface TopBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onAddStore: () => void;
}

function TopBar({ query, onQueryChange, onAddStore }: TopBarProps) {
  return (
    <header
      className="sticky top-0 z-20 backdrop-blur"
      style={{
        background:
          "color-mix(in srgb, var(--background-elevated) 90%, transparent)",
        borderBottom: "1px solid var(--border-default)",
      }}
    >
      <div className="flex items-center gap-3 h-16 px-4 sm:px-6">
        {/* Search bar — filters the store grid below */}
        <div className="flex-1 max-w-sm relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-secondary)" }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Find a store by name or ID…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
            style={{
              background: "var(--background-secondary)",
              border: "1px solid var(--border-default)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Primary action */}
        <button
          onClick={onAddStore}
          className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg transition-opacity hover:opacity-90 whitespace-nowrap ml-auto"
          style={{
            background: "var(--brand-core)",
            color: "var(--md-sys-color-on-primary)",
          }}
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add New Store</span>
        </button>
      </div>
    </header>
  );
}

// ── KPI card ─────────────────────────────────────────────────────────────
function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon;
  const trendColorVar =
    kpi.trend === "up"
      ? "var(--md-sys-color-primary)"
      : kpi.trend === "down"
        ? "var(--md-sys-color-error)"
        : "var(--text-secondary)";

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{
        background: "var(--background-elevated)",
        border: "1px solid var(--border-default)",
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          {kpi.label}
        </span>
        <Icon size={16} style={{ color: "var(--text-secondary)" }} />
      </div>
      <div
        className="font-mono text-2xl font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        {kpi.value}
      </div>
      <span className="text-xs font-medium" style={{ color: trendColorVar }}>
        {kpi.delta}
      </span>
    </div>
  );
}

// ── Status badge (shared by table + mobile cards) ───────────────────────
function StatusBadge({ status }: { status: StoreStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.offline;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
      style={cfg.pillStyle}
    >
      <span className="relative flex h-2 w-2">
        {cfg.ping && (
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
            style={cfg.dotStyle}
          />
        )}
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={cfg.dotStyle}
        />
      </span>
      {cfg.label}
    </span>
  );
}

// ── Row actions ──────────────────────────────────────────────────────────
interface RowActionsProps {
  store: StoreRecord;
  onEdit: (store: StoreRecord) => void;
  onView: (store: StoreRecord) => void;
  onTogglePause: (store: StoreRecord) => void;
}

function RowActions({ store, onEdit, onView, onTogglePause }: RowActionsProps) {
  const isPaused = store.status === "offline";
  const iconBtnStyle: React.CSSProperties = { color: "var(--text-secondary)" };
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onView(store)}
        title="View details"
        className="p-1.5 rounded-md transition-colors hover:opacity-70"
        style={iconBtnStyle}
      >
        <Eye size={16} />
      </button>
      <button
        onClick={() => onEdit(store)}
        title="Edit store"
        className="p-1.5 rounded-md transition-colors hover:opacity-70"
        style={iconBtnStyle}
      >
        <Pencil size={16} />
      </button>
      <button
        onClick={() => onTogglePause(store)}
        title={isPaused ? "Resume operations" : "Pause operations"}
        className="p-1.5 rounded-md transition-colors hover:opacity-70"
        style={iconBtnStyle}
      >
        {isPaused ? <Play size={16} /> : <Pause size={16} />}
      </button>
    </div>
  );
}

// ── Store table (desktop) ───────────────────────────────────────────────
interface StoreListProps {
  stores: StoreRecord[];
  onEdit: (store: StoreRecord) => void;
  onView: (store: StoreRecord) => void;
  onTogglePause: (store: StoreRecord) => void;
}

function StoreTable({ stores, onEdit, onView, onTogglePause }: StoreListProps) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr
          className="text-left text-xs"
          style={{ borderBottom: "1px solid var(--border-default)" }}
        >
          <th
            className="py-3 pr-4 font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Store
          </th>
          <th
            className="py-3 pr-4 font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Status
          </th>
          <th
            className="py-3 pr-4 font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Today&apos;s Sales
          </th>
          <th
            className="py-3 pr-4 font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Traffic
          </th>
          <th
            className="py-3 pr-4 font-medium text-right"
            style={{ color: "var(--text-secondary)" }}
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {stores.map((store) => (
          <tr
            key={store.id}
            className="transition-colors"
            style={{ borderBottom: "1px solid var(--border-light)" }}
          >
            <td className="py-3 pr-4">
              <div
                className="font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {store.name}
              </div>
              <div
                className="text-xs font-mono"
                style={{ color: "var(--text-secondary)" }}
              >
                {store.id}
              </div>
            </td>
            <td className="py-3 pr-4">
              <StatusBadge status={store.status} />
            </td>
            <td
              className="py-3 pr-4 font-mono"
              style={{ color: "var(--text-primary)" }}
            >
              {store.sales}
            </td>
            <td
              className="py-3 pr-4"
              style={{ color: "var(--text-secondary)" }}
            >
              {store.traffic}
            </td>
            <td className="py-3 pr-4">
              <div className="flex justify-end">
                <RowActions
                  store={store}
                  onEdit={onEdit}
                  onView={onView}
                  onTogglePause={onTogglePause}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Store cards (mobile) ────────────────────────────────────────────────
function StoreCards({ stores, onEdit, onView, onTogglePause }: StoreListProps) {
  return (
    <div>
      {stores.map((store) => (
        <div
          key={store.id}
          className="py-3 flex items-center justify-between gap-3"
          style={{ borderBottom: "1px solid var(--border-light)" }}
        >
          <div>
            <div
              className="font-medium text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              {store.name}
            </div>
            <div
              className="text-xs font-mono"
              style={{ color: "var(--text-secondary)" }}
            >
              {store.id}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={store.status} />
              <span
                className="text-xs font-mono"
                style={{ color: "var(--text-secondary)" }}
              >
                {store.sales}
              </span>
            </div>
          </div>
          <RowActions
            store={store}
            onEdit={onEdit}
            onView={onView}
            onTogglePause={onTogglePause}
          />
        </div>
      ))}
    </div>
  );
}

// ── Main dashboard ───────────────────────────────────────────────────────
export default function MultiStoreDashboard() {
  const [query, setQuery] = useState<string>("");

  // Filters the mock list client-side; swap for a server-side search
  // query (e.g. GET /api/stores?q=...) once this is wired to a backend.
  const filteredStores = useMemo<StoreRecord[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_STORES;
    return MOCK_STORES.filter(
      (s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q),
    );
  }, [query]);

  // ── Action stubs — replace with real API calls / navigation ──────────
  const handleAddStore = () => console.log("TODO: open 'Add New Store' flow");
  const handleEdit = (store: StoreRecord) =>
    console.log("TODO: edit store", store.id);
  const handleView = (store: StoreRecord) =>
    console.log("TODO: navigate to store detail", store.id);
  const handleTogglePause = (store: StoreRecord) =>
    console.log("TODO: toggle pause for", store.id);

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--background-primary)" }}
    >
      <TopBar
        query={query}
        onQueryChange={setQuery}
        onAddStore={handleAddStore}
      />

      <main className="px-4 sm:px-6 py-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Global KPIs */}
        <section aria-label="Global performance summary">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_KPIS.map((kpi) => (
              <KpiCard key={kpi.id} kpi={kpi} />
            ))}
          </div>
        </section>

        {/* Store management grid/table */}
        <section
          aria-label="Store list"
          className="rounded-xl"
          style={{
            background: "var(--background-elevated)",
            border: "1px solid var(--border-default)",
          }}
        >
          <div
            className="flex items-center justify-between px-4 sm:px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-default)" }}
          >
            <h2
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Stores{" "}
              <span
                className="font-normal"
                style={{ color: "var(--text-secondary)" }}
              >
                ({filteredStores.length})
              </span>
            </h2>
          </div>

          <div className="px-4 sm:px-5">
            {filteredStores.length === 0 ? (
              <div
                className="py-10 text-center text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                No stores match &quot;{query}&quot;.
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden sm:block">
                  <StoreTable
                    stores={filteredStores}
                    onEdit={handleEdit}
                    onView={handleView}
                    onTogglePause={handleTogglePause}
                  />
                </div>
                {/* Mobile card list */}
                <div className="sm:hidden">
                  <StoreCards
                    stores={filteredStores}
                    onEdit={handleEdit}
                    onView={handleView}
                    onTogglePause={handleTogglePause}
                  />
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
