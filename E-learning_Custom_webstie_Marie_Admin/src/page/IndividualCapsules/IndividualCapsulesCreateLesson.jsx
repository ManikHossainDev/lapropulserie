// import React, { useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { MdOutlineKeyboardArrowLeft } from 'react-icons/md';
// import { FiUploadCloud, FiX, FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';
// import { useCreateCapsuleModuleWithLessonMutation } from '../../redux/features/Individualcapsule/Individualcapsule';
// import { toast } from 'sonner';

// // ── Reusable Upload Zone ──────────────────────────────────────────────────────
// const UploadZone = ({ inputId, accept, previewType, preview, fileName, dragOver, setDragOver, onFile, onClear, height = 'h-28' }) => (
//     <>
//         {preview ? (
//             <div className="relative rounded-xl overflow-hidden border border-[#eaecf4] h-32">
//                 {previewType === 'video'
//                     ? <video src={preview} className="w-full h-full object-cover" controls />
//                     : <img src={preview} alt="preview" className="w-full h-full object-cover" />
//                 }
//                 <button type="button" onClick={onClear}
//                     className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow border border-[#eaecf4] text-red-500 hover:bg-red-50 transition-colors">
//                     <FiX size={12} />
//                 </button>
//                 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-2">
//                     <p className="text-white text-xs truncate">{fileName}</p>
//                 </div>
//             </div>
//         ) : (
//             <label
//                 htmlFor={inputId}
//                 onDragOver={e => { e.preventDefault(); setDragOver(true); }}
//                 onDragLeave={() => setDragOver(false)}
//                 onDrop={e => { e.preventDefault(); setDragOver(false); onFile(e.dataTransfer.files?.[0]); }}
//                 className={`flex flex-col items-center justify-center gap-2 ${height} border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
//                     ${dragOver ? 'border-[#6c63ff] bg-[#f0f0ff]' : 'border-[#e0c8d8] bg-[#fdf6f9] hover:border-[#6c63ff] hover:bg-[#f8f0ff]'}`}
//             >
//                 <FiUploadCloud size={20} className="text-[#b08898]" />
//                 <p className="text-xs text-[#b08898]">Click to upload or drag and drop</p>
//                 <input id={inputId} type="file" accept={accept} className="hidden" onChange={e => onFile(e.target.files?.[0])} />
//             </label>
//         )}
//     </>
// );

// // ── Question Types ────────────────────────────────────────────────────────────
// const QUESTION_TYPES = ['Text Area', 'Single Select'];

// const makeOption = (sl) => ({ sl, details: '', isCorrect: false });
// const makeQuestion = (sl) => ({ sl, title: '', type: 'Text Area', helperText: '', options: [] });
// const makeLesson = (sl) => ({ sl, id: Date.now() + sl, title: '', description: '', estimatedTime: '', orderNumber: sl, video: null, videoFile: null, videoName: '', dragOver: false, confirmed: false });

// // ── Main Component ────────────────────────────────────────────────────────────
// const IndividualCapsulesCreateLesson = () => {
//     const navigate = useNavigate();
//     const { id: capsuleId } = useParams();
//     const [createModule, { isLoading }] = useCreateCapsuleModuleWithLessonMutation();

//     const inputClass = "h-10 w-full border border-[#e8d0dc] rounded-lg px-3 text-sm text-[#1a1a2e] placeholder:text-[#c8a8b8] bg-white focus:outline-none focus:border-[#6c63ff] transition-colors";

//     // ── Module Fields ──
//     const [sl, setSl] = useState(1);
//     const [moduleTitle, setModuleTitle] = useState('');
//     const [roadMapBrief, setRoadMapBrief] = useState('');
//     const [moduleDescription, setModuleDescription] = useState('');
//     const [estimatedTime, setEstimatedTime] = useState('');
//     const [orderNumber, setOrderNumber] = useState(1);

//     // Module Video
//     const [moduleVideo, setModuleVideo] = useState(null);
//     const [moduleVideoFile, setModuleVideoFile] = useState(null);
//     const [moduleVideoName, setModuleVideoName] = useState('');
//     const [moduleVideoDragOver, setModuleVideoDragOver] = useState(false);

//     const handleModuleVideo = (file) => {
//         if (!file) return;
//         setModuleVideoName(file.name);
//         setModuleVideoFile(file);
//         setModuleVideo(URL.createObjectURL(file));
//     };

//     // ── Lessons ──
//     const [lessons, setLessons] = useState([makeLesson(1)]);

//     const updateLesson = (id, field, value) =>
//         setLessons(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));

//     const handleLessonVideo = (id, file) => {
//         if (!file) return;
//         updateLesson(id, 'videoName', file.name);
//         updateLesson(id, 'videoFile', file);
//         updateLesson(id, 'video', URL.createObjectURL(file));
//     };

//     const addLesson = () =>
//         setLessons(prev => [...prev, makeLesson(prev.length + 1)]);

//     const removeLesson = (id) =>
//         setLessons(prev => {
//             const filtered = prev.filter(l => l.id !== id);
//             return filtered.map((l, i) => ({ ...l, sl: i + 1, orderNumber: i + 1 }));
//         });

//     const toggleConfirm = (id) =>
//         setLessons(prev => prev.map(l => l.id === id ? { ...l, confirmed: !l.confirmed } : l));

