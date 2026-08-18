"use client";

// MOCK DATA - the category list below is useState seed data and edits are
// local only. /v1/categories exists and is already consumed elsewhere via
// features/stores/api/categories.client.ts, so this page could be wired for
// real with little work. See docs/connection-audit.md §7.
import { useState } from "react";
import {
  Grid,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  FolderPlus,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([
    {
      id: "cat_01",
      name: "Grocery & Fresh Produce",
      slug: "grocery-fresh-produce",
      icon: "🥦",
      storesCount: 42,
      productsCount: 650,
      active: true,
    },
    {
      id: "cat_02",
      name: "Bakery & Desserts",
      slug: "bakery-desserts",
      icon: "🥐",
      storesCount: 28,
      productsCount: 310,
      active: true,
    },
    {
      id: "cat_03",
      name: "Electronics & Gadgets",
      slug: "electronics-gadgets",
      icon: "⚡",
      storesCount: 35,
      productsCount: 890,
      active: true,
    },
    {
      id: "cat_04",
      name: "Café & Artisanal Coffee",
      slug: "cafe-artisanal-coffee",
      icon: "☕",
      storesCount: 19,
      productsCount: 180,
      active: true,
    },
    {
      id: "cat_05",
      name: "Fashion & Local Apparel",
      slug: "fashion-local-apparel",
      icon: "👗",
      storesCount: 24,
      productsCount: 420,
      active: true,
    },
  ]);

  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("🏷️");
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat = {
      id: `cat_${Date.now()}`,
      name: newCatName.trim(),
      slug: newCatName.toLowerCase().replace(/\s+/g, "-"),
      icon: newCatIcon || "🏷️",
      storesCount: 0,
      productsCount: 0,
      active: true,
    };

    setCategories([...categories, newCat]);
    setNewCatName("");
    setShowAddModal(false);
  };

  const toggleStatus = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
    );
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] flex items-center gap-3">
            <Grid className="w-7 h-7 text-[var(--brand-core)]" />
            Marketplace Category Management
          </h1>
          <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
            Organize marketplace taxonomies for store categories, product
            tagging, and search filters.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-[var(--brand-core)] hover:bg-sky-400 text-white font-bold text-sm shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-6 rounded-3xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 backdrop-blur-md space-y-4 hover:border-sky-500/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[var(--background-primary)] border border-[var(--border-default)] flex items-center justify-center text-2xl shadow-sm">
                  {cat.icon}
                </div>
                <button
                  onClick={() => toggleStatus(cat.id)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                    cat.active
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/30"
                  }`}
                >
                  {cat.active ? "ACTIVE" : "DISABLED"}
                </button>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {cat.name}
                </h3>
                <p className="text-xs font-mono text-[var(--text-tertiary)] mt-0.5">
                  /{cat.slug}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-light)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>{cat.storesCount} Stores</span>
              <span>{cat.productsCount} Products</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl border border-[var(--border-default)] bg-[var(--background-primary)] space-y-6 shadow-2xl">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              Create New Category
            </h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Home & Living"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-secondary)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">
                  Emoji Icon
                </label>
                <input
                  type="text"
                  placeholder="e.g. 🏡"
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--background-secondary)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-tertiary)] hover:bg-[var(--background-tertiary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--brand-core)] text-white text-xs font-bold shadow-md hover:bg-sky-400 transition-colors"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
