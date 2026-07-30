import React, { useState } from "react";
import { FiArrowLeft, FiCheck, FiPlus } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    useGetAvailableIndividualCapsulesQuery,
    useLinkCapsulesToJourneyMutation,
} from "../../redux/features/ExpeditionJourney/ExpeditionJourney";
import { toast } from "sonner";

const ExpeditionJourneyCapsuleCreate = () => {
    const [searchParams] = useSearchParams();
    const journeyId = searchParams.get("journeyId");
    const navigate = useNavigate();

    const { data, isLoading, isError } = useGetAvailableIndividualCapsulesQuery(journeyId, {
        skip: !journeyId,
    });
    const [linkCapsules, { isLoading: isLinking }] = useLinkCapsulesToJourneyMutation();

    const [selected, setSelected] = useState([]);

    const capsules = data?.data || [];

    const toggleSelect = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!journeyId) {
            toast.error("Missing journey ID");
            return;
        }
        if (!selected.length) {
            toast.error("Select at least one capsule to add");
            return;
        }

        try {
            await linkCapsules({
                journeyId,
                individualCapsuleIds: selected,
            }).unwrap();
            toast.success(
                selected.length === 1
                    ? "Capsule added to journey"
                    : `${selected.length} capsules added to journey`
            );
            navigate(`/expedition-journey/edit/${journeyId}`);
        } catch (err) {
            console.error("Link capsules error:", err);
            toast.error(err?.data?.message ?? "Failed to add capsules");
        }
    };

    if (!journeyId) {
        return (
            <div className="p-6 text-center text-red-500 text-sm">
                No journey ID provided. Go back and try again.
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 flex justify-center">
            <form onSubmit={handleSubmit} className="w-full max-w-3xl bg-gray-100 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(`/expedition-journey/edit/${journeyId}`)}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-white transition-colors text-gray-500"
                        >
                            <FiArrowLeft size={18} />
                        </button>
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800">Add a Capsule</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Select existing individual capsules to include in this expedition
                            </p>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLinking || !selected.length}
                        className="text-sm bg-[#2d2a71] text-white py-3 px-5 rounded-lg flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#3d3a8f] transition"
                    >
                        {isLinking ? "Adding…" : `Add ${selected.length || ""} Capsule${selected.length !== 1 ? "s" : ""}`}
                        <FiPlus />
                    </button>
                </div>

                {isLoading ? (
                    <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-sm animate-pulse">
                        Loading available capsules…
                    </div>
                ) : isError ? (
                    <div className="bg-white rounded-xl p-8 text-center text-red-500 text-sm">
                        Failed to load capsules. Please try again.
                    </div>
                ) : capsules.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-sm border border-dashed border-gray-200">
                        No individual capsules available to add.
                        <br />
                        <span className="text-xs mt-2 block">
                            Create capsules under Individual Capsules first, or all capsules are already in this journey.
                        </span>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {capsules.map((capsule) => {
                            const id = capsule.id || capsule._id;
                            const isSelected = selected.includes(id);
                            const category = capsule.capsuleCategoryId;

                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => toggleSelect(id)}
                                    className={`w-full text-left bg-white rounded-xl p-4 border-2 transition-all flex gap-4 items-start ${
                                        isSelected
                                            ? "border-[#2d2a71] shadow-md"
                                            : "border-transparent hover:border-gray-200"
                                    }`}
                                >
                                    <div
                                        className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                                            isSelected
                                                ? "bg-[#2d2a71] border-[#2d2a71] text-white"
                                                : "border-gray-300"
                                        }`}
                                    >
                                        {isSelected && <FiCheck size={12} />}
                                    </div>

                                    {capsule.thumbnail ? (
                                        <img
                                            src={capsule.thumbnail}
                                            alt=""
                                            className="w-20 h-14 object-cover rounded-lg flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-20 h-14 bg-gray-100 rounded-lg flex-shrink-0" />
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-800 text-sm leading-snug">
                                            {capsule.title}
                                        </h4>
                                        {category?.title && (
                                            <p className="text-xs text-[#2d2a71] font-medium mt-0.5">
                                                {category.title}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                            {capsule.description}
                                        </p>
                                        {category?.estimatedDuration && (
                                            <span className="text-xs text-gray-400 mt-1 inline-block">
                                                {category.estimatedDuration}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </form>
        </div>
    );
};

export default ExpeditionJourneyCapsuleCreate;
