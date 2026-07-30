'use client';

import React, { useState } from 'react';
import { FaSearch, FaFilter, FaInfoCircle, FaWallet, FaMoneyBill, FaWindowClose, FaUpload } from 'react-icons/fa';
import { IoMdNotifications } from 'react-icons/io';
import { useFetchWithdrawalsQuery, useFetchBankAccountQuery, useSaveBankAccountMutation, useApproveWithdrawalMutation } from '@/redux/api/adminApi';
import { useToast } from '@/Components/Admin/hooks/useToast';

export default function WalletPage() {
  const { show } = useToast();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountForm, setAccountForm] = useState({ bankName: '', accountNumber: '', routingNumber: '' });
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState('completed');

  const { data: withdrawalsData, isLoading } = useFetchWithdrawalsQuery({ query, page, pageSize: 14 });
  const { data: bankAccountData } = useFetchBankAccountQuery();
  const [saveBankAccount] = useSaveBankAccountMutation();
  const [approveWithdrawal] = useApproveWithdrawalMutation();

  const items = withdrawalsData?.data?.results || [];

  const totalPages = withdrawalsData?.data?.totalPages || 1;
  const bankAccount = bankAccountData;

  const handleSaveAccount = async () => {
    try {
      await saveBankAccount(accountForm).unwrap();
      show('Bank account updated', 'success');
      setShowAccountModal(false);
      setAccountForm({ bankName: '', accountNumber: '', routingNumber: '' });
    } catch (err) {
      show('Failed to save bank info', 'error');
    }
  };

  const handleOpenApproval = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setApprovalStatus('completed');
    setProofFile(null);
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = async () => {
    if (!selectedWithdrawal) return;
    try {
      const formData = new FormData();

      if (approvalStatus === 'rejected') {
        formData.append('status', 'reject');
      } else {
        if (!proofFile) {
          show('Proof of payment is required for approval', 'error');
          return;
        }
        formData.append('status', 'accept');
      }

      if (proofFile) {
        formData.append('proofOfPayment', proofFile);
      }

      await approveWithdrawal({ id: selectedWithdrawal.id, formData }).unwrap();
      show(`Withdrawal ${approvalStatus}`, 'success');
      setShowApprovalModal(false);
      setSelectedWithdrawal(null);
      setProofFile(null);
    } catch (err) {
      show('Failed to update withdrawal', 'error');
    }
  };

  return (
    <div className="px-6 py-5">
      <div className="mt-5 flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="relative flex-1">
          <FaSearch size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input type="text" value={query} onChange={(e) => { setPage(1); setQuery(e.target.value); }} placeholder="Search request by name" className="w-full rounded-lg bg-gray-50 py-2.5 pr-3 pl-10 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-200" />
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50">
          <FaFilter size={14} /> Filters
        </button>
      </div>

      <div className="mt-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <FaWallet size={18} className="text-[#2E2A5A]" />
          <h3 className="text-base font-bold text-[#2E2A5A]">Withdrawal Requests</h3>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Request Date</th>
                <th className="px-4 py-3">Bank Account</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">No withdrawal requests</td></tr>
              ) : (
                items.map((w) => (
                  <tr key={w.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3"><div className="flex items-center gap-3">{w.userId?.profileImage?.imageUrl ? (<img src={w.userId.profileImage.imageUrl} className="h-8 w-8 rounded-full object-cover" alt={w.userId.name} />) : (<div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">{w.userId?.name?.slice(0, 2).toUpperCase() || "??"}</div>)}<span className="font-medium text-[#2E2A5A]">{w.userId?.name || "N/A"}</span></div></td>
                    <td className="px-4 py-3 text-gray-600">{w.userId?.email || "N/A"}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-600">${w.requestedAmount}</td>
                    <td className="px-4 py-3 text-gray-600">{w.requestedAt ? new Date(w.requestedAt).toLocaleDateString() : "N/A"}</td>
                    <td className="px-4 py-3"><div className="text-sm text-[#2E2A5A]">{w.bankAccountNumber ? `XXXX-XXXX-XXXX-${w.bankAccountNumber.slice(-4)}` : "N/A"}</div><div className="text-xs text-gray-500">{w.bankName}</div></td>
                    <td className="px-4 py-3">
                      {w.status === 'completed' && <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-0.5 text-xs text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Completed</span>}
                      {w.status === 'processing' && <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3 py-0.5 text-xs text-amber-700"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Processing</span>}
                      {w.status === 'rejected' && <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-3 py-0.5 text-xs text-red-700"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />Rejected</span>}
                      {w.status === 'requested' && <span className="inline-flex items-center gap-1 rounded-full border border-blue-300 bg-blue-50 px-3 py-0.5 text-xs text-blue-700"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />Requested</span>}
                    </td>
                    <td className="px-4 py-3">
                      {w.status === 'processing' || w.status === 'requested' ? (
                        <button onClick={() => handleOpenApproval(w)} className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white transition hover:bg-emerald-600">
                          <FaInfoCircle size={14} />
                        </button>
                      ) : (
                        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2E2A5A] text-white transition hover:bg-[#3a3470]">
                          <FaInfoCircle size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-sm rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50">Previous</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 text-sm rounded-lg ${page === p ? 'bg-[#2E2A5A] text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 text-sm rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50">Next</button>
        </div>
      )}

      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowAccountModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[#2E2A5A] mb-4">Account Information</h3>
            {bankAccount ? (
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Bank:</span> {bankAccount.bankName}</p>
                <p><span className="font-medium">Account:</span> {bankAccount.accountNumber}</p>
                <p><span className="font-medium">Routing:</span> {bankAccount.routingNumber}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">No bank account configured</p>
            )}
            <div className="mt-4 space-y-3">
              <input type="text" placeholder="Bank Name" value={accountForm.bankName} onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input type="text" placeholder="Account Number" value={accountForm.accountNumber} onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input type="text" placeholder="Routing Number" value={accountForm.routingNumber} onChange={(e) => setAccountForm({ ...accountForm, routingNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowAccountModal(false)} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleSaveAccount} className="px-4 py-2 rounded-lg text-sm bg-[#2E2A5A] text-white hover:bg-[#3a3870]">Save</button>
            </div>
          </div>
        </div>
      )}

      {showApprovalModal && selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4" onClick={() => setShowApprovalModal(false)}>
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden font-sans" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="flex justify-between items-start p-6 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Withdrawal Request Details</h2>
                <p className="text-slate-500 text-sm mt-1">Review and process mentor payment request</p>
              </div>
              <button onClick={() => setShowApprovalModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <FaWindowClose size={24} />
              </button>
            </div>

            <div className="p-8">
              {/* Profile Section */}
              <div className="flex items-center gap-4 mb-6">
                {selectedWithdrawal.userId?.profileImage?.imageUrl ? (
                  <img
                    src={selectedWithdrawal.userId.profileImage.imageUrl}
                    alt={selectedWithdrawal.userId.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl">
                    {selectedWithdrawal.userId?.name?.slice(0, 2).toUpperCase() || "??"}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedWithdrawal.userId?.name || "N/A"}</h3>
                  <p className="text-slate-500">{selectedWithdrawal.userId?.email || "N/A"}</p>
                </div>
              </div>

              {/* Amount Display */}
              <div className="bg-[#F0F1F8] rounded-2xl p-10 text-center mb-8">
                <p className="text-slate-500 font-medium mb-1">Requested Amount</p>
                <h1 className="text-5xl font-bold text-[#3B388E]">${selectedWithdrawal.requestedAmount}</h1>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-y-6 gap-x-12 mb-8">
                <div>
                  <p className="text-slate-400 text-sm">Bank Name</p>
                  <p className="font-bold text-slate-800">{selectedWithdrawal.bankName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Branch Name</p>
                  <p className="font-bold text-slate-800">{selectedWithdrawal.bankBranch || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Account Holder</p>
                  <p className="font-bold text-slate-800">{selectedWithdrawal.bankAccountHolderName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Account Number</p>
                  <p className="font-bold text-slate-800 tracking-wider">{selectedWithdrawal.bankAccountNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Request Date</p>
                  <p className="font-bold text-slate-800">{selectedWithdrawal.requestedAt ? new Date(selectedWithdrawal.requestedAt).toLocaleDateString() : "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Routing Number</p>
                  <p className="font-bold text-slate-800 tracking-wider">{selectedWithdrawal.bankRoutingNumber || "N/A"}</p>
                </div>
              </div>

              {/* Upload Section */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Proof of Payment <span className="text-slate-400">*</span>
                </label>
                <div className="border-2 border-dashed border-[#3B388E]/30 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setProofFile(e.target.files[0])}
                    className="hidden"
                    id="proof-upload"
                  />
                  <label htmlFor="proof-upload" className="cursor-pointer flex flex-col items-center">
                    <FaUpload className="text-slate-300 mb-2" size={32} strokeWidth={1.5} />
                    <p className="text-slate-400 text-sm">Click to upload or drag and drop</p>
                    {proofFile && <p className="text-[#3B388E] text-sm mt-2 font-medium">{proofFile.name}</p>}
                  </label>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-6 pt-0 flex gap-4">
              <button onClick={() => setShowApprovalModal(false)} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-slate-700 font-bold rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleApprovalSubmit} className="flex-1 py-4 bg-[#2D2A6E] hover:bg-[#23205a] text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}