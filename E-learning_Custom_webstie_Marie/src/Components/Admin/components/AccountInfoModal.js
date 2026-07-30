'use client';

import { useEffect, useState } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import Modal from './Modal';

export default function AccountInfoModal({ open, onClose, initial, onSubmit, saving }) {
  const [data, setData] = useState({
    bankName: '',
    bankBranch: '',
    accountHolder: '',
    accountNumber: '',
    routingNumber: '',
    accountType: 'savings',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setData({ ...initial });
    } else {
      setData({
        bankName: '',
        bankBranch: '',
        accountHolder: '',
        accountNumber: '',
        routingNumber: '',
        accountType: 'savings',
      });
    }
    setErrors({});
  }, [open, initial]);

  function set(k, v) {
    setData((d) => ({ ...d, [k]: v }));
  }

  function validate() {
    const e = {};
    if (!data.bankName.trim()) e.bankName = 'Required';
    if (!data.accountHolder.trim()) e.accountHolder = 'Required';
    if (!data.accountNumber.trim()) e.accountNumber = 'Required';
    if (!data.routingNumber.trim()) e.routingNumber = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    await onSubmit(data);
  }

  const fieldClass = (key) => `w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200 ${errors[key] ? 'border-red-300' : 'border-gray-300'}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Account Information"
      subtitle="Secure bank account details for withdrawals"
      footer={
        <>
          <button type="button" onClick={onClose} disabled={saving} className="flex items-center gap-2 rounded-lg bg-gray-100 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-50">
            <FaTimes size={16} /> Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-[#2E2A5A] px-6 py-2 text-sm font-medium text-white transition hover:bg-[#3a3470] disabled:opacity-50">
            <FaSave size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">Bank Name</label>
          <input type="text" value={data.bankName} onChange={(e) => set('bankName', e.target.value)} placeholder="Chase Bank" className={fieldClass('bankName')} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">Bank Branch</label>
          <input type="text" value={data.bankBranch} onChange={(e) => set('bankBranch', e.target.value)} placeholder="Manhattan Main Branch" className={fieldClass('bankBranch')} />
        </div>
      </div>
      <div className="mt-4">
        <label className="mb-1 block text-xs font-semibold text-gray-700">Account Holder Name</label>
        <input type="text" value={data.accountHolder} onChange={(e) => set('accountHolder', e.target.value)} placeholder="John Doe" className={fieldClass('accountHolder')} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">Account Number</label>
          <input type="text" value={data.accountNumber} onChange={(e) => set('accountNumber', e.target.value)} placeholder="***********5678" className={fieldClass('accountNumber')} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">Routing Number</label>
          <input type="text" value={data.routingNumber} onChange={(e) => set('routingNumber', e.target.value)} placeholder="02100000254" className={fieldClass('routingNumber')} />
        </div>
      </div>
      <div className="mt-4">
        <label className="mb-2 block text-xs font-semibold text-gray-700">Bank Account Type</label>
        <div className="flex gap-6">
          {['savings', 'current'].map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm capitalize">
              <input type="radio" name="acctType" checked={data.accountType === opt} onChange={() => set('accountType', opt)} className="h-4 w-4 accent-indigo-700" />
              {opt}
            </label>
          ))}
        </div>
      </div>
    </Modal>
  );
}