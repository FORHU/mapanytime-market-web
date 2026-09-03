"use client";

import { useState } from "react";
import {
  Grid,
  Plus,
  Search,
  Edit2,
  Trash2,
  FolderPlus,
  ChevronRight,
} from "lucide-react";
import {
  useAdminCategories,
  useAdminCategoryActions,
} from "@/features/adminCategories/hooks/useAdminCategories";
import type { AdminCategory } from "@/features/adminCategories/contracts/adminCategory.contract";

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDescription, setNewCatDescription] = useState("");
  const [newCatParentId, setNewCatParentId] = useState("");
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [editName, setEditName] = useState("");

  // Real taxonomy. This screen used to hold its categories in useState seed
  // data, so every edit vanished on refresh. See FLAGS.md ADM-3.
  const { data, isLoading, isError, error } = useAdminCategories();
  const { create, rename, remove } = useAdminCategoryActions();

  const roots = data ?? [];
  const term = search.trim().toLowerCase();
  const filtered = term
    ? roots
        .map((root) => ({
          ...root,
          subCategories: root.subCategories.filter((sub) =>
            sub.name.toLowerCase().includes(term),
          ),
        }))
        .filter(
          (root) =>
            root.name.toLowerCase().includes(term) ||
            root.subCategories.length > 0,
        )
    : roots;

  const totalCategories = roots.reduce(
    (sum, root) => sum + 1 + root.subCategories.length,
    0,
  );

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCatName.trim();
    if (!name) return;

    create.mutate(
      {
        name,
        description: newCatDescription.trim() || undefined,
        parentId: newCatParentId || undefined,
      },
      {
        onSuccess: () => {
          setNewCatName("");
          setNewCatDescription("");
          setNewCatParentId("");
          setShowAddModal(false);
        },
      },
    );
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    const name = editName.trim();
    if (!editing || !name) return;

    rename.mutate(
      { id: editing.id, input: { name } },
      { onSuccess: () => setEditing(null) },
    );
  };

  const handleDelete = (category: AdminCategory) => {
    const childWarning = category.subCategories.length
      ? `\n\nIt has ${category.subCategories.length} sub-categor${
          category.subCategories.length === 1 ? "y" : "ies"
        }.`
      : "";
    if (
      !window.confirm(
        `Delete "${category.name}"? Stores and products filed under it will lose this category.${childWarning}`,
      )
    ) {
      return;
    }
    remove.mutate(category.id);
  };

  // useSafeMutation types `error` as unknown, so narrow it to a message here
  // rather than rendering the raw value.
  const mutationErrorMessage = [create.error, rename.error, remove.error]
    .filter(Boolean)
    .map((e) =>
      e instanceof Error ? e.message : "That change could not be saved.",
    )
    .at(0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] flex items-center gap-3">
            <Grid className="w-7 h-7 text-[var(--brand-core)]" />
            Category Taxonomy
          </h1>
          <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
            The category tree every store and product is filed under.
            {!isLoading && !isError && ` ${totalCategories} in total.`}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--brand-core)] text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> New category
        </button>
      </div>

      <div className="relative w-full sm:w-96">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--background-primary)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)]"
        />
      </div>

      {mutationErrorMessage && (
        <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 text-xs text-rose-400">
          {mutationErrorMessage}
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 animate-pulse"
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="p-6 rounded-3xl border border-rose-500/30 bg-rose-500/5 text-sm text-rose-400">
          <p className="font-bold mb-1">Could not load categories.</p>
          <p className="text-xs opacity-80">
            {error instanceof Error ? error.message : "Please try again."}
          </p>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="p-12 rounded-3xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 text-center">
          <FolderPlus className="w-10 h-10 mx-auto mb-3 text-[var(--text-tertiary)] opacity-40" />
          <p className="font-bold text-[var(--text-primary)]">
            {term ? "No categories match that search" : "No categories yet"}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {term
              ? "Try a different term."
              : "Add the first one to start building the taxonomy."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {filtered.map((root) => (
          <div
            key={root.id}
            className="rounded-2xl border border-[var(--border-default)] bg-[var(--background-secondary)]/50 backdrop-blur-md overflow-hidden"
          >
            <div className="flex items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="font-bold text-[var(--text-primary)] truncate">
                  {root.name}
                </p>
                {root.description && (
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
                    {root.description}
                  </p>
                )}
                <p className="text-[10px] font-bold text-[var(--text-tertiary)] mt-1 uppercase tracking-wide">
                  {root.subCategories.length} sub-categor
                  {root.subCategories.length === 1 ? "y" : "ies"} ·{" "}
                  {root.status}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setEditing(root);
                    setEditName(root.name);
                  }}
                  aria-label={`Rename ${root.name}`}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)] transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(root)}
                  disabled={remove.isPending}
                  aria-label={`Delete ${root.name}`}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {root.subCategories.length > 0 && (
              <div className="border-t border-[var(--border-light)] divide-y divide-[var(--border-light)]">
                {root.subCategories.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between gap-4 px-5 py-3"
                  >
                    <span className="flex items-center gap-2 text-sm text-[var(--text-secondary)] min-w-0">
                      <ChevronRight className="w-3 h-3 shrink-0 text-[var(--text-tertiary)]" />
                      <span className="truncate">{sub.name}</span>
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditing(sub);
                          setEditName(sub.name);
                        }}
                        aria-label={`Rename ${sub.name}`}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)] transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(sub)}
                        disabled={remove.isPending}
                        aria-label={`Delete ${sub.name}`}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddCategory}
            className="w-full max-w-md rounded-3xl border border-[var(--border-default)] bg-[var(--background-primary)] p-6 space-y-4"
          >
            <h2 className="text-lg font-black text-[var(--text-primary)]">
              New category
            </h2>

            <div>
              <label
                htmlFor="cat-name"
                className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5"
              >
                Name
              </label>
              <input
                id="cat-name"
                autoFocus
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--background-secondary)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)]"
              />
            </div>

            <div>
              <label
                htmlFor="cat-desc"
                className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5"
              >
                Description <span className="font-normal">(optional)</span>
              </label>
              <input
                id="cat-desc"
                value={newCatDescription}
                onChange={(e) => setNewCatDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--background-secondary)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)]"
              />
            </div>

            <div>
              <label
                htmlFor="cat-parent"
                className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5"
              >
                Parent
              </label>
              <select
                id="cat-parent"
                value={newCatParentId}
                onChange={(e) => setNewCatParentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--background-secondary)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)]"
              >
                <option value="">None — this is a root category</option>
                {roots.map((root) => (
                  <option key={root.id} value={root.id}>
                    {root.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newCatName.trim() || create.isPending}
                className="px-4 py-2 rounded-xl bg-[var(--brand-core)] text-white text-xs font-bold disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                {create.isPending ? "Creating..." : "Create category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleRename}
            className="w-full max-w-md rounded-3xl border border-[var(--border-default)] bg-[var(--background-primary)] p-6 space-y-4"
          >
            <h2 className="text-lg font-black text-[var(--text-primary)]">
              Rename category
            </h2>

            <div>
              <label
                htmlFor="cat-rename"
                className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5"
              >
                Name
              </label>
              <input
                id="cat-rename"
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--background-secondary)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-core)]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--background-tertiary)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!editName.trim() || rename.isPending}
                className="px-4 py-2 rounded-xl bg-[var(--brand-core)] text-white text-xs font-bold disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                {rename.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
