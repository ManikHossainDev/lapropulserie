import React, { useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { useCreateFreeQuestionnaireMutation } from "../../redux/features/FreeQuestionnaire/freeQuestionnaire";
import { toast } from "sonner";

// Question types exactly as the API expects
const QUESTION_TYPES = ["Single Select", "Multiple Select", "Text Input", "Text Area"];

// ── tiny helpers ────────────────────────────────────────────────────────────
const uid = () => Date.now() + Math.random();

const blankOption = (sl) => ({ _uid: uid(), sl, details: "", isCorrect: false });

const blankQuestion = (sl) => ({
  _uid: uid(),
  sl,
  title: "",
  type: "Single Select",
  helperText: "",
  options: [blankOption(1), blankOption(2)],
});

// ── component ───────────────────────────────────────────────────────────────
const FreeQuestionnaireCreate = () => {
  const navigate = useNavigate();
  const [createFreeQuestion, { isLoading }] = useCreateFreeQuestionnaireMutation();

  // Section-level fields
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [category, setCategory] = useState("free");

  // Questions
  const [questions, setQuestions] = useState([blankQuestion(1)]);

  // ── question handlers ────────────────────────────────────────────────────
  const addQuestion = () => {
    setQuestions((prev) => [...prev, blankQuestion(prev.length + 1)]);
  };

  const deleteQuestion = (_uid) => {
    setQuestions((prev) =>
      prev
        .filter((q) => q._uid !== _uid)
        .map((q, i) => ({ ...q, sl: i + 1 }))
    );
  };

  const updateQuestion = (_uid, field, value) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q._uid !== _uid) return q;
        const updated = { ...q, [field]: value };
        // Reset options when switching to/from Text Area
        if (field === "type") {
          if (value === "Text Area") {
            updated.options = [];
          } else if (!q.options.length) {
            updated.options = [blankOption(1), blankOption(2)];
          }
        }
        return updated;
      })
    );
  };

  // ── option handlers ──────────────────────────────────────────────────────
  const addOption = (q_uid) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q._uid !== q_uid
          ? q
          : { ...q, options: [...q.options, blankOption(q.options.length + 1)] }
      )
    );
  };

  const deleteOption = (q_uid, opt_uid) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q._uid !== q_uid
          ? q
          : {
            ...q,
            options: q.options
              .filter((o) => o._uid !== opt_uid)
              .map((o, i) => ({ ...o, sl: i + 1 })),
          }
      )
    );
  };

  const updateOption = (q_uid, opt_uid, field, value) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q._uid !== q_uid
          ? q
          : {
            ...q,
            options: q.options.map((o) =>
              o._uid !== opt_uid ? o : { ...o, [field]: value }
            ),
          }
      )
    );
  };

  // For Single Select — selecting one correct answer deselects all others
  const handleCorrectToggle = (q_uid, opt_uid, qType) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q._uid !== q_uid) return q;
        return {
          ...q,
          options: q.options.map((o) => ({
            ...o,
            isCorrect:
              qType === "Single Select"
                ? o._uid === opt_uid          // only this one is correct
                : o._uid === opt_uid
                  ? !o.isCorrect              // toggle for Multiple Select
                  : o.isCorrect,
          })),
        };
      })
    );
  };

  // ── validation ───────────────────────────────────────────────────────────
  const validate = () => {
    if (!title.trim()) return "Section title is required.";
    if (!brief.trim()) return "Section brief is required.";
    for (const q of questions) {
      if (!q.title.trim()) return `Question ${q.sl} title is required.`;
      if (q.type !== "Text Area") {
        if (q.options.length < 2) return `Question ${q.sl} needs at least 2 options.`;
        if (q.options.some((o) => !o.details.trim()))
          return `All options in Question ${q.sl} must have text.`;
      }
    }
    return null;
  };

  // ── submit ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const error = validate();
    if (error) return alert(error);

    // Build payload exactly matching the API shape
    const payload = {
      title: title.trim(),
      brief: brief.trim(),
      category,
      questions: questions.map((q) => {
        const qPayload = {
          sl: q.sl,
          title: q.title.trim(),
          type: q.type,
          ...(q.helperText.trim() && { helperText: q.helperText.trim() }),
        };
        if (q.type !== "Text Area") {
          qPayload.options = q.options.map((o) => ({
            sl: o.sl,
            details: o.details.trim(),
            isCorrect: o.isCorrect,
          }));
        }
        return qPayload;
      }),
    };

    try {
      await createFreeQuestion(payload).unwrap();
      toast.success("Section created successfully!");
      // navigate("/free-questionnaire");
      window.location.href = '/free-questionnaire'
    } catch (err) {
      console.error("Create failed:", err);
      alert(err?.data?.message ?? "Something went wrong. Please try again.");
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-5 min-h-screen">
      <h2 className="text-3xl font-semibold mb-5 text-[#2d2a71]">
        Create Questionnaire
      </h2>

      <div className="rounded-lg space-y-6">

        {/* ── Basic Information ── */}
        <div className="border p-5 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-6 rounded w-1 bg-[#2d2a71] block" />
            <h2 className="text-lg font-semibold">Basic Information</h2>
          </div>

          <input
            type="text"
            placeholder="Section Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
          />

          <textarea
            placeholder="Section Brief *"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={3}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
          />

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full md:w-1/3 border px-3 py-2 rounded focus:outline-none focus:ring"
            >
              <option value="free">Free</option>
              <option value="module">Module</option>
            </select>
          </div>
        </div>

        {/* ── Questions ── */}
        <div className="space-y-6 border p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="h-6 rounded w-1 bg-[#2d2a71] block" />
            <h2 className="text-lg font-semibold">Questionnaire</h2>
            <span className="text-sm text-gray-400">({questions.length} question{questions.length !== 1 ? "s" : ""})</span>
          </div>

          {questions.map((q, index) => (
            <div key={q._uid} className="border p-4 rounded-lg bg-gray-50 space-y-3">

              {/* Question header */}
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Question {index + 1}</h3>
                <button
                  onClick={() => deleteQuestion(q._uid)}
                  disabled={questions.length === 1}
                  className="text-white bg-red-500 hover:bg-red-600 disabled:opacity-40 py-1.5 px-4 rounded text-sm flex items-center gap-1"
                >
                  <RiDeleteBin6Line /> Delete
                </button>
              </div>

              {/* Title */}
              <input
                type="text"
                placeholder="Question Title *"
                value={q.title}
                onChange={(e) => updateQuestion(q._uid, "title", e.target.value)}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
              />

              {/* Type */}
              <select
                value={q.type}
                onChange={(e) => updateQuestion(q._uid, "type", e.target.value)}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              {/* Helper text */}
              <input
                type="text"
                placeholder="Helper Text / Instructions (optional)"
                value={q.helperText}
                onChange={(e) => updateQuestion(q._uid, "helperText", e.target.value)}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
              />

              {/* Options (hidden for Text Area) */}
              {q.type !== "Text Area" && (
                <div>
                  <h4 className="font-medium mb-2 text-sm">
                    Answer Options
                    <span className="text-gray-400 font-normal ml-1">
                      — tick the correct answer{q.type === "Multiple Select" ? "s" : ""}
                    </span>
                  </h4>

                  {q.options.map((opt, i) => (
                    <div key={opt._uid} className="flex items-center gap-2 mb-2">

                      {/* Correct toggle */}
                      <input
                        type={q.type === "Single Select" ? "radio" : "checkbox"}
                        checked={opt.isCorrect}
                        onChange={() => handleCorrectToggle(q._uid, opt._uid, q.type)}
                        className="accent-[#2d2a71] w-4 h-4 shrink-0"
                        title="Mark as correct"
                      />

                      <input
                        type="text"
                        placeholder={`Option ${i + 1}`}
                        value={opt.details}
                        onChange={(e) =>
                          updateOption(q._uid, opt._uid, "details", e.target.value)
                        }
                        className="flex-1 border px-3 py-2 rounded focus:outline-none focus:ring"
                      />

                      <button
                        onClick={() => deleteOption(q._uid, opt._uid)}
                        disabled={q.options.length <= 2}
                        className="bg-red-500 disabled:opacity-40 text-white px-3 py-2 rounded hover:bg-red-600"
                      >
                        <RiDeleteBin6Line />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addOption(q._uid)}
                    className="text-blue-600 text-sm mt-1 hover:underline"
                  >
                    + Add Option
                  </button>
                </div>
              )}

              {/* Text Area preview hint */}
              {q.type === "Text Area" && (
                <div className="bg-white border border-dashed border-gray-300 rounded px-3 py-2 text-sm text-gray-400">
                  Free-text answer — no options needed
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Question */}
        <button
          onClick={addQuestion}
          className="bg-[#2d2a71] hover:bg-[#3d3a91] text-white px-4 py-2 rounded transition"
        >
          + Add Question
        </button>

        {/* Save */}
        <div className="text-right">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-[#2d2a71] hover:bg-[#3d3a91] disabled:opacity-50 text-white px-6 py-3 rounded font-semibold transition"
          >
            {isLoading ? "Saving…" : "Save Section"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreeQuestionnaireCreate;