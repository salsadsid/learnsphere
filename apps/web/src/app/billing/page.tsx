"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/shared/auth-guard";
import { authGetJson } from "@/shared/api";

type PaymentHistoryItem = {
  paymentId: string;
  courseId: string;
  courseTitle?: string;
  amountCents: number;
  currency: string;
  status: "pending" | "paid" | "failed";
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
};

type PaymentHistoryResponse = {
  items: PaymentHistoryItem[];
};

type BillingState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; items: PaymentHistoryItem[] };

const formatCurrency = (amountCents: number, currency: string): string => {
  const amount = amountCents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
};

export default function BillingPage() {
  const [state, setState] = useState<BillingState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      const result = await authGetJson<PaymentHistoryResponse>("/api/v1/payments/history");
      if (!active) {
        return;
      }

      if (!result.ok || !result.data) {
        setState({
          status: "error",
          message: result.error ?? "Unable to load billing history.",
        });
        return;
      }

      setState({ status: "ready", items: result.data.items });
    };

    loadHistory();

    return () => {
      active = false;
    };
  }, []);

  return (
    <AuthGuard>
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-16">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Billing</p>
          <h1 className="text-3xl font-semibold text-slate-900 font-[var(--font-display)]">
            Payment history
          </h1>
          <p className="text-sm text-slate-600">
            Review your recent course payments and checkout attempts.
          </p>
        </header>

        {state.status === "loading" && (
          <div className="rounded-3xl border border-slate-900/10 bg-white/70 p-8 text-sm text-slate-600">
            Loading payment history...
          </div>
        )}

        {state.status === "error" && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">
            {state.message}
          </div>
        )}

        {state.status === "ready" && (
          <div className="rounded-3xl border border-slate-900/10 bg-white/80 p-8 shadow-sm">
            {state.items.length === 0 ? (
              <p className="text-sm text-slate-600">No payments yet.</p>
            ) : (
              <div className="grid gap-4">
                {state.items.map((item) => (
                  <div
                    key={item.paymentId}
                    className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          {item.courseTitle ?? item.courseId}
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {formatCurrency(item.amountCents, item.currency)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          {item.status}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {item.paidAt && (
                      <p className="mt-2 text-xs text-emerald-600">
                        Paid {new Date(item.paidAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
