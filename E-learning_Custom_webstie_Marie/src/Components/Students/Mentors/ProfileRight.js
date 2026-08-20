'use client';

import React from 'react';
import MentorProfileRateing from './MentorProfileRateing';
import { mentorOptionFr } from '@/Components/mentors/All/mentorOptionLabels';

const Tag = ({ children }) => (
  <span className="px-3 py-1 text-sm border rounded-full bg-gray-50">
    {children}
  </span>
);

const Section = ({ title, children }) => (
  <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow border mb-6">
    <h2 className="text-xl font-semibold text-primary mb-4">{title}</h2>
    {children}
  </div>
);

const ProfileRight = ({ mentor }) => {


  return (
    <div>

      {/* ABOUT */}
      <Section title="À propos">
        <p className="text-gray-600 mb-4 leading-relaxed">
          {mentor?.bio || "Aucune biographie pour le moment."}
        </p>
      </Section>

      {/* VALUES */}
      <Section title="Valeurs">
        <div className="flex flex-wrap gap-2">
          {mentor?.values?.length > 0 ? (
            mentor.values.map((item, i) => (
              <Tag key={i}>{mentorOptionFr(item)}</Tag>
            ))
          ) : (
            <p className="text-sm text-gray-400">Aucune valeur renseignée</p>
          )}
        </div>
      </Section>

      {/* SPECIALTIES */}
      <Section title="Spécialités">
        <div className="flex flex-wrap gap-2">
          {mentor?.specialties?.length > 0 ? (
            mentor.specialties.map((item, i) => (
              <Tag key={i}>{mentorOptionFr(item)}</Tag>
            ))
          ) : (
            <p className="text-sm text-gray-400">Aucune spécialité renseignée</p>
          )}
        </div>
      </Section>

      {/* METHODOLOGIES */}
      <Section title="Méthodologies">
        <div className="flex flex-wrap gap-2">
          {mentor?.methodologies?.length > 0 ? (
            mentor.methodologies.map((item, i) => (
              <Tag key={i}>{mentorOptionFr(item)}</Tag>
            ))
          ) : (
            <p className="text-sm text-gray-400">Aucune méthodologie renseignée</p>
          )}
        </div>
      </Section>

      {/* RATINGS */}
      <MentorProfileRateing mentor={mentor} />

    </div>
  );
};

export default ProfileRight;