import React, { useState } from 'react';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { useGetAllUsersQuery } from '../../redux/features/user/userApi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });
}

function capitalize(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function Avatar({ src, name }) {
  const initials = name?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const url = src ? (src.startsWith("http") ? src : `${BASE_URL}${src}`) : null;

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
        className="w-8 h-8 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-xs font-semibold flex items-center justify-center">
      {initials}
    </div>
  );
}

const ROLE_STYLES = {
  admin:   "bg-purple-100 text-purple-700",
  mentor:  "bg-blue-100   text-blue-700",
  student: "bg-cyan-100   text-cyan-700",
};

const AllUsersList = () => {
  const [page, setPage]     = useState(1);
  const [limit]             = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);

  const { data, isLoading, isFetching } = useGetAllUsersQuery({ page, limit, search });
  const allUsers   = data?.data        ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;   // adjust key to match your API
  const totalItems = data?.meta?.total        ?? 0;

  // Debounce-free: search on Enter or button click
  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="bg-white border rounded-lg p-4">

        {/* Search bar */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by name or email..."
            className="border px-3 py-2 rounded w-1/3 focus:outline-none focus:ring"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-[#2d2a71] text-white rounded hover:bg-[#3d3a91] text-sm"
          >
            Search
          </button>
          {search && (
            <button
              onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
              className="px-4 py-2 border rounded text-sm text-gray-500 hover:bg-gray-100"
            >
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-lg overflow-x-auto">
          <table className="min-w-full rounded-md border-2 border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-semibold">User</th>
                <th className="px-4 py-4 text-left text-sm font-semibold">Email</th>
                <th className="px-4 py-4 text-left text-sm font-semibold">Role</th>
                <th className="px-4 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-4 text-left text-sm font-semibold">Email Verified</th>
                <th className="px-4 py-4 text-left text-sm font-semibold">Joined</th>
                <th className="px-4 py-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading || isFetching ? (
                // Skeleton rows
                [...Array(limit)].map((_, i) => (
                  <tr key={i} className="border-t animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : allUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400 text-sm">
                    No users found
                  </td>
                </tr>
              ) : (
                allUsers.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50 transition">

                    {/* User (avatar + name) */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar src={user.profileImage?.imageUrl} name={user.name} />
                        <span className="text-sm font-medium">{user.name}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>

                    {/* Role badge */}
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${ROLE_STYLES[user.role] ?? "bg-gray-100 text-gray-600"}`}>
                        {capitalize(user.role)}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === "active" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                        {capitalize(user.status)}
                      </span>
                    </td>

                    {/* Email verified */}
                    <td className="px-4 py-3 text-sm">
                      {user.isEmailVerified
                        ? <span className="text-green-500 font-medium">Yes</span>
                        : <span className="text-gray-400">No</span>
                      }
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(user.createdAt)}</td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <button className="text-red-500 px-3 py-1 rounded hover:bg-red-50 transition">
                          <RiDeleteBin6Line />
                        </button>
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-[#2d2a71] px-3 py-1 rounded hover:bg-indigo-50 transition"
                        >
                          <HiOutlineDotsVertical />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <span>
              Page {page} of {totalPages}
              {totalItems > 0 && ` · ${totalItems} users`}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
              >
                ← Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[999999] bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg md:w-[50vw] w-[80vw] p-6">
            <h2 className="text-xl font-bold mb-4">User Details</h2>

            {/* Avatar + name header */}
            <div className="flex items-center gap-4 mb-5 pb-4 border-b">
              <Avatar src={selectedUser.profileImage?.imageUrl} name={selectedUser.name} />
              <div>
                <p className="font-semibold">{selectedUser.name}</p>
                {/* <p className="text-xs text-gray-400">{selectedUser.id}</p> */}
              </div>
            </div>

            <div className="space-y-0 text-sm divide-y">
              {[
                ["Email",          selectedUser.email],
                ["Role",           capitalize(selectedUser.role)],
                ["Status",         capitalize(selectedUser.status)],
                ["Email Verified", selectedUser.isEmailVerified ? "Yes" : "No"],
                ["Journey Type",   capitalize(selectedUser.journeyType ?? "—")],
                ["Questionnaire",  selectedUser.hasCompletedQuestionnaire ? "Completed" : "Pending"],
                ["Joined",         formatDate(selectedUser.createdAt)],
                ["Last Updated",   formatDate(selectedUser.updatedAt)],
              ].map(([label, value]) => (
                <p key={label} className="flex items-center justify-between py-2.5">
                  <strong className="text-gray-600">{label}:</strong>
                  <span className="text-gray-800">{value}</span>
                </p>
              ))}
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setSelectedUser(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsersList;