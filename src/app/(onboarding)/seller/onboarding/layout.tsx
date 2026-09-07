"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/Button";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useOrgContext } from "@/features/team";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Guards the "create-first-store" flow. We check for actual store ownership
  // rather than `isAdmin` to ensure hired staff (like a SELLER_ADMIN) are blocked
  // from accidentally creating independent competing stores. This is purely a UX
  // guard to save users a click; the backend POST /stores already enforces a 403.
  const orgQuery = useOrgContext(mounted && !!token);
  const isOwner = orgQuery.data?.isOwner === true;
  const isResolving = orgQuery.isPending;
  const failed = orgQuery.isError;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !token) {
      router.replace("/login");
    }
  }, [mounted, router, token]);

  useEffect(() => {
    // Only redirect on a resolved non-owner. A failed request is reported, not
    // acted on — bouncing an owner out of onboarding over a network blip would
    // be its own bug.
    if (orgQuery.data && !isOwner) {
      router.replace("/seller/manage-stores");
    }
  }, [orgQuery.data, isOwner, router]);

  if (!mounted || !token) return null;

  const shell = (content: React.ReactNode) => (
    <div
      className="min-h-screen flex items-center justify-center p-4 transition-colors"
      style={{ backgroundColor: "var(--background-secondary)" }}
    >
      {content}
    </div>
  );

  if (failed) {
    return shell(
      <div className="w-full max-w-md space-y-3 rounded-2xl border border-[var(--border-light)] bg-[var(--background-elevated)] p-8 text-center">
        <p className="font-semibold text-[var(--text-primary)]">
          We couldn&apos;t check your account.
        </p>
        <p className="text-sm text-[var(--text-secondary)]">
          Onboarding is only available to the organization owner, and we could
          not confirm that just now.
        </p>
        <Button onClick={() => orgQuery.refetch()}>Try again</Button>
      </div>,
    );
  }

  // Resolving, or resolved to staff and mid-redirect: render nothing rather
  // than flashing the wizard at someone who may not be allowed to see it.
  // Resolving, or resolved to staff and mid-redirect: render nothing rather
  // than flashing the wizard at someone who may not be allowed to see it.
  if (isResolving || !isOwner) return null;

  return shell(children);
}
