import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiLayers, FiDollarSign } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import {
    useGetAllExpeditionJourneysQuery,
    useDeleteExpeditionJourneyMutation,
} from '../../redux/features/ExpeditionJourney/ExpeditionJourney';
import { MdOutlineNoteAdd } from 'react-icons/md';

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);

const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

// ── Card ──────────────────────────────────────────────────────────────────────
const JourneyCard = ({ journey, onDelete, isDeleting }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">

        {/* Top row: badge + actions */}
        <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                journey.journeyType === 'regular'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-purple-50 text-purple-600'
            }`}>
                {journey.journeyType}
            </span>

            <div className="flex items-center gap-2">
                <Link
                    to={`/expedition-journey/capsule/create?journeyId=${journey.id}`}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#2d2a71] hover:bg-[#2d2a71]/10 transition-colors"
                    title="Edit"
                >
                    <MdOutlineNoteAdd size={15} />
                </Link>
                <Link
                    to={`/expedition-journey/edit/${journey.id}`}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#2d2a71] hover:bg-[#2d2a71]/10 transition-colors"
                    title="Edit"
                >
                    <FiEdit2 size={15} />
                </Link>
                <button
                    onClick={() => onDelete(journey.id)}
                    disabled={isDeleting}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Delete"
                >
                    <FiTrash2 size={15} />
                </button>
            </div>
        </div>

        {/* Title + description */}
        <div>
            <h3 className="font-semibold text-gray-900 text-base leading-snug">{journey.title}</h3>
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                {journey.roadMapBrief || journey.description || 'No description provided.'}
            </p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
                <FiLayers size={13} className="text-[#2d2a71]" />
                {journey.totalCapsules ?? journey.numberOfCapsule ?? 0} Capsules
            </span>
            <span className="flex items-center gap-1">
                <FiStar size={13} className="text-amber-400" />
                {journey.averageRating?.toFixed(1) ?? '0.0'}
                <span className="text-gray-400">({journey.totalReviewCount ?? 0})</span>
            </span>
        </div>

        {/* Footer: price + date */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="font-bold text-[#2d2a71] text-lg flex items-center gap-0.5">
                <FiDollarSign size={15} />
                {formatPrice(journey.price).replace('$', '')}
            </span>
            <span className="text-xs text-gray-400">Updated {formatDate(journey.updatedAt)}</span>
        </div>
    </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const ExpeditionJourneyHome = () => {
    const { data, isLoading } = useGetAllExpeditionJourneysQuery();
    const [deleteExpeditionJourney] = useDeleteExpeditionJourneyMutation();

    const [deletedIds, setDeletedIds] = useState(new Set());
    const [deletingId, setDeletingId] = useState(null);

    const rawList = data?.data ?? [];
    const journeys = rawList.filter((j) => !deletedIds.has(j.id));

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this journey?')) return;
        setDeletingId(id);
        try {
            await deleteExpeditionJourney(id).unwrap();
            setDeletedIds((prev) => new Set(prev).add(id));
        } catch (err) {
            console.error('Delete failed:', err);
            alert(err?.data?.message ?? 'Failed to delete. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="p-6 min-h-screen">

            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Expedition Journeys</h1>
                    {!isLoading && (
                        <p className="text-sm text-gray-400 mt-0.5">{journeys.length} journey{journeys.length !== 1 ? 's' : ''}</p>
                    )}
                </div>
                <Link
                    to="/expedition-journey/create"
                    className="py-2.5 px-6 bg-[#2d2a71] hover:bg-[#23206b] rounded text-white flex items-center gap-2 text-sm font-medium transition-colors"
                >
                    <FiPlus size={16} /> Create New Journey
                </Link>
            </div>

            {/* Skeleton */}
            {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse space-y-3">
                            <div className="h-4 bg-gray-100 rounded w-1/3" />
                            <div className="h-5 bg-gray-100 rounded w-2/3" />
                            <div className="h-3 bg-gray-100 rounded w-full" />
                            <div className="h-3 bg-gray-100 rounded w-4/5" />
                            <div className="h-px bg-gray-100 rounded mt-2" />
                            <div className="flex justify-between">
                                <div className="h-5 bg-gray-100 rounded w-16" />
                                <div className="h-4 bg-gray-100 rounded w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Cards grid */}
            {!isLoading && journeys.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {journeys.map((journey) => (
                        <JourneyCard
                            key={journey.id}
                            journey={journey}
                            onDelete={handleDelete}
                            isDeleting={deletingId === journey.id}
                        />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!isLoading && journeys.length === 0 && (
                <div className="h-[60vh] flex flex-col items-center justify-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-full bg-[#2d2a71]/10 flex items-center justify-center">
                        <FiLayers size={24} className="text-[#2d2a71]" />
                    </div>
                    <p className="text-gray-500 text-sm">No journeys yet.</p>
                    <Link
                        to="/expedition-journey/create"
                        className="text-[#2d2a71] text-sm font-medium hover:underline"
                    >
                        Create your first journey →
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ExpeditionJourneyHome;