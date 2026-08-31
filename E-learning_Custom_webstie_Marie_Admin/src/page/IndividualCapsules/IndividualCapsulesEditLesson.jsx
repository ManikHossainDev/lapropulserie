import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdOutlineKeyboardArrowLeft } from 'react-icons/md';
import { FiUploadCloud, FiX, FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';
import { useGetCapsuleModuleLessonByIdQuery, useUpdateCapsuleModuleLessonMutation } from '../../redux/features/Individualcapsule/Individualcapsule';
import { toast } from 'sonner';

// ── Reusable Upload Zone ──────────────────────────────────────────────────────
const UploadZone = ({ inputId, accept, previewType, preview, fileName, dragOver, setDragOver, onFile, onClear, height = 'h-28' }) => (
    <>
        {preview ? (
            <div className="relative rounded-xl overflow-hidden border border-[#eaecf4] h-32 bg-[#0f0f1a]">
                {previewType === 'video'
                    ? (/\.m3u8(\?|$)/i.test(String(preview))
                        ? (
                            <div className="h-full flex flex-col items-center justify-center gap-1 px-3 text-center">
                                <p className="text-xs text-white/90 font-medium">Current video on file</p>
                                <p className="text-[10px] text-white/50">Use Replace to change it</p>
                            </div>
                          )
                        : <video src={preview} className="w-full h-full object-cover" controls />)
                    : <img src={preview} alt="preview" className="w-full h-full object-cover" />
                }
                <button type="button" onClick={onClear}
                    className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow border border-[#eaecf4] text-red-500 hover:bg-red-50 transition-colors">
                    <FiX size={12} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 flex items-center justify-between gap-2">
                    <p className="text-white text-xs truncate min-w-0">{fileName}</p>
                    <label
                        htmlFor={inputId}
                        className="flex-shrink-0 cursor-pointer rounded-md bg-white/95 text-[#2d2a71] text-[11px] font-semibold px-2.5 py-1 hover:bg-white"
                    >
                        Replace
                    </label>
                </div>
                <input
                    id={inputId}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={(e) => {
                        onFile(e.target.files?.[0]);
                        e.target.value = '';
                    }}
                />
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

// ── Helpers ───────────────────────────────────────────────────────────────────
const resolveLessonApiId = (l) => l?._id || l?.id || '';
const resolveLessonVideoUrl = (l) => {
    if (!l) return null;
    if (l.videoUrl) return l.videoUrl;
    if (typeof l.lessonVideo === 'string') return l.lessonVideo;
    return l.lessonVideo?.url || null;
};
const resolveModuleVideoUrl = (mod) => {
    if (!mod) return null;
    if (mod.videoUrl) return mod.videoUrl;
    if (typeof mod.moduleVideo === 'string') return mod.moduleVideo;
    return mod.moduleVideo?.url || null;
};

const makeNewLesson = (sl) => ({
    // no _id — brand new lesson added during edit
    sl,
    id: `new_${Date.now()}_${sl}`,   // local key only
    title: '',
    description: '',
    estimatedTime: '',
    orderNumber: sl,
    video: null,
    videoFile: null,
    videoName: '',
    dragOver: false,
    confirmed: false,
    isNew: true,
});

const mapApiLesson = (l, index) => {
    const apiId = resolveLessonApiId(l);
    const videoUrl = resolveLessonVideoUrl(l);
    return {
        _id: apiId,
        sl: l.sl ?? index + 1,
        id: apiId || `existing_${index}`,
        title: l.title ?? '',
        description: l.description ?? '',
        estimatedTime: l.estimatedTime ?? '',
        orderNumber: l.orderNumber ?? index + 1,
        video: videoUrl,
        videoFile: null,
        videoName: videoUrl ? 'Current video' : '',
        dragOver: false,
        confirmed: false,
        isNew: false,
        // Keep existing video object so save without replace does not wipe it
        existingLessonVideo: l.lessonVideo && typeof l.lessonVideo === 'object' ? l.lessonVideo : null,
    };
};

// ── Main Component ────────────────────────────────────────────────────────────
const IndividualCapsulesEditLesson = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data: moduleData, isLoading: isFetching } = useGetCapsuleModuleLessonByIdQuery(id);
    const fullData = moduleData?.data ?? {};
    const [updateModule, { isLoading }] = useUpdateCapsuleModuleLessonMutation();

    const inputClass = "h-10 w-full border border-[#e8d0dc] rounded-lg px-3 text-sm text-[#1a1a2e] placeholder:text-[#c8a8b8] bg-white focus:outline-none focus:border-[#6c63ff] transition-colors";

    // ── Module Fields ──
    const [sl, setSl]                               = useState(1);
    const [moduleTitle, setModuleTitle]             = useState('');
    const [roadMapBrief, setRoadMapBrief]           = useState('');
    const [moduleDescription, setModuleDescription] = useState('');
    const [estimatedTime, setEstimatedTime]         = useState('');
    const [orderNumber, setOrderNumber]             = useState(1);

    // Module Video
    const [moduleVideo, setModuleVideo]                   = useState(null);
    const [moduleVideoFile, setModuleVideoFile]           = useState(null);
    const [moduleVideoName, setModuleVideoName]           = useState('');
    const [moduleVideoDragOver, setModuleVideoDragOver]   = useState(false);

    const handleModuleVideo = (file) => {
        if (!file) return;
        setModuleVideoName(file.name);
        setModuleVideoFile(file);
        setModuleVideo(URL.createObjectURL(file));
    };

    // ── Lessons ──
    const [lessons, setLessons] = useState([]);

    // ── Populate from API ──
    useEffect(() => {
        if (!fullData?.title) return;
        setSl(fullData.sl ?? 1);
        setModuleTitle(fullData.title ?? '');
        setRoadMapBrief(fullData.roadMapBrief ?? '');
        setModuleDescription(fullData.description ?? '');
        setEstimatedTime(fullData.estimatedTime ?? '');
        setOrderNumber(fullData.orderNumber ?? 1);
        if (fullData.videoUrl || fullData.moduleVideo) {
            const url = resolveModuleVideoUrl(fullData);
            if (url) {
                setModuleVideo(url);
                setModuleVideoName('Current video');
            }
        }
        if (fullData.lessons?.length) {
            setLessons(fullData.lessons.map(mapApiLesson));
        }
    }, [fullData]);

    // ── Lesson Handlers ──
    const updateLesson = (localId, field, value) =>
        setLessons(prev => prev.map(l => l.id === localId ? { ...l, [field]: value } : l));

    const handleLessonVideo = (localId, file) => {
        if (!file) return;
        setLessons(prev => prev.map(l => l.id === localId
            ? {
                ...l,
                videoName: file.name,
                videoFile: file,
                video: URL.createObjectURL(file),
                existingLessonVideo: null,
            }
            : l
        ));
    };

    const clearLessonVideo = (localId) =>
        setLessons(prev => prev.map(l => l.id === localId
            ? { ...l, video: null, videoFile: null, videoName: '', existingLessonVideo: null }
            : l
        ));

    const addLesson = () =>
        setLessons(prev => [...prev, makeNewLesson(prev.length + 1)]);

    const removeLesson = (localId) =>
        setLessons(prev => {
            const filtered = prev.filter(l => l.id !== localId);
            return filtered.map((l, i) => ({ ...l, sl: i + 1, orderNumber: i + 1 }));
        });

    const toggleConfirm = (localId) =>
        setLessons(prev => prev.map(l => l.id === localId ? { ...l, confirmed: !l.confirmed } : l));

    // ── File key logic ──
    // Existing lessons that get a new video: lessonVideo_{sl}_updated
    // Brand-new lessons added during edit:   lessonVideo_{sl}_new
    const getFileKey = (lesson) =>
        lesson.isNew
            ? `lessonVideo_${lesson.sl}_new`
            : `lessonVideo_${lesson.sl}_updated`;

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
            capsuleId: fullData.capsuleId ?? '',
            orderNumber,
            lessons: lessons.map(l => ({
                ...(l._id ? { _id: l._id } : {}),   // include _id only for existing lessons
                sl: l.sl,
                title: l.title,
                description: l.description,
                estimatedTime: l.estimatedTime,
                orderNumber: l.orderNumber,
                _fileKey: getFileKey(l),
                // Preserve existing video when not uploading a replacement
                ...(!l.videoFile && l.existingLessonVideo?.url
                    ? { lessonVideo: l.existingLessonVideo }
                    : !l.videoFile && l.video && !String(l.video).startsWith('blob:')
                        ? { lessonVideo: { url: l.video, status: 'ready' } }
                        : {}),
            })),
        };

        formData.append('data', JSON.stringify(data));
        if (moduleVideoFile) formData.append('moduleVideo', moduleVideoFile);
        lessons.forEach(l => {
            if (l.videoFile) formData.append(getFileKey(l), l.videoFile);
        });

        try {
            const res = await updateModule({ id, formData }).unwrap();
            console.log(res);
            toast.success('Module updated successfully!');
            navigate(-1);
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to update module. Please try again.');
        }
    };

    if (isFetching) {
        return (
            <div className="min-h-screen p-5 flex items-center justify-center">
                <p className="text-sm text-[#aab0c6]">Loading module...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-5">

            {/* ── Back Header ── */}
            <div onClick={() => navigate(-1)} className="flex items-center gap-1 cursor-pointer mb-6 w-fit">
                <MdOutlineKeyboardArrowLeft size={26} className="text-[#2d2a71]" />
                <h1 className="text-xl font-bold text-[#1a1a2e]">Edit Module</h1>
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
                            Add New Lesson
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
                            <input type="text" value={estimatedTime} onChange={e => setEstimatedTime(e.target.value)} placeholder="e.g. 6 days" className={inputClass} />
                        </div>

                        {/* Module Video */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-[#1a1a2e]">Module Video</label>
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
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-[#1a1a2e]">
                                    Lesson {String(index + 1).padStart(2, '0')}
                                </h3>
                                {lesson.isNew && (
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#e0e0ff] text-[#2d2a71]">
                                        New
                                    </span>
                                )}
                            </div>
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
                                <input type="text" value={lesson.title}
                                    onChange={e => updateLesson(lesson.id, 'title', e.target.value)}
                                    className={inputClass} />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[#1a1a2e]">Description <span className="text-red-400">*</span></label>
                                <textarea value={lesson.description}
                                    onChange={e => updateLesson(lesson.id, 'description', e.target.value)}
                                    rows={2}
                                    className="w-full border border-[#e8d0dc] rounded-lg px-3 py-2 text-sm text-[#1a1a2e] bg-white focus:outline-none focus:border-[#6c63ff] transition-colors resize-none" />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[#1a1a2e]">Estimated Time <span className="text-red-400">*</span></label>
                                <input type="text" value={lesson.estimatedTime}
                                    onChange={e => updateLesson(lesson.id, 'estimatedTime', e.target.value)}
                                    placeholder="e.g. 13 minutes"
                                    className={inputClass} />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-[#1a1a2e]">
                                    Lesson Video
                                    {!lesson.isNew && (
                                        <span className="ml-1.5 text-[#aab0c6] font-normal text-xs">(upload to replace)</span>
                                    )}
                                </label>
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

                {/* ── Action Buttons ── */}
                <div className="flex items-center justify-end gap-3 pb-6">
                    <button type="button" onClick={() => navigate(-1)}
                        className="h-11 px-6 rounded-xl border border-[#eaecf4] bg-white text-sm font-semibold text-[#7b7d9d] hover:border-[#2d2a71] hover:text-[#2d2a71] transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={isLoading}
                        className="h-11 px-8 rounded-xl bg-[#2d2a71] hover:bg-[#3d3a91] text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                        {isLoading ? 'Updating...' : 'Update Module'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default IndividualCapsulesEditLesson;