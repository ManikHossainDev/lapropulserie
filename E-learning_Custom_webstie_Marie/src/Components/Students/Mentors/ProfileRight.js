'use client';

import React from 'react';
import MentorProfileRateing from './MentorProfileRateing';
import { useReviewMantorMutation } from '@/redux/fetures/Mentors/Mentors';

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
      <Section title="About Me">
        <p className="text-gray-600 mb-4 leading-relaxed">
          {mentor?.bio || "No bio available"}
        </p>

        <p className="font-medium mb-2">I'm passionate about:</p>

        <ul className="list-disc pl-6 text-gray-600 space-y-1">
          <li>Turning career confusion into clear direction</li>
          <li>Helping people build work around their life</li>
          <li>Guiding professionals from burnout to passion</li>
          <li>Making career development empowering</li>
        </ul>
      </Section>

      {/* VALUES */}
      <Section title="Values">
        <div className="flex flex-wrap gap-2">
          {mentor?.values?.length > 0 ? (
            mentor.values.map((item, i) => (
              <Tag key={i}>{item}</Tag>
            ))
          ) : (
            <p className="text-sm text-gray-400">No values found</p>
          )}
        </div>
      </Section>

      {/* SPECIALTIES */}
      <Section title="Specialties">
        <div className="flex flex-wrap gap-2">
          {mentor?.specialties?.length > 0 ? (
            mentor.specialties.map((item, i) => (
              <Tag key={i}>{item}</Tag>
            ))
          ) : (
            <p className="text-sm text-gray-400">No specialties found</p>
          )}
        </div>
      </Section>

      {/* METHODOLOGIES */}
      <Section title="Methodologies">
        <div className="flex flex-wrap gap-2">
          {mentor?.methodologies?.length > 0 ? (
            mentor.methodologies.map((item, i) => (
              <Tag key={i}>{item}</Tag>
            ))
          ) : (
            <p className="text-sm text-gray-400">No methodologies found</p>
          )}
        </div>
      </Section>

      {/* RATINGS */}
      <MentorProfileRateing mentor={mentor} />

    </div>
  );
};

export default ProfileRight;