//     // ── Question (optional) ──
//     const [hasQuestion, setHasQuestion] = useState(false);
//     const [questionTitle, setQuestionTitle] = useState('');
//     const [questionRoadmapBrief, setQuestionRoadmapBrief] = useState('');
//     const [questions, setQuestions] = useState([makeQuestion(1)]);

//     const addQuestion = () =>
//         setQuestions(prev => [...prev, makeQuestion(prev.length + 1)]);

//     const removeQuestion = (sl) =>
//         setQuestions(prev => {
//             const filtered = prev.filter(q => q.sl !== sl);
//             return filtered.map((q, i) => ({ ...q, sl: i + 1 }));
//         });

//     const updateQuestion = (sl, field, value) =>
//         setQuestions(prev => prev.map(q => q.sl === sl
//             ? { ...q, [field]: value, options: field === 'type' && value === 'Text Area' ? [] : q.options }
//             : q
//         ));

//     const addOption = (qSl) =>
//         setQuestions(prev => prev.map(q => q.sl === qSl
//             ? { ...q, options: [...q.options, makeOption(q.options.length + 1)] }
//             : q
//         ));

//     const removeOption = (qSl, optSl) =>
//         setQuestions(prev => prev.map(q => q.sl === qSl
//             ? { ...q, options: q.options.filter(o => o.sl !== optSl).map((o, i) => ({ ...o, sl: i + 1 })) }
//             : q
//         ));

//     const updateOption = (qSl, optSl, field, value) =>
//         setQuestions(prev => prev.map(q => q.sl === qSl
//             ? {
//                 ...q, options: q.options.map(o => o.sl === optSl
//                     ? { ...o, [field]: value }
//                     : field === 'isCorrect' ? { ...o, isCorrect: false } : o   // single-select: one correct only
//                 )
//             }
//             : q
//         ));

//     // ── Submit ──
//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         const formData = new FormData();

//         const data = {
//             sl,
//             title: moduleTitle,
//             roadMapBrief,
//             description: moduleDescription,
//             estimatedTime,
//             capsuleId: capsuleId ?? '',
//             orderNumber,
//             lessons: lessons.map((l, i) => ({
//                 sl: l.sl,
//                 title: l.title,
//                 description: l.description,
//                 estimatedTime: l.estimatedTime,
//                 orderNumber: l.orderNumber,
//                 _fileKey: `lessonVideo_${l.sl}`,
//             })),
//             ...(hasQuestion && {
//                 question: {
//                     title: questionTitle,
//                     roadmap_brief: questionRoadmapBrief,
//                     questions: questions.map(q => ({
//                         sl: q.sl,
//                         title: q.title,
//                         type: q.type,
//                         helperText: q.helperText,
//                         options: q.options,
//                     })),
//                 },
//             }),
//         };

//         formData.append('data', JSON.stringify(data));
//         if (moduleVideoFile) formData.append('moduleVideo', moduleVideoFile);
//         lessons.forEach(l => {
//             if (l.videoFile) formData.append(`lessonVideo_${l.sl}`, l.videoFile);
//         });

//         try {
//             const res = await createModule(formData).unwrap();
//             console.log(res);
//             toast.success('Module created successfully!');
//             navigate(-1);
//         } catch (error) {
//             toast.error(error?.data?.message || 'Failed to create module. Please try again.');
//         }
//     };

//     return (
//         <div className="min-h-screen p-5">

//             {/* ── Back Header ── */}
//             <div onClick={() => navigate(-1)} className="flex items-center gap-1 cursor-pointer mb-6 w-fit">
//                 <MdOutlineKeyboardArrowLeft size={26} className="text-[#2d2a71]" />
//                 <h1 className="text-xl font-bold text-[#1a1a2e]">Create Module</h1>
//             </div>

//             <form onSubmit={handleSubmit} className="flex flex-col gap-5">

//                 {/* ── Module Card ── */}
//                 <div className="bg-[#fce8f0] rounded-2xl border border-[#f0c8d8] p-5">
//                     <div className="flex items-center justify-between mb-5">
//                         <div className="flex items-center gap-2">
//                             <span className="w-1 h-5 rounded-full bg-[#2d2a71] inline-block" />
//                             <h2 className="text-base font-bold text-[#1a1a2e]">Module</h2>
//                         </div>
//                         <button type="button" onClick={addLesson}
//                             className="flex items-center gap-2 px-4 h-9 rounded-xl text-white text-sm font-semibold bg-[#2d2a71] hover:bg-[#3d3a91] transition-colors">
//                             <FiPlus size={14} strokeWidth={2.5} />
//                             Create New Lesson
//                         </button>
//                     </div>

//                     <div className="flex flex-col gap-4">

//                         {/* SL + Order Number */}
//                         <div className="grid grid-cols-2 gap-4">
//                             <div className="flex flex-col gap-1.5">
//                                 <label className="text-xs font-semibold text-[#1a1a2e]">SL <span className="text-red-400">*</span></label>
//                                 <input type="number" min="1" value={sl} onChange={e => setSl(Number(e.target.value))} className={inputClass} />
//                             </div>
//                             <div className="flex flex-col gap-1.5">
//                                 <label className="text-xs font-semibold text-[#1a1a2e]">Order Number <span className="text-red-400">*</span></label>
//                                 <input type="number" min="1" value={orderNumber} onChange={e => setOrderNumber(Number(e.target.value))} className={inputClass} />
//                             </div>
//                         </div>

