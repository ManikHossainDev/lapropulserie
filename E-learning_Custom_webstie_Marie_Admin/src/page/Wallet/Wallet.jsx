// import { useState } from "react";
// import { useGetUserSubscriptionQuery } from "../../redux/features/subscription/subscription";

// const tableData = Array.from({ length: 15 }, (_, i) => ({
//     id: i,
//     name: "Alex Morgan",
//     email: "Alex@gmail.com",
//     amount: "$40",
//     date: "05-09-2025",
//     account: `****${5670 + i}`,
//     bank: "Chase Bank",
//     status: i < 3 ? "processing" : "completed",
// }));

// const XIcon = () => (
//     <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//         <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
//     </svg>
// );

// const UploadIcon = () => (
//     <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
//         <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
//         <polyline points="17 8 12 3 7 8" />
//         <line x1="12" y1="3" x2="12" y2="15" />
//     </svg>
// );

// // ─── File Upload Area ───────────────────────────────────────────────────────
// function FileUpload({ id }) {
//     const [fileName, setFileName] = useState("");
//     const [hovered, setHovered] = useState(false);

//     return (
//         <label
//             htmlFor={id}
//             onMouseEnter={() => setHovered(true)}
//             onMouseLeave={() => setHovered(false)}
//             className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 mt-1 ${hovered ? "border-[#6c63ff] bg-[#f8f8ff]" : "border-[#e4e5f0] bg-white"
//                 }`}
//         >
//             <input
//                 id={id}
//                 type="file"
//                 accept="image/*,.pdf"
//                 className="hidden"
//                 onChange={e => e.target.files?.[0] && setFileName(e.target.files[0].name)}
//             />
//             <div className="flex items-center justify-center text-[#7b7d9d] mb-2">
//                 <UploadIcon />
//             </div>
//             <div className="text-[13px] text-[#7b7d9d]">
//                 <strong className="text-[#2d2a71]">Click to upload</strong> or drag and drop
//             </div>
//             {fileName && (
//                 <div className="text-xs text-[#00c9a7] mt-1.5 font-semibold">✓ {fileName}</div>
//             )}
//         </label>
//     );
// }

// // ─── Modal Wrapper ──────────────────────────────────────────────────────────
// function Modal({ open, onClose, title, subtitle, children }) {
//     if (!open) return null;
//     return (
//         <div
//             onClick={e => e.target === e.currentTarget && onClose()}
//             className="fixed inset-0 bg-[rgba(20,18,60,0.45)] backdrop-blur-sm z-[100] flex items-center justify-center"
//         >
//             <style>{`@keyframes slideUp { from { transform: translateY(28px) scale(.97); opacity:0 } to { transform: none; opacity:1 } } .modal-anim { animation: slideUp .28s cubic-bezier(.22,1,.36,1); }`}</style>
//             <div className="modal-anim bg-white rounded-[20px] shadow-2xl w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">

//                 {/* Header */}
//                 <div className="px-7 pt-6 flex justify-between items-start">
//                     <div>
//                         <h2 className="text-[17px] font-bold text-[#2d2a71] tracking-tight m-0" style={{ fontFamily: "'Sora',sans-serif" }}>
//                             {title}
//                         </h2>
//                         <p className="text-[13px] text-[#7b7d9d] mt-0.5">{subtitle}</p>
//                     </div>
//                     <button
//                         onClick={onClose}
//                         className="w-8 h-8 rounded-full border-none bg-[#f0f0ff] cursor-pointer flex items-center justify-center text-[#2d2a71] flex-shrink-0 hover:bg-[#e0e0f8] transition-colors"
//                     >
//                         <XIcon />
//                     </button>
//                 </div>

//                 {/* Body */}
//                 <div className="px-7 pt-5 pb-7">{children}</div>
//             </div>
//         </div>
//     );
// }

// // ─── Section Title ──────────────────────────────────────────────────────────
// function SectionTitle({ children }) {
//     return (
//         <div className="flex items-center gap-2 text-[14px] font-bold text-[#2d2a71] mb-3.5" style={{ fontFamily: "'Sora',sans-serif" }}>
//             {children}
//             <span className="flex-1 h-px bg-[#e4e5f0] inline-block" />
//         </div>
//     );
// }

