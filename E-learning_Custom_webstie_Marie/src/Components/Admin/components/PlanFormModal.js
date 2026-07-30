'use client';

import { useEffect, useState } from 'react';
import { FaPlus, FaTrashAlt, FaCheckCircle } from 'react-icons/fa';
import Modal from './Modal';

export default function PlanFormModal({ open, onClose, onSubmit, initial, saving }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState(['', '', '', '']);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [status, setStatus] = useState('active');
  const [icon, setIcon] = useState('moon');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setName(initial.name);
      setPrice(String(initial.price));
      setDescription(initial.description || '');
      setFeatures(initial.features?.length ? [...initial.features] : ['', '', '', '']);
      setBillingPeriod(initial.billingPeriod);
      setStatus(initial.status);
      setIcon(initial.icon);
    } else {
      setName('');
      setPrice('');
      setDescription('');
      setFeatures(['', '', '', '']);
      setBillingPeriod('monthly');
      setStatus('active');
      setIcon('moon');
    }
    setErrors({});
  }, [open, initial]);

  function validate() {
    const e = {};
    if (!name.trim()) e.name = 'Plan name is required';
    if (!price || isNaN(Number(price)) || Number(price) < 0) e.price = 'Valid price is required';
    if (!features.some((f) => f.trim())) e.features = 'Add at least one feature';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    await onSubmit({
      name: name.trim(),
      price: Number(price),
      description: description.trim(),
      features: features.map((f) => f.trim()).filter(Boolean),
      billingPeriod,
      status,
      icon,
    });
  }

  const addFeature = () => setFeatures((f) => [...f, '']);
  const updateFeature = (i, v) => setFeatures((f) => f.map((x, j) => (j === i ? v : x)));
  const removeFeature = (i) => setFeatures((f) => f.filter((_, j) => j !== i));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit Subscription Plan' : 'Add New Subscription Plan'}
      subtitle={initial ? 'Update plan details, features, and billing' : 'Create a new subscription tier for your users'}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={saving} className="rounded-lg bg-[#2E2A5A] px-6 py-2 text-sm font-medium text-white transition hover:bg-[#3a3470] disabled:opacity-50">
            {saving ? 'Saving...' : initial ? 'Save Changes' : 'Create'}
          </button>
        </>
      }
    >
      <div>
        <h3 className="border-l-[3px] border-cyan-500 pl-2 text-sm font-bold text-[#2E2A5A]">Basic Information</h3>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Plan Name<span className="text-red-500">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200 ${errors.name ? 'border-red-300' : 'border-gray-300'}`} />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Price ($)<span className="text-red-500">*</span></label>
            <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200 ${errors.price ? 'border-red-300' : 'border-gray-300'}`} />
            {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-xs font-semibold text-gray-700">Plan Description</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="border-l-[3px] border-pink-500 pl-2 text-sm font-bold text-[#2E2A5A]">Plan Features<span className="text-red-500">*</span></h3>
          <button type="button" onClick={addFeature} className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100">
            <FaPlus size={14} /> Add Feature
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="relative flex-1">
                <FaCheckCircle size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-indigo-400" />
                <input type="text" value={f} onChange={(e) => updateFeature(i, e.target.value)} placeholder="Feature 1 (e.g., Basic mentorship access)" className="w-full rounded-lg border border-gray-300 py-2.5 pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
              </div>
              <button type="button" onClick={() => removeFeature(i)} disabled={features.length <= 1} className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:opacity-30" aria-label="Remove feature">
                <FaTrashAlt size={16} />
              </button>
            </div>
          ))}
        </div>
        {errors.features && <p className="mt-1 text-xs text-red-500">{errors.features}</p>}
      </div>

      <div className="mt-6">
        <h3 className="border-l-[3px] border-emerald-500 pl-2 text-sm font-bold text-[#2E2A5A]">Billing Status</h3>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Billing Period<span className="text-red-500">*</span></label>
            <select value={billingPeriod} onChange={(e) => setBillingPeriod(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200">
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Plan Status<span className="text-red-500">*</span></label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-xs font-semibold text-gray-700">Plan Icon</label>
          <div className="flex gap-3">
            {['moon', 'star', 'rocket'].map((opt) => (
              <button key={opt} type="button" onClick={() => setIcon(opt)} className={`flex-1 rounded-lg border-2 px-3 py-2 text-xs font-medium capitalize transition ${icon === opt ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}