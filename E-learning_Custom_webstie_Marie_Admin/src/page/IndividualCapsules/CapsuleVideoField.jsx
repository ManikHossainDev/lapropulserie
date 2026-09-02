import React, { useEffect, useState } from 'react';
import { FiUploadCloud, FiX, FiLink } from 'react-icons/fi';

const inputCls =
  'h-11 border border-[#eaecf4] rounded-xl px-4 text-sm text-[#1a1a2e] placeholder:text-[#aab0c6] bg-[#fafafa] focus:outline-none focus:border-[#6c63ff] focus:bg-white transition-colors w-full';

/**
 * Capsule Part 1/2/5 video picker — upload file or YouTube/Vimeo embed.
 * Supports showing an existing saved video and replacing it without clearing first.
 */
const CapsuleVideoField = ({
  label,
  fileKey,
  fileState,
  setFileState,
  embedState,
  setEmbedState,
  existingVideo = null,
  onClearExisting,
}) => {
  const [mode, setMode] = useState(() => (embedState ? 'embed' : 'upload'));

  useEffect(() => {
    if (embedState) setMode('embed');
    else if (fileState?.preview || existingVideo) setMode('upload');
  }, [embedState, fileState?.preview, existingVideo]);

  const handleFile = (file) => {
    if (!file) return;
    const maxBytes = 250 * 1024 * 1024;
    if (file.size > maxBytes) {
      // Soft guard — form submit also validates; catch early for UX
      window.alert(
        `This video is ${(file.size / (1024 * 1024)).toFixed(0)} MB. Max upload is 250 MB — use Embed Link for larger files.`,
      );
      return;
    }
    setFileState({ file, preview: URL.createObjectURL(file), name: file.name });
    setEmbedState('');
    // Keep existingVideo until save succeeds — if the multipart file is dropped
    // (proxy limit, network), the payload can still re-send the prior URL.
  };

  const existingUrl =
    typeof existingVideo === 'string'
      ? existingVideo
      : existingVideo?.url || null;
  const uploadPreview = fileState?.preview || existingUrl;
  const isHls = Boolean(existingUrl && /\.m3u8(\?|$)/i.test(existingUrl) && !fileState?.preview);

  const fileInput = (
    <input
      id={fileKey}
      type="file"
      accept="video/*"
      className="hidden"
      onChange={(e) => {
        handleFile(e.target.files?.[0]);
        e.target.value = '';
      }}
    />
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[#1a1a2e]">{label}</label>
        <div className="flex gap-1 bg-[#f0f0f8] rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${mode === 'upload' ? 'bg-white text-[#2d2a71] shadow-sm' : 'text-[#aab0c6]'}`}
          >
            <FiUploadCloud size={12} /> Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('embed')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${mode === 'embed' ? 'bg-white text-[#2d2a71] shadow-sm' : 'text-[#aab0c6]'}`}
          >
            <FiLink size={12} /> Embed Link
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        uploadPreview ? (
          <div className="relative rounded-xl overflow-hidden border border-[#eaecf4] bg-[#0f0f1a]">
            {isHls ? (
              <div className="h-36 flex flex-col items-center justify-center gap-1 px-4 text-center">
                <p className="text-sm text-white/90 font-medium">Current video on file</p>
                <p className="text-xs text-white/50">Preview unavailable for streamed videos — use Replace to change it.</p>
              </div>
            ) : (
              <video src={uploadPreview} className="w-full h-36 object-cover" controls />
            )}
            <button
              type="button"
              onClick={() => {
                setFileState(null);
                onClearExisting?.();
              }}
              className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow border border-[#eaecf4] text-red-500 hover:bg-red-50"
              title="Remove video"
            >
              <FiX size={12} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 flex items-center justify-between gap-2">
              <p className="text-white text-xs truncate min-w-0">
                {fileState?.name || 'Current uploaded video'}
              </p>
              <label
                htmlFor={fileKey}
                className="flex-shrink-0 cursor-pointer rounded-md bg-white/95 text-[#2d2a71] text-[11px] font-semibold px-2.5 py-1 hover:bg-white"
              >
                Replace
              </label>
            </div>
            {fileInput}
          </div>
        ) : (
          <label
            htmlFor={fileKey}
            className="flex flex-col gap-2 items-center justify-center h-28 border-2 border-dashed border-[#d4d6e8] rounded-xl cursor-pointer bg-[#fafafa] hover:border-[#6c63ff] hover:bg-[#f8f8ff] transition-all"
          >
            <FiUploadCloud size={22} className="text-[#aab0c6]" />
            <p className="text-xs text-[#aab0c6]">
              Click to upload — MP4, MOV (max 250 MB). Larger files: use Embed Link.
            </p>
            {fileInput}
          </label>
        )
      ) : (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={embedState}
            onChange={(e) => {
              setEmbedState(e.target.value);
              if (e.target.value.trim()) {
                setFileState(null);
                onClearExisting?.();
              }
            }}
            placeholder="Paste YouTube/Vimeo link or full iframe HTML"
            className={inputCls}
          />
          {embedState && /youtube|vimeo|youtu\.be/i.test(embedState) && (
            <p className="text-[11px] text-green-700">
              Embed link detected — will replace any uploaded file on save.
            </p>
          )}
          {existingUrl && !embedState && (
            <p className="text-[11px] text-[#8898b8]">
              An uploaded video is currently saved. Paste an embed link here to replace it, or switch to Upload.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CapsuleVideoField;
