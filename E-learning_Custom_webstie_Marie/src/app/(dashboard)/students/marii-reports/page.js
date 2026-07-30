'use client';

import React from 'react';
import Link from 'next/link';
import { useListMariiReportsQuery } from '@/redux/fetures/capsuleJourney/capsuleJourney';

export default function MariiReportsPage() {
  const { data, isLoading } = useListMariiReportsQuery();
  const reports = data?.data || [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#2d2a71] mb-6">Mes rapports Marii</h1>
      {isLoading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : reports.length === 0 ? (
        <p className="text-gray-500">Aucun rapport pour le moment. Terminez une capsule pour générer votre rapport.</p>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const capsule = report.capsuleId;
            const capsuleId = capsule?.id || capsule?._id || report.capsuleId;
            const title = capsule?.title || 'Capsule';
            return (
              <div key={report.id || report._id} className="border rounded-xl p-5 bg-white shadow-sm">
                <h2 className="font-semibold text-lg">{title}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Thème : {report.report?.mainTheme}
                </p>
                <Link
                  href={`/students/individual-capsule/${capsuleId}?step=6`}
                  className="inline-block mt-3 text-sm text-[#2d2a71] font-medium"
                >
                  Voir le rapport →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
