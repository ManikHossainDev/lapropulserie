/* eslint-disable react/prop-types */

import { useState } from "react";
import { FiMenu } from "react-icons/fi";
import { MdNotificationsNone } from "react-icons/md";
import { useGetAllNotificationsQuery, useReadAllNotificationsMutation } from "../../../redux/features/setting/settingApi";
import { toast } from "sonner";

const Header = ({ toggleSidebar }) => {
  const { data, isLoading, refetch } = useGetAllNotificationsQuery();
  const [readAllNotification] = useReadAllNotificationsMutation();
  const fullNotifications = data?.data || [];
  console.log(fullNotifications)

  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState(new Set());

  // Mark one as read
  const markAsRead = (id) => {
    setReadIds(prev => new Set([...prev, id]));
  };

  // Mark all as read
  const markAllAsRead = async () => {
    // setReadIds(new Set(fullNotifications.map(n => n.id)));
    try {
      await readAllNotification();
      refetch();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
    }
  };

  // Unread = viewStatus false AND not locally marked as read
  const unreadCount = fullNotifications.filter(
    n => !n.viewStatus && !readIds.has(n.id)
  ).length;

  const isRead = (n) => n.viewStatus || readIds.has(n.id);

  const formatTime = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? "s" : ""} ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="w-full px-5 py-3.5 bg-gray-100 flex justify-between items-center sticky top-0 z-10">

      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden text-3xl text-gray-700"
          onClick={toggleSidebar}
        >
          <FiMenu />
        </button>
      </div>

      {/* Right */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="relative bg-[#2d2a71] p-2 rounded-md"
        >
          <MdNotificationsNone className="text-white text-3xl" />

          {/* Unread Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-3 w-80 bg-white shadow-lg rounded-lg border z-50">

            {/* Header */}
            <div className="p-3 border-b flex justify-between items-center">
              <span className="font-semibold text-gray-700">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-500 hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <p className="p-4 text-sm text-gray-500 text-center">Loading...</p>
              ) : fullNotifications.length > 0 ? (
                fullNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`px-4 py-3 cursor-pointer border-b transition
                      ${!isRead(n) ? "bg-blue-50" : "bg-white"}
                      hover:bg-gray-100`}
                  >
                    <p className={`text-sm ${!isRead(n) ? "font-semibold text-gray-900" : "text-gray-600"}`}>
                      {n.title?.en || n.title}
                    </p>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-400">{formatTime(n.createdAt)}</p>
                      {n.type && (
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full capitalize">
                          {n.type}
                        </span>
                      )}
                    </div>

                    {!isRead(n) && (
                      <span className="text-xs text-blue-500">● Unread</span>
                    )}
                  </div>
                ))
              ) : (
                <p className="p-4 text-sm text-gray-500 text-center">No notifications</p>
              )}
            </div>

            {/* Footer */}
            <div className="p-2 text-center border-t">
              <button className="text-blue-500 text-sm hover:underline">
                View All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;