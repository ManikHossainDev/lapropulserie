// import React, { useState, useMemo } from "react";
// import { FaRegEdit } from "react-icons/fa";
// import { HiPlus } from "react-icons/hi";
// import { RiDeleteBin6Line } from "react-icons/ri";
// import { RxDragHandleDots2 } from "react-icons/rx";
// import { Link } from "react-router-dom";
// import { useDeleteFreeQuestionnaireMutation, useGetAllFreeQuestionnaireQuery } from "../../redux/features/FreeQuestionnaire/freeQuestionnaire";

// // Category → style map
// const CATEGORY_STYLES = {
//   free: "bg-blue-100   text-blue-600",
//   capsule: "bg-purple-100 text-purple-600",
//   module: "bg-green-100  text-green-600",
// };

// function CategoryBadge({ category = "" }) {
//   return (
//     <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${CATEGORY_STYLES[category.toLowerCase()] ?? "bg-gray-100 text-gray-500"}`}>
//       {category}
//     </span>
//   );
// }

// function formatDate(iso) {
//   if (!iso) return "";
//   return new Date(iso).toLocaleDateString(undefined, {
//     year: "numeric", month: "short", day: "numeric",
//   });
// }

// const FreeQuestionnaire = () => {
//   const { data, isLoading } = useGetAllFreeQuestionnaireQuery();
//   const [deleteItem] = useDeleteFreeQuestionnaireMutation();

//   // Keep a local deleted-IDs set so deletes feel instant without a refetch
//   const [deletedIds, setDeletedIds] = useState(new Set());
//   const [search, setSearch] = useState("");
//   const [activeCategory, setActiveCategory] = useState("all");

//   const rawList = data?.data ?? [];

//   // Derive unique categories for filter tabs
//   const categories = useMemo(() => {
//     const cats = [...new Set(rawList.map((q) => q.category?.toLowerCase()).filter(Boolean))];
//     return ["all", ...cats];
//   }, [rawList]);

//   // Apply category filter + search + local deletes
//   const filtered = useMemo(() => {
//     return rawList.filter((q) => {
//       if (deletedIds.has(q.id)) return false;
//       if (activeCategory !== "all" && q.category?.toLowerCase() !== activeCategory) return false;
//       const term = search.toLowerCase();
//       return (
//         q.title?.toLowerCase().includes(term) ||
//         q.brief?.toLowerCase().includes(term)
//       );
//     });
//   }, [rawList, deletedIds, search, activeCategory]);

//   const handleDelete = (id) => {
//     if (window.confirm("Delete this section?")) {
//       setDeletedIds((prev) => new Set(prev).add(id));
//     }
//   };

//   return (
//     <div className="p-6 min-h-screen">
//       <div className="border-gray-200 border p-5 rounded-lg shadow">

//         {/* Top bar */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
//           <input
//             type="text"
//             placeholder="Filter / Search by title or description..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full md:w-1/3 border px-3 py-2 rounded focus:outline-none focus:ring"
//           />

//           <Link
//             to="/free-questionnaire/create"
//             className="bg-[#2d2a71] text-white px-4 py-2 rounded flex items-center gap-1 self-start md:self-auto"
//           >
//             <HiPlus /> Create Question Section
//           </Link>
//         </div>

//         {/* Header */}
//         <div className="flex items-center gap-2 mb-4">
//           <span className="h-6 rounded w-1 bg-[#2d2a71] block" />
//           <h2 className="text-lg font-semibold">Question Sections</h2>
//           <span className="text-sm text-gray-400 ml-1">({filtered.length})</span>
//         </div>

//         {/* Category filter tabs */}
//         <div className="flex gap-2 flex-wrap mb-5">
//           {categories.map((cat) => (
//             <button
//               key={cat}
//               onClick={() => setActiveCategory(cat)}
//               className={`px-3 py-1 rounded-full text-xs font-medium capitalize border transition ${activeCategory === cat
//                 ? "bg-[#2d2a71] text-white border-[#2d2a71]"
//                 : "bg-white text-gray-500 border-gray-200 hover:border-[#2d2a71] hover:text-[#2d2a71]"
//                 }`}
//             >
//               {cat}
//             </button>
//           ))}
//         </div>

//         {/* List */}
//         <div className="space-y-3">

//           {/* Skeleton */}
//           {isLoading && (
//             [...Array(4)].map((_, i) => (
//               <div key={i} className="border rounded-lg p-4 animate-pulse flex justify-between items-center">
//                 <div className="space-y-2 flex-1">
//                   <div className="h-4 bg-gray-100 rounded w-1/3" />
//                   <div className="h-3 bg-gray-100 rounded w-1/2" />
//                 </div>
//                 <div className="flex gap-3">
//                   <div className="h-5 w-5 bg-gray-100 rounded" />
//                   <div className="h-5 w-5 bg-gray-100 rounded" />
//                 </div>
//               </div>
//             ))
//           )}

//           {/* Rows */}
//           {!isLoading && filtered.map((sec) => (
//             <div
//               key={sec.id}
//               className="border rounded-lg p-4 flex justify-between items-center hover:shadow-sm transition"
//             >
//               {/* Left */}
//               <div className="flex gap-3 items-start">
//                 <RxDragHandleDots2 className="text-2xl mt-1 text-gray-300 cursor-grab" />
//                 <div>
//                   <div className="flex items-center gap-2 flex-wrap">
//                     <h3 className="font-semibold text-base">{sec.title}</h3>
//                     <CategoryBadge category={sec.category} />
//                   </div>
//                   <p className="text-gray-500 text-sm mt-0.5">{sec.brief}</p>
//                   <p className="text-xs text-gray-400 mt-1">
//                     Created {formatDate(sec.createdAt)}
//                   </p>
//                 </div>
//               </div>

//               {/* Actions */}
//               <div className="flex items-center gap-3 shrink-0">
//                 <Link
//                   to={`/free-questionnaire/edit/${sec.id}`}
//                   className="text-gray-600 hover:text-[#2d2a71] transition"
//                 >
//                   <FaRegEdit size={18} />
//                 </Link>
//                 <button
//                   onClick={() => handleDelete(sec.id)}
//                   className="text-red-400 hover:text-red-600 transition"
//                 >
//                   <RiDeleteBin6Line size={18} />
//                 </button>
//               </div>
//             </div>
//           ))}

//           {/* Empty state */}
//           {!isLoading && filtered.length === 0 && (
//             <div className="text-center text-gray-400 py-10 text-sm">
//               No sections found.
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FreeQuestionnaire;


import React, { useState, useMemo } from "react";
import { FaRegEdit } from "react-icons/fa";
import { HiPlus } from "react-icons/hi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { RxDragHandleDots2 } from "react-icons/rx";
import { Link } from "react-router-dom";
import { useDeleteFreeQuestionnaireMutation, useGetAllFreeQuestionnaireQuery } from "../../redux/features/FreeQuestionnaire/freeQuestionnaire";

const CATEGORY_STYLES = {
  free:    "bg-blue-100   text-blue-600",
  capsule: "bg-purple-100 text-purple-600",
  module:  "bg-green-100  text-green-600",
};

function CategoryBadge({ category = "" }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${CATEGORY_STYLES[category.toLowerCase()] ?? "bg-gray-100 text-gray-500"}`}>
      {category}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });
}

const FreeQuestionnaire = () => {
  const { data, isLoading } = useGetAllFreeQuestionnaireQuery();
  const [deleteItem, { isLoading: isDeleting }] = useDeleteFreeQuestionnaireMutation();

  const [deletedIds,     setDeletedIds]     = useState(new Set());
  const [deletingId,     setDeletingId]     = useState(null);   // tracks which row is mid-delete
  const [search,         setSearch]         = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const rawList = data?.data ?? [];

  const categories = useMemo(() => {
    const cats = [...new Set(rawList.map((q) => q.category?.toLowerCase()).filter(Boolean))];
    return ["all", ...cats];
  }, [rawList]);

  const filtered = useMemo(() => {
    return rawList.filter((q) => {
      if (deletedIds.has(q.id)) return false;
      if (activeCategory !== "all" && q.category?.toLowerCase() !== activeCategory) return false;
      const term = search.toLowerCase();
      return (
        q.title?.toLowerCase().includes(term) ||
        q.brief?.toLowerCase().includes(term)
      );
    });
  }, [rawList, deletedIds, search, activeCategory]);

  // ── Delete with API call ──────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this section?")) return;

    setDeletingId(id);
    try {
      await deleteItem(id).unwrap();
      setDeletedIds((prev) => new Set(prev).add(id));   // hide row instantly
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err?.data?.message ?? "Failed to delete. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="border-gray-200 border p-5 rounded-lg shadow">

        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <input
            type="text"
            placeholder="Filter / Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/3 border px-3 py-2 rounded focus:outline-none focus:ring"
          />
          <Link
            to="/free-questionnaire/create"
            className="bg-[#2d2a71] text-white px-4 py-2 rounded flex items-center gap-1 self-start md:self-auto"
          >
            <HiPlus /> Create Question Section
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="h-6 rounded w-1 bg-[#2d2a71] block" />
          <h2 className="text-lg font-semibold">Question Sections</h2>
          <span className="text-sm text-gray-400 ml-1">({filtered.length})</span>
        </div>

        {/* Category filter tabs */}
        <div className="flex gap-2 flex-wrap mb-5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize border transition ${
                activeCategory === cat
                  ? "bg-[#2d2a71] text-white border-[#2d2a71]"
                  : "bg-white text-gray-500 border-gray-200 hover:border-[#2d2a71] hover:text-[#2d2a71]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">

          {/* Skeleton */}
          {isLoading && [...Array(4)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse flex justify-between items-center">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
              <div className="flex gap-3">
                <div className="h-5 w-5 bg-gray-100 rounded" />
                <div className="h-5 w-5 bg-gray-100 rounded" />
              </div>
            </div>
          ))}

          {/* Rows */}
          {!isLoading && filtered.map((sec) => (
            <div
              key={sec.id}
              className="border rounded-lg p-4 flex justify-between items-center hover:shadow-sm transition"
            >
              {/* Left */}
              <div className="flex gap-3 items-start">
                <RxDragHandleDots2 className="text-2xl mt-1 text-gray-300 cursor-grab" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-base">{sec.title}</h3>
                    <CategoryBadge category={sec.category} />
                  </div>
                  <p className="text-gray-500 text-sm mt-0.5">{sec.brief}</p>
                  <p className="text-xs text-gray-400 mt-1">Created {formatDate(sec.createdAt)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to={`/free-questionnaire/edit/${sec.id}`}
                  className="text-gray-600 hover:text-[#2d2a71] transition"
                >
                  <FaRegEdit size={18} />
                </Link>

                <button
                  onClick={() => handleDelete(sec.id)}
                  disabled={deletingId === sec.id}
                  className="text-red-400 hover:text-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {deletingId === sec.id
                    ? <span className="text-xs">…</span>
                    : <RiDeleteBin6Line size={18} />
                  }
                </button>
              </div>
            </div>
          ))}

          {/* Empty state */}
          {!isLoading && filtered.length === 0 && (
            <div className="text-center text-gray-400 py-10 text-sm">
              No sections found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreeQuestionnaire;