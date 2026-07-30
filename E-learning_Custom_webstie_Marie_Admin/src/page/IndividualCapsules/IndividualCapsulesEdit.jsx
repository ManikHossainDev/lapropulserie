import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MdOutlineKeyboardArrowLeft } from 'react-icons/md';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import {
  useDeleteCapsuleMutation,
  useGetAllcapsuleQuery,
  useGetIndividualcapsuleByIdQuery,
  useUpdateIndividualcapsuleMutation,
} from '../../redux/features/Individualcapsule/Individualcapsule';
import { toast } from 'sonner';
import CategoryCommercialFields from './CategoryCommercialFields';
import {
  appendCategoryFiles,
  buildCategoryPayload,
  validateCategoryForm,
} from './categoryFormUtils';

const IndividualCapsulesEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: capsulesCategoryDetails, refetch } = useGetIndividualcapsuleByIdQuery(id);
  const fullCapsule = capsulesCategoryDetails?.data;
  const [updateCapsule, { isLoading }] = useUpdateIndividualcapsuleMutation();

  const { data } = useGetAllcapsuleQuery(id);
  const capsules = data?.data?.results;
  const [deleteCapsule] = useDeleteCapsuleMutation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [about, setAbout] = useState('');
  const [level, setLevel] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [price, setPrice] = useState('');
  const [whatYouLearn, setWhatYouLearn] = useState(['', '']);

  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!fullCapsule) return;
    setTitle(fullCapsule.title ?? '');
    setDescription(fullCapsule.description ?? '');
    setAbout(fullCapsule.about ?? '');
    setLevel(fullCapsule.level ?? '');
    setEstimatedDuration(fullCapsule.estimatedDuration ?? '');
    setPrice(
      fullCapsule.sellIndividually === false ? '' : (fullCapsule.price ?? ''),
    );
    setWhatYouLearn(fullCapsule.whatYouLearn?.length ? fullCapsule.whatYouLearn : ['', '']);
    if (fullCapsule.thumbnail) {
      setThumbnail(fullCapsule.thumbnail);
      setFileName('Current thumbnail');
    }
  }, [fullCapsule]);

  const handleThumbnailFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = () => setThumbnail(reader.result);
    reader.readAsDataURL(file);
  };

  const handleLearnChange = (i, val) =>
    setWhatYouLearn((prev) => prev.map((item, idx) => (idx === i ? val : item)));
  const addLearnItem = () => setWhatYouLearn((prev) => [...prev, '']);
  const removeLearnItem = (i) => {
    if (whatYouLearn.length <= 1) return;
    setWhatYouLearn((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleDelete = async (capsuleId) => {
    if (!window.confirm('Supprimer cette capsule ?')) return;
    try {
      await deleteCapsule(capsuleId).unwrap();
      refetch();
      toast.success('Capsule deleted successfully!');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete capsule.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateCategoryForm({
      title,
      description,
      about,
      level,
      price,
      whatYouLearn,
      thumbnailFile,
      isEdit: true,
      hasExistingThumbnail: !!thumbnail,
    });

    if (validationErrors.length > 0) {
      validationErrors.forEach((message) => toast.error(message));
      return;
    }

    const formData = new FormData();
    formData.append(
      'data',
      JSON.stringify(
        buildCategoryPayload({
          title,
          description,
          about,
          level,
          estimatedDuration,
          price,
          whatYouLearn,
        }),
      ),
    );
    appendCategoryFiles(formData, { thumbnailFile });

    try {
      await updateCapsule({ id, formData }).unwrap();
      refetch();
      toast.success('Capsule category updated successfully!');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update category. Please try again.');
    }
  };

  return (
    <div className="min-h-screen p-5">
      <div onClick={() => navigate(-1)} className="flex items-center gap-1 cursor-pointer mb-7 w-fit">
        <MdOutlineKeyboardArrowLeft size={26} className="text-[#2d2a71]" />
        <h1 className="text-xl font-bold text-[#1a1a2e]">Edit Capsule Category</h1>
      </div>

      <div className="bg-white rounded-2xl border border-[#eaecf4] shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-[#eaecf4]">
          <h2 className="text-base font-bold text-[#2d2a71]">Commercial & Presentation</h2>
          <p className="text-xs text-[#aab0c6] mt-0.5">
            Information learners see before purchasing this experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-6">
          <CategoryCommercialFields
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            about={about}
            setAbout={setAbout}
            level={level}
            setLevel={setLevel}
            estimatedDuration={estimatedDuration}
            setEstimatedDuration={setEstimatedDuration}
            price={price}
            setPrice={setPrice}
            whatYouLearn={whatYouLearn}
            onLearnChange={handleLearnChange}
            onAddLearnItem={addLearnItem}
            onRemoveLearnItem={removeLearnItem}
            thumbnail={thumbnail}
            thumbnailName={fileName}
            thumbnailDragOver={dragOver}
            setThumbnailDragOver={setDragOver}
            onThumbnailFile={handleThumbnailFile}
            onClearThumbnail={() => {
              setThumbnail(null);
              setThumbnailFile(null);
              setFileName('');
            }}
            thumbnailInputId="categoryEditThumbnailInput"
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-11 px-6 rounded-xl border border-[#eaecf4] bg-white text-sm font-semibold text-[#7b7d9d] hover:border-[#2d2a71] hover:text-[#2d2a71] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="h-11 px-8 rounded-xl bg-[#2d2a71] hover:bg-[#3d3a91] text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {isLoading ? 'Updating...' : 'Update Category'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-[#eaecf4] shadow-sm">
        <div className="px-6 py-4 border-b border-[#eaecf4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-1 h-5 rounded-full bg-[#2d2a71] inline-block" />
            <h2 className="text-base font-bold text-[#1a1a2e]">Capsules</h2>
            <span className="text-sm text-[#aab0c6] font-medium">({capsules?.length ?? 0})</span>
          </div>
          <Link
            to={`/individual-capsules/capsule/create?categoryId=${id}`}
            className="flex items-center gap-2 px-5 h-10 rounded-xl text-white text-sm font-semibold bg-[#2d2a71] hover:bg-[#3d3a91] transition-colors"
          >
            <FiPlus size={15} strokeWidth={2.5} />
            Create Capsule
          </Link>
        </div>

        <div className="p-6">
          {capsules?.length === 0 ? (
            <div className="text-center py-16 text-[#aab0c6] text-sm">
              No capsules yet. Create your first learning journey!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {capsules?.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-2xl overflow-hidden border border-[#eaecf4] hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="w-full h-40 bg-[#f0f0f8] flex items-center justify-center text-3xl">
                    🧭
                  </div>
                  <div className="px-4 py-3">
                    <h3 className="text-sm font-bold text-[#1a1a2e] mb-1">{card.title}</h3>
                    <p className="text-xs text-[#7b7d9d] leading-relaxed line-clamp-2">
                      {card.introduction?.title || 'Learning journey'}
                    </p>
                  </div>
                  <div className="flex border-t border-[#eaecf4]">
                    <Link
                      to={`/individual-capsules/capsule/edit/${card.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-[#2d2a71] hover:bg-[#f0f0ff] transition-colors"
                    >
                      <FiEdit2 size={13} />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="flex items-center justify-center px-4 border-l border-[#eaecf4] text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndividualCapsulesEdit;
