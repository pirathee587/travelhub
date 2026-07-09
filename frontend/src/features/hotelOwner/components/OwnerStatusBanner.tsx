import { CheckCircle2, ShieldAlert, ShieldCheck, UserCircle, XCircle } from "lucide-react";
import { getTestingOwnerLabel, type OwnerSession } from "@/features/hotelOwner/services/owner-session";
import { isUsingMockAuth } from "@/features/hotelOwner/services/mock-auth";

type Props = {
  session: OwnerSession;
};

function StatusPill({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
        ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {ok ? (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0" />
      )}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide opacity-70">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}

export function OwnerStatusBanner({ session }: Props) {
  const roleOk = session.role === "HOTEL_OWNER";
  const activeOk = session.isActive !== false;
  const approvedOk = session.isApproved;
  const accessOk = session.accessGranted;

  return (
    <div
      className={`mb-8 rounded-2xl border p-4 shadow-sm sm:p-5 ${
        accessOk
          ? "border-emerald-200 bg-gradient-to-r from-emerald-50/80 to-card"
          : "border-amber-200 bg-gradient-to-r from-amber-50/80 to-card"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              accessOk ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {accessOk ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <ShieldAlert className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Owner session {isUsingMockAuth() ? "(testing)" : ""}
            </p>
            <h2 className="font-display text-lg font-semibold text-foreground">
              {session.name || "Unknown owner"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {session.email} · {getTestingOwnerLabel()}
            </p>
          </div>
        </div>

        <div
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
            accessOk
              ? "bg-emerald-100 text-emerald-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <UserCircle className="h-3.5 w-3.5" />
          {accessOk ? "Dashboard access granted" : "Dashboard access denied"}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <StatusPill label="Role" value={session.role} ok={roleOk} />
        <StatusPill
          label="Approval"
          value={approvedOk ? (session.status === "ACTIVE" ? "Approved (ACTIVE)" : "Approved") : session.status}
          ok={approvedOk}
        />
        <StatusPill
          label="Account active"
          value={activeOk ? "Active" : "Inactive"}
          ok={activeOk}
        />
        <StatusPill
          label="Owner ID"
          value={String(session.id)}
          ok={true}
        />
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{session.message}</p>
    </div>
  );
}