//                         {/* Module Title */}
//                         <div className="flex flex-col gap-1.5">
//                             <label className="text-xs font-semibold text-[#1a1a2e]">Module Title <span className="text-red-400">*</span></label>
//                             <input type="text" value={moduleTitle} onChange={e => setModuleTitle(e.target.value)} className={inputClass} />
//                         </div>

//                         {/* Roadmap Brief */}
//                         <div className="flex flex-col gap-1.5">
//                             <label className="text-xs font-semibold text-[#1a1a2e]">Roadmap Brief <span className="text-red-400">*</span></label>
//                             <input type="text" value={roadMapBrief} onChange={e => setRoadMapBrief(e.target.value)} placeholder="One-line brief" className={inputClass} />
//                         </div>

//                         {/* Description */}
//                         <div className="flex flex-col gap-1.5">
//                             <label className="text-xs font-semibold text-[#1a1a2e]">Description <span className="text-red-400">*</span></label>
//                             <textarea value={moduleDescription} onChange={e => setModuleDescription(e.target.value)} rows={3}
//                                 className="w-full border border-[#e8d0dc] rounded-lg px-3 py-2 text-sm text-[#1a1a2e] bg-white focus:outline-none focus:border-[#6c63ff] transition-colors resize-none" />
//                         </div>

//                         {/* Estimated Time */}
//                         <div className="flex flex-col gap-1.5">
//                             <label className="text-xs font-semibold text-[#1a1a2e]">Estimated Time <span className="text-red-400">*</span></label>
//                             <input type="text" value={estimatedTime} onChange={e => setEstimatedTime(e.target.value)} placeholder="e.g. 5 days" className={inputClass} />
//                         </div>

//                         {/* Module Video */}
//                         <div className="flex flex-col gap-1.5">
//                             <label className="text-xs font-semibold text-[#1a1a2e]">Module Video <span className="text-red-400">*</span></label>
//                             <UploadZone
//                                 inputId="moduleVideo"
//                                 accept="video/*"
//                                 previewType="video"
//                                 preview={moduleVideo}
//                                 fileName={moduleVideoName}
//                                 dragOver={moduleVideoDragOver}
//                                 setDragOver={setModuleVideoDragOver}
//                                 onFile={handleModuleVideo}
//                                 onClear={() => { setModuleVideo(null); setModuleVideoFile(null); setModuleVideoName(''); }}
//                                 height="h-28"
//                             />
//                         </div>

//                     </div>
//                 </div>

//                 {/* ── Lesson Cards ── */}
//                 {lessons.map((lesson, index) => (
//                     <div key={lesson.id} className="bg-[#fce8f0] rounded-2xl border border-[#f0c8d8] p-5">
//                         <div className="flex items-center justify-between mb-5">
//                             <h3 className="text-sm font-bold text-[#1a1a2e]">
//                                 Lesson {String(index + 1).padStart(2, '0')}
//                             </h3>
//                             <div className="flex items-center gap-2">
//                                 <button type="button" onClick={() => toggleConfirm(lesson.id)}
//                                     className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors
//                                         ${lesson.confirmed ? 'bg-[#2d2a71] border-[#2d2a71] text-white' : 'bg-white border-[#d0b8c8] text-[#2d2a71] hover:bg-[#eeeeff]'}`}>
//                                     <FiCheck size={14} strokeWidth={2.5} />
//                                 </button>
//                                 <button type="button" onClick={() => removeLesson(lesson.id)}
//                                     className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#f0c8c8] bg-white text-red-500 hover:bg-red-50 transition-colors">
//                                     <FiTrash2 size={14} />
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="flex flex-col gap-4">

//                             {/* Lesson Title */}
//                             <div className="flex flex-col gap-1.5">
//                                 <label className="text-xs font-semibold text-[#1a1a2e]">Lesson Title <span className="text-red-400">*</span></label>
//                                 <input type="text" value={lesson.title} onChange={e => updateLesson(lesson.id, 'title', e.target.value)} className={inputClass} />
//                             </div>

//                             {/* Lesson Description */}
//                             <div className="flex flex-col gap-1.5">
//                                 <label className="text-xs font-semibold text-[#1a1a2e]">Description <span className="text-red-400">*</span></label>
//                                 <textarea value={lesson.description} onChange={e => updateLesson(lesson.id, 'description', e.target.value)} rows={2}
//                                     className="w-full border border-[#e8d0dc] rounded-lg px-3 py-2 text-sm text-[#1a1a2e] bg-white focus:outline-none focus:border-[#6c63ff] transition-colors resize-none" />
//                             </div>

//                             {/* Estimated Time */}
//                             <div className="flex flex-col gap-1.5">
//                                 <label className="text-xs font-semibold text-[#1a1a2e]">Estimated Time <span className="text-red-400">*</span></label>
//                                 <input type="text" value={lesson.estimatedTime} onChange={e => updateLesson(lesson.id, 'estimatedTime', e.target.value)} placeholder="e.g. 12 minutes" className={inputClass} />
//                             </div>