// // ─── Withdrawal Request Modal ───────────────────────────────────────────────
// function WithdrawalModal({ open, onClose }) {
//     const infoItems = [
//         ["Bank Name", "Chase Bank"], ["Branch Name", "Manhattan Main Branch"],
//         ["Account Holder", "Alex Morgan"], ["Account Number", "1923452355679"],
//         ["Request Date", "2026-01-25"], ["Routing Number", "02100000254"],
//     ];

//     return (
//         <Modal open={open} onClose={onClose} title="Withdrawal Request Details" subtitle="Review and process mentor payment request">

//             {/* User Row */}
//             <div className="flex items-center gap-3 mb-5">
//                 <div className="w-[46px] h-[46px] rounded-full bg-gradient-to-br from-[#2d2a71] to-[#6c63ff] flex items-center justify-center text-white text-base font-bold flex-shrink-0">
//                     AM
//                 </div>
//                 <div>
//                     <div className="font-bold text-[15px] text-[#1a1a2e]">Alex Morgan</div>
//                     <div className="text-[12.5px] text-[#7b7d9d]">alex@gmail.com</div>
//                 </div>
//             </div>

//             {/* Amount Card */}
//             <div className="bg-gradient-to-br from-[#2d2a71] to-[#4b48b0] rounded-2xl px-5 py-5 mb-5 text-white flex flex-col items-end">
//                 <div className="text-xs opacity-75">Requested Amount</div>
//                 <div className="text-[34px] font-bold tracking-tight" style={{ fontFamily: "'Sora',sans-serif" }}>$40.00</div>
//             </div>

//             {/* Info Grid */}
//             <div className="grid grid-cols-2 gap-3.5 mb-5">
//                 {infoItems.map(([label, val]) => (
//                     <div key={label}>
//                         <div className="text-[11.5px] text-[#7b7d9d] font-medium mb-0.5">{label}</div>
//                         <div className="text-[13.5px] font-semibold text-[#1a1a2e]">{val}</div>
//                     </div>
//                 ))}
//             </div>

//             <div className="h-px bg-[#e4e5f0] mb-5" />

//             {/* Proof of Payment */}
//             <SectionTitle>Proof of Payment</SectionTitle>
//             <FileUpload id="proofFile" />

//             {/* Footer */}
//             <div className="flex gap-2.5 justify-end mt-6">
//                 <button
//                     onClick={onClose}
//                     className="h-10 px-5 border border-[#e4e5f0] rounded-[10px] bg-white text-[14px] font-medium text-[#7b7d9d] cursor-pointer hover:border-[#2d2a71] hover:text-[#2d2a71] transition-colors"
//                 >
//                     Cancel
//                 </button>
//                 <button className="h-10 px-7 border-none rounded-[10px] bg-gradient-to-r from-[#2d2a71] to-[#6c63ff] text-[14px] font-semibold text-white cursor-pointer shadow-[0_4px_14px_rgba(108,99,255,0.35)] hover:opacity-90 transition-opacity">
//                     Create
//                 </button>
//             </div>
//         </Modal>
//     );
// }

// // ─── Account Info Modal ─────────────────────────────────────────────────────
// function AccountModal({ open, onClose }) {
//     const [accType, setAccType] = useState("savings");
//     const fields = [
//         [["Bank Name", "Chase Bank"], ["Bank Branch", "Manhattan Main Branch"]],
//         [["Account Holder Name", "John Doe"]],
//         [["Account Number", "**********5670"], ["Routing Number", "02100000254"]],
//     ];

//     return (
//         <Modal open={open} onClose={onClose} title="Account Information" subtitle="Secure bank account details for withdrawals">

//             <SectionTitle>Bank Details</SectionTitle>

//             {fields.map((row, ri) => (
//                 <div key={ri} className={`grid gap-3.5 mb-3.5 ${row.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
//                     {row.map(([label, placeholder]) => (
//                         <div key={label} className="flex flex-col gap-1">
//                             <label className="text-[12px] font-semibold text-[#7b7d9d]">{label}</label>
//                             <input
//                                 type="text"
//                                 defaultValue={placeholder}
//                                 className="h-10 border border-[#e4e5f0] rounded-[9px] px-3 text-[13.5px] text-[#1a1a2e] bg-[#fafafa] outline-none focus:border-[#6c63ff] focus:bg-white transition-colors"
//                             />
//                         </div>
//                     ))}
//                 </div>
//             ))}

//             {/* Account Type */}
//             <div className="mb-3.5">
//                 <label className="text-[12px] font-semibold text-[#7b7d9d] block mb-2">Bank Account Type</label>
//                 <div className="flex gap-5">
//                     {["savings", "current"].map(type => (
//                         <label key={type} className="flex items-center gap-1.5 text-[13.5px] cursor-pointer capitalize">
//                             <input
//                                 type="radio"
//                                 name="accType"
//                                 value={type}
//                                 checked={accType === type}
//                                 onChange={() => setAccType(type)}
//                                 className="accent-[#2d2a71]"
//                             />
//                             {type.charAt(0).toUpperCase() + type.slice(1)}
//                         </label>
//                     ))}
//                 </div>
//             </div>

//             <div className="h-px bg-[#e4e5f0] my-5" />

//             <SectionTitle>Upload Verification Document</SectionTitle>
//             <FileUpload id="acctFile" />

//             <div className="flex gap-2.5 justify-end mt-6">
//                 <button
//                     onClick={onClose}
//                     className="h-10 px-5 border border-[#e4e5f0] rounded-[10px] bg-white text-[14px] font-medium text-[#7b7d9d] cursor-pointer hover:border-[#2d2a71] hover:text-[#2d2a71] transition-colors"
//                 >
//                     Cancel
//                 </button>
//                 <button className="h-10 px-7 border-none rounded-[10px] bg-gradient-to-r from-[#2d2a71] to-[#6c63ff] text-[14px] font-semibold text-white cursor-pointer shadow-[0_4px_14px_rgba(108,99,255,0.35)] hover:opacity-90 transition-opacity">
//                     Save Account
//                 </button>
//             </div>
//         </Modal>
//     );
// }

// // ─── Main Component ─────────────────────────────────────────────────────────
// export default function Wallet() {
//     const [withdrawalOpen, setWithdrawalOpen] = useState(false);
//     const [accountOpen, setAccountOpen] = useState(false);

//     const [page, setPage] = useState(1);
//     const [limit, setLimit] = useState(10);
//     const { data } = useGetUserSubscriptionQuery({ page, limit });
//     const subscriptions = data?.data || [];
//     console.log(subscriptions)

//     return (
//         <div className="font-sans  min-h-screen">
//             <style>{`
//                 @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@400;600;700&display=swap');
//                 body { font-family: 'DM Sans', sans-serif; }
//                 tbody tr:hover { background: #f0f0ff !important; }
//             `}</style>

//             {/* Main Content */}
//             <div className="p-5 pb-12">

//                 {/* Page Header */}
//                 <div className="mb-6">
//                     <h1
//                         className="text-[22px] font-bold text-[#2d2a71] tracking-tight m-0"
//                         style={{ fontFamily: "'Sora',sans-serif" }}
//                     >
//                         Wallet Management
//                     </h1>
//                     <p className="text-[13px] text-[#7b7d9d] mt-1">Manage mentor withdrawal requests and payments</p>
//                 </div>

//                 {/* Toolbar */}
//                 <div className="flex items-center gap-3 mb-5">
//                     <div className="relative flex-1 max-w-[340px]">
//                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7b7d9d]">
//                             <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                                 <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
//                             </svg>
//                         </span>
//                         <input
//                             type="text"
//                             placeholder="Search request by name…"
//                             className="w-full h-10 border border-[#e4e5f0] rounded-[10px] pl-10 pr-3 text-[13.5px] outline-none bg-white focus:border-[#6c63ff] transition-colors"
//                         />
//                     </div>
//                     <button className="h-10 flex items-center gap-1.5 px-4 border border-[#e4e5f0] rounded-[10px] bg-white text-[13.5px] font-medium cursor-pointer hover:border-[#6c63ff] hover:bg-[#f8f8ff] transition-all">
//                         <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                             <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="12" y1="18" x2="12" y2="18" />
//                         </svg>
//                         Filters
//                     </button>
//                 </div>

//                 {/* Section Label */}
//                 <div className="flex items-center gap-2 text-[13px] font-semibold text-[#2d2a71] mb-3.5">
//                     <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                         <rect x="2" y="3" width="20" height="14" rx="2" />
//                         <line x1="8" y1="21" x2="16" y2="21" />
//                         <line x1="12" y1="17" x2="12" y2="21" />
//                     </svg>
//                     Withdrawal Requests
//                 </div>

