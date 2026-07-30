'use client';
import React, { useState, useRef, useMemo } from 'react';
import { useGetRevenueDataQuery, useGetRevenueTrendQuery, useGetPayoutHistoryQuery } from '@/redux/api/mentorApi';

const AreaChart = ({ data }) => {
    const [tooltip, setTooltip] = useState(null);
    const svgRef = useRef(null);

    const W = 600, H = 200;
    const padL = 40, padR = 20, padT = 20, padB = 30;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    const chartData = useMemo(() => {
        if (!data || data.length === 0) {
            return [{ period: '', amount: 0 }];
        }
        return data.map(d => ({
            period: d.period,
            amount: d.amount || 0
        }));
    }, [data]);

    const maxVal = Math.max(...chartData.map(d => d.amount));
    const minVal = 0;
    const range = maxVal - minVal || 1;

    const getX = (i) => padL + (i / (chartData.length - 1 || 1)) * chartW;
    const getY = (v) => padT + chartH - ((v - minVal) / range) * chartH;

    const buildPath = () => {
        if (chartData.length < 2) return '';
        let d = `M ${getX(0)} ${getY(chartData[0].amount)}`;
        for (let i = 1; i < chartData.length; i++) {
            const x0 = getX(i - 1), y0 = getY(chartData[i - 1].amount);
            const x1 = getX(i), y1 = getY(chartData[i].amount);
            const cpX = (x0 + x1) / 2;
            d += ` C ${cpX} ${y0}, ${cpX} ${y1}, ${x1} ${y1}`;
        }
        return d;
    };

    const linePath = buildPath();
    const areaPath = linePath
        + ` L ${getX(chartData.length - 1)} ${padT + chartH}`
        + ` L ${getX(0)} ${padT + chartH} Z`;

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({
        value: Math.round(minVal + t * range),
        y: padT + chartH - t * chartH,
    }));

    const handleMouseMove = (e) => {
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const scaleX = W / rect.width;
        const mx = (e.clientX - rect.left) * scaleX - padL;
        const idx = Math.round((mx / chartW) * (chartData.length - 1));
        const clamped = Math.max(0, Math.min(chartData.length - 1, idx));
        setTooltip({ idx: clamped, x: getX(clamped), y: getY(chartData[clamped].amount) });
    };

    const tooltipX = tooltip ? Math.min(tooltip.x - 44, W - padR - 92) : 0;
    const tooltipY = tooltip ? Math.max(tooltip.y - 44, padT) : 0;

    const formatPeriod = (period) => {
        if (!period) return '';
        const parts = period.split('-');
        if (parts.length === 2) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthIdx = parseInt(parts[1]) - 1;
            return months[monthIdx] || period;
        }
        if (parts.length === 3) {
            return parts[2];
        }
        return period;
    };

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setTooltip(null)}
            style={{ overflow: 'visible' }}
        >
            <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4338ca" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#4338ca" stopOpacity="0.03" />
                </linearGradient>
            </defs>

            {yTicks.map((t, i) => (
                <g key={i}>
                    <line x1={padL} y1={t.y} x2={W - padR} y2={t.y} stroke="#f0f0f0" strokeWidth="1" />
                    <text x={padL - 6} y={t.y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
                        {t.value >= 1000 ? `${(t.value / 1000).toFixed(0)}k` : t.value}
                    </text>
                </g>
            ))}

            <path d={areaPath} fill="url(#areaGrad)" />
            <path d={linePath} fill="none" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" />

            {chartData.map((d, i) => (
                <text key={i} x={getX(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">
                    {formatPeriod(d.period)}
                </text>
            ))}

            {tooltip && (
                <g>
                    <line
                        x1={tooltip.x} y1={padT}
                        x2={tooltip.x} y2={padT + chartH}
                        stroke="#4338ca" strokeWidth="1" strokeDasharray="4 3"
                    />
                    <circle cx={tooltip.x} cy={tooltip.y} r="5" fill="white" stroke="#4338ca" strokeWidth="2" />
                    <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                        <rect width="92" height="36" rx="8" fill="#3730a3" />
                        <text x="8" y="14" fontSize="9" fill="white" fontWeight="600">
                            {formatPeriod(chartData[tooltip.idx].period)}
                        </text>
                        <text x="8" y="28" fontSize="9" fill="#c7d2fe">
                            ${chartData[tooltip.idx].amount.toLocaleString()}
                        </text>
                    </g>
                </g>
            )}
        </svg>
    );
};

const Page = () => {
    const [period, setPeriod] = useState('monthly');

    const { data: revenueData, isLoading: revenueLoading } = useGetRevenueDataQuery();
    const { data: trendData, isLoading: trendLoading } = useGetRevenueTrendQuery(period);
    const { data: payoutData, isLoading: payoutLoading } = useGetPayoutHistoryQuery({ page: 1, limit: 10 });

    const revenue = revenueData?.data || revenueData;
    const payouts = payoutData?.data || payoutData || [];
    const trend = trendData?.data || trendData || [];

    const currentMonthName = new Date().toLocaleString('fr-FR', { month: 'long' });

    return (
        <div className="relative py-10">
            <div className="absolute inset-0 bg-[url('/Images/StudentsDash/page_bg.png')] bg-cover bg-no-repeat opacity-60" />

            <div className="p-4 relative space-y-4 bg-gray-100 min-h-screen max-w-6xl mx-auto rounded-lg shadow-md py-5">

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                            <p className="text-sm font-semibold text-gray-600">Gains totaux</p>
                            <span className="text-2xl">💵</span>
                        </div>
                        {revenueLoading ? (
                            <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
                        ) : (
                            <>
                                <p className="text-2xl font-bold text-gray-900 mb-2">
                                    ${(revenue?.lifetimeEarnings || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <span>🗓</span>
                                        <span>{revenue?.timePeriod || '0 mois'} au total</span>
                                    </div>
                            </>
                        )}
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                            <p className="text-sm font-semibold text-gray-600">Ce mois-ci ({currentMonthName})</p>
                            <span className="text-2xl">🚀</span>
                        </div>
                        {revenueLoading ? (
                            <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
                        ) : (
                            <>
                                <p className="text-2xl font-bold text-gray-900 mb-2">
                                    ${(revenue?.thisMonthEarnings || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                                <div className="flex items-center gap-1.5 text-xs font-medium">
                                    <span className={revenue?.monthlyGrowthPercentage >= 0 ? 'text-green-500' : 'text-red-500'}>
                                        {revenue?.monthlyGrowthPercentage >= 0 ? '↗' : '↘'}
                                    </span>
                                    <span className={revenue?.monthlyGrowthPercentage >= 0 ? 'text-green-500' : 'text-red-500'}>
                                        {Math.abs(revenue?.monthlyGrowthPercentage || 0)}% {revenue?.monthlyGrowthPercentage >= 0 ? 'd’augmentation' : 'de baisse'} par rapport au mois dernier
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-800">Évolution des revenus</h2>
                        <div className="flex border border-gray-200 rounded-lg overflow-hidden text-xs">
                            {[
                                { key: 'monthly', label: 'Mensuel' },
                                { key: 'quarterly', label: 'Trimestriel' },
                                { key: 'annually', label: 'Annuel' },
                            ].map((p) => (
                                <button
                                    key={p.key}
                                    onClick={() => setPeriod(p.key)}
                                    className={`px-3 py-1.5 font-medium transition-all ${period === p.key
                                        ? 'bg-indigo-800 text-white'
                                        : 'bg-white text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    {trendLoading ? (
                        <div className="h-52 bg-gray-100 animate-pulse rounded"></div>
                    ) : (
                        <AreaChart key={period} data={trend} />
                    )}
                </div>

                <div className="bg-white border overflow-x-auto border-gray-100 rounded-2xl p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-800 mb-4">Historique des paiements</h2>
                    <div className="rounded-xl min-w-[600px] border border-gray-100">
                        <div className="grid grid-cols-5 bg-indigo-50 px-4 py-2.5 text-xs font-semibold text-indigo-800">
                            <span>N°</span>
                            <span>Mentoré</span>
                            <span>E-mail</span>
                            <span>Montant</span>
                            <span>Statut du paiement</span>
                        </div>
                        {payoutLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="grid grid-cols-5 px-4 py-3 border-t border-gray-50">
                                    <div className="h-4 bg-gray-100 animate-pulse rounded"></div>
                                </div>
                            ))
                        ) : payouts.length > 0 ? (
                            payouts.map((row, i) => (
                                <div
                                    key={i}
                                    className={`grid grid-cols-5 px-4 py-3 text-xs text-gray-600 items-center border-t border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                        }`}
                                >
                                    <span className="text-gray-400">{i + 1}</span>
                                    <span className="font-medium text-gray-700">{row.mentorName || 'N/A'}</span>
                                    <span className="text-gray-400">{row.email || 'N/A'}</span>
                                    <span>${(row.amount || 0).toFixed(2)}</span>
                                    <span>
                                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 border border-green-200 text-xs font-medium px-2.5 py-1.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                            {row.status || 'Completed'}
                                        </span>
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-gray-400 text-sm">
                                No payout history found
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;