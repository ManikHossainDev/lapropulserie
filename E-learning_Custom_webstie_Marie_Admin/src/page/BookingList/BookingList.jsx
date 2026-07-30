import React, { useState } from "react";
import { Modal, Input } from "antd";
import {
  useGetBookingAccessListQuery,
  useGetBookingInterviewListQuery,
  useGetBookingInterviewNoShowListQuery,
  useUpdateBookingStatusMutation,
} from "../../redux/features/bookingList/bookingList";
import { toast } from "sonner";

// ── helpers ────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });
}

function formatTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit",
  });
}

const STATUS_STYLES = {
  requested: "bg-yellow-100 text-yellow-700",
  scheduled: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-500",
  noshow: "bg-gray-100 text-gray-600",
};

function StatusBadge({ status = "" }) {
  const key = status.toLowerCase();
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[key] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

// ── Detail Row helper ──────────────────────────────────────────────────────
function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm text-gray-800 font-medium break-all">{value || "—"}</span>
    </div>
  );
}

// ── View Details Modal ─────────────────────────────────────────────────────
// ✅ No hooks — safe to return null early
function ViewDetailsModal({ item, onClose }) {
  return (
    <Modal
      open={!!item}
      onCancel={onClose}
      footer={null}
      title={<span className="text-[#2d2a71] font-bold text-base">Booking Details</span>}
      width={520}
      destroyOnClose
    >
      {item && (
        <>
          {/* Avatar row */}
          <div className="flex items-center gap-3 mt-2 mb-5 p-3 bg-gray-50 rounded-xl">
            <div className="w-11 h-11 rounded-full bg-[#2d2a71] flex items-center justify-center text-white font-bold text-base flex-shrink-0">
              {(item.mentor?.email?.[0] ?? item.mentorId?.[0] ?? "M").toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{item.mentor?.email ?? item.mentorId ?? "—"}</p>
              <p className="text-xs text-gray-400 capitalize">{item.mentor?.role ?? "Mentor"}</p>
            </div>
            <div className="ml-auto">
              <StatusBadge status={item.status} />
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="Mentor ID" value={item.mentorId} />
            <DetailRow label="Role" value={item.mentor?.role ?? "Mentor"} />
            <DetailRow label="Date" value={formatDate(item.interviewScheduledAt ?? item.requestDate)} />
            <DetailRow label="Time" value={formatTime(item.interviewScheduledAt ?? item.requestDate)} />
            {item.notes && (
              <div className="col-span-2">
                <DetailRow label="Notes" value={item.notes} />
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

// ── Approve / Reject Modal ─────────────────────────────────────────────────
// ✅ useState is ALWAYS called — no early return before hooks
function ActionModal({ item, actionType, onClose, onConfirm, isLoading }) {
  const [notes, setNotes] = useState("");

  // derived — safe because hook is already called above
  const isApprove = actionType === "approved";
  const isOpen = !!item && !!actionType;

  const handleConfirm = () => {
    onConfirm({ status: actionType, notes: notes.trim() });
  };

  const handleClose = () => {
    setNotes(""); // reset notes on close
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      destroyOnClose={false}   // keep notes state while open
      title={
        <span className={`font-bold text-base ${isApprove ? "text-green-600" : "text-red-500"}`}>
          {isApprove ? "✓ Approve Booking" : "✗ Reject Booking"}
        </span>
      }
      width={460}
    >
      {item && (
        <>
          {/* Mentor summary card */}
          <div className="mt-3 p-3 bg-gray-50 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2d2a71] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {(item.mentor?.email?.[0] ?? "M").toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{item.mentor?.email ?? item.mentorId}</p>
              <p className="text-xs text-gray-400 capitalize">{item.mentor?.role ?? "Mentor"}</p>
            </div>
            <div className="ml-auto">
              <StatusBadge status={item.status} />
            </div>
          </div>

          {/* Notes input */}
          <div className="mt-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Notes <span className="text-gray-400 font-normal normal-case">(optional)</span>
            </label>
            <Input.TextArea
              rows={3}
              placeholder={
                isApprove
                  ? "e.g. Mentor approved after successful interview."
                  : "e.g. Mentor did not meet requirements."
              }
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="rounded-lg text-sm"
            />
          </div>

          {/* Live payload preview */}
          {/* <div className="mt-3 bg-gray-900 rounded-xl p-3 text-xs font-mono text-green-300">
            <p className="text-gray-500 mb-1 text-[10px] uppercase tracking-widest">Payload</p>
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(
                { status: actionType, notes: notes || "(your note here)" },
                null,
                2
              )}
            </pre>
          </div> */}

          {/* Footer */}
          <div className="mt-5 flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`px-6 py-2 rounded-lg text-white text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed ${isApprove
                ? "bg-green-500 hover:bg-green-600"
                : "bg-red-500 hover:bg-red-600"
                }`}
            >
              {isLoading ? "Saving…" : isApprove ? "Approve" : "Reject"}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

// ── Shared table body ──────────────────────────────────────────────────────
function BookingTableBody({ rows = [], isLoading, showActions, emptyText, onView, onAction }) {
  if (isLoading) {
    return (
      <>
        {[...Array(4)].map((_, i) => (
          <tr key={i} className="border-t animate-pulse">
            {[...Array(7)].map((_, j) => (
              <td key={j} className="px-4 py-3">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </td>
            ))}
          </tr>
        ))}
      </>
    );
  }

  if (!rows.length) {
    return (
      <tr>
        <td colSpan={7} className="text-center text-gray-400 text-sm py-10">{emptyText}</td>
      </tr>
    );
  }

  return (
    <>
      {rows.map((item, index) => (
        <tr key={item.id ?? index} className="border-t hover:bg-gray-50 transition">

          {/* Row number */}
          <td className="px-4 py-3 text-sm text-gray-500">
            {String(index + 1).padStart(2, "0")}
          </td>

          {/* Mentor email / ID */}
          <td className="px-4 py-3 text-sm">
            {item.mentor?.email ?? (
              <span className="text-gray-400 font-mono text-xs">{item.mentorId?.slice(-8)}</span>
            )}
          </td>

          {/* Role */}
          <td className="px-4 py-3 text-sm capitalize">
            {item.mentor?.role ?? "Mentor"}
          </td>

          {/* Status */}
          <td className="px-4 py-3">
            <StatusBadge status={item.status} />
          </td>

          {/* Date */}
          <td className="px-4 py-3 text-sm text-gray-600">
            {formatDate(item.interviewScheduledAt ?? item.requestDate)}
          </td>

          {/* Time */}
          <td className="px-4 py-3 text-sm text-gray-600">
            {formatTime(item.interviewScheduledAt ?? item.requestDate)}
          </td>

          {/* Actions */}
          <td className="px-4 py-3">
            {showActions ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAction(item, "approved")}
                  className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 text-xs font-medium transition"
                >
                  Approve
                </button>
                <button
                  onClick={() => onAction(item, "rejected")}
                  className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-xs font-medium transition"
                >
                  Reject
                </button>
              </div>
            ) : (
              <button
                onClick={() => onView(item)}
                className="text-blue-500 hover:text-blue-700 hover:underline text-xs font-medium transition"
              >
                View
              </button>
            )}
          </td>
        </tr>
      ))}
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
const AllUsersList = () => {
  const [activeTab, setActiveTab] = useState("calendly");
  const [viewItem, setViewItem] = useState(null);
  const [actionItem, setActionItem] = useState(null);
  const [actionType, setActionType] = useState(null);

  const { data: bookingData, isLoading: loadingAccess, refetch: refetchAccess } = useGetBookingAccessListQuery();
  const { data: interviewData, isLoading: loadingInterviews } = useGetBookingInterviewListQuery();
  const { data: noShowData, isLoading: loadingNoShows } = useGetBookingInterviewNoShowListQuery();
  const [updateBookingStatus, { isLoading: isUpdating }] = useUpdateBookingStatusMutation();

  const accessRows = bookingData?.data ?? [];
  const interviewRows = interviewData?.data ?? [];
  const noShowRows = noShowData?.data ?? [];

  const handleOpenAction = (item, type) => {
    setActionItem(item);
    setActionType(type);
  };

  const handleCloseAction = () => {
    setActionItem(null);
    setActionType(null);
  };

  const handleConfirmAction = async (payload) => {

    const data = {
      approvalStatus: payload.status,
    }

    console.log(data)

    try {
      const res = await updateBookingStatus({ id: actionItem?.mentorProfileId, data }).unwrap();
      console.log(res)
      toast.success(`Booking ${payload.status} successfully`);
      handleCloseAction();
      refetchAccess();
    } catch (err) {
      toast.error(`Failed to ${payload.status} booking`);
      console.error(err);
    }
  };

  const tabs = [
    {
      id: "calendly",
      label: "Calendly Access Request",
      count: accessRows.length,
      rows: accessRows,
      isLoading: loadingAccess,
      showActions: true,
      emptyText: "No access requests found.",
      dateHeader: "Request Date",
    },
    {
      id: "interviews",
      label: "Interviews Scheduled",
      count: interviewRows.length,
      rows: interviewRows,
      isLoading: loadingInterviews,
      showActions: false,
      emptyText: "No interviews scheduled.",
      dateHeader: "Scheduled Date",
    },
    {
      id: "noShows",
      label: "No-Shows",
      count: noShowRows.length,
      rows: noShowRows,
      isLoading: loadingNoShows,
      showActions: false,
      emptyText: "No no-show records found.",
      dateHeader: "Request Date",
    },
  ];

  const active = tabs.find((t) => t.id === activeTab);

  const latestNote = activeTab === "calendly"
    ? accessRows.find((r) => r.notes)?.notes
    : null;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow rounded-lg p-4">

        {/* Tabs */}
        <div className="flex space-x-4 border-b mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 px-3 font-medium flex items-center gap-2 transition ${activeTab === tab.id
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-blue-500"
                }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === tab.id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                  }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notes banner */}
        {latestNote && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
            <strong>Latest note:</strong> {latestNote}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">No.</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Mentor ID / Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{active.dateHeader}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Time</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <BookingTableBody
                rows={active.rows}
                isLoading={active.isLoading}
                showActions={active.showActions}
                emptyText={active.emptyText}
                onView={(item) => setViewItem(item)}
                onAction={handleOpenAction}
              />
            </tbody>
          </table>
        </div>

      </div>

      {/* View Details Modal */}
      <ViewDetailsModal
        item={viewItem}
        onClose={() => setViewItem(null)}
      />

      {/* Approve / Reject Modal — always rendered, open controlled by isOpen inside */}
      <ActionModal
        item={actionItem}
        actionType={actionType}
        onClose={handleCloseAction}
        onConfirm={handleConfirmAction}
        isLoading={isUpdating}
      />
    </div>
  );
};

export default AllUsersList;