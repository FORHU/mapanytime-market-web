import { Suspense } from "react";
import { AcceptInviteCard } from "@/features/adminInvites/components/AcceptInviteCard";
import { Loader2 } from "lucide-react";

export default function AcceptInvitePage() {
  return (
    <div className="min-h-screen bg-[var(--background-primary)] text-[var(--text-primary)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-core)]" />
          </div>
        }
      >
        <AcceptInviteCard />
      </Suspense>
    </div>
  );
}

