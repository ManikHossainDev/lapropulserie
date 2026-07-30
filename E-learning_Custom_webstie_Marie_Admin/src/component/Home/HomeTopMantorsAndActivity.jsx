import React from "react";
import { useGetDashActiveFeedQuery } from "../../redux/features/dashboardHome/dashboardHome";

// Map activity type → emoji icon
const TYPE_ICON = {
  payment:      "💲",
  booking:      "👤",
  subscription: "⭐",
  capsule:      "✅",
  session:      "📅",
  mentor:       "🎓",
  default:      "🔔",
};

function getIcon(type = "") {
  return TYPE_ICON[type.toLowerCase()] ?? TYPE_ICON.default;
}

function formatTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── static until a top-mentors API is available ───────────────────────────
const STATIC_MENTORS = [
  { name: "Dr. Sarah Chen",  role: "Tech Career Coaching", rating: 4.9, img: "https://i.pravatar.cc/40?img=1" },
  { name: "James Whitfield", role: "Product Management",   rating: 4.8, img: "https://i.pravatar.cc/40?img=2" },
  { name: "Priya Nair",      role: "Data Science Mentor",  rating: 4.7, img: "https://i.pravatar.cc/40?img=3" },
];

const HomeTopMantorsAndActivity = () => {
  const { data, isLoading } = useGetDashActiveFeedQuery();
  const activities = data?.data?.activities ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:mt-0 mt-5">

      {/* ── Top Mentors (static) ── */}
      <div className="bg-gray-100 rounded-2xl shadow-sm p-5">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🎓 Top Mentors
        </h2>

        <div className="space-y-3">
          {STATIC_MENTORS.map((mentor, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 hover:bg-gray-200 transition p-3 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <img
                  src={mentor.img}
                  alt={mentor.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-sm">{mentor.name}</p>
                  <p className="text-xs text-gray-500">{mentor.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium">
                ⭐ {mentor.rating}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Live Activity Feed ── */}
      <div className="bg-gray-100 rounded-2xl shadow-sm p-5">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          ⏱ Live Activity Feed
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse flex gap-3 bg-gray-50 p-3 rounded-xl">
                <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-start gap-3 bg-gray-50 hover:bg-gray-200 transition p-3 rounded-xl ${
                  !activity.viewStatus ? "border-l-2 border-blue-400" : ""
                }`}
              >
                <div className="text-lg shrink-0">{getIcon(activity.type)}</div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm">{activity.title?.en ?? "—"}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTime(activity.createdAt)}
                  </p>
                </div>

                {/* Unread indicator dot */}
                {!activity.viewStatus && (
                  <span className="mt-1 w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default HomeTopMantorsAndActivity;