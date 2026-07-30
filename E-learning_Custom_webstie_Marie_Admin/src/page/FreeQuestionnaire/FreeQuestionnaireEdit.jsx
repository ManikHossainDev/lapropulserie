import React, { useState, useEffect } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate, useParams } from "react-router-dom";
import {
    useGetFreeQuestionnaireByIdQuery,
    useUpdateFreeQuestionnaireMutation,
} from "../../redux/features/FreeQuestionnaire/freeQuestionnaire";
import { toast } from "sonner";

// ── Type maps ────────────────────────────────────────────────────────────────
const API_TO_UI = {
    "Single Select": "Single Option",
    "Multiple Select": "Multiple Option",
    "Text Area": "Text",
    "Text Input": "Text",
};
const UI_TO_API = {
    "Single Option": "Single Select",
    "Multiple Option": "Multiple Select",
    "Text": "Text Input",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const makeQuestion = () => ({
    _uid: Date.now() + Math.random(),
    mongoId: null,
    title: "",
    questionText: "",
    type: "Single Option",
    helpText: "",
    options: [{ _uid: Date.now() + Math.random(), text: "", isCorrect: false }],
});

const makeOption = () => ({ _uid: Date.now() + Math.random(), text: "", isCorrect: false });

// ── Component ────────────────────────────────────────────────────────────────
const FreeQuestionnaireEdit = () => {
    const { id } = useParams();

    const { data, isLoading, isError, refetch } =
        useGetFreeQuestionnaireByIdQuery({ questionaryId: id });

    const fullData = data?.data ?? {};

    const [updateFreeQuestionnaire, { isLoading: isSaving }] =
        useUpdateFreeQuestionnaireMutation();

    // ── Local state ──────────────────────────────────────────────────────────
    const [sectionTitle, setSectionTitle] = useState("");
    const [sectionBrief, setSectionBrief] = useState("");
    const [questions, setQuestions] = useState([makeQuestion()]);
    const [deletedQuestionIds, setDeletedQuestionIds] = useState([]);
    const navigate = useNavigate();

    // ── Populate from API ────────────────────────────────────────────────────
    useEffect(() => {
        if (!data) return;

        setSectionTitle(fullData.title ?? "");
        setSectionBrief(fullData.brief ?? "");

        if (Array.isArray(fullData?.questions) && fullData?.questions?.length > 0) {
            setQuestions(
                fullData?.questions?.map((q) => ({
                    _uid: Date.now() + Math.random(),
                    mongoId: q.id ?? null,
                    title: q.title ?? "",
                    questionText: q.questionText ?? q.title ?? "",
                    type: API_TO_UI[q.type] ?? "Single Option",
                    helpText: q.helperText ?? "",
                    options: Array.isArray(q.options)
                        ? q.options.map((o) => ({
                            _uid: Date.now() + Math.random(),
                            text: o.details ?? "",
                            isCorrect: o.isCorrect ?? false,
                        }))
                        : [makeOption()],
                }))
            );
        }
        setDeletedQuestionIds([]);
    }, [data]);

    // ── Question handlers ────────────────────────────────────────────────────
    const addQuestion = () =>
        setQuestions((prev) => [...prev, makeQuestion()]);

    const deleteQuestion = (qUid) => {
        setQuestions((prev) => {
            const target = prev.find((q) => q._uid === qUid);
            if (target?.mongoId) {
                setDeletedQuestionIds((ids) => [...ids, target.mongoId]);
            }
            return prev.filter((q) => q._uid !== qUid);
        });
    };

    const updateQuestion = (qUid, field, value) =>
        setQuestions((prev) =>
            prev.map((q) => (q._uid === qUid ? { ...q, [field]: value } : q))
        );

    // ── Option handlers ──────────────────────────────────────────────────────
    const addOption = (qUid) =>
        setQuestions((prev) =>
            prev.map((q) =>
                q._uid === qUid
                    ? { ...q, options: [...q.options, makeOption()] }
                    : q
            )
        );

    const deleteOption = (qUid, optUid) =>
        setQuestions((prev) =>
            prev.map((q) =>
                q._uid === qUid
                    ? { ...q, options: q.options.filter((o) => o._uid !== optUid) }
                    : q
            )
        );

    const updateOption = (qUid, optUid, field, value) =>
        setQuestions((prev) =>
            prev.map((q) =>
                q._uid === qUid
                    ? {
                        ...q,
                        options: q.options.map((o) =>
                            o._uid === optUid ? { ...o, [field]: value } : o
                        ),
                    }
                    : q
            )
        );

    // ── Save ─────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        // Basic validation
        if (!sectionTitle.trim()) {
            alert("Section title is required.");
            return;
        }

        const formatQuestion = (q, sl) => ({
            sl,
            title: q.title.trim() || q.questionText.trim(),
            type: UI_TO_API[q.type] ?? "Single Select",
            helperText: q.helpText.trim(),
            ...(q.type !== "Text" && {
                options: q.options.map((o, oi) => ({
                    sl: oi + 1,
                    details: o.text.trim(),
                    isCorrect: o.isCorrect,
                })),
            }),
        });

        const createItems = [];
        const updateItems = [];

        questions.forEach((q, qi) => {
            const formatted = formatQuestion(q, qi + 1);
            if (q.mongoId) {
                updateItems.push({ id: q.mongoId, ...formatted });
            } else {
                createItems.push(formatted);
            }
        });

        const questionsPayload = {};
        if (createItems.length) questionsPayload.create = createItems;
        if (updateItems.length) questionsPayload.update = updateItems;
        if (deletedQuestionIds.length) questionsPayload.delete = deletedQuestionIds;

        const payload = {
            title: sectionTitle.trim(),
            brief: sectionBrief.trim(),
            category: fullData?.category ?? "free",
            ...(Object.keys(questionsPayload).length > 0 && {
                questions: questionsPayload,
            }),
        };

        console.log(payload)

        try {
            const res = await updateFreeQuestionnaire({
                questionaryId: id,
                body: payload,
            }).unwrap();

            console.log(res)
            // alert("Questionnaire updated successfully!");
            toast.success("Questionnaire updated successfully!");
            refetch();
            navigate("/free-questionnaire");
        } catch (err) {
            console.error("Update failed:", err);
            // alert("Failed to update questionnaire. Please try again.");
            toast.error("Failed to update questionnaire. Please try again.");
        }
    };

    // ── Loading / error states ────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="p-5 min-h-screen flex items-center justify-center">
                <p className="text-gray-500 text-lg">Loading questionnaire…</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-5 min-h-screen flex items-center justify-center">
                <p className="text-red-500 text-lg">
                    Failed to load questionnaire. Please refresh.
                </p>
            </div>
        );
    }

    // ── UI ────────────────────────────────────────────────────────────────────
    return (
        <div className="p-5 min-h-screen">
            <h2 className="text-3xl font-semibold mb-5 text-[#2d2a71]">
                Edit Questionnaire
            </h2>

            <div className="rounded-lg space-y-6">

                {/* ── Basic Information ── */}
                <div className="border p-5 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="h-6 rounded w-1 bg-[#2d2a71] block" />
                        <h2 className="text-lg font-semibold">Basic Information</h2>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-gray-600 font-medium">
                            Section Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter section title"
                            value={sectionTitle}
                            onChange={(e) => setSectionTitle(e.target.value)}
                            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#2d2a71]"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-gray-600 font-medium">
                            Section Brief <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Enter section brief"
                            value={sectionBrief}
                            onChange={(e) => setSectionBrief(e.target.value)}
                            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#2d2a71]"
                        />
                    </div>
                </div>

                {/* ── Questions ── */}
                <div className="space-y-6 border p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                        <span className="h-6 rounded w-1 bg-[#2d2a71] block" />
                        <h2 className="text-lg font-semibold">Questionnaire</h2>
                    </div>

                    {questions.map((q, index) => (
                        <div key={q._uid} className="border p-4 rounded-lg bg-gray-50 space-y-3">

                            {/* Question header */}
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-[#2d2a71]">
                                    Question {index + 1}
                                </h3>
                                <button
                                    onClick={() => deleteQuestion(q._uid)}
                                    className="text-white bg-red-500 hover:bg-red-600 py-1.5 px-4 rounded text-sm flex items-center gap-1.5 transition-colors"
                                >
                                    <RiDeleteBin6Line /> Delete
                                </button>
                            </div>

                            {/* Title */}
                            <div className="space-y-1">
                                <label className="text-sm text-gray-600 font-medium">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter question title"
                                    value={q.title}
                                    onChange={(e) =>
                                        updateQuestion(q._uid, "title", e.target.value)
                                    }
                                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#2d2a71]"
                                />
                            </div>

                            {/* Question text */}
                            <div className="space-y-1">
                                <label className="text-sm text-gray-600 font-medium">
                                    Question Text
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter the full question"
                                    value={q.questionText}
                                    onChange={(e) =>
                                        updateQuestion(q._uid, "questionText", e.target.value)
                                    }
                                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#2d2a71]"
                                />
                            </div>

                            {/* Type */}
                            <div className="space-y-1">
                                <label className="text-sm text-gray-600 font-medium">
                                    Question Type
                                </label>
                                <select
                                    value={q.type}
                                    onChange={(e) =>
                                        updateQuestion(q._uid, "type", e.target.value)
                                    }
                                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#2d2a71] bg-white"
                                >
                                    <option>Single Option</option>
                                    <option>Multiple Option</option>
                                    <option>Text</option>
                                </select>
                            </div>

                            {/* Help text */}
                            <div className="space-y-1">
                                <label className="text-sm text-gray-600 font-medium">
                                    Help Text / Instructions
                                </label>
                                <input
                                    type="text"
                                    placeholder="Optional hint for the user"
                                    value={q.helpText}
                                    onChange={(e) =>
                                        updateQuestion(q._uid, "helpText", e.target.value)
                                    }
                                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#2d2a71]"
                                />
                            </div>

                            {/* Options (hidden for Text type) */}
                            {q.type !== "Text" && (
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-600 font-medium block">
                                        Answer Options
                                    </label>

                                    {q.options.map((opt, i) => (
                                        <div key={opt._uid} className="flex items-center gap-2">
                                            {/* Correct toggle */}
                                            <input
                                                type={
                                                    q.type === "Single Option"
                                                        ? "radio"
                                                        : "checkbox"
                                                }
                                                title="Mark as correct"
                                                checked={opt.isCorrect}
                                                name={`correct-${q._uid}`}
                                                onChange={(e) => {
                                                    if (q.type === "Single Option") {
                                                        setQuestions((prev) =>
                                                            prev.map((pq) =>
                                                                pq._uid === q._uid
                                                                    ? {
                                                                        ...pq,
                                                                        options: pq.options.map(
                                                                            (o) => ({
                                                                                ...o,
                                                                                isCorrect:
                                                                                    o._uid === opt._uid,
                                                                            })
                                                                        ),
                                                                    }
                                                                    : pq
                                                            )
                                                        );
                                                    } else {
                                                        updateOption(
                                                            q._uid,
                                                            opt._uid,
                                                            "isCorrect",
                                                            e.target.checked
                                                        );
                                                    }
                                                }}
                                                className="accent-[#2d2a71] w-4 h-4 flex-shrink-0"
                                            />

                                            <input
                                                type="text"
                                                placeholder={`Option ${i + 1}`}
                                                value={opt.text}
                                                onChange={(e) =>
                                                    updateOption(
                                                        q._uid,
                                                        opt._uid,
                                                        "text",
                                                        e.target.value
                                                    )
                                                }
                                                className="flex-1 border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#2d2a71]"
                                            />

                                            {opt.isCorrect && (
                                                <span className="text-xs text-green-600 font-medium whitespace-nowrap">
                                                    ✓ Correct
                                                </span>
                                            )}

                                            <button
                                                onClick={() => deleteOption(q._uid, opt._uid)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded transition-colors"
                                            >
                                                <RiDeleteBin6Line />
                                            </button>
                                        </div>
                                    ))}

                                    <p className="text-xs text-gray-400">
                                        {q.type === "Single Option"
                                            ? "Select the radio button to mark the correct answer."
                                            : "Check all correct answers."}
                                    </p>

                                    <button
                                        onClick={() => addOption(q._uid)}
                                        className="text-[#2d2a71] text-sm font-medium hover:underline mt-1"
                                    >
                                        + Add Option
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    <button
                        onClick={addQuestion}
                        className="bg-[#2d2a71] hover:bg-[#23206b] text-white px-4 py-2 rounded transition-colors"
                    >
                        + Add Question
                    </button>
                </div>

                {/* ── Footer ── */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-[#2d2a71] hover:bg-[#23206b] disabled:opacity-60 disabled:cursor-not-allowed text-white px-8 py-3 rounded font-semibold transition-colors"
                    >
                        {isSaving ? "Saving…" : "Save Section"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FreeQuestionnaireEdit;