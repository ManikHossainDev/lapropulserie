import { FiPlus, FiTrash2, FiUploadCloud, FiX } from 'react-icons/fi';

export const LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export const inputCls =
  'h-11 border border-[#eaecf4] rounded-xl px-4 text-sm text-[#1a1a2e] placeholder:text-[#aab0c6] bg-[#fafafa] focus:outline-none focus:border-[#6c63ff] focus:bg-white transition-colors w-full';
export const textareaCls =
  'border border-[#eaecf4] rounded-xl px-4 py-3 text-sm text-[#1a1a2e] placeholder:text-[#aab0c6] bg-[#fafafa] focus:outline-none focus:border-[#6c63ff] focus:bg-white transition-colors resize-none w-full';

const CategoryCommercialFields = ({
  title,
  setTitle,
  description,
  setDescription,
  about,
  setAbout,
  level,
  setLevel,
  estimatedDuration,
  setEstimatedDuration,
  price,
  setPrice,
  whatYouLearn,
  onLearnChange,
  onAddLearnItem,
  onRemoveLearnItem,
  thumbnail,
  thumbnailName,
  thumbnailDragOver,
  setThumbnailDragOver,
  onThumbnailFile,
  onClearThumbnail,
  thumbnailInputId = 'categoryThumbnailInput',
}) => (
  <div className="flex flex-col gap-5">
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-[#1a1a2e]">
        Category Title <span className="text-red-400">*</span>
      </label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter category title"
        className={inputCls}
      />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-[#1a1a2e]">
          Level <span className="text-red-400">*</span>
        </label>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputCls}>
          <option value="" disabled>
            Select level
          </option>
          {LEVEL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-[#1a1a2e]">Estimated Duration</label>
        <input
          type="number"
          min="1"
          value={estimatedDuration}
          onChange={(e) => setEstimatedDuration(e.target.value)}
          placeholder="e.g. 5"
          className={inputCls}
        />
      </div>
    </div>

    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-[#1a1a2e]">
        Short Description <span className="text-red-400">*</span>
      </label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        placeholder="Brief description shown before purchase"
        className={textareaCls}
      />
    </div>

    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-[#1a1a2e]">
        Detailed Description <span className="text-red-400">*</span>
      </label>
      <textarea
        value={about}
        onChange={(e) => setAbout(e.target.value)}
        rows={4}
        placeholder="Full description shown on the discovery page"
        className={textareaCls}
      />
    </div>

    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-[#1a1a2e]">
        Price (€) <span className="text-[#aab0c6] font-normal">(optional)</span>
      </label>
      <p className="text-xs text-[#aab0c6]">
        Leave empty if this category is only used inside an Expedition Journey (no individual purchase).
      </p>
      <div className="relative max-w-xs">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#aab0c6] font-medium">
          €
        </span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          className="h-11 w-full border border-[#eaecf4] rounded-xl pl-8 pr-4 text-sm text-[#1a1a2e] placeholder:text-[#aab0c6] bg-[#fafafa] focus:outline-none focus:border-[#6c63ff] focus:bg-white transition-colors"
        />
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[#1a1a2e]">
          What the Learner Will Learn <span className="text-red-400">*</span>
        </label>
        <button
          type="button"
          onClick={onAddLearnItem}
          className="flex items-center gap-1 text-xs font-semibold text-[#2d2a71] hover:text-[#6c63ff] transition-colors"
        >
          <FiPlus size={14} /> Add Item
        </button>
      </div>
      {whatYouLearn.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#eaecf4] text-[#2d2a71] text-xs font-bold flex items-center justify-center flex-shrink-0">
            {i + 1}
          </span>
          <input
            type="text"
            value={item}
            onChange={(e) => onLearnChange(i, e.target.value)}
            placeholder="e.g. How to identify your core values"
            className="flex-1 h-11 border border-[#eaecf4] rounded-xl px-4 text-sm text-[#1a1a2e] placeholder:text-[#aab0c6] bg-[#fafafa] focus:outline-none focus:border-[#6c63ff] focus:bg-white transition-colors"
          />
          <button
            type="button"
            onClick={() => onRemoveLearnItem(i)}
            disabled={whatYouLearn.length <= 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#eaecf4] text-red-400 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-30 flex-shrink-0"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      ))}
    </div>

    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-[#1a1a2e]">
        Thumbnail <span className="text-red-400">*</span>
      </label>
      {thumbnail ? (
        <div className="relative rounded-xl overflow-hidden border border-[#eaecf4] h-48">
          <img src={thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={onClearThumbnail}
            className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow border border-[#eaecf4] text-red-500 hover:bg-red-50"
          >
            <FiX size={14} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-2">
            <p className="text-white text-xs truncate">{thumbnailName}</p>
          </div>
        </div>
      ) : (
        <label
          htmlFor={thumbnailInputId}
          onDragOver={(e) => {
            e.preventDefault();
            setThumbnailDragOver(true);
          }}
          onDragLeave={() => setThumbnailDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setThumbnailDragOver(false);
            onThumbnailFile(e.dataTransfer.files?.[0]);
          }}
          className={`flex flex-col items-center justify-center gap-3 h-44 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
            ${thumbnailDragOver ? 'border-[#6c63ff] bg-[#f0f0ff]' : 'border-[#d4d6e8] bg-[#fafafa] hover:border-[#6c63ff] hover:bg-[#f8f8ff]'}`}
        >
          <FiUploadCloud size={24} className="text-[#2d2a71]" />
          <p className="text-sm text-[#7b7d9d]">
            <span className="font-semibold text-[#2d2a71]">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-[#aab0c6]">PNG, JPG, WEBP up to 5MB</p>
          <input
            id={thumbnailInputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onThumbnailFile(e.target.files?.[0])}
          />
        </label>
      )}
    </div>
  </div>
);

export default CategoryCommercialFields;
