"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Toast, type ToastState } from "@/components/admin/settings/toast";
import { ReservationToolbar } from "./reservation-toolbar";
import { ReservationStatsCards } from "./reservation-stats";
import { ReservationList } from "./reservation-list";
import { ReservationNotesModal } from "./reservation-notes-modal";
import { ReservationDeleteModal } from "./reservation-delete-modal";
import { ReservationEmptyState } from "./reservation-empty-state";
import type {
  ReservationData,
  ReservationListResult,
  ReservationPeriodFilter,
  ReservationSortKey,
  ReservationStatus,
  ReservationStatusFilter,
} from "@/lib/reservations/types";

const PAGE_SIZE = 100;

interface ReservationManagerProps {
  initial: ReservationListResult;
}

interface ActiveQuery {
  search: string;
  status: ReservationStatusFilter;
  period: ReservationPeriodFilter;
  sort: ReservationSortKey;
}

const STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No show",
};

export function ReservationManager({ initial }: ReservationManagerProps) {
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState<ActiveQuery>({
    search: "",
    status: "all",
    period: "all",
    sort: "newest",
  });
  const [data, setData] = useState<ReservationListResult>(initial);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [notesTarget, setNotesTarget] = useState<ReservationData | null>(null);
  const [notesSaving, setNotesSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ReservationData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setLoading(true);
  }, []);

  const refreshInBackground = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery((q) => (q.search === searchInput ? q : { ...q, search: searchInput }));
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams({
      search: query.search,
      status: query.status,
      period: query.period,
      sort: query.sort,
      page: "1",
      pageSize: String(PAGE_SIZE),
    });
    fetch(`/api/reservations?${params.toString()}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    })
      .then((r) => r.json())
      .then((res) => {
        if (ignore) return;
        if (res?.ok) {
          setData(res);
        } else {
          setToast({ type: "error", message: res?.error ?? "Could not load the reservations." });
        }
      })
      .catch(() => {
        if (!ignore) setToast({ type: "error", message: "Could not reach the server." });
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [query, refreshKey]);

  const hasFilters = Boolean(searchInput || query.status !== "all" || query.period !== "all");

  const handleStatusChange = useCallback(
    async (item: ReservationData, status: ReservationStatus) => {
      const now = new Date().toISOString();
      const patched: ReservationData = {
        ...item,
        status,
        confirmedAt:
          status === "CONFIRMED" && !item.confirmedAt ? now : item.confirmedAt,
        completedAt:
          status === "COMPLETED" && !item.completedAt ? now : item.completedAt,
        cancelledAt:
          status === "CANCELLED" && !item.cancelledAt ? now : item.cancelledAt,
      };
      setData((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.id === item.id ? patched : i)),
      }));

      const res = await fetch(`/api/reservations/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        refresh();
        setToast({ type: "error", message: payload?.error ?? "Could not update the reservation." });
        return;
      }
      const saved = payload.item as ReservationData;
      setData((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.id === saved.id ? saved : i)),
      }));
      refreshInBackground();
      setToast({ type: "success", message: `${saved.number} marked as ${STATUS_LABELS[saved.status]}.` });
    },
    [refresh, refreshInBackground]
  );

  const handleNotesSave = useCallback(
    async (notes: string) => {
      if (!notesTarget) return;
      const id = notesTarget.id;
      setNotesSaving(true);
      setData((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.id === id ? { ...i, notes } : i)),
      }));

      const res = await fetch(`/api/reservations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const payload = await res.json().catch(() => ({}));
      setNotesTarget(null);
      setNotesSaving(false);
      if (!res.ok) {
        refresh();
        setToast({ type: "error", message: payload?.error ?? "Could not save the notes." });
        return;
      }
      const saved = payload.item as ReservationData;
      setData((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.id === saved.id ? saved : i)),
      }));
      refreshInBackground();
      setToast({ type: "success", message: "Internal notes saved." });
    },
    [notesTarget, refresh, refreshInBackground]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    const res = await fetch(`/api/reservations/${deleteTarget.id}`, { method: "DELETE" });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      setToast({ type: "error", message: payload?.error ?? "Could not delete the reservation." });
      setDeleting(false);
      return;
    }
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== deleteTarget.id),
      total: Math.max(0, prev.total - 1),
    }));
    setDeleteTarget(null);
    setDeleting(false);
    refreshInBackground();
    setToast({ type: "success", message: `${deleteTarget.number} deleted.` });
  }, [deleteTarget, deleting, refreshInBackground]);

  const clearFilters = () => {
    setSearchInput("");
    setQuery((q) => ({ ...q, status: "all", period: "all" }));
  };

  const memoizedItems = useMemo(() => data.items, [data.items]);

  return (
    <div className="space-y-6">
      <ReservationStatsCards stats={data.stats} />

      <ReservationToolbar
        search={searchInput}
        onSearch={setSearchInput}
        status={query.status}
        onStatus={(value) => setQuery((q) => ({ ...q, status: value }))}
        period={query.period}
        onPeriod={(value) => setQuery((q) => ({ ...q, period: value }))}
        sort={query.sort}
        onSort={(value) => setQuery((q) => ({ ...q, sort: value }))}
        total={data.total}
        loading={loading}
        onRefresh={refresh}
      />

      {memoizedItems.length === 0 && !loading ? (
        <ReservationEmptyState hasFilters={hasFilters} onClear={clearFilters} />
      ) : (
        <ReservationList
          items={memoizedItems}
          loading={loading}
          onStatusChange={handleStatusChange}
          onEditNotes={setNotesTarget}
          onDelete={setDeleteTarget}
        />
      )}

      {notesTarget && (
        <ReservationNotesModal
          item={notesTarget}
          saving={notesSaving}
          onCancel={() => setNotesTarget(null)}
          onSave={handleNotesSave}
        />
      )}

      {deleteTarget && (
        <ReservationDeleteModal
          item={deleteTarget}
          deleting={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
