'use client';

import url from '@/redux/api/baseUrl';
import { useGetCompletedJourneysQuery, useGetMyMentorsQuery, useGetStudentMyProfileInfoQuery, useGetStudentProfileProgressQuery } from '@/redux/fetures/profile/profile';
import DownloadCertificate from '@/Components/others/DownloadCertificate';
import React from 'react';

// --- Circular Progress Component ---
const CircularProgress = ({ percentage, sublabel, size = 120, stroke = 10 }) => {

    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    {/* Background ring */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth={stroke}
                    />
                    {/* Progress ring */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#312e81"
                        strokeWidth={stroke}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-bold text-gray-800 leading-tight">
                        {percentage}%
                    </span>
                    <span className="text-xs text-gray-500 leading-tight">
                        {sublabel}
                    </span>
                </div>
            </div>
        </div>
    );
};

// --- Mentor Card (UNCHANGED) ---
const MentorCard = ({ name, role, imgSrc }) => (
    <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
            <img
                src={imgSrc || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=c7d2fe&color=312e81&size=40`}
                alt={name}
                className="w-10 h-10 rounded-full object-cover"
            />
            <div>
                <p className="text-sm font-semibold text-gray-800">{name}</p>
                <p className="text-xs text-gray-400">{role}</p>
            </div>
        </div>
        <button className="w-9 h-9 rounded-lg bg-indigo-900 flex items-center justify-center text-white hover:bg-indigo-700 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </button>
    </div>
);

// --- Course Row (UNCHANGED) ---
const CourseRow = ({ title, date, imgSrc, completedDate }) => (
    <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-3 lg:px-5 py-2 lg:py-4 shadow-sm gap-3">
        <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-indigo-100">
                <img
                    src={imgSrc || `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=e0e7ff&color=312e81&size=48`}
                    alt={title}
                    className="w-full h-full object-contain object-center"
                />
            </div>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{title}</p>
                <p className="text-xs text-gray-400 mt-0.5">Terminé le {date}</p>
            </div>
        </div>
        <DownloadCertificate
            programTitle={title}
            completedDate={completedDate}
            fileName="certificat-parcours-exploration.pdf"
            buttonClassName="flex items-center gap-2 border border-indigo-300 text-indigo-800 text-xs font-medium px-4 py-2 rounded-lg hover:bg-indigo-50 transition shrink-0"
        />
    </div>
);

// --- Main Page ---
const Page = () => {

    const { data, isLoading } = useGetStudentProfileProgressQuery();
    const progress = data?.data;
    const { data: MyMentors } = useGetMyMentorsQuery();
    const mentorsData = Array.isArray(MyMentors?.data)
        ? MyMentors.data
        : MyMentors?.data?.results || MyMentors?.data?.mentors || [];

    const { data: profileInfo } = useGetStudentMyProfileInfoQuery();
    const profile = profileInfo?.data;
    const { data: completedRes } = useGetCompletedJourneysQuery();
    const completedJourneys = Array.isArray(completedRes?.data)
        ? completedRes.data
        : completedRes?.data?.results || [];

    if (isLoading) {
        return <p className="text-center py-5">Chargement...</p>;
    }

    const overallProgress = progress?.overallJourneyProgress || 0;
    const isJourneyComplete = overallProgress >= 100;

    const formatDate = (value) => {
        if (!value) return '';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return value;
        return d.toLocaleDateString('fr-FR');
    };

    const courses = completedJourneys.map((journey) => ({
        title: journey.title,
        date: formatDate(journey.completedDate || journey.date),
        completedDate: journey.completedDate || journey.date,
        imgSrc: journey.thumbnail,
    }));

    return (
        <div
            className="p-6"
            style={{
                background: 'linear-gradient(135deg, #ddd6fe 0%, #c7d2fe 40%, #e0e7ff 70%, #f5d0fe 100%)',
            }}
        >
            <div className="max-w-7xl mx-auto space-y-5">

                {/* Profile Header */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-5 flex items-center gap-5 shadow-sm">
                    <img
                        src={url + (profile?.profileImage?.imageUrl)}
                        alt="Maire Wagner"
                        className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-100"
                    />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{profile?.name || 'Demo User'}</h1>
                        <p className="text-sm text-gray-400 mt-0.5">{profile?.email || 'demo@example.com'}</p>
                    </div>
                </div>

                {/* Middle Section */}
                <div className="grid md:grid-cols-3 xl:grid-cols-5 gap-5">

                    {/* Learning Progress */}
                    <div className="lg:col-span-3 bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">📊</span>
                                <h2 className="font-semibold text-gray-800">Progression</h2>
                            </div>
                            <span className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium ${
                                isJourneyComplete
                                    ? 'text-green-700 bg-green-50 border border-green-200'
                                    : 'text-indigo-700 bg-indigo-50 border border-indigo-200'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                                    isJourneyComplete ? 'bg-green-500' : 'bg-indigo-500'
                                }`}></span>
                                {isJourneyComplete ? 'Terminé' : 'En cours'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">

                            {/* Current Capsule */}
                            <div className="border border-gray-100 rounded-xl p-5 flex flex-col items-center gap-3">
                                <p className="text-xs text-gray-500 font-medium">
                                    Progression de la capsule en cours
                                </p>

                                <CircularProgress
                                    percentage={progress?.currentCapsuleProgress || 0}
                                    sublabel={progress?.currentCapsuleName || "Aucune capsule"}
                                    size={130}
                                    stroke={11}
                                />
                            </div>

                            {/* Overall */}
                            <div className="border border-gray-100 rounded-xl p-5 flex flex-col items-center gap-3">
                                <p className="text-xs text-gray-500 font-medium">
                                    Progression globale du parcours
                                </p>

                                <CircularProgress
                                    percentage={progress?.overallJourneyProgress || 0}
                                    sublabel="Progression des capsules"
                                    size={130}
                                    stroke={11}
                                />
                            </div>

                        </div>
                    </div>

                    {/* Mentors */}
                    <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-5">
                            <span className="text-lg">🧑‍🏫</span>
                            <h2 className="font-semibold text-gray-800">Mes mentors</h2>
                        </div>

                        <div className="space-y-3">
                            {mentorsData?.map((mentor, i) => {
                                const avatar = mentor.avatarUrl || mentor.imgSrc || '';
                                const imgSrc = avatar.startsWith('http')
                                    ? avatar
                                    : avatar
                                        ? url + avatar
                                        : undefined;
                                return (
                                    <MentorCard
                                        key={mentor.mentorId || i}
                                        name={mentor.name}
                                        role={mentor.role || mentor.designation || mentor.currentJobTitle || 'Mentor'}
                                        imgSrc={imgSrc}
                                    />
                                );
                            })}
                            {
                                mentorsData.length === 0 && (
                                    <p className="text-center text-gray-500 py-5">Aucun mentor pour le moment.</p>
                                )
                            }
                        </div>
                    </div>
                </div>

                {/* Courses */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                        <span className="w-6 h-6 rounded-full bg-indigo-900 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8 15.414l-4.707-4.707a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </span>
                        <h2 className="font-semibold text-gray-800">Certificats</h2>
                    </div>

                    <div className="space-y-3">
                        {courses.length === 0 ? (
                            <p className="text-center text-gray-500 py-6">
                                Aucun certificat pour le moment. Terminez le Parcours Exploration pour le télécharger ici.
                            </p>
                        ) : (
                            courses.map((course, i) => (
                                <CourseRow key={i} title={course.title} date={course.date} imgSrc={course.imgSrc} completedDate={course.completedDate} />
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Page;