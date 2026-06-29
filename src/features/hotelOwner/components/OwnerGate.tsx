import { type ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { OwnerStatusBanner } from "@/features/hotelOwner/components/OwnerStatusBanner";
import { useOwnerSession } from "@/features/hotelOwner/services/owner-session";
import { isUsingMockAuth, MOCK_USER_ID } from "@/features/hotelOwner/services/mock-auth";

export function OwnerGate({ children }: { children: ReactNode }) {
  const { session, loading, error } = useOwnerSession();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Validating owner access…</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-4 font-display text-xl font-semibold">Session check failed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {error ?? "Unable to load owner session."}
          </p>
          {isUsingMockAuth() && (
            <p className="mt-3 text-xs text-muted-foreground">
              Testing with hardcoded owner ID: {MOCK_USER_ID}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!session.accessGranted) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <OwnerStatusBanner session={session} />
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <ShieldAlert className="mx-auto h-12 w-12 text-amber-600" />
            <h1 className="mt-4 font-display text-2xl font-semibold">Access not granted</h1>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
              This account must be a hotel owner with approval status ACTIVE and the account
              active flag set to true before the dashboard can load.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