//                             {/* Lesson Video */}
//                             <div className="flex flex-col gap-1.5">
//                                 <label className="text-xs font-semibold text-[#1a1a2e]">Lesson Video <span className="text-red-400">*</span></label>
//                                 <UploadZone
//                                     inputId={`lessonVideo_${lesson.id}`}
//                                     accept="video/*"
//                                     previewType="video"
//                                     preview={lesson.video}
//                                     fileName={lesson.videoName}
//                                     dragOver={lesson.dragOver}
//                                     setDragOver={val => updateLesson(lesson.id, 'dragOver', val)}
//                                     onFile={file => handleLessonVideo(lesson.id, file)}
//                                     onClear={() => updateLesson(lesson.id, 'video', null) || updateLesson(lesson.id, 'videoFile', null) || updateLesson(lesson.id, 'videoName', '')}
//                                     height="h-28"
//                                 />
//                             </div>

//                         </div>
//                     </div>
//                 ))}

//                 {/* ── Question / Questionary Card (optional) ── */}
//                 <div className="bg-[#fce8f0] rounded-2xl border border-[#f0c8d8] p-5">
//                     <div className="flex items-center justify-between mb-4">
//                         <div className="flex items-center gap-2">
//                             <span className="w-1 h-5 rounded-full bg-[#2d2a71] inline-block" />
//                             <h2 className="text-base font-bold text-[#1a1a2e]">Questionary</h2>
//                             <span className="text-xs text-[#aab0c6] font-normal">(optional)</span>
//                         </div>
//                         <button type="button" onClick={() => setHasQuestion(p => !p)}
//                             className={`w-9 h-5 rounded-full transition-colors relative ${hasQuestion ? 'bg-[#2d2a71]' : 'bg-[#d0b8c8]'}`}>
//                             <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${hasQuestion ? 'left-4' : 'left-0.5'}`} />
//                         </button>
//                     </div>

//                     {hasQuestion && (
//                         <div className="flex flex-col gap-5">

//                             {/* Question Block Header */}
//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                 <div className="flex flex-col gap-1.5">
//                                     <label className="text-xs font-semibold text-[#1a1a2e]">Question Block Title <span className="text-red-400">*</span></label>
//                                     <input type="text" value={questionTitle} onChange={e => setQuestionTitle(e.target.value)} className={inputClass} />
//                                 </div>
//                                 <div className="flex flex-col gap-1.5">
//                                     <label className="text-xs font-semibold text-[#1a1a2e]">Roadmap Brief</label>
//                                     <input type="text" value={questionRoadmapBrief} onChange={e => setQuestionRoadmapBrief(e.target.value)} className={inputClass} />
//                                 </div>
//                             </div>

//                             {/* Individual Questions */}
//                             {questions.map((q, qIndex) => (
//                                 <div key={q.sl} className="bg-white rounded-xl border border-[#f0c8d8] p-4 flex flex-col gap-4">
//                                     <div className="flex items-center justify-between">
//                                         <span className="text-xs font-bold text-[#2d2a71]">Question {String(qIndex + 1).padStart(2, '0')}</span>
//                                         <button type="button" onClick={() => removeQuestion(q.sl)}
//                                             disabled={questions.length === 1}
//                                             className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#f0c8c8] text-red-400 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
//                                             <FiTrash2 size={12} />
//                                         </button>
//                                     </div>

//                                     {/* Question Title + Type */}
//                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                         <div className="flex flex-col gap-1.5">
//                                             <label className="text-xs font-semibold text-[#1a1a2e]">Question Title <span className="text-red-400">*</span></label>
//                                             <input type="text" value={q.title} onChange={e => updateQuestion(q.sl, 'title', e.target.value)} className={inputClass} />
//                                         </div>
//                                         <div className="flex flex-col gap-1.5">
//                                             <label className="text-xs font-semibold text-[#1a1a2e]">Type <span className="text-red-400">*</span></label>
//                                             <select value={q.type} onChange={e => updateQuestion(q.sl, 'type', e.target.value)}
//                                                 className="h-10 w-full border border-[#e8d0dc] rounded-lg px-3 text-sm text-[#1a1a2e] bg-white focus:outline-none focus:border-[#6c63ff] transition-colors appearance-none cursor-pointer">
//                                                 {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
//                                             </select>
//                                         </div>
//                                     </div>

//                                     {/* Helper Text */}
//                                     <div className="flex flex-col gap-1.5">
//                                         <label className="text-xs font-semibold text-[#1a1a2e]">Helper Text</label>
//                                         <input type="text" value={q.helperText} onChange={e => updateQuestion(q.sl, 'helperText', e.target.value)} placeholder="e.g. Write a short reflection" className={inputClass} />
//                                     </div>

