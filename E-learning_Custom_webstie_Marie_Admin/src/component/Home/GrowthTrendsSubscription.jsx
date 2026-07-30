import React, { useMemo } from "react";
import {
  useGetAllActiveSubscriptionsQuery,
  useGetDashboardGrowthTrendsQuery,
} from "../../redux/features/dashboardHome/dashboardHome";

const CHART_WIDTH = 600;
const CHART_HEIGHT = 200;
const PADDING = { top: 16, right: 16, bottom: 8, left: 36 };

const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

// Cycle through these for however many plans come back
const PLAN_STYLES = [
  { bar: "bg-cyan-500",   text: "text-cyan-600"   },
  { bar: "bg-purple-500", text: "text-purple-600" },
  { bar: "bg-green-500",  text: "text-green-600"  },
  { bar: "bg-amber-500",  text: "text-amber-600"  },
];

function buildAreaPath(points, bottom) {
  if (!points.length) return "";
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const close = ` L${points[points.length - 1].x},${bottom} L${points[0].x},${bottom} Z`;
  return line + close;
}

function buildLinePath(points) {
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
}

const GrowthTrendsSubscription = () => {
  /* ── Growth Trends ── */
  const { data: trendsData, isLoading: trendsLoading } = useGetDashboardGrowthTrendsQuery();
  const periods = trendsData?.data?.periods ?? [];

  /* ── Subscriptions ── */
  const { data: subscriptionsData, isLoading: plansLoading } = useGetAllActiveSubscriptionsQuery();

  const activePlans = useMemo(() => {
    const raw = subscriptionsData?.data?.plans ?? [];
    // Sort by sortOrder so display order matches backend intention
    return [...raw].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [subscriptionsData]);

  // Max price used to scale bar widths proportionally
  const maxPrice = useMemo(
    () => Math.max(...activePlans.map((p) => p.price), 1),
    [activePlans]
  );

  /* ── Chart maths ── */
  const { studentPoints, mentorPoints, xLabels, maxVal, totalStudents, totalMentors } =
    useMemo(() => {
      if (!periods.length)
        return { studentPoints: [], mentorPoints: [], xLabels: [], maxVal: 1, totalStudents: 0, totalMentors: 0 };

      const maxVal = Math.max(...periods.map((p) => Math.max(p.newStudents, p.newMentors)), 1);
      const totalStudents = periods.reduce((s, p) => s + p.newStudents, 0);
      const totalMentors  = periods.reduce((s, p) => s + p.newMentors,  0);
      const xStep = plotWidth / (periods.length - 1 || 1);

      const studentPoints = periods.map((p, i) => ({
        x: PADDING.left + i * xStep,
        y: PADDING.top + plotHeight - (p.newStudents / maxVal) * plotHeight,
        value: p.newStudents,
      }));

      const mentorPoints = periods.map((p, i) => ({
        x: PADDING.left + i * xStep,
        y: PADDING.top + plotHeight - (p.newMentors / maxVal) * plotHeight,
        value: p.newMentors,
      }));

      const xLabels = periods.map((p, i) => ({
        x: PADDING.left + i * xStep,
        label: p.label.split(" ").map((w, j) => (j === 0 ? w.slice(0, 3) : w.slice(2))).join(" "),
        show: periods.length <= 6 || i % 2 === 0 || i === periods.length - 1,
      }));

      return { studentPoints, mentorPoints, xLabels, maxVal, totalStudents, totalMentors };
    }, [periods]);

  const bottomY         = PADDING.top + plotHeight;
  const studentAreaPath = buildAreaPath(studentPoints, bottomY);
  const studentLinePath = buildLinePath(studentPoints);
  const mentorAreaPath  = buildAreaPath(mentorPoints,  bottomY);
  const mentorLinePath  = buildLinePath(mentorPoints);

  const yTicks = [0, 0.5, 1].map((ratio) => ({
    y:     PADDING.top + plotHeight - ratio * plotHeight,
    label: Math.round(maxVal * ratio),
  }));

  return (
    <div className="w-full p-4 bg-gray-50">
      <div className="flex gap-6 flex-col md:flex-row">

        {/* ── LEFT: GROWTH TRENDS ── */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Growth Trends</h2>
          </div>

          {trendsLoading ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              Loading…
            </div>
          ) : (
            <svg
              width="100%"
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT + 32}`}
              className="overflow-visible"
            >
              <defs>
                <linearGradient id="gradStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#22d3ee" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.04" />
                </linearGradient>
                <linearGradient id="gradMentors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#a855f7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.03" />
                </linearGradient>
              </defs>

              {yTicks.map((tick) => (
                <g key={tick.y}>
                  <line x1={PADDING.left} y1={tick.y} x2={CHART_WIDTH - PADDING.right} y2={tick.y} stroke="#f1f5f9" strokeWidth="1" />
                  <text x={PADDING.left - 6} y={tick.y} textAnchor="end" dominantBaseline="central" fontSize="10" fill="#94a3b8">
                    {tick.label}
                  </text>
                </g>
              ))}

              {studentPoints.length > 1 && (
                <>
                  <path d={studentAreaPath} fill="url(#gradStudents)" />
                  <path d={studentLinePath} fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                </>
              )}

              {mentorPoints.length > 1 && (
                <>
                  <path d={mentorAreaPath} fill="url(#gradMentors)" />
                  <path d={mentorLinePath} fill="none" stroke="#a855f7" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                </>
              )}

              {studentPoints.map((p, i) =>
                p.value > 0 ? (
                  <circle key={`s-${i}`} cx={p.x} cy={p.y} r="4" fill="#22d3ee" stroke="#fff" strokeWidth="1.5">
                    <title>{`${periods[i]?.label}: ${p.value} students`}</title>
                  </circle>
                ) : null
              )}

              {mentorPoints.map((p, i) =>
                p.value > 0 ? (
                  <circle key={`m-${i}`} cx={p.x} cy={p.y} r="4" fill="#a855f7" stroke="#fff" strokeWidth="1.5">
                    <title>{`${periods[i]?.label}: ${p.value} mentors`}</title>
                  </circle>
                ) : null
              )}

              {xLabels.map((item, i) =>
                item.show ? (
                  <text key={i} x={item.x} y={bottomY + 20} textAnchor="middle" fontSize="11" fill="#94a3b8">
                    {item.label}
                  </text>
                ) : null
              )}
            </svg>
          )}

          <div className="flex gap-6 mt-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400" />
              Students ({totalStudents.toLocaleString()})
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500" />
              Mentors ({totalMentors.toLocaleString()})
            </div>
          </div>
        </div>

        {/* ── RIGHT: SUBSCRIPTIONS ── */}
        <div className="w-80 bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Subscriptions</h2>

          {plansLoading ? (
            <div className="flex flex-col gap-5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse">
                  <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-2 bg-gray-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            activePlans.map((plan, idx) => {
              const style   = PLAN_STYLES[idx % PLAN_STYLES.length];
              const barPct  = Math.round((plan.price / maxPrice) * 100);
              const billing = plan.billingPeriod === "monthly" ? "mo" : plan.billingPeriod;

              return (
                <div key={plan.id} className="mb-5 last:mb-0">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <span className={style.text + " font-medium"}>{plan.name}</span>
                      {plan.mostPopular && (
                        <span className="text-xs bg-purple-50 text-purple-500 font-medium px-1.5 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <span className="text-gray-500 tabular-nums">
                      ${plan.price}<span className="text-gray-400">/{billing}</span>
                    </span>
                  </div>

                  <div className="w-full h-2 bg-gray-100 rounded-full">
                    <div
                      className={`h-2 ${style.bar} rounded-full transition-all duration-500`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>

                  <p className="text-xs text-gray-400 mt-1 truncate">{plan.description}</p>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default GrowthTrendsSubscription;