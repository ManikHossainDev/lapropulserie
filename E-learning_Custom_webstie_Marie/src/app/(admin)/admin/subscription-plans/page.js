'use client';

import React, { useState } from 'react';
import { FaArrowLeft, FaPlus, FaMoon, FaStar, FaRocket, FaCheckCircle, FaTrashAlt, FaCheck, FaEdit } from 'react-icons/fa';
import { IoMdNotifications } from 'react-icons/io';
import { useRouter } from 'next/navigation';
import UserPageHeader from '@/Components/Admin/components/UserPageHeader';
import PlanFormModal from '@/Components/Admin/components/PlanFormModal';
import { useFetchSubscriptionPlansQuery, useCreateSubscriptionPlanMutation, useUpdateSubscriptionPlanMutation, useDeleteSubscriptionPlanMutation } from '@/redux/api/adminApi';
import { useToast } from '@/Components/Admin/hooks/useToast';
import { useConfirm } from '@/Components/Admin/hooks/useConfirm';

const ICONS = { moon: FaMoon, star: FaStar, rocket: FaRocket };
const ICON_BG = { moon: 'bg-amber-500', star: 'bg-cyan-500', rocket: 'bg-pink-500' };

export default function SubscriptionPlansPage() {
  const router = useRouter();
  const { show } = useToast();
  const confirm = useConfirm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data: plansData, isLoading } = useFetchSubscriptionPlansQuery();
  const [createPlan] = useCreateSubscriptionPlanMutation();
  const [updatePlan] = useUpdateSubscriptionPlanMutation();
  const [deletePlan] = useDeleteSubscriptionPlanMutation();

  const plansList = plansData?.data || plansData || [];

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing?._id || editing?.id) {
        await updatePlan({ id: editing._id || editing.id, ...data }).unwrap();
        show('Plan updated', 'success');
      } else {
        await createPlan(data).unwrap();
        show('Plan created', 'success');
      }
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      show(err?.data?.message || 'Failed to save plan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan) => {
    const ok = await confirm({
      title: 'Delete plan?',
      description: `"${plan.name || plan.planName}" will be permanently removed.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    try {
      await deletePlan(plan._id || plan.id).unwrap();
      show('Plan deleted', 'success');
    } catch (err) {
      show(err?.data?.message || 'Failed to delete', 'error');
    }
  };

  return (
    <div className="px-6 py-5">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button type="button" onClick={() => router.push('/admin/subscriptions')} className="mt-1 rounded-md p-1 text-gray-600 transition hover:bg-gray-100" aria-label="Back">
            <FaArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#2E2A5A]">Subscription Plans</h1>
            <p className="mt-1 text-sm text-gray-600">Manage all subscriptions tiers and pricing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => { setEditing(null); setModalOpen(true); }} className="flex items-center gap-2 rounded-lg bg-[#2E2A5A] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#3a3470]">
            Add New Plan <FaPlus size={16} />
          </button>
          <button type="button" className="relative rounded-lg bg-gray-200 p-2.5 text-gray-700 transition hover:bg-gray-300" aria-label="Notifications">
            <IoMdNotifications size={18} />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-amber-500" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : plansList.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <p className="text-sm text-gray-500">No plans yet. Click "Add New Plan +" to create one.</p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {plansList.map((plan, idx) => {
            const iconKey = plan.icon || ['moon', 'star', 'rocket'][idx % 3];
            const Icon = ICONS[iconKey] || FaRocket;
            return (
              <div key={plan._id || plan.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-lg text-white ${ICON_BG[iconKey] || 'bg-gray-500'}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => { setEditing(plan); setModalOpen(true); }} className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100" aria-label="Edit">
                      <FaEdit size={16} />
                    </button>
                    <button type="button" onClick={() => handleDelete(plan)} className="rounded-lg p-2 text-red-500 transition hover:bg-red-50" aria-label="Delete">
                      <FaTrashAlt size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-[#2E2A5A]">${plan.price}</span>
                    <span className="text-sm text-gray-500">/{plan.billingPeriod || 'month'}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-[#2E2A5A]">{plan.name || plan.planName}</h3>
                  <p className="mt-1 text-sm text-gray-500">{(plan.features?.length || 0)} features</p>
                </div>

                <div className="mt-4 space-y-2">
                  {(plan.features || []).slice(0, 4).map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <FaCheckCircle size={14} className="text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-sm text-gray-500">{plan.totalSubscribers || plan.activeSubscribers || 0} subscribers</span>
                  <span className={`text-xs font-medium ${plan.isActive !== false ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {plan.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PlanFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        initial={editing}
        saving={saving}
      />
    </div>
  );
}