//                                     {/* Options — only for Single Select */}
//                                     {q.type === 'Single Select' && (
//                                         <div className="flex flex-col gap-2">
//                                             <div className="flex items-center justify-between">
//                                                 <label className="text-xs font-semibold text-[#1a1a2e]">Options</label>
//                                                 <button type="button" onClick={() => addOption(q.sl)}
//                                                     className="flex items-center gap-1 text-xs font-semibold text-[#2d2a71] hover:text-[#6c63ff] transition-colors">
//                                                     <FiPlus size={12} strokeWidth={2.5} /> Add Option
//                                                 </button>
//                                             </div>
//                                             {q.options.map(opt => (
//                                                 <div key={opt.sl} className="flex items-center gap-2">
//                                                     <span className="text-xs text-[#aab0c6] w-5 flex-shrink-0">{opt.sl}.</span>
//                                                     <input type="text" value={opt.details} onChange={e => updateOption(q.sl, opt.sl, 'details', e.target.value)}
//                                                         placeholder="Option text" className={`${inputClass} flex-1`} />
//                                                     <button type="button" onClick={() => updateOption(q.sl, opt.sl, 'isCorrect', true)}
//                                                         title="Mark as correct"
//                                                         className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center border transition-colors
//                                                             ${opt.isCorrect ? 'bg-[#2d2a71] border-[#2d2a71] text-white' : 'bg-white border-[#d0b8c8] text-[#2d2a71] hover:bg-[#eeeeff]'}`}>
//                                                         <FiCheck size={12} strokeWidth={2.5} />
//                                                     </button>
//                                                     <button type="button" onClick={() => removeOption(q.sl, opt.sl)}
//                                                         className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg border border-[#f0c8c8] text-red-400 hover:bg-red-50 transition-colors">
//                                                         <FiTrash2 size={12} />
//                                                     </button>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     )}
//                                 </div>
//                             ))}

//                             {/* Add Question Button */}
//                             <button type="button" onClick={addQuestion}
//                                 className="flex items-center gap-2 px-4 h-9 rounded-xl text-[#2d2a71] text-sm font-semibold border-2 border-dashed border-[#c8a8d8] hover:border-[#2d2a71] hover:bg-[#f0eeff] transition-colors w-fit">
//                                 <FiPlus size={14} strokeWidth={2.5} />
//                                 Add Question
//                             </button>

//                         </div>
//                     )}
//                 </div>

//                 {/* ── Action Buttons ── */}
//                 <div className="flex items-center justify-end gap-3 pb-6">
//                     <button type="button" onClick={() => navigate(-1)}
//                         className="h-11 px-6 rounded-xl border border-[#eaecf4] bg-white text-sm font-semibold text-[#7b7d9d] hover:border-[#2d2a71] hover:text-[#2d2a71] transition-colors">
//                         Cancel
//                     </button>
//                     <button type="submit" disabled={isLoading}
//                         className="h-11 px-8 rounded-xl bg-[#2d2a71] hover:bg-[#3d3a91] text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
//                         {isLoading ? 'Saving...' : 'Save Module'}
//                     </button>
//                 </div>

//             </form>
//         </div>
//     );
// };

// export default IndividualCapsulesCreateLesson;


import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdOutlineKeyboardArrowLeft } from 'react-icons/md';
import { FiUploadCloud, FiX, FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';
import { useCreateCapsuleModuleWithLessonMutation } from '../../redux/features/Individualcapsule/Individualcapsule';
import { toast } from 'sonner';

// ── Reusable Upload Zone ──────────────────────────────────────────────────────
const UploadZone = ({ inputId, accept, previewType, preview, fileName, dragOver, setDragOver, onFile, onClear, height = 'h-28' }) => (
    <>
        {preview ? (
            <div className="relative rounded-xl overflow-hidden border border-[#eaecf4] h-32">
                {previewType === 'video'
                    ? <video src={preview} className="w-full h-full object-cover" controls />
                    : <img src={preview} alt="preview" className="w-full h-full object-cover" />
                }
                <button type="button" onClick={onClear}
                    className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow border border-[#eaecf4] text-red-500 hover:bg-red-50 transition-colors">
                    <FiX size={12} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-2">
                    <p className="text-white text-xs truncate">{fileName}</p>
                </div>
            </div>
        ) : (
            <label
                htmlFor={inputId}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); onFile(e.dataTransfer.files?.[0]); }}
                className={`flex flex-col items-center justify-center gap-2 ${height} border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
                    ${dragOver ? 'border-[#6c63ff] bg-[#f0f0ff]' : 'border-[#e0c8d8] bg-[#fdf6f9] hover:border-[#6c63ff] hover:bg-[#f8f0ff]'}`}
            >
                <FiUploadCloud size={20} className="text-[#b08898]" />
                <p className="text-xs text-[#b08898]">Click to upload or drag and drop</p>
                <input id={inputId} type="file" accept={accept} className="hidden" onChange={e => onFile(e.target.files?.[0])} />
            </label>
        )}
    </>
);

// ── Constants ─────────────────────────────────────────────────────────────────
const QUESTION_TYPES = ['Text Area', 'Single Select'];

const makeOption  = (sl) => ({ sl, details: '', isCorrect: false });
const makeQuestion = (sl) => ({ sl, title: '', type: 'Text Area', helperText: '', options: [] });
const makeLesson  = (sl) => ({
    sl,
    id: Date.now() + sl,
    title: '',
    description: '',
    estimatedTime: '',
    orderNumber: sl,
    video: null,
    videoFile: null,
    videoName: '',
    dragOver: false,
    confirmed: false,
});

