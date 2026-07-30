import React, { useState } from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { FiPlus, FiArrowUp, FiX } from 'react-icons/fi';
import { BsRocketTakeoff, BsStar, BsLightning } from 'react-icons/bs';
import {
    useGetAllSubscriptionsQuery,
    useCreateSubscriptionMutation,
    useUpdateSubscriptionMutation,
} from '../../redux/features/subscription/subscription';
import { toast } from 'sonner';

// ── Icon config (UI-only) ─────────────────────────────────────────────────────
const ICON_OPTIONS = [
    { key: 'rocket', bg: 'bg-orange-400' },
    { key: 'star', bg: 'bg-cyan-400' },
    { key: 'lightning', bg: 'bg-pink-500' },
    { key: 'green', bg: 'bg-green-400' },
    { key: 'purple', bg: 'bg-purple-500' },
];

// Assign icon by sortOrder so each plan looks distinct
const ORDER_TO_ICON = [
    { iconKey: 'star', iconBg: 'bg-cyan-400' },
    { iconKey: 'rocket', iconBg: 'bg-orange-400' },
    { iconKey: 'lightning', iconBg: 'bg-pink-500' },
    { iconKey: 'green', iconBg: 'bg-green-400' },
    { iconKey: 'purple', iconBg: 'bg-purple-500' },
];
const getIcon = (plan, index) =>
    ORDER_TO_ICON[plan.sortOrder - 1] ?? ORDER_TO_ICON[index % ORDER_TO_ICON.length];

// ── Small UI components ───────────────────────────────────────────────────────
const PlanIcon = ({ iconKey, size = 20 }) => {
    if (iconKey === 'star') return <BsStar size={size} className="text-white" />;
    if (iconKey === 'lightning') return <BsLightning size={size} className="text-white" />;
    return <BsRocketTakeoff size={size} className="text-white" />;
};

const CheckIcon = () => (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <path d="M1 4l2 2 4-4" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const Toggle = ({ checked, onChange, disabled }) => (
    <button
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${checked ? 'bg-green-400' : 'bg-gray-300'
            }`}
    >
        <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'
            }`} />
    </button>
);

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm animate-pulse">
        <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-gray-100" />
            <div className="flex gap-2">
                <div className="w-11 h-6 rounded-full bg-gray-100" />
                <div className="w-6 h-6 rounded bg-gray-100" />
            </div>
        </div>
        <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-2/3" />
            <div className="h-7 bg-gray-100 rounded w-1/3" />
        </div>
        <div className="space-y-1.5">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-3 bg-gray-100 rounded" style={{ width: `${85 - i * 10}%` }} />
            ))}
        </div>
        <div className="h-9 bg-gray-100 rounded-xl mt-auto" />
    </div>
);

// ── Plan Card ─────────────────────────────────────────────────────────────────
const PlanCard = ({ plan, index, onToggle, onEdit, isToggling }) => {
    const { iconKey, iconBg } = getIcon(plan, index);
    const isActive = plan.status === 'active';

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow duration-200">

            {/* Top row */}
            <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                    <PlanIcon iconKey={iconKey} />
                </div>
                <div className="flex items-center gap-2">
                    <Toggle
                        checked={isActive}
                        onChange={() => onToggle(plan)}
                        disabled={isToggling}
                    />
                </div>
            </div>

            {/* Name + price */}
            <div>
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800 text-base">{plan.name}</h3>
                    {plan.mostPopular && (
                        <span className="text-xs bg-amber-100 text-amber-600 font-medium px-2 py-0.5 rounded-full">
                            Popular
                        </span>
                    )}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${plan.price}
                    <span className="text-sm font-normal text-gray-400">/{plan.billingPeriod ?? 'month'}</span>
                </p>
                {plan.trialDays > 0 && (
                    <p className="text-xs text-indigo-500 mt-0.5">{plan.trialDays}-day free trial</p>
                )}
                {plan.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{plan.description}</p>
                )}
            </div>

            {/* Subscribers */}
            <div>
                <p className="text-xs text-gray-400 mb-0.5">Active Subscribers</p>
                <p className="text-2xl font-bold text-gray-900">
                    {(plan.activeSubscribers ?? 0).toLocaleString()}
                </p>
            </div>

            {/* Features */}
            <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Features:</p>
                <ul className="space-y-1.5">
                    {(plan.features ?? []).map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                <CheckIcon />
                            </span>
                            {f}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Edit button */}
            <button
                onClick={() => onEdit(plan)}
                className="w-full mt-auto py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#2d2a71] transition-colors"
            >
                Edit Plan
            </button>
        </div>
    );
};

// ── Revenue Card ──────────────────────────────────────────────────────────────
const RevenueCard = ({ plan }) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <p className="text-xs text-gray-400 mb-1">Total {plan.name}'s Revenue</p>
        <p className="text-3xl font-bold text-gray-900">${(plan.revenue ?? 0).toLocaleString()}</p>
        <p className="text-sm text-green-500 flex items-center gap-1 mt-1.5 font-medium">
            <FiArrowUp size={14} />
            {plan.revenueGrowth ?? 0}% from last month
        </p>
    </div>
);

// ── Modal helpers ─────────────────────────────────────────────────────────────
const makeFeature = () => ({ id: Date.now() + Math.random(), text: '' });

const EMPTY_FORM = {
    name: '',
    description: '',
    price: '',
    trialDays: '',
    sortOrder: '',
    status: 'active',
    iconKey: 'rocket',
    iconBg: 'bg-orange-400',
    features: [makeFeature()],
};

// ── Modal ─────────────────────────────────────────────────────────────────────
const PlanModal = ({ mode, initialData, onClose, onSave, isSaving }) => {
    const [form, setForm] = useState(initialData);
    const [errors, setErrors] = useState({});

    const handleField = (field, value) => {
        setForm((p) => ({ ...p, [field]: value }));
        setErrors((p) => ({ ...p, [field]: '' }));
    };

    const addFeature = () =>
        setForm((p) => ({ ...p, features: [...p.features, makeFeature()] }));
    const updateFeature = (id, text) =>
        setForm((p) => ({ ...p, features: p.features.map((f) => f.id === id ? { ...f, text } : f) }));
    const deleteFeature = (id) =>
        setForm((p) => ({ ...p, features: p.features.filter((f) => f.id !== id) }));
    const pickIcon = (opt) =>
        setForm((p) => ({ ...p, iconKey: opt.key, iconBg: opt.bg }));

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Plan name is required.';
        if (!form.price) errs.price = 'Price is required.';
        else if (isNaN(Number(form.price)) || Number(form.price) < 0)
            errs.price = 'Enter a valid price.';
        return errs;
    };

    const handleSave = () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        onSave({
            ...form,
            price: Number(form.price),
            trialDays: form.trialDays !== '' ? Number(form.trialDays) : undefined,
            sortOrder: form.sortOrder !== '' ? Number(form.sortOrder) : undefined,
            features: form.features.map((f) => f.text).filter(Boolean),
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
            onClick={(e) => e.target === e.currentTarget && !isSaving && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="h-5 w-1 rounded bg-[#2d2a71] block" />
                        <h2 className="text-base font-semibold text-gray-800">
                            {mode === 'add' ? 'Add New Plan' : 'Edit Plan'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors disabled:opacity-40"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">

                    {/* Icon picker */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Plan Icon & Color</label>
                        <div className="flex gap-3">
                            {ICON_OPTIONS.map((opt) => (
                                <button
                                    key={opt.key}
                                    onClick={() => pickIcon(opt)}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${opt.bg} transition-all duration-150 ${form.iconKey === opt.key
                                            ? 'ring-2 ring-offset-2 ring-[#2d2a71] scale-110'
                                            : 'opacity-50 hover:opacity-80'
                                        }`}
                                >
                                    <PlanIcon iconKey={opt.key} size={18} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Plan Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => handleField('name', e.target.value)}
                            placeholder="e.g. Standard Monthly"
                            className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d2a71]/30 ${errors.name ? 'border-red-400' : 'border-gray-200'
                                }`}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            rows={2}
                            value={form.description}
                            onChange={(e) => handleField('description', e.target.value)}
                            placeholder="Short plan description"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d2a71]/30 resize-none"
                        />
                    </div>

                    {/* Price + Trial days */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price ($) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={form.price}
                                onChange={(e) => handleField('price', e.target.value)}
                                placeholder="59"
                                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d2a71]/30 ${errors.price ? 'border-red-400' : 'border-gray-200'
                                    }`}
                            />
                            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trial Days</label>
                            <input
                                type="number"
                                min="0"
                                value={form.trialDays}
                                onChange={(e) => handleField('trialDays', e.target.value)}
                                placeholder="7"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d2a71]/30"
                            />
                        </div>
                    </div>

                    {/* Status + Sort order */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={form.status}
                                onChange={(e) => handleField('status', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d2a71]/30 bg-white"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                            <input
                                type="number"
                                min="1"
                                value={form.sortOrder}
                                onChange={(e) => handleField('sortOrder', e.target.value)}
                                placeholder="1"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d2a71]/30"
                            />
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700">Features</label>
                            <button
                                onClick={addFeature}
                                className="text-xs text-[#2d2a71] font-medium flex items-center gap-1 hover:underline"
                            >
                                <FiPlus size={13} /> Add Feature
                            </button>
                        </div>
                        <div className="space-y-2">
                            {form.features.map((f) => (
                                <div key={f.id} className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                        <CheckIcon />
                                    </span>
                                    <input
                                        type="text"
                                        value={f.text}
                                        onChange={(e) => updateFeature(f.id, e.target.value)}
                                        placeholder="e.g. Priority review queue"
                                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d2a71]/30"
                                    />
                                    <button
                                        onClick={() => deleteFeature(f.id)}
                                        disabled={form.features.length === 1}
                                        className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-1 flex-shrink-0"
                                    >
                                        <RiDeleteBin6Line size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {form.features.length === 0 && (
                            <p className="text-xs text-gray-400 mt-1 text-center py-2">
                                No features. Click "Add Feature" to add one.
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 rounded-xl bg-[#2d2a71] hover:bg-[#23206b] text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-w-[110px] text-center"
                    >
                        {isSaving ? 'Saving…' : mode === 'add' ? 'Add Plan' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const Subscription = () => {
    const { data: plansData, isLoading, refetch } = useGetAllSubscriptionsQuery({ page: 1, limit: 50 });
    const [createSubscription, { isLoading: isCreating }] = useCreateSubscriptionMutation();
    const [updateSubscription, { isLoading: isUpdating }] = useUpdateSubscriptionMutation();

    // API shape: data.data.results[]
    const plans = plansData?.data?.results ?? [];

    const [togglingId, setTogglingId] = useState(null);
    const [modal, setModal] = useState(null);

    const isSaving = isCreating || isUpdating;

    // ── Toggle active ↔ inactive ───────────────────────────────────────────────
    // RTK slice: query: ({ id, ...data }) => body = data (everything except id)
    const handleToggle = async (plan) => {
        setTogglingId(plan.id);
        try {
            await updateSubscription({
                id: plan.id,
                status: plan.status === 'active' ? 'inactive' : 'active',
            }).unwrap();
            refetch();
            toast.success('Status updated.');
        } catch (err) {
            console.error('Toggle failed:', err);
            alert(err?.data?.message ?? 'Failed to update status.');
        } finally {
            setTogglingId(null);
        }
    };

    // ── Open Add modal ─────────────────────────────────────────────────────────
    const openAdd = () =>
        setModal({
            mode: 'add',
            data: { ...EMPTY_FORM, features: [makeFeature()] },
        });

    // ── Open Edit modal — pre-fill all fields from API plan ───────────────────
    const openEdit = (plan) => {
        const { iconKey, iconBg } = getIcon(plan, 0);
        setModal({
            mode: 'edit',
            data: {
                id: plan.id,
                name: plan.name ?? '',
                description: plan.description ?? '',
                price: String(plan.price ?? ''),
                trialDays: plan.trialDays != null ? String(plan.trialDays) : '',
                sortOrder: plan.sortOrder != null ? String(plan.sortOrder) : '',
                status: plan.status ?? 'active',
                iconKey,
                iconBg,
                // API features = string[] → convert to {id, text} objects for the form
                features: (plan.features ?? []).map((f) => ({
                    id: Date.now() + Math.random(),
                    text: typeof f === 'string' ? f : f.text ?? '',
                })),
            },
        });
    };

    // ── Create or Update ───────────────────────────────────────────────────────
    // RTK slice spreads { id, ...data } — so pass id at top level, rest = body
    const handleSave = async (formData) => {
        // Build clean payload matching your API shape
        const payload = {
            name: formData.name,
            description: formData.description,
            price: formData.price,                                   // Number
            trialDays: formData.trialDays ?? undefined,
            sortOrder: formData.sortOrder ?? undefined,
            status: formData.status,
            features: formData.features,                                // string[]
        };

        // Strip undefined keys so they don't override existing values
        Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

        try {
            if (modal.mode === 'add') {
                await createSubscription(payload).unwrap();
                toast.success('Plan created successfully!');
                refetch();
            } else {
                // RTK: query: ({ id, ...data }) → id extracted, rest sent as body
                await updateSubscription({ id: formData.id, ...payload }).unwrap();
            }
            setModal(null);
        } catch (err) {
            console.error('Save failed:', err);
            alert(err?.data?.message ?? 'Failed to save. Please try again.');
        }
    };
    

    
    return (
        <div className="p-5 min-h-screen ">

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#2d2a71]">Subscription Plans</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Manage All Subscriptions Tiers And Pricing</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#2d2a71] hover:bg-[#23206b] text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                >
                    Add New Plan <FiPlus size={16} />
                </button>
            </div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
                {isLoading
                    ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
                    : plans.map((plan, index) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            index={index}
                            onToggle={handleToggle}
                            onEdit={openEdit}
                            isToggling={togglingId === plan.id}
                        />
                    ))
                }
            </div>

            {/* Revenue Cards */}
            {!isLoading && plans.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {plans.map((plan) => (
                        <RevenueCard key={plan.id} plan={plan} />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!isLoading && plans.length === 0 && (
                <div className="text-center py-20 text-gray-400 text-sm">
                    No plans yet.{' '}
                    <button onClick={openAdd} className="text-[#2d2a71] font-medium hover:underline">
                        Add your first plan →
                    </button>
                </div>
            )}

            {/* Modal */}
            {modal && (
                <PlanModal
                    mode={modal.mode}
                    initialData={modal.data}
                    onClose={() => !isSaving && setModal(null)}
                    onSave={handleSave}
                    isSaving={isSaving}
                />
            )}
        </div>
    );
};

export default Subscription;