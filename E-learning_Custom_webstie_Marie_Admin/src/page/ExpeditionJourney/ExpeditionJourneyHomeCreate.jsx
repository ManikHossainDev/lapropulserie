import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useCreateExpeditionJourneyMutation } from "../../redux/features/ExpeditionJourney/ExpeditionJourney";
import { toast } from "sonner";

const ExpeditionJourneyHomeCreate = () => {
    const navigate = useNavigate();
    const [createExpeditionJourney, { isLoading: isSaving }] = useCreateExpeditionJourneyMutation();

    const [form, setForm] = useState({
        title: "",
        roadMapBrief: "",
        price: "",
    });

    const [errors, setErrors] = useState({});

    // ── Field change ─────────────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // clear error on type
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    // ── Validation ───────────────────────────────────────────────────────────
    const validate = () => {
        const errs = {};
        if (!form.title.trim()) errs.title = "Expedition title is required.";
        if (!form.roadMapBrief.trim()) errs.roadMapBrief = "Roadmap brief is required.";
        if (!form.price) errs.price = "Price is required.";
        else if (isNaN(Number(form.price)) || Number(form.price) < 0)
            errs.price = "Enter a valid price.";
        return errs;
    };

    // ── Save ─────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        const payload = {
            title: form.title.trim(),
            roadMapBrief: form.roadMapBrief.trim(),
            price: Number(form.price),
        };

        try {
            const res = await createExpeditionJourney(payload).unwrap();

            toast.success("Expedition Journey created successfully!");
            navigate("/expedition-journey"); // adjust route as needed
        } catch (err) {
            console.error("Create failed:", err);
            alert(err?.data?.message ?? "Failed to create. Please try again.");
        }
    };

    // ── UI ────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex justify-center">
            <div className="w-full bg-white rounded-2xl shadow-sm p-5">

                {/* ── Expedition Info ── */}
                <div className="bg-gray-100 rounded-lg p-5 space-y-5">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Expedition Journey Information
                        </h2>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-8 py-2 bg-[#2d2a71] text-white rounded transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSaving ? "Saving…" : "Save"}
                        </button>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expedition Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Enter Expedition Title"
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.title ? "border-red-400" : "border-gray-200"
                                }`}
                        />
                        {errors.title && (
                            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                        )}
                    </div>

                    {/* Roadmap Brief */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Roadmap Brief <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows="3"
                            name="roadMapBrief"
                            value={form.roadMapBrief}
                            onChange={handleChange}
                            placeholder="Enter Roadmap Brief"
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.roadMapBrief ? "border-red-400" : "border-gray-200"
                                }`}
                        />
                        {errors.roadMapBrief && (
                            <p className="text-red-500 text-xs mt-1">{errors.roadMapBrief}</p>
                        )}
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price ($) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            placeholder="Enter price in USD"
                            min="0"
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.price ? "border-red-400" : "border-gray-200"
                                }`}
                        />
                        {errors.price && (
                            <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                        )}
                    </div>
                </div>

                {/* ── Capsules ── */}
                {/* <div className="bg-gray-100 rounded-lg p-5 mt-5">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-md font-semibold text-gray-800">Capsules</h3>
                        <Link
                            to="/expedition-journey/capsule/create"
                            className="px-4 py-2 text-sm bg-[#2d2a71] text-white rounded transition flex items-center gap-2"
                        >
                            <FiPlus /> Create New Capsule
                        </Link>
                    </div>

                    <div className="text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg p-4 text-center">
                        No capsules yet. Click "Create New Capsule" to get started.
                    </div>
                </div> */}

            </div>
        </div>
    );
};

export default ExpeditionJourneyHomeCreate;