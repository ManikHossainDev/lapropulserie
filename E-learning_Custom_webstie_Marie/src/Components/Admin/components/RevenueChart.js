'use client';

import { useMemo } from 'react';

export default function RevenueChart({ data, series, height = 260 }) {
  const { paths, dots, ticks, max, min } = useMemo(() => {
    const w = 800;
    const h = height - 40;
    const padX = 40;
    const padY = 20;
    const innerW = w - padX * 2;
    const innerH = h - padY * 2;

    const allValues = data.flatMap((p) =>
      series.map((s) => p.values?.[s.key] ?? 0)
    );
    const max = Math.max(...allValues, 1);
    const min = 0;

    const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;
    const yFor = (v) => padY + innerH - ((v - min) / (max - min)) * innerH;
    const xFor = (i) => padX + i * stepX;

    const paths = series.map((s) => {
      const points = data.map((p, i) => {
        const x = xFor(i);
        const y = yFor(p.values?.[s.key] ?? 0);
        return { x, y };
      });
      const lineD = points
        .map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x},${pt.y}`)
        .join(' ');
      const areaD =
        s.fill && points.length
          ? `${lineD} L${points[points.length - 1].x},${padY + innerH} L${points[0].x},${padY + innerH} Z`
          : null;
      return { ...s, points, lineD, areaD };
    });

    const dots = paths.flatMap((p) =>
      p.points.map((pt) => ({ ...pt, color: p.color }))
    );

    const ticks = data.map((p, i) => ({ x: xFor(i), label: p.label }));

    return { paths, dots, ticks, max, min };
  }, [data, series, height]);

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 800 ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
      >
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={40}
            x2={760}
            y1={20 + (height - 60) * t}
            y2={20 + (height - 60) * t}
            stroke="#F3F4F6"
            strokeWidth={1}
          />
        ))}
        {paths.map(
          (p) =>
            p.areaD && (
              <path
                key={`area-${p.key}`}
                d={p.areaD}
                fill={p.color}
                opacity={p.fillOpacity ?? 0.18}
              />
            )
        )}
        {paths.map((p) => (
          <path
            key={`line-${p.key}`}
            d={p.lineD}
            fill="none"
            stroke={p.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={3.5} fill={d.color} />
        ))}
        {ticks.map((t, i) => (
          <text
            key={i}
            x={t.x}
            y={height - 8}
            textAnchor="middle"
            fontSize={11}
            fill="#9CA3AF"
          >
            {t.label}
          </text>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-6">
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-2 text-xs">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-gray-600">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}