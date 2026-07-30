import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MdOutlineKeyboardArrowLeft } from 'react-icons/md';
import { FiUploadCloud, FiX, FiPlus, FiTrash2, FiLink } from 'react-icons/fi';
import { useCreateCapsuleMutation } from '../../redux/features/Individualcapsule/Individualcapsule';
import { toast } from 'sonner';
import {
  appendCapsuleFiles,
  buildCapsulePayload,
  validateCapsuleForm,
  validateCapsuleVideoFiles,
} from './capsuleFormUtils';

// ── Shared style ──────────────────────────────────────────────────────────────
const inputCls = 'h-11 border border-[#eaecf4] rounded-xl px-4 text-sm text-[#1a1a2e] placeholder:text-[#aab0c6] bg-[#fafafa] focus:outline-none focus:border-[#6c63ff] focus:bg-white transition-colors w-full';
const textareaCls = 'border border-[#eaecf4] rounded-xl px-4 py-3 text-sm text-[#1a1a2e] placeholder:text-[#aab0c6] bg-[#fafafa] focus:outline-none focus:border-[#6c63ff] focus:bg-white transition-colors resize-none w-full';

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ number, title, subtitle }) => (
  <div className="px-6 py-4 border-b border-[#eaecf4] flex items-center gap-3">
    <div className="w-8 h-8 rounded-full bg-[#2d2a71] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
      {number}
    </div>
    <div>
      <h2 className="text-base font-bold text-[#2d2a71]">{title}</h2>
      {subtitle && <p className="text-xs text-[#aab0c6] mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

// ── Video Field — upload or embed link ────────────────────────────────────────
const VideoField = ({ label, fileKey, embedKey, fileState, setFileState, embedState, setEmbedState }) => {
  const [mode, setMode] = useState('upload'); // 'upload' | 'embed'

  const handleFile = (file) => {
    if (!file) return;
    setFileState({ file, preview: URL.createObjectURL(file), name: file.name });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[#1a1a2e]">{label}</label>
        <div className="flex gap-1 bg-[#f0f0f8] rounded-lg p-0.5">
          <button type="button" onClick={() => setMode('upload')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${mode === 'upload' ? 'bg-white text-[#2d2a71] shadow-sm' : 'text-[#aab0c6]'}`}>
            <FiUploadCloud size={12} /> Upload
          </button>
          <button type="button" onClick={() => setMode('embed')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${mode === 'embed' ? 'bg-white text-[#2d2a71] shadow-sm' : 'text-[#aab0c6]'}`}>
            <FiLink size={12} /> Embed Link
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        fileState?.preview ? (
          <div className="relative rounded-xl overflow-hidden border border-[#eaecf4] h-36">
            <video src={fileState.preview} className="w-full h-full object-cover" controls />
            <button type="button" onClick={() => setFileState(null)}
              className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow border border-[#eaecf4] text-red-500 hover:bg-red-50">
              <FiX size={12} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-2">
              <p className="text-white text-xs truncate">{fileState.name}</p>
            </div>
          </div>
        ) : (
          <label htmlFor={fileKey}
            className="flex flex-col items-center justify-center gap-2 h-28 border-2 border-dashed border-[#d4d6e8] rounded-xl cursor-pointer bg-[#fafafa] hover:border-[#6c63ff] hover:bg-[#f8f8ff] transition-all">
            <FiUploadCloud size={22} className="text-[#aab0c6]" />
            <p className="text-xs text-[#aab0c6]">Click to upload — MP4, MOV (max 100 MB). Larger files: use Embed Link.</p>
            <input id={fileKey} type="file" accept="video/*" className="hidden"
              onChange={e => handleFile(e.target.files?.[0])} />
          </label>
        )
      ) : (
        <input type="text" value={embedState} onChange={e => setEmbedState(e.target.value)}
          placeholder="YouTube/Vimeo URL only (not full iframe HTML)" className={inputCls} />
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const IndividualCapsulesCreateCapsule = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId');
  const [createCapsule, { isLoading }] = useCreateCapsuleMutation();

  const [title, setTitle] = useState('');

  // ── Part 1 – Introduction ──
  const [introTitle, setIntroTitle] = useState('');
  const [introText, setIntroText] = useState('');
  const [founderVideoFile, setFounderVideoFile] = useState(null); // { file, preview, name }
  const [founderVideoEmbed, setFounderVideoEmbed] = useState('');

  // ── Part 2 – Inspiration ──
  const [inspTitle, setInspTitle] = useState('');
  const [inspText, setInspText] = useState('');
  const [inspirationVideoFile, setInspirationVideoFile] = useState(null);
  const [inspirationVideoEmbed, setInspirationVideoEmbed] = useState('');

  // ── Part 3 – Reflection Questions ──
  const [reflTitle, setReflTitle] = useState('');
  const [reflInstructions, setReflInstructions] = useState('');
  const [questions, setQuestions] = useState([{ question: '', orderNumber: 1 }]);

  const addQuestion = () => {
    if (questions.length >= 10) return toast.error('Maximum 10 questions allowed');
    setQuestions(prev => [...prev, { question: '', orderNumber: prev.length + 1 }]);
  };
  const removeQuestion = (i) => setQuestions(prev => prev.filter((_, idx) => idx !== i).map((q, idx) => ({ ...q, orderNumber: idx + 1 })));
  const updateQuestion = (i, val) => setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, question: val } : q));

  // ── Part 4 – Practical Exercises ──
  const [practTitle, setPractTitle] = useState('');
  const [exercises, setExercises] = useState([{ exercise: '', orderNumber: 1 }]);

  const addExercise = () => setExercises(prev => [...prev, { exercise: '', orderNumber: prev.length + 1 }]);
  const removeExercise = (i) => setExercises(prev => prev.filter((_, idx) => idx !== i).map((e, idx) => ({ ...e, orderNumber: idx + 1 })));
  const updateExercise = (i, val) => setExercises(prev => prev.map((e, idx) => idx === i ? { ...e, exercise: val } : e));

  // ── Part 5 – Science ──
  const [sciTitle, setSciTitle] = useState('');
  const [sciText, setSciText] = useState('');
  const [sciVideoFile, setSciVideoFile] = useState(null);
  const [sciVideoEmbed, setSciVideoEmbed] = useState('');

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateCapsuleForm({
      categoryId,
      isEdit: false,
      title,
    });

    if (validationErrors.length > 0) {
      validationErrors.forEach((message) => toast.error(message));
      return;
    }

    const videoErrors = validateCapsuleVideoFiles({
      founderVideoFile,
      inspirationVideoFile,
      sciVideoFile,
    });
    if (videoErrors.length > 0) {
      videoErrors.forEach((message) => toast.error(message));
      return;
    }

    const formData = new FormData();
    const data = buildCapsulePayload({
      title,
      capsuleCategoryId: categoryId,
      introTitle,
      introText,
      founderVideoEmbed,
      founderVideoFile,
      inspTitle,
      inspText,
      inspirationVideoEmbed,
      inspirationVideoFile,
      reflTitle,
      reflInstructions,
      questions,
      practTitle,
      exercises,
      sciTitle,
      sciText,
      sciVideoEmbed,
      sciVideoFile,
    });

    formData.append('data', JSON.stringify(data));
    appendCapsuleFiles(formData, {
      founderVideoFile,
      inspirationVideoFile,
      sciVideoFile,
    });

    try {
      await createCapsule(formData).unwrap();
      toast.success('Capsule created successfully!');
      navigate(-1);
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.data?.errorMessages?.map((item) => item.message).join(', ') ||
        'Failed to create capsule. Please try again.';
      toast.error(message);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-5">

      {/* Back */}
      <div onClick={() => navigate(-1)} className="flex items-center gap-1 cursor-pointer mb-7 w-fit">
        <MdOutlineKeyboardArrowLeft size={26} className="text-[#2d2a71]" />
        <h1 className="text-xl font-bold text-[#1a1a2e]">Create Capsule</h1>
      </div>

      {!categoryId && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Open this page from a category (Edit Category → Create New Capsule) so the capsule is linked correctly.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        <div className="bg-white rounded-2xl border border-[#eaecf4] shadow-sm">
          <SectionHeader number="ℹ" title="Capsule Identity" subtitle="Internal name for this learning journey (commercial info lives on the category)" />
          <div className="px-6 py-6">
            <div className="flex flex-col gap-1.5 max-w-xl">
              <label className="text-sm font-semibold text-[#1a1a2e]">Capsule Title <span className="text-red-400">*</span></label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Finding Your Why" className={inputCls} required />
            </div>
          </div>
        </div>

        {/* ══ PART 1 – INTRODUCTION ══ */}
        <div className="bg-white rounded-2xl border border-[#eaecf4] shadow-sm">
          <SectionHeader number="1" title="Introduction" subtitle="Founder video and welcome message" />
          <div className="px-6 py-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#1a1a2e]">Section Title</label>
              <input type="text" value={introTitle} onChange={e => setIntroTitle(e.target.value)} placeholder="e.g. 🌟 Find Your Why" className={inputCls} />
            </div>
            <VideoField label="Founder Video" fileKey="founderVideoUpload"
              fileState={founderVideoFile} setFileState={setFounderVideoFile}
              embedState={founderVideoEmbed} setEmbedState={setFounderVideoEmbed} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#1a1a2e]">Additional Text</label>
              <textarea value={introText} onChange={e => setIntroText(e.target.value)} rows={3} placeholder="A message from Marie..." className={textareaCls} />
            </div>
          </div>
        </div>

        {/* ══ PART 2 – INSPIRATION ══ */}
        <div className="bg-white rounded-2xl border border-[#eaecf4] shadow-sm">
          <SectionHeader number="2" title="Inspiration" subtitle="Inspirational video and reflection prompt" />
          <div className="px-6 py-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#1a1a2e]">Section Title</label>
              <input type="text" value={inspTitle} onChange={e => setInspTitle(e.target.value)} placeholder="e.g. 💡 Inspiration" className={inputCls} />
            </div>
            <VideoField label="Inspirational Video" fileKey="inspirationVideoUpload"
              fileState={inspirationVideoFile} setFileState={setInspirationVideoFile}
              embedState={inspirationVideoEmbed} setEmbedState={setInspirationVideoEmbed} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#1a1a2e]">Additional Text</label>
              <textarea value={inspText} onChange={e => setInspText(e.target.value)} rows={3} placeholder="Reflection & inspiration prompt..." className={textareaCls} />
            </div>
          </div>
        </div>

        {/* ══ PART 3 – REFLECTION QUESTIONS ══ */}
        <div className="bg-white rounded-2xl border border-[#eaecf4] shadow-sm">
          <SectionHeader number="3" title="Reflection Questions" subtitle="Up to 10 open questions — learner answers are saved" />
          <div className="px-6 py-6 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#1a1a2e]">Section Title</label>
                <input type="text" value={reflTitle} onChange={e => setReflTitle(e.target.value)} placeholder="e.g. 📝 Self-Reflection" className={inputCls} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#1a1a2e]">Instructions / Comments</label>
              <textarea value={reflInstructions} onChange={e => setReflInstructions(e.target.value)} rows={2} placeholder="Take a moment to reflect on the questions below..." className={textareaCls} />
            </div>

            {/* Questions list */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[#1a1a2e]">Questions <span className="text-[#aab0c6] font-normal text-xs">({questions.length}/10)</span></label>
                <button type="button" onClick={addQuestion}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#2d2a71] hover:text-[#6c63ff] transition-colors disabled:opacity-40"
                  disabled={questions.length >= 10}>
                  <FiPlus size={14} /> Add Question
                </button>
              </div>
              {questions.map((q, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-3 w-7 h-7 rounded-full bg-[#2d2a71]/10 text-[#2d2a71] text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <input type="text" value={q.question} onChange={e => updateQuestion(i, e.target.value)}
                    placeholder={`Question ${i + 1}`}
                    className="flex-1 h-11 border border-[#eaecf4] rounded-xl px-4 text-sm text-[#1a1a2e] placeholder:text-[#aab0c6] bg-[#fafafa] focus:outline-none focus:border-[#6c63ff] focus:bg-white transition-colors" />
                  <button type="button" onClick={() => removeQuestion(i)} disabled={questions.length <= 1}
                    className="mt-1.5 w-9 h-9 flex items-center justify-center rounded-xl border border-[#eaecf4] text-red-400 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-30 flex-shrink-0">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ PART 4 – PRACTICAL EXERCISES ══ */}
        <div className="bg-white rounded-2xl border border-[#eaecf4] shadow-sm">
          <SectionHeader number="4" title="Practical Exercises" subtitle="Action-based exercises — learner responses are saved" />
          <div className="px-6 py-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#1a1a2e]">Section Title</label>
              <input type="text" value={practTitle} onChange={e => setPractTitle(e.target.value)} placeholder="e.g. 🚀 Take Action" className={inputCls} />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[#1a1a2e]">Exercises</label>
                <button type="button" onClick={addExercise} className="flex items-center gap-1.5 text-xs font-semibold text-[#2d2a71] hover:text-[#6c63ff] transition-colors">
                  <FiPlus size={14} /> Add Exercise
                </button>
              </div>
              {exercises.map((ex, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-3 w-7 h-7 rounded-full bg-[#2d2a71]/10 text-[#2d2a71] text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <textarea value={ex.exercise} onChange={e => updateExercise(i, e.target.value)}
                    placeholder={`Exercise ${i + 1} description...`} rows={2}
                    className="flex-1 border border-[#eaecf4] rounded-xl px-4 py-3 text-sm text-[#1a1a2e] placeholder:text-[#aab0c6] bg-[#fafafa] focus:outline-none focus:border-[#6c63ff] focus:bg-white transition-colors resize-none" />
                  <button type="button" onClick={() => removeExercise(i)} disabled={exercises.length <= 1}
                    className="mt-1.5 w-9 h-9 flex items-center justify-center rounded-xl border border-[#eaecf4] text-red-400 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-30 flex-shrink-0">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ PART 5 – SCIENCE & UNDERSTANDING ══ */}
        <div className="bg-white rounded-2xl border border-[#eaecf4] shadow-sm">
          <SectionHeader number="5" title="Science & Understanding" subtitle="Educational content on neuroscience, psychology, motivation" />
          <div className="px-6 py-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#1a1a2e]">Section Title</label>
              <input type="text" value={sciTitle} onChange={e => setSciTitle(e.target.value)} placeholder="e.g. 🧠 Science & Insights" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#1a1a2e]">Educational Text</label>
              <textarea value={sciText} onChange={e => setSciText(e.target.value)} rows={6} placeholder="Explain concepts from neuroscience, psychology, motivation, habits, mindset..." className={textareaCls} />
            </div>
            <VideoField label="Optional Video Resource" fileKey="scienceVideoUpload"
              fileState={sciVideoFile} setFileState={setSciVideoFile}
              embedState={sciVideoEmbed} setEmbedState={setSciVideoEmbed} />
          </div>
        </div>

        {/* ══ PART 6 – MARII AI (info only) ══ */}
        <div className="bg-gradient-to-br from-[#f0eeff] to-[#fff0f8] rounded-2xl border border-[#d8d0f0] shadow-sm">
          <div className="px-6 py-4 border-b border-[#d8d0f0] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#6c63ff] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">6</div>
            <div>
              <h2 className="text-base font-bold text-[#2d2a71]">Marii AI Summary</h2>
              <p className="text-xs text-[#aab0c6] mt-0.5">Auto-generated at capsule completion — no admin input required</p>
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-[#e0d8f8]">
              <div className="text-2xl">🤖</div>
              <div>
                <p className="text-sm font-semibold text-[#2d2a71]">Marii will automatically:</p>
                <ul className="mt-2 space-y-1 text-xs text-[#7b7d9d]">
                  <li>• Analyze all learner answers from Parts 3 & 4</li>
                  <li>• Identify dominant themes & personal strengths</li>
                  <li>• Generate personalized recommendations & next steps</li>
                  <li>• Recommend books, podcasts, mentors from the Propulserie library</li>
                  <li>• Save & email the report to the learner</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ══ ACTIONS ══ */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <button type="button" onClick={() => navigate(-1)}
            className="h-11 px-6 rounded-xl border border-[#eaecf4] bg-white text-sm font-semibold text-[#7b7d9d] hover:border-[#2d2a71] hover:text-[#2d2a71] transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isLoading}
            className="h-11 px-8 rounded-xl bg-[#2d2a71] hover:bg-[#3d3a91] text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {isLoading ? 'Saving...' : 'Save Capsule'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default IndividualCapsulesCreateCapsule;