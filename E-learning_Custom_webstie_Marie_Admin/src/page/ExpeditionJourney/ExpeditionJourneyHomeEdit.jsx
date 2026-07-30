import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiPlus, FiArrowLeft, FiSave, FiClock, FiLayers, FiEdit2, FiChevronUp, FiChevronDown, FiExternalLink } from 'react-icons/fi';
import { MdDragIndicator } from 'react-icons/md';
import { RiDeleteBin6Line } from 'react-icons/ri';
import {
    useGetAllCaplesByJourneyIdQuery,
    useGetExpeditionJourneyByIdQuery,
    useUpdateExpeditionJourneyMutation,
    useDeleteExpeditionJourneyMutation,
    useUpdateJourneyCapsuleOrderMutation,
    useRemoveJourneyCapsuleMutation,
} from '../../redux/features/ExpeditionJourney/ExpeditionJourney';
import { toast } from 'sonner';

const CATEGORY_TITLES = new Set([
    'mieux se connaître',
    'apprendre à se connaître',
]);

const isLikelyCategoryRow = (capsule) => {
    const title = (capsule?.title || '').trim().toLowerCase();
    const hasIndividual =
        capsule?.individualCapsuleId?.id ||
        capsule?.individualCapsuleId?._id ||
        capsule?.individualCapsuleId;
    if (!hasIndividual && CATEGORY_TITLES.has(title)) return true;
    if (!hasIndividual && /catégorie|category/i.test(capsule?.roadMapBrief || '')) return true;
    return false;
};

const CapsuleCard = ({
    capsule,
    isFirst,
    isLast,
    onMoveUp,
    onMoveDown,
    onRemove,
    isReordering,
    isRemoving,
    isDragging,
    isDropTarget,
    onPointerDragStart,
}) => {
    const capsuleId = capsule.id || capsule._id;
    const individualId =
        capsule.individualCapsuleId?.id ||
        capsule.individualCapsuleId?._id ||
        capsule.individualCapsuleId;
    const categoryLike = isLikelyCategoryRow(capsule);
    const cardIndex = capsule.__index;

    return (
        <div
            data-capsule-index={cardIndex}
            className={`bg-white border rounded-xl p-5 shadow-sm transition-shadow select-none ${
                isDragging
                    ? 'opacity-50 border-[#2d2a71] ring-2 ring-[#2d2a7130] cursor-grabbing'
                    : isDropTarget
                      ? 'border-[#2d2a71] outline outline-2 outline-dashed outline-[#2d2a71]'
                      : 'border-gray-200 hover:shadow-md cursor-grab'
            } ${categoryLike ? 'border-amber-300 bg-amber-50/40' : ''}`}
            onPointerDown={(e) => {
                if (isReordering) return;
                // Ignore interactive controls (arrows / links / delete)
                if (e.target.closest('[data-no-drag]')) return;
                if (e.button !== 0) return;
                onPointerDragStart?.(e);
            }}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="p-1 text-gray-400" title="Drag the card to reorder">
                        <MdDragIndicator size={18} />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#2d2a71] bg-[#2d2a7112] px-3 py-1 rounded-full">
                        Capsule {capsule.capsuleNumber}
                    </span>
                </div>
                <div className="flex items-center gap-1" data-no-drag>
                    <button
                        type="button"
                        onClick={onMoveUp}
                        disabled={isFirst || isReordering}
                        className="p-1.5 rounded border border-gray-200 text-gray-400 hover:text-[#2d2a71] hover:border-[#2d2a71] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move up"
                    >
                        <FiChevronUp size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={onMoveDown}
                        disabled={isLast || isReordering}
                        className="p-1.5 rounded border border-gray-200 text-gray-400 hover:text-[#2d2a71] hover:border-[#2d2a71] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move down"
                    >
                        <FiChevronDown size={14} />
                    </button>
                    {individualId && (
                        <Link
                            to={`/individual-capsules/capsule/edit/${individualId}`}
                            className="flex items-center gap-1 p-1.5 rounded border border-gray-200 text-gray-400 hover:text-[#2d2a71] hover:border-[#2d2a71] transition-colors"
                            title="Edit capsule journey"
                        >
                            <FiExternalLink size={13} />
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={() => onRemove(capsuleId)}
                        disabled={isRemoving}
                        className="p-1.5 rounded border border-red-200 text-red-400 hover:text-red-600 hover:border-red-400 disabled:opacity-50 transition-colors"
                        title="Remove from journey"
                    >
                        <RiDeleteBin6Line size={13} />
                    </button>
                </div>
            </div>

            {categoryLike && (
                <p className="text-xs text-amber-700 mb-2 font-medium">
                    ⚠ This looks like a category, not a capsule. Remove it from the journey.
                </p>
            )}

            {capsule.thumbnail && (
                <img
                    className="w-full rounded-lg my-2 object-cover max-h-36 pointer-events-none"
                    src={capsule.thumbnail}
                    alt=""
                    draggable={false}
                />
            )}

            <h4 className="text-base font-semibold text-gray-800 mb-1 leading-snug">
                {capsule.title}
            </h4>

            {capsule.roadMapBrief && (
                <p className="text-xs text-[#2d2a71] font-medium mb-2">
                    {capsule.roadMapBrief}
                </p>
            )}

            {capsule.description && (
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {capsule.description}
                </p>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-400">
                {capsule.estimatedTime && (
                    <span className="flex items-center gap-1">
                        <FiClock size={12} /> {capsule.estimatedTime}
                    </span>
                )}
                {individualId ? (
                    <span className="flex items-center gap-1 text-green-600">
                        <FiLayers size={12} /> Linked capsule
                    </span>
                ) : (
                    <span className="flex items-center gap-1 text-amber-600">
                        <FiLayers size={12} /> Legacy / not linked
                    </span>
                )}
            </div>
        </div>
    );
};

const ExpeditionJourneyHomeEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading, isError } = useGetExpeditionJourneyByIdQuery(id);
    const { data: journeyData, isLoading: capsulesLoading, refetch: refetchCapsules } = useGetAllCaplesByJourneyIdQuery(id);
    const [updateJourney, { isLoading: isSaving }] = useUpdateExpeditionJourneyMutation();
    const [deleteJourney, { isLoading: isDeleting }] = useDeleteExpeditionJourneyMutation();
    const [updateOrder, { isLoading: isReordering }] = useUpdateJourneyCapsuleOrderMutation();
    const [removeCapsule, { isLoading: isRemoving }] = useRemoveJourneyCapsuleMutation();

    const rawCapsules = journeyData?.data?.results || journeyData?.data || [];
    const capsules = [...rawCapsules].sort((a, b) => a.capsuleNumber - b.capsuleNumber);

    const [form, setForm] = useState({ title: '', roadMapBrief: '', price: '', thumbnail: '' });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const [errors, setErrors] = useState({});
    const [dragIndex, setDragIndex] = useState(null);
    const [overIndex, setOverIndex] = useState(null);
    const dragRef = useRef({ active: false, from: null, over: null });
    const capsulesRef = useRef(capsules);
    capsulesRef.current = capsules;

    useEffect(() => {
        if (data?.data) {
            const { title, roadMapBrief, price, thumbnail } = data.data;
            setForm({
                title: title || '',
                roadMapBrief: roadMapBrief || '',
                price: price ?? '',
                thumbnail: thumbnail || '',
            });
        }
    }, [data]);

    // Always clear stuck drag if pointer is released anywhere (incl. outside window)
    useEffect(() => {
        const clearIfIdle = () => {
            if (!dragRef.current.active) return;
            dragRef.current = { active: false, from: null, over: null };
            setDragIndex(null);
            setOverIndex(null);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };
        window.addEventListener('blur', clearIfIdle);
        return () => window.removeEventListener('blur', clearIfIdle);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setThumbnailFile(file);
        setThumbnailPreview(URL.createObjectURL(file));
    };

    const validate = () => {
        const errs = {};
        if (!form.title.trim()) errs.title = 'Expedition title is required.';
        if (!form.roadMapBrief.trim()) errs.roadMapBrief = 'Roadmap brief is required.';
        if (!String(form.price)) errs.price = 'Price is required.';
        else if (isNaN(Number(form.price)) || Number(form.price) < 0) errs.price = 'Enter a valid price.';
        return errs;
    };

    const handleSave = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        try {
            await updateJourney({
                id,
                title: form.title.trim(),
                roadMapBrief: form.roadMapBrief.trim(),
                price: Number(form.price),
                ...(thumbnailFile ? { thumbnailFile } : {}),
            }).unwrap();
            setThumbnailFile(null);
            toast.success('Journey updated successfully');
        } catch (err) {
            toast.error(err?.data?.message ?? 'Failed to save journey');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this journey?')) return;
        try {
            await deleteJourney(id).unwrap();
            toast.success('Journey deleted');
            navigate('/expedition-journey');
        } catch (err) {
            toast.error(err?.data?.message ?? 'Failed to delete journey');
        }
    };

    const persistOrder = async (reordered) => {
        const payload = reordered.map((c, idx) => ({
            id: c.id || c._id,
            capsuleNumber: idx + 1,
        }));

        try {
            await updateOrder({ journeyId: id, capsules: payload }).unwrap();
            refetchCapsules();
            toast.success('Capsule order updated');
        } catch (err) {
            toast.error(err?.data?.message ?? 'Failed to update capsule order');
        }
    };

    const handleMoveUp = (index) => {
        if (index === 0) return;
        const reordered = [...capsules];
        [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
        persistOrder(reordered);
    };

    const handleMoveDown = (index) => {
        if (index >= capsules.length - 1) return;
        const reordered = [...capsules];
        [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
        persistOrder(reordered);
    };

    const indexFromPoint = (clientX, clientY) => {
        const el = document.elementFromPoint(clientX, clientY);
        const card = el?.closest?.('[data-capsule-index]');
        if (!card) return null;
        const idx = Number(card.getAttribute('data-capsule-index'));
        return Number.isNaN(idx) ? null : idx;
    };

    const endPointerDrag = (clientX, clientY) => {
        const from = dragRef.current.from;
        const over =
            clientX != null && clientY != null
                ? indexFromPoint(clientX, clientY)
                : dragRef.current.over;

        dragRef.current = { active: false, from: null, over: null };
        setDragIndex(null);
        setOverIndex(null);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';

        if (from == null || over == null || from === over) return;

        const list = [...capsulesRef.current];
        const [moved] = list.splice(from, 1);
        list.splice(over, 0, moved);
        persistOrder(list);
    };

    const handlePointerDragStart = (index) => (e) => {
        if (isReordering || capsules.length < 2) return;

        e.preventDefault();
        e.currentTarget.setPointerCapture?.(e.pointerId);

        dragRef.current = { active: true, from: index, over: index };
        setDragIndex(index);
        setOverIndex(index);
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';

        const onMove = (ev) => {
            if (!dragRef.current.active) return;
            const next = indexFromPoint(ev.clientX, ev.clientY);
            if (next == null || next === dragRef.current.over) return;
            dragRef.current.over = next;
            setOverIndex(next);
        };

        const onUp = (ev) => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
            endPointerDrag(ev.clientX, ev.clientY);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
    };

    const handleRemoveCapsule = async (capsuleId) => {
        if (!window.confirm('Remove this capsule from the journey?')) return;
        try {
            await removeCapsule(capsuleId).unwrap();
            toast.success('Capsule removed from journey');
            refetchCapsules();
        } catch (err) {
            toast.error(err?.data?.message ?? 'Failed to remove capsule');
        }
    };

    if (isLoading) {
        return (
            <div className="p-5 min-h-screen flex items-center justify-center">
                <p className="text-gray-500 text-sm">Loading journey details...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-5 min-h-screen flex items-center justify-center">
                <p className="text-red-500 text-sm">Failed to load journey. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="p-5 min-h-screen">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/expedition-journey')}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-white transition-colors text-gray-500"
                        >
                            <FiArrowLeft size={18} />
                        </button>
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800">Edit Expedition Journey</h2>
                            <p className="text-sm text-gray-500">Update journey details and capsule sequence</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="px-4 py-2 rounded-lg border border-red-200 text-red-500 text-sm hover:bg-red-50 disabled:opacity-60"
                        >
                            {isDeleting ? 'Deleting…' : 'Delete'}
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 rounded-lg bg-[#2d2a71] text-white text-sm flex items-center gap-2 hover:bg-[#23206b] disabled:opacity-60"
                        >
                            <FiSave size={14} />
                            {isSaving ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2d2a71]/30 bg-white text-sm ${errors.title ? 'border-red-400' : 'border-gray-200'}`}
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Roadmap brief</label>
                        <input
                            name="roadMapBrief"
                            value={form.roadMapBrief}
                            onChange={handleChange}
                            className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2d2a71]/30 bg-white text-sm ${errors.roadMapBrief ? 'border-red-400' : 'border-gray-200'}`}
                        />
                        {errors.roadMapBrief && <p className="text-red-500 text-xs mt-1">{errors.roadMapBrief}</p>}
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                        <input
                            type="number"
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            placeholder="Enter price"
                            min="0"
                            className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2d2a71]/30 bg-white text-sm ${errors.price ? 'border-red-400' : 'border-gray-200'}`}
                        />
                        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                    </div>
                    <div className="md:col-span-3 border-t border-gray-100 pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Journey cover image
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                            Shown on the journey page — this is not a capsule thumbnail.
                        </p>
                        <div className="flex items-center gap-4">
                            {(thumbnailPreview || form.thumbnail) && (
                                <img
                                    src={thumbnailPreview || form.thumbnail}
                                    alt="Journey cover"
                                    className="h-20 w-32 object-cover rounded-lg border border-gray-200"
                                />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleThumbnailChange}
                                className="text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="h-6 w-1 rounded bg-[#2d2a71] block" />
                            <h3 className="text-base font-semibold text-gray-800">
                                Capsules
                                {capsules.length > 0 && (
                                    <span className="ml-2 text-xs font-semibold bg-[#2d2a7115] text-[#2d2a71] px-2 py-0.5 rounded-full">
                                        {capsules.length}
                                    </span>
                                )}
                            </h3>
                        </div>
                        <Link
                            to={`/expedition-journey/capsule/create?journeyId=${id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-[#2d2a71] hover:bg-[#23206b] text-white rounded text-sm transition-colors"
                        >
                            <FiPlus size={14} /> Add a Capsule
                        </Link>
                    </div>

                    {capsules.length > 1 && (
                        <p className="text-xs text-gray-400 mb-3">
                            Hold and drag any capsule card onto another (or use ↑/↓) to reorder.
                        </p>
                    )}

                    {capsulesLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse space-y-3">
                                    <div className="h-3 w-24 bg-gray-100 rounded-full" />
                                    <div className="h-4 w-3/4 bg-gray-100 rounded" />
                                    <div className="h-3 w-full bg-gray-100 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : capsules.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {capsules.map((capsule, index) => (
                                <CapsuleCard
                                    key={capsule.id || capsule._id}
                                    capsule={{ ...capsule, __index: index }}
                                    isFirst={index === 0}
                                    isLast={index === capsules.length - 1}
                                    onMoveUp={() => handleMoveUp(index)}
                                    onMoveDown={() => handleMoveDown(index)}
                                    onRemove={handleRemoveCapsule}
                                    isReordering={isReordering}
                                    isRemoving={isRemoving}
                                    isDragging={dragIndex === index}
                                    isDropTarget={dragIndex != null && overIndex === index && dragIndex !== index}
                                    onPointerDragStart={handlePointerDragStart(index)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg p-8 text-center">
                            <FiLayers size={28} className="mx-auto mb-2 text-gray-300" />
                            No capsules yet. Click <strong className="text-[#2d2a71]">&quot;Add a Capsule&quot;</strong> to select existing individual capsules.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ExpeditionJourneyHomeEdit;
