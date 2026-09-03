import React from "react";

export function AdminFooter() {
  return (
    <footer
      className="pt-12 pb-4 mt-auto border-t text-center text-[11px] text-zinc-400 font-medium flex flex-col sm:flex-row items-center justify-between gap-2"
      style={{ borderColor: "var(--border-light)" }}
    >
      <span>© 2026 MapAnytime Ecosystem — Super Admin Control Console</span>
      <span className="font-mono text-[10px] text-cyan-400">
        v1.1.0 · Super Admin Protocol
      </span>
    </footer>
  );
}
