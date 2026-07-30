'use client';

import React, { useState } from 'react';
import { FaPlay, FaChevronDown, FaLock } from 'react-icons/fa';
import { Modal } from 'antd';
import 'antd/dist/reset.css';

const initialLessons = [
    {
        title: 'Intro to User Research',
        duration: '10:00',
        video: 'https://www.youtube.com/embed/ENGLLB_BKfc',
        unlocked: true,
        completed: false,
    },
    {
        title: 'User Interview Techniques',
        duration: '08:30',
        video: 'https://www.youtube.com/embed/OqryPk36zOc',
        unlocked: false,
        completed: false,
    },
    {
        title: 'Persona Creation',
        duration: '12:00',
        video: 'https://www.youtube.com/embed/gDly1v20qy0',
        unlocked: false,
        completed: false,
    },
    {
        title: 'Journey Mapping',
        duration: '09:45',
        video: 'https://www.youtube.com/embed/hVoCx8_fLE8',
        unlocked: false,
        completed: false,
    },
];

export default function Page() {
    const [openModule, setOpenModule] = useState(true);
    const [lessons, setLessons] = useState(initialLessons);
    const [activeIndex, setActiveIndex] = useState(0);
    const [videoOpen, setVideoOpen] = useState(false);

    const totalLessons = lessons.length;
    const completedLessons = lessons.filter(l => l.completed).length;
    const progress = Math.round((completedLessons / totalLessons) * 100);

    const playLesson = (index) => {
        if (!lessons[index].unlocked) return;
        setActiveIndex(index);
        setVideoOpen(true);
    };

    const completeAndNext = () => {
        const updated = [...lessons];

        // mark current complete
        updated[activeIndex].completed = true;

        // unlock next
        if (activeIndex + 1 < updated.length) {
            updated[activeIndex + 1].unlocked = true;
            setActiveIndex(activeIndex + 1);
        } else {
            setVideoOpen(false);
        }

        setLessons(updated);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-6">
            <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur rounded-2xl shadow-md border p-6">

                {/* Breadcrumb */}
                <p className="text-sm text-gray-500 mb-6">
                    Home / Exploration Journey / Gift Capsule
                </p>

                {/* Course Header */}
                <div className="bg-gray-50 border rounded-xl p-6 mb-8">
                    <h1 className="text-3xl font-semibold text-indigo-900 mb-2">
                        Advanced Product Design Mentorship
                    </h1>

                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                        <span>{progress}% Complete</span>
                        <span>{completedLessons} of {totalLessons} Lessons</span>
                    </div>

                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <h2 className="text-2xl font-semibold text-primary mb-6">Capsule Modules</h2>

                {/* Module */}
                <div className="border rounded-2xl overflow-hidden">

                    {/* Header */}
                    <div
                        onClick={() => setOpenModule(!openModule)}
                        className="flex items-center justify-between p-5 bg-gray-50 cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border flex items-center justify-center text-primary">
                                <FaPlay size={12} />
                            </div>
                            <div>
                                <h3 className="font-semibold">
                                    Module 01: This Strategic Designer
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {progress}% Progress
                                </p>
                            </div>
                        </div>

                        <FaChevronDown className={openModule ? 'rotate-180' : ''} />
                    </div>

                    {openModule && (
                        <div className="p-5 space-y-4">

                            {/* Active Preview */}
                            <div className="border rounded-xl overflow-hidden">
                                <div className="flex justify-between px-4 py-3 text-sm text-gray-600">
                                    <span>{lessons[activeIndex].title}</span>
                                    <span>{lessons[activeIndex].duration}</span>
                                </div>

                                <div
                                    onClick={() => playLesson(activeIndex)}
                                    className="relative h-60 bg-gray-200 cursor-pointer"
                                >
                                    <img
                                        src="https://t3.ftcdn.net/jpg/11/02/73/30/360_F_1102733023_gxNqjAZ7rsCLu4aU6rNJZKg3kcUPibHo.jpg"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center">
                                            <FaPlay />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lesson List */}
                            {lessons.map((lesson, index) => (
                                <div
                                    key={index}
                                    onClick={() => playLesson(index)}
                                    className={`flex items-center justify-between border rounded-lg px-4 py-3 ${lesson.unlocked ? 'cursor-pointer' : 'opacity-60'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {lesson.unlocked ? (
                                            <FaPlay className="text-primary" size={12} />
                                        ) : (
                                            <FaLock className="text-gray-400" size={12} />
                                        )}
                                        <span>{lesson.title}</span>

                                        {lesson.completed && (
                                            <span className="text-green-500 text-xs ml-2">
                                                ✓ completed
                                            </span>
                                        )}
                                    </div>

                                    <span className="text-sm text-gray-500">
                                        {lesson.duration}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Video Modal */}
            <Modal
                open={videoOpen}
                footer={null}
                onCancel={() => setVideoOpen(false)}
                width={900}
                centered
                destroyOnClose
            >
                <div className="space-y-4">
                    <div className="relative w-full h-0 pb-[56.25%]">
                        <iframe
                            src={lessons[activeIndex].video}
                            className="absolute top-0 left-0 w-full h-full"
                            allowFullScreen
                        />
                    </div>

                    <button
                        onClick={completeAndNext}
                        className="w-full bg-primary text-white py-3 rounded-lg font-medium"
                    >
                        {activeIndex === lessons.length - 1
                            ? 'Finish Course'
                            : 'Mark Complete & Next Lesson'}
                    </button>
                </div>
            </Modal>
        </div>
    );
}