// ── Main Component ────────────────────────────────────────────────────────────
const IndividualCapsulesCreateLesson = () => {
    const navigate = useNavigate();
    const { id: capsuleId } = useParams();
    const [createModule, { isLoading }] = useCreateCapsuleModuleWithLessonMutation();

    const inputClass = "h-10 w-full border border-[#e8d0dc] rounded-lg px-3 text-sm text-[#1a1a2e] placeholder:text-[#c8a8b8] bg-white focus:outline-none focus:border-[#6c63ff] transition-colors";

    // ── Module Fields ──
    const [sl, setSl]                         = useState(1);
    const [moduleTitle, setModuleTitle]       = useState('');
    const [roadMapBrief, setRoadMapBrief]     = useState('');
    const [moduleDescription, setModuleDescription] = useState('');
    const [estimatedTime, setEstimatedTime]   = useState('');
    const [orderNumber, setOrderNumber]       = useState(1);

    // Module Video
    const [moduleVideo, setModuleVideo]           = useState(null);
    const [moduleVideoFile, setModuleVideoFile]   = useState(null);
    const [moduleVideoName, setModuleVideoName]   = useState('');
    const [moduleVideoDragOver, setModuleVideoDragOver] = useState(false);

    const handleModuleVideo = (file) => {
        if (!file) return;
        setModuleVideoName(file.name);
        setModuleVideoFile(file);
        setModuleVideo(URL.createObjectURL(file));
    };

    // ── Lessons ──
    const [lessons, setLessons] = useState([makeLesson(1)]);

    const updateLesson = (id, field, value) =>
        setLessons(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));

    const handleLessonVideo = (id, file) => {
        if (!file) return;
        updateLesson(id, 'videoName', file.name);
        updateLesson(id, 'videoFile', file);
        updateLesson(id, 'video', URL.createObjectURL(file));
    };

    const clearLessonVideo = (id) =>
        setLessons(prev => prev.map(l => l.id === id
            ? { ...l, video: null, videoFile: null, videoName: '' }
            : l
        ));

    const addLesson = () =>
        setLessons(prev => [...prev, makeLesson(prev.length + 1)]);

    const removeLesson = (id) =>
        setLessons(prev => {
            const filtered = prev.filter(l => l.id !== id);
            return filtered.map((l, i) => ({ ...l, sl: i + 1, orderNumber: i + 1 }));
        });

    const toggleConfirm = (id) =>
        setLessons(prev => prev.map(l => l.id === id ? { ...l, confirmed: !l.confirmed } : l));

    // ── Questionary ──
    const [hasQuestion, setHasQuestion]             = useState(false);
    const [questionTitle, setQuestionTitle]         = useState('');
    const [questionRoadmapBrief, setQuestionRoadmapBrief] = useState('');
    const [questions, setQuestions]                 = useState([makeQuestion(1)]);

    const addQuestion = () =>
        setQuestions(prev => [...prev, makeQuestion(prev.length + 1)]);

    const removeQuestion = (sl) =>
        setQuestions(prev => {
            const filtered = prev.filter(q => q.sl !== sl);
            return filtered.map((q, i) => ({ ...q, sl: i + 1 }));
        });

    const updateQuestion = (sl, field, value) =>
        setQuestions(prev => prev.map(q => q.sl === sl
            ? { ...q, [field]: value, options: field === 'type' && value === 'Text Area' ? [] : q.options }
            : q
        ));

    const addOption = (qSl) =>
        setQuestions(prev => prev.map(q => q.sl === qSl
            ? { ...q, options: [...q.options, makeOption(q.options.length + 1)] }
            : q
        ));

    const removeOption = (qSl, optSl) =>
        setQuestions(prev => prev.map(q => q.sl === qSl
            ? { ...q, options: q.options.filter(o => o.sl !== optSl).map((o, i) => ({ ...o, sl: i + 1 })) }
            : q
        ));

    const updateOption = (qSl, optSl, field, value) =>
        setQuestions(prev => prev.map(q => q.sl === qSl
            ? {
                ...q,
                options: q.options.map(o => o.sl === optSl
                    ? { ...o, [field]: value }
                    : field === 'isCorrect' ? { ...o, isCorrect: false } : o  // single-select: one correct only
                ),
            }
            : q
        ));

    // ── Submit ──
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        const data = {
            sl,
            title: moduleTitle,
            roadMapBrief,
            description: moduleDescription,
            estimatedTime,
            capsuleId: capsuleId ?? '',
            orderNumber,
            lessons: lessons.map(l => ({
                sl: l.sl,
                title: l.title,
                description: l.description,
                estimatedTime: l.estimatedTime,
                orderNumber: l.orderNumber,
                _fileKey: `lessonVideo_${l.sl}`,
            })),
            ...(hasQuestion && {
                question: {
                    title: questionTitle,
                    roadmap_brief: questionRoadmapBrief,
                    questions: questions.map(q => ({
                        sl: q.sl,
                        title: q.title,
                        type: q.type,
                        helperText: q.helperText,
                        options: q.options,
                    })),
                },
            }),
        };

        formData.append('data', JSON.stringify(data));
        if (moduleVideoFile) formData.append('moduleVideo', moduleVideoFile);
        lessons.forEach(l => {
            if (l.videoFile) formData.append(`lessonVideo_${l.sl}`, l.videoFile);
        });

        try {
            const res = await createModule(formData).unwrap(); // ✅ pass FormData directly
            console.log(res);
            toast.success('Module created successfully!');
            navigate(-1);
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to create module. Please try again.');
        }
    };

    return (
        <div className="min-h-screen p-5">

            {/* ── Back Header ── */}
            <div onClick={() => navigate(-1)} className="flex items-center gap-1 cursor-pointer mb-6 w-fit">
                <MdOutlineKeyboardArrowLeft size={26} className="text-[#2d2a71]" />
                <h1 className="text-xl font-bold text-[#1a1a2e]">Create Module</h1>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* ── Module Card ── */}
                <div className="bg-[#fce8f0] rounded-2xl border border-[#f0c8d8] p-5">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <span className="w-1 h-5 rounded-full bg-[#2d2a71] inline-block" />
                            <h2 className="text-base font-bold text-[#1a1a2e]">Module</h2>
                        </div>
                        <button type="button" onClick={addLesson}
                            className="flex items-center gap-2 px-4 h-9 rounded-xl text-white text-sm font-semibold bg-[#2d2a71] hover:bg-[#3d3a91] transition-colors">
                            <FiPlus size={14} strokeWidth={2.5} />
                            Create New Lesson
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">

                        {/* SL + Order Number */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[#1a1a2e]">SL <span className="text-red-400">*</span></label>
                                <input type="number" min="1" value={sl} onChange={e => setSl(Number(e.target.value))} className={inputClass} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[#1a1a2e]">Order Number <span className="text-red-400">*</span></label>
                                <input type="number" min="1" value={orderNumber} onChange={e => setOrderNumber(Number(e.target.value))} className={inputClass} />
                            </div>
                        </div>

                        {/* Module Title */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-[#1a1a2e]">Module Title <span className="text-red-400">*</span></label>
                            <input type="text" value={moduleTitle} onChange={e => setModuleTitle(e.target.value)} className={inputClass} />
                        </div>

                        {/* Roadmap Brief */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-[#1a1a2e]">Roadmap Brief <span className="text-red-400">*</span></label>
                            <input type="text" value={roadMapBrief} onChange={e => setRoadMapBrief(e.target.value)} placeholder="One-line brief" className={inputClass} />
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-[#1a1a2e]">Description <span className="text-red-400">*</span></label>
                            <textarea value={moduleDescription} onChange={e => setModuleDescription(e.target.value)} rows={3}
                                className="w-full border border-[#e8d0dc] rounded-lg px-3 py-2 text-sm text-[#1a1a2e] bg-white focus:outline-none focus:border-[#6c63ff] transition-colors resize-none" />
                        </div>

                        {/* Estimated Time */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-[#1a1a2e]">Estimated Time <span className="text-red-400">*</span></label>
                            <input type="text" value={estimatedTime} onChange={e => setEstimatedTime(e.target.value)} placeholder="e.g. 5 days" className={inputClass} />
                        </div>

                        {/* Module Video */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-[#1a1a2e]">Module Video <span className="text-red-400">*</span></label>
                            <UploadZone
                                inputId="moduleVideo"
                                accept="video/*"
                                previewType="video"
                                preview={moduleVideo}
                                fileName={moduleVideoName}
                                dragOver={moduleVideoDragOver}
                                setDragOver={setModuleVideoDragOver}
                                onFile={handleModuleVideo}
                                onClear={() => { setModuleVideo(null); setModuleVideoFile(null); setModuleVideoName(''); }}
                                height="h-28"
                            />
                        </div>

                    </div>
                </div>

                {/* ── Lesson Cards ── */}
                {lessons.map((lesson, index) => (
                    <div key={lesson.id} className="bg-[#fce8f0] rounded-2xl border border-[#f0c8d8] p-5">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-sm font-bold text-[#1a1a2e]">
                                Lesson {String(index + 1).padStart(2, '0')}
                            </h3>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => toggleConfirm(lesson.id)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors
                                        ${lesson.confirmed
                                            ? 'bg-[#2d2a71] border-[#2d2a71] text-white'
                                            : 'bg-white border-[#d0b8c8] text-[#2d2a71] hover:bg-[#eeeeff]'
                                        }`}>
                                    <FiCheck size={14} strokeWidth={2.5} />
                                </button>
                                <button type="button" onClick={() => removeLesson(lesson.id)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#f0c8c8] bg-white text-red-500 hover:bg-red-50 transition-colors">
                                    <FiTrash2 size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[#1a1a2e]">Lesson Title <span className="text-red-400">*</span></label>
                                <input type="text" value={lesson.title} onChange={e => updateLesson(lesson.id, 'title', e.target.value)} className={inputClass} />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[#1a1a2e]">Description <span className="text-red-400">*</span></label>
                                <textarea value={lesson.description} onChange={e => updateLesson(lesson.id, 'description', e.target.value)} rows={2}
                                    className="w-full border border-[#e8d0dc] rounded-lg px-3 py-2 text-sm text-[#1a1a2e] bg-white focus:outline-none focus:border-[#6c63ff] transition-colors resize-none" />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[#1a1a2e]">Estimated Time <span className="text-red-400">*</span></label>
                                <input type="text" value={lesson.estimatedTime} onChange={e => updateLesson(lesson.id, 'estimatedTime', e.target.value)} placeholder="e.g. 12 minutes" className={inputClass} />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[#1a1a2e]">Lesson Video <span className="text-red-400">*</span></label>
                                <UploadZone
                                    inputId={`lessonVideo_${lesson.id}`}
                                    accept="video/*"
                                    previewType="video"
                                    preview={lesson.video}
                                    fileName={lesson.videoName}
                                    dragOver={lesson.dragOver}
                                    setDragOver={val => updateLesson(lesson.id, 'dragOver', val)}
                                    onFile={file => handleLessonVideo(lesson.id, file)}
                                    onClear={() => clearLessonVideo(lesson.id)}
                                    height="h-28"
                                />
                            </div>

                        </div>
                    </div>
                ))}

                {/* ── Questionary Card (optional) ── */}
                <div className="bg-[#fce8f0] rounded-2xl border border-[#f0c8d8] p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="w-1 h-5 rounded-full bg-[#2d2a71] inline-block" />
                            <h2 className="text-base font-bold text-[#1a1a2e]">Questionary</h2>
                            <span className="text-xs text-[#aab0c6] font-normal">(optional)</span>
                        </div>
                        <button type="button" onClick={() => setHasQuestion(p => !p)}
                            className={`w-9 h-5 rounded-full transition-colors relative ${hasQuestion ? 'bg-[#2d2a71]' : 'bg-[#d0b8c8]'}`}>
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${hasQuestion ? 'left-4' : 'left-0.5'}`} />
                        </button>
                    </div>

                    {hasQuestion && (
                        <div className="flex flex-col gap-5">

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-[#1a1a2e]">Question Block Title <span className="text-red-400">*</span></label>
                                    <input type="text" value={questionTitle} onChange={e => setQuestionTitle(e.target.value)} className={inputClass} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-[#1a1a2e]">Roadmap Brief</label>
                                    <input type="text" value={questionRoadmapBrief} onChange={e => setQuestionRoadmapBrief(e.target.value)} className={inputClass} />
                                </div>
                            </div>

                            {questions.map((q, qIndex) => (
                                <div key={q.sl} className="bg-white rounded-xl border border-[#f0c8d8] p-4 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-[#2d2a71]">
                                            Question {String(qIndex + 1).padStart(2, '0')}
                                        </span>
                                        <button type="button" onClick={() => removeQuestion(q.sl)}
                                            disabled={questions.length === 1}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#f0c8c8] text-red-400 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                            <FiTrash2 size={12} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-[#1a1a2e]">Question Title <span className="text-red-400">*</span></label>
                                            <input type="text" value={q.title} onChange={e => updateQuestion(q.sl, 'title', e.target.value)} className={inputClass} />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-semibold text-[#1a1a2e]">Type <span className="text-red-400">*</span></label>
                                            <select value={q.type} onChange={e => updateQuestion(q.sl, 'type', e.target.value)}
                                                className="h-10 w-full border border-[#e8d0dc] rounded-lg px-3 text-sm text-[#1a1a2e] bg-white focus:outline-none focus:border-[#6c63ff] transition-colors appearance-none cursor-pointer">
                                                {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-[#1a1a2e]">Helper Text</label>
                                        <input type="text" value={q.helperText} onChange={e => updateQuestion(q.sl, 'helperText', e.target.value)} placeholder="e.g. Write a short reflection" className={inputClass} />
                                    </div>

                                    {q.type === 'Single Select' && (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-semibold text-[#1a1a2e]">Options</label>
                                                <button type="button" onClick={() => addOption(q.sl)}
                                                    className="flex items-center gap-1 text-xs font-semibold text-[#2d2a71] hover:text-[#6c63ff] transition-colors">
                                                    <FiPlus size={12} strokeWidth={2.5} /> Add Option
                                                </button>
                                            </div>
                                            {q.options.map(opt => (
                                                <div key={opt.sl} className="flex items-center gap-2">
                                                    <span className="text-xs text-[#aab0c6] w-5 flex-shrink-0">{opt.sl}.</span>
                                                    <input type="text" value={opt.details}
                                                        onChange={e => updateOption(q.sl, opt.sl, 'details', e.target.value)}
                                                        placeholder="Option text" className={`${inputClass} flex-1`} />
                                                    <button type="button" onClick={() => updateOption(q.sl, opt.sl, 'isCorrect', true)}
                                                        title="Mark as correct"
                                                        className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center border transition-colors
                                                            ${opt.isCorrect
                                                                ? 'bg-[#2d2a71] border-[#2d2a71] text-white'
                                                                : 'bg-white border-[#d0b8c8] text-[#2d2a71] hover:bg-[#eeeeff]'
                                                            }`}>
                                                        <FiCheck size={12} strokeWidth={2.5} />
                                                    </button>
                                                    <button type="button" onClick={() => removeOption(q.sl, opt.sl)}
                                                        className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg border border-[#f0c8c8] text-red-400 hover:bg-red-50 transition-colors">
                                                        <FiTrash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <button type="button" onClick={addQuestion}
                                className="flex items-center gap-2 px-4 h-9 rounded-xl text-[#2d2a71] text-sm font-semibold border-2 border-dashed border-[#c8a8d8] hover:border-[#2d2a71] hover:bg-[#f0eeff] transition-colors w-fit">
                                <FiPlus size={14} strokeWidth={2.5} />
                                Add Question
                            </button>

                        </div>
                    )}
                </div>

                {/* ── Action Buttons ── */}
                <div className="flex items-center justify-end gap-3 pb-6">
                    <button type="button" onClick={() => navigate(-1)}
                        className="h-11 px-6 rounded-xl border border-[#eaecf4] bg-white text-sm font-semibold text-[#7b7d9d] hover:border-[#2d2a71] hover:text-[#2d2a71] transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={isLoading}
                        className="h-11 px-8 rounded-xl bg-[#2d2a71] hover:bg-[#3d3a91] text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                        {isLoading ? 'Saving...' : 'Save Module'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default IndividualCapsulesCreateLesson;