import { useState } from "react";
import { FiSearch, FiFilter, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useGetIndividualcapsuleQuery, useDeleteIndividualcapsuleMutation } from "../../redux/features/Individualcapsule/Individualcapsule";
import { toast } from "sonner";

const IndividualCapsules = () => {
  const { data, isLoading  , refetch} = useGetIndividualcapsuleQuery();
  // sendResponse flattens paginateResults → data is the array (meta at top level)
  const categories = Array.isArray(data?.data)
    ? data.data
    : data?.data?.results || [];
  const [deleteIndividual] = useDeleteIndividualcapsuleMutation();

  const [search, setSearch] = useState("");

  const filtered = categories?.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    try {
      await deleteIndividual(id).unwrap();
      refetch();
      toast.success("Category deleted successfully!");
    } catch {
      toast.error("Failed to delete category.");
    }
  };

  return (
    <div className="min-h-screen p-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e] leading-tight m-0">
            Individual Capsules
          </h1>
          <p className="text-sm text-[#7b7d9d] mt-1">
            Create Capsules And Monitor The Capsule
          </p>
        </div>

        <Link
          to="/individual-capsules/create"
          className="flex items-center gap-2 px-5 h-11 rounded-xl text-white text-sm font-semibold bg-[#2d2a71] hover:bg-[#3d3a91] transition-colors"
        >
          <FiPlus size={16} strokeWidth={2.5} />
          Create New Capsule Category
        </Link>
      </div>

      {/* ── Search & Filter ── */}
      <div className="flex items-center gap-3 mb-7">
        <div className="relative flex-1 max-w-lg">
          <FiSearch size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aab0c6]" />
          <input
            type="text"
            placeholder="Search category"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-11 bg-white border border-[#eaecf4] rounded-xl pl-11 pr-4 text-sm text-[#1a1a2e] placeholder:text-[#aab0c6] focus:outline-none focus:border-[#6c63ff] transition-colors"
          />
        </div>

        <button className="flex items-center gap-2 h-11 px-4 bg-white border border-[#eaecf4] rounded-xl text-sm font-medium text-[#2d2a71] cursor-pointer hover:border-[#6c63ff] hover:bg-[#f8f8ff] transition-all">
          <FiFilter size={14} />
          Filters
        </button>
      </div>

      {/* ── Section Label ── */}
      <div className="flex items-center gap-2.5 mb-5">
        <span className="w-1 h-5 rounded-full bg-[#2d2a71] inline-block" />
        <span className="text-sm font-bold text-[#1a1a2e]">Categories</span>
        <span className="text-sm text-[#aab0c6] font-medium">({filtered.length})</span>
      </div>

      {/* ── Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-[#eaecf4] animate-pulse">
              <div className="w-full h-40 bg-[#eaecf4]" />
              <div className="px-4 py-3 flex flex-col gap-2">
                <div className="h-3.5 bg-[#eaecf4] rounded w-2/3" />
                <div className="h-3 bg-[#eaecf4] rounded w-full" />
                <div className="h-3 bg-[#eaecf4] rounded w-4/5" />
              </div>
              <div className="h-10 bg-[#f5f6fa] border-t border-[#eaecf4]" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-[#aab0c6] text-sm">
          No categories found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(card => (
            <div
              key={card.id}
              className="bg-white rounded-2xl overflow-hidden border border-[#eaecf4] hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              {/* Thumbnail */}
              <img
                src={card.thumbnail}
                alt={card.title}
                className="w-full h-40 object-cover"
                onError={e => {
                  e.target.src = "https://placehold.co/400x160?text=No+Image";
                }}
              />

              {/* Body */}
              <div className="px-4 py-3">
                <h3 className="text-sm font-bold text-[#1a1a2e] mb-1 truncate">{card.title}</h3>
                <p className="text-xs text-[#7b7d9d] leading-relaxed line-clamp-2">
                  {card.description}
                </p>
                {card.sellIndividually === false ? (
                  <p className="text-xs font-semibold text-[#7b7d9d] mt-2">Journey only</p>
                ) : card.price != null ? (
                  <p className="text-xs font-semibold text-[#2d2a71] mt-2">
                    {card.price === 0 ? 'Free' : `€${card.price}`}
                  </p>
                ) : null}
              </div>

              {/* Actions */}
              <div className="flex border-t border-[#eaecf4]">
                <Link
                  to={`/individual-capsules/edit/${card.id}`}
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
  );
};

export default IndividualCapsules;