//                 {/* Table Card */}
//                 <div className="bg-white rounded-2xl border border-[#e4e5f0] shadow-[0_4px_24px_rgba(44,42,113,0.08)] overflow-hidden">
//                     <table className="w-full border-collapse">
//                         <thead>
//                             <tr>
//                                 {["User", "Email Address", "Amount", "Request Date", "Bank Account", "Status", "Action"].map(h => (
//                                     <th
//                                         key={h}
//                                         className="px-4 py-3 text-[12px] font-semibold text-[#7b7d9d] uppercase tracking-wide text-left bg-[#f8f8ff] border-b border-[#e4e5f0]"
//                                     >
//                                         {h}
//                                     </th>
//                                 ))}
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {tableData.map(row => (
//                                 <tr
//                                     key={row.id}
//                                     onClick={() => setWithdrawalOpen(true)}
//                                     className="cursor-pointer border-b border-[#e4e5f0] last:border-b-0 transition-colors duration-150"
//                                 >
//                                     {/* User */}
//                                     <td className="px-4 py-3 text-[13.5px]">
//                                         <div className="flex items-center gap-2.5">
//                                             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2d2a71] to-[#6c63ff] flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
//                                                 AM
//                                             </div>
//                                             <span className="font-semibold text-[#1a1a2e]">{row.name}</span>
//                                         </div>
//                                     </td>

//                                     {/* Email */}
//                                     <td className="px-4 py-3 text-[13px] text-[#7b7d9d]">{row.email}</td>

//                                     {/* Amount */}
//                                     <td className="px-4 py-3">
//                                         <span className="text-[#2d2a71] font-bold text-[14px]">{row.amount}</span>
//                                     </td>

//                                     {/* Date */}
//                                     <td className="px-4 py-3 text-[13px] text-[#1a1a2e]">{row.date}</td>

//                                     {/* Bank Account */}
//                                     <td className="px-4 py-3">
//                                         <div className="font-semibold text-[13.5px] text-[#1a1a2e]">{row.account}</div>
//                                         <div className="text-[11.5px] text-[#7b7d9d]">{row.bank}</div>
//                                     </td>

//                                     {/* Status */}
//                                     <td className="px-4 py-3">
//                                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${row.status === "processing"
//                                             ? "bg-amber-100 text-amber-700"
//                                             : "bg-emerald-100 text-emerald-800"
//                                             }`}>
//                                             <span className="w-1.5 h-1.5 rounded-full bg-current" />
//                                             {row.status === "processing" ? "Processing" : "Completed"}
//                                         </span>
//                                     </td>

//                                     {/* Action */}
//                                     <td className="px-4 py-3">
//                                         <button
//                                             onClick={e => { e.stopPropagation(); setAccountOpen(true); }}
//                                             className="w-[30px] h-[30px] rounded-lg bg-[#f0f0ff] border-none cursor-pointer flex items-center justify-center text-[#2d2a71] hover:bg-[#6c63ff] hover:text-white transition-colors"
//                                         >
//                                             <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                                                 <circle cx="12" cy="12" r="10" />
//                                                 <line x1="12" y1="8" x2="12" y2="8" />
//                                                 <line x1="12" y1="12" x2="12" y2="16" />
//                                             </svg>
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>

//                     {/* Pagination */}
//                     <div className="flex items-center justify-end gap-1.5 px-5 py-4 border-t border-[#e4e5f0]">
//                         {["← Previous", "1", "2", "Next →"].map((label, i) => (
//                             <button
//                                 key={label}
//                                 disabled={i === 0}
//                                 className={`h-8 min-w-[32px] rounded-lg border text-[13px] font-medium px-2.5 transition-all ${i === 1
//                                     ? "bg-[#2d2a71] text-white border-[#2d2a71]"
//                                     : i === 0
//                                         ? "bg-white text-[#1a1a2e] border-[#e4e5f0] opacity-40 cursor-not-allowed"
//                                         : "bg-white text-[#1a1a2e] border-[#e4e5f0] cursor-pointer hover:border-[#6c63ff] hover:text-[#6c63ff]"
//                                     }`}
//                             >
//                                 {label}
//                             </button>
//                         ))}
//                     </div>
//                 </div>
//             </div>

//             {/* Modals */}
//             <WithdrawalModal open={withdrawalOpen} onClose={() => setWithdrawalOpen(false)} />
//             <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} />
//         </div>
//     );
// }

import { useState } from "react";
import { useGetUserSubscriptionQuery } from "../../redux/features/subscription/subscription";

const XIcon = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const UploadIcon = () => (
    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
};

const getInitials = (name = "") =>
    name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith("http")) return avatar;
    return `${import.meta.env.VITE_API_BASE_URL || ""}${avatar}`;
};

// ─── File Upload Area ───────────────────────────────────────────────────────
function FileUpload({ id }) {
    const [fileName, setFileName] = useState("");
    const [hovered, setHovered] = useState(false);

    return (
        <label
            htmlFor={id}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 mt-1 ${hovered ? "border-[#6c63ff] bg-[#f8f8ff]" : "border-[#e4e5f0] bg-white"}`}
        >
            <input
                id={id}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={e => e.target.files?.[0] && setFileName(e.target.files[0].name)}
            />
            <div className="flex items-center justify-center text-[#7b7d9d] mb-2"><UploadIcon /></div>
            <div className="text-[13px] text-[#7b7d9d]">
                <strong className="text-[#2d2a71]">Click to upload</strong> or drag and drop
            </div>
            {fileName && <div className="text-xs text-[#00c9a7] mt-1.5 font-semibold">✓ {fileName}</div>}
        </label>
    );
}

// ─── Modal Wrapper ──────────────────────────────────────────────────────────
function Modal({ open, onClose, title, subtitle, children }) {
    if (!open) return null;
    return (
        <div
            onClick={e => e.target === e.currentTarget && onClose()}
            className="fixed inset-0 bg-[rgba(20,18,60,0.45)] backdrop-blur-sm z-[100] flex items-center justify-center"
        >
            <style>{`@keyframes slideUp { from { transform: translateY(28px) scale(.97); opacity:0 } to { transform: none; opacity:1 } } .modal-anim { animation: slideUp .28s cubic-bezier(.22,1,.36,1); }`}</style>
            <div className="modal-anim bg-white rounded-[20px] shadow-2xl w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
                <div className="px-7 pt-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-[17px] font-bold text-[#2d2a71] tracking-tight m-0" style={{ fontFamily: "'Sora',sans-serif" }}>
                            {title}
                        </h2>
                        <p className="text-[13px] text-[#7b7d9d] mt-0.5">{subtitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full border-none bg-[#f0f0ff] cursor-pointer flex items-center justify-center text-[#2d2a71] flex-shrink-0 hover:bg-[#e0e0f8] transition-colors"
                    >
                        <XIcon />
                    </button>
                </div>
                <div className="px-7 pt-5 pb-7">{children}</div>
            </div>
        </div>
    );
}

// ─── Section Title ──────────────────────────────────────────────────────────
function SectionTitle({ children }) {
    return (
        <div className="flex items-center gap-2 text-[14px] font-bold text-[#2d2a71] mb-3.5" style={{ fontFamily: "'Sora',sans-serif" }}>
            {children}
            <span className="flex-1 h-px bg-[#e4e5f0] inline-block" />
        </div>
    );
}

// ─── Status Badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const map = {
        pending:   "bg-amber-100 text-amber-700",
        active:    "bg-emerald-100 text-emerald-800",
        cancelled: "bg-red-100 text-red-700",
        expired:   "bg-gray-100 text-gray-600",
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold capitalize ${map[status] || "bg-gray-100 text-gray-600"}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {status}
        </span>
    );
}

// ─── Withdrawal Request Modal ───────────────────────────────────────────────
function WithdrawalModal({ open, onClose, subscription }) {
    if (!subscription) return null;

    const { user, plan, status, createdAt, lastBilling, nextBilling, transactionId } = subscription;
    const avatarUrl = getAvatarUrl(user?.avatar);

    const infoItems = [
        ["Plan Name",       plan?.name || "N/A"],
        ["Billing Period",  plan?.billingPeriod || "N/A"],
        ["Plan Price",      plan?.price != null ? `$${plan.price}` : "N/A"],
        ["Status",          status || "N/A"],
        ["Request Date",    formatDate(createdAt)],
        ["Last Billing",    formatDate(lastBilling)],
        ["Next Billing",    formatDate(nextBilling)],
        ["Transaction ID",  transactionId || "N/A"],
    ];

    return (
        <Modal open={open} onClose={onClose} title="Subscription Details" subtitle="Review mentor subscription information">

            {/* User Row */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-[46px] h-[46px] rounded-full overflow-hidden bg-gradient-to-br from-[#2d2a71] to-[#6c63ff] flex items-center justify-center text-white text-base font-bold flex-shrink-0">
                    {avatarUrl
                        ? <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
                        : getInitials(user?.name)
                    }
                </div>
                <div>
                    <div className="font-bold text-[15px] text-[#1a1a2e]">{user?.name || "N/A"}</div>
                    <div className="text-[12.5px] text-[#7b7d9d]">{user?.email || "N/A"}</div>
                </div>
            </div>

            {/* Amount Card */}
            <div className="bg-gradient-to-br from-[#2d2a71] to-[#4b48b0] rounded-2xl px-5 py-5 mb-5 text-white flex flex-col items-end">
                <div className="text-xs opacity-75">Plan Price</div>
                <div className="text-[34px] font-bold tracking-tight" style={{ fontFamily: "'Sora',sans-serif" }}>
                    ${plan?.price ?? "0"}.00
                </div>
                <div className="text-xs opacity-60 capitalize mt-1">{plan?.billingPeriod}</div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3.5 mb-5">
                {infoItems.map(([label, val]) => (
                    <div key={label}>
                        <div className="text-[11.5px] text-[#7b7d9d] font-medium mb-0.5">{label}</div>
                        <div className="text-[13.5px] font-semibold text-[#1a1a2e]">
                            {label === "Status" ? <StatusBadge status={val} /> : val}
                        </div>
                    </div>
                ))}
            </div>

            <div className="h-px bg-[#e4e5f0] mb-5" />

            {/* Proof of Payment */}
            <SectionTitle>Proof of Payment</SectionTitle>
            <FileUpload id="proofFile" />

            {/* Footer */}
            <div className="flex gap-2.5 justify-end mt-6">
                <button
                    onClick={onClose}
                    className="h-10 px-5 border border-[#e4e5f0] rounded-[10px] bg-white text-[14px] font-medium text-[#7b7d9d] cursor-pointer hover:border-[#2d2a71] hover:text-[#2d2a71] transition-colors"
                >
                    Cancel
                </button>
                <button className="h-10 px-7 border-none rounded-[10px] bg-gradient-to-r from-[#2d2a71] to-[#6c63ff] text-[14px] font-semibold text-white cursor-pointer shadow-[0_4px_14px_rgba(108,99,255,0.35)] hover:opacity-90 transition-opacity">
                    Approve
                </button>
            </div>
        </Modal>
    );
}

// ─── Account Info Modal ─────────────────────────────────────────────────────
function AccountModal({ open, onClose, subscription }) {
    const [accType, setAccType] = useState("savings");
    if (!subscription) return null;

    const { user, plan } = subscription;
    const avatarUrl = getAvatarUrl(user?.avatar);

    return (
        <Modal open={open} onClose={onClose} title="Account Information" subtitle="Secure bank account details for withdrawals">

            {/* User summary at top */}
            <div className="flex items-center gap-3 mb-5 p-3 bg-[#f8f8ff] rounded-xl">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#2d2a71] to-[#6c63ff] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {avatarUrl
                        ? <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
                        : getInitials(user?.name)
                    }
                </div>
                <div>
                    <div className="font-bold text-[14px] text-[#1a1a2e]">{user?.name}</div>
                    <div className="text-[12px] text-[#7b7d9d]">{user?.email}</div>
                </div>
                <div className="ml-auto text-right">
                    <div className="text-[11px] text-[#7b7d9d]">Plan</div>
                    <div className="text-[13px] font-bold text-[#2d2a71]">{plan?.name}</div>
                </div>
            </div>

            <SectionTitle>Subscription Details</SectionTitle>

            <div className="grid grid-cols-2 gap-3.5 mb-5">
                {[
                    ["Plan Name",      plan?.name || "N/A"],
                    ["Billing Period", plan?.billingPeriod || "N/A"],
                    ["Price",          plan?.price != null ? `$${plan.price}` : "N/A"],
                    ["User Email",     user?.email || "N/A"],
                ].map(([label, val]) => (
                    <div key={label} className="flex flex-col gap-1">
                        <label className="text-[12px] font-semibold text-[#7b7d9d]">{label}</label>
                        <input
                            type="text"
                            defaultValue={val}
                            readOnly
                            className="h-10 border border-[#e4e5f0] rounded-[9px] px-3 text-[13.5px] text-[#1a1a2e] bg-[#fafafa] outline-none focus:border-[#6c63ff] focus:bg-white transition-colors"
                        />
                    </div>
                ))}
            </div>

            {/* Account Type */}
            <div className="mb-3.5">
                <label className="text-[12px] font-semibold text-[#7b7d9d] block mb-2">Bank Account Type</label>
                <div className="flex gap-5">
                    {["savings", "current"].map(type => (
                        <label key={type} className="flex items-center gap-1.5 text-[13.5px] cursor-pointer capitalize">
                            <input
                                type="radio"
                                name="accType"
                                value={type}
                                checked={accType === type}
                                onChange={() => setAccType(type)}
                                className="accent-[#2d2a71]"
                            />
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </label>
                    ))}
                </div>
            </div>

            <div className="h-px bg-[#e4e5f0] my-5" />

            <SectionTitle>Upload Verification Document</SectionTitle>
            <FileUpload id="acctFile" />

            <div className="flex gap-2.5 justify-end mt-6">
                <button
                    onClick={onClose}
                    className="h-10 px-5 border border-[#e4e5f0] rounded-[10px] bg-white text-[14px] font-medium text-[#7b7d9d] cursor-pointer hover:border-[#2d2a71] hover:text-[#2d2a71] transition-colors"
                >
                    Cancel
                </button>
                <button className="h-10 px-7 border-none rounded-[10px] bg-gradient-to-r from-[#2d2a71] to-[#6c63ff] text-[14px] font-semibold text-white cursor-pointer shadow-[0_4px_14px_rgba(108,99,255,0.35)] hover:opacity-90 transition-opacity">
                    Save Account
                </button>
            </div>
        </Modal>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Wallet() {
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [withdrawalOpen, setWithdrawalOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);

    const [page, setPage] = useState(1);
    const limit = 10;
    const { data, isLoading } = useGetUserSubscriptionQuery({ page, limit });
    const subscriptions = data?.data || [];
    const totalPages = data?.meta?.totalPages || 1;

    const openWithdrawal = (sub) => { setSelectedSubscription(sub); setWithdrawalOpen(true); };
    const openAccount    = (sub) => { setSelectedSubscription(sub); setAccountOpen(true); };

    return (
        <div className="font-sans min-h-screen">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@400;600;700&display=swap');
                body { font-family: 'DM Sans', sans-serif; }
                tbody tr:hover { background: #f0f0ff !important; }
            `}</style>

            <div className="p-5 pb-12">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-[22px] font-bold text-[#2d2a71] tracking-tight m-0" style={{ fontFamily: "'Sora',sans-serif" }}>
                        Wallet Management
                    </h1>
                    <p className="text-[13px] text-[#7b7d9d] mt-1">Manage mentor withdrawal requests and payments</p>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="relative flex-1 max-w-[340px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7b7d9d]">
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search request by name…"
                            className="w-full h-10 border border-[#e4e5f0] rounded-[10px] pl-10 pr-3 text-[13.5px] outline-none bg-white focus:border-[#6c63ff] transition-colors"
                        />
                    </div>
                    <button className="h-10 flex items-center gap-1.5 px-4 border border-[#e4e5f0] rounded-[10px] bg-white text-[13.5px] font-medium cursor-pointer hover:border-[#6c63ff] hover:bg-[#f8f8ff] transition-all">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="12" y1="18" x2="12" y2="18" />
                        </svg>
                        Filters
                    </button>
                </div>

                {/* Section Label */}
                <div className="flex items-center gap-2 text-[13px] font-semibold text-[#2d2a71] mb-3.5">
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                    Subscription List
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-2xl border border-[#e4e5f0] shadow-[0_4px_24px_rgba(44,42,113,0.08)] overflow-hidden">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                {["User", "Email Address", "Plan", "Price", "Billing", "Status", "Action"].map(h => (
                                    <th key={h} className="px-4 py-3 text-[12px] font-semibold text-[#7b7d9d] uppercase tracking-wide text-left bg-[#f8f8ff] border-b border-[#e4e5f0]">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-[13px] text-[#7b7d9d]">
                                        Loading...
                                    </td>
                                </tr>
                            ) : subscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-[13px] text-[#7b7d9d]">
                                        No subscriptions found.
                                    </td>
                                </tr>
                            ) : subscriptions.map(sub => {
                                const avatarUrl = getAvatarUrl(sub.user?.avatar);
                                return (
                                    <tr
                                        key={sub._id}
                                        onClick={() => openWithdrawal(sub)}
                                        className="cursor-pointer border-b border-[#e4e5f0] last:border-b-0 transition-colors duration-150"
                                    >
                                        {/* User */}
                                        <td className="px-4 py-3 text-[13.5px]">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#2d2a71] to-[#6c63ff] flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
                                                    {avatarUrl
                                                        ? <img src={avatarUrl} alt={sub.user?.name} className="w-full h-full object-cover" />
                                                        : getInitials(sub.user?.name)
                                                    }
                                                </div>
                                                <span className="font-semibold text-[#1a1a2e]">{sub.user?.name || "N/A"}</span>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="px-4 py-3 text-[13px] text-[#7b7d9d]">{sub.user?.email || "N/A"}</td>

                                        {/* Plan */}
                                        <td className="px-4 py-3">
                                            <span className="text-[#2d2a71] font-bold text-[13.5px]">{sub.plan?.name || "N/A"}</span>
                                        </td>

                                        {/* Price */}
                                        <td className="px-4 py-3">
                                            <span className="text-[#2d2a71] font-bold text-[14px]">
                                                {sub.plan?.price != null ? `$${sub.plan.price}` : "N/A"}
                                            </span>
                                        </td>

                                        {/* Billing Period */}
                                        <td className="px-4 py-3 text-[13px] text-[#1a1a2e] capitalize">
                                            {sub.plan?.billingPeriod || "N/A"}
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3">
                                            <StatusBadge status={sub.status} />
                                        </td>

                                        {/* Action */}
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={e => { e.stopPropagation(); openAccount(sub); }}
                                                className="w-[30px] h-[30px] rounded-lg bg-[#f0f0ff] border-none cursor-pointer flex items-center justify-center text-[#2d2a71] hover:bg-[#6c63ff] hover:text-white transition-colors"
                                            >
                                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <line x1="12" y1="8" x2="12" y2="8" />
                                                    <line x1="12" y1="12" x2="12" y2="16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex items-center justify-end gap-1.5 px-5 py-4 border-t border-[#e4e5f0]">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className={`h-8 px-3 rounded-lg border text-[13px] font-medium transition-all ${page === 1 ? "opacity-40 cursor-not-allowed bg-white border-[#e4e5f0] text-[#1a1a2e]" : "bg-white border-[#e4e5f0] text-[#1a1a2e] cursor-pointer hover:border-[#6c63ff] hover:text-[#6c63ff]"}`}
                        >
                            ← Previous
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`h-8 min-w-[32px] rounded-lg border text-[13px] font-medium px-2.5 transition-all ${p === page ? "bg-[#2d2a71] text-white border-[#2d2a71]" : "bg-white text-[#1a1a2e] border-[#e4e5f0] cursor-pointer hover:border-[#6c63ff] hover:text-[#6c63ff]"}`}
                            >
                                {p}
                            </button>
                        ))}

                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className={`h-8 px-3 rounded-lg border text-[13px] font-medium transition-all ${page === totalPages ? "opacity-40 cursor-not-allowed bg-white border-[#e4e5f0] text-[#1a1a2e]" : "bg-white border-[#e4e5f0] text-[#1a1a2e] cursor-pointer hover:border-[#6c63ff] hover:text-[#6c63ff]"}`}
                        >
                            Next →
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <WithdrawalModal open={withdrawalOpen} onClose={() => setWithdrawalOpen(false)} subscription={selectedSubscription} />
            <AccountModal   open={accountOpen}    onClose={() => setAccountOpen(false)}    subscription={selectedSubscription} />
        </div>
    );
}