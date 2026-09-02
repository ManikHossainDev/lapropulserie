import { mentorOptionFr, mentorOptionsFrJoin } from '@/Components/mentors/All/mentorOptionLabels';
import Link from 'next/link';
import React from 'react';
import { CiLocationOn } from 'react-icons/ci';
import { GrLanguage } from 'react-icons/gr';
import { HiLanguage } from 'react-icons/hi2';
import { openMentorFreeIntro } from '@/Components/Students/Mentors/bookMentorSession';
import { toast } from 'react-toastify';

const RecommendedMentorsCard = ({ mentor }) => {
  const handleBooking = () => {
    try {
      openMentorFreeIntro(mentor?.calendlyProfileLink);
    } catch (error) {
      toast.error(
        error?.message ||
          'Impossible de réserver ce mentor. Réessaie plus tard.',
      );
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-4">
        <img
          src={mentor.avatarUrl || '/Images/default-avatar.png'}
          alt={mentor.name}
          className="w-20 h-20 rounded-lg object-cover"
          onError={(e) => {
            e.currentTarget.src = '/Images/default-avatar.png';
          }}
        />

        <div className="flex-1">
          <h2 className="text-xl font-semibold">{mentor.name}</h2>

          <div className="text-yellow-400 text-sm">
            {'★'.repeat(Math.round(mentor.avgRating || 0))}
            <span className="text-gray-400 ml-1">
              /5 ({mentor.avgRating})
            </span>
          </div>

          <div className="text-gray-500 text-sm flex flex-wrap gap-3 mt-1">
            <span className="flex items-center gap-1">
              <CiLocationOn />
              {mentor.location}
            </span>

            <span className="flex items-center gap-1">
              <HiLanguage />
              {mentorOptionsFrJoin(mentor.language, ', ')}
            </span>

            <span className="flex items-center gap-1">
              <GrLanguage />
              {mentorOptionFr(mentor.availableIn)}
            </span>
          </div>
        </div>

        <div className="text-sm font-semibold text-primary text-right">
          Découverte
          <br />
          offerte
        </div>
      </div>

      <p className="text-gray-600 text-sm">{mentor.bio}</p>

      <div className="flex flex-wrap gap-2 text-sm">
        <span className="bg-gray-100 px-3 py-1 rounded">
          {mentorOptionsFrJoin(mentor.focusArea)}
        </span>
        <span className="bg-gray-100 px-3 py-1 rounded">
          {mentorOptionsFrJoin(mentor.coreValues)}
        </span>
        <span className="bg-gray-100 px-3 py-1 rounded">
          {mentorOptionsFrJoin(mentor.specialties)}
        </span>
      </div>

      <div className="flex gap-3 pt-2">
        <Link
          href={`/students/mentors/${mentor?.mentorId}`}
          className="flex-1 flex items-center justify-center border rounded-lg py-3"
        >
          Voir le profil
        </Link>

        <button
          type="button"
          onClick={handleBooking}
          className="flex-1 bg-primary text-white rounded-lg py-3"
        >
          Réserver une découverte offerte
        </button>
      </div>
    </div>
  );
};

export default RecommendedMentorsCard;
