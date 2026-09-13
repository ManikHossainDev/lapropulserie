


'use client';

import { getFullImageUrl, DEFAULT_AVATAR } from '@/utils/imageUrl';
import { useGetStudentMyProfileInfoQuery } from '@/redux/fetures/profile/profile';
import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { IoIosMenu, IoMdNotifications } from 'react-icons/io';

const StudentsHeader = ({ isOpen, setIsOpen }) => {

    const { data: profileInfo } = useGetStudentMyProfileInfoQuery();
    const profile = profileInfo?.data;
    

    const [showNotifications, setShowNotifications] = useState(false);
    const [notifs, setNotifs] = useState([]);
    const notifRef = useRef(null);

    const unreadCount = notifs.filter((n) => !n.read).length;

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllRead = () => {
        setNotifs(notifs.map((n) => ({ ...n, read: true })));
    };

    const markRead = (id) => {
        setNotifs(notifs.map((n) => n.id === id ? { ...n, read: true } : n));
    };

    return (
        <div className="bg-[#dedde8] w-full p-5 flex justify-between lg:justify-end items-center gap-3">

            {/* Mobile menu toggle */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 cursor-pointer text-primary lg:hidden flex items-center justify-center rounded-full"
            >
                <IoIosMenu className="text-5xl" />
            </div>

            <div className="flex items-center gap-3">

                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                    <div
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="w-12 h-12 bg-indigo-900 cursor-pointer text-white flex items-center justify-center rounded-full relative"
                    >
                        <IoMdNotifications className="text-2xl" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </div>

                    {/* Dropdown */}
                    {showNotifications && (
                        <div className="absolute z-50 top-14 right-0 bg-white shadow-xl rounded-2xl w-80 border border-gray-100 overflow-hidden">

                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-sm font-bold text-gray-800">Notifications</h2>
                                    {unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="text-xs text-indigo-700 font-medium hover:underline"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            {/* List */}
                            <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                                {notifs.length === 0 ? (
                                    <div className="px-4 py-8 text-center">
                                        <p className="text-2xl mb-2">🔔</p>
                                        <p className="text-sm text-gray-400">Aucune notification pour le moment</p>
                                    </div>
                                ) : (
                                    notifs.map((notif) => (
                                        <div
                                            key={notif.id}
                                            onClick={() => markRead(notif.id)}
                                            className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50
                                                ${!notif.read ? 'bg-indigo-50/60' : 'bg-white'}`}
                                        >
                                            {/* Dot */}
                                            <div className="mt-1.5 flex-shrink-0">
                                                <span className={`w-2 h-2 rounded-full inline-block ${!notif.read ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-semibold ${!notif.read ? 'text-gray-900' : 'text-gray-500'}`}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                                                <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                                <button className="text-xs text-indigo-700 font-medium hover:underline">
                                    View all notifications
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile */}
                <Link
                    href="/students/my-account"
                    className="bg-white cursor-pointer flex items-center gap-2 p-2 rounded-lg"
                >
                    <img
                        className="w-10 h-10 rounded-full object-cover"
                        src={getFullImageUrl(profile?.profileImage?.imageUrl, DEFAULT_AVATAR)}
                        alt={profile?.name || 'profile'}
                    />
                    <div className="hidden sm:block">
                        <h2 className="font-semibold text-sm text-gray-800">{profile?.name}</h2>
                        {/* <p className="text-gray-500 text-xs">Student</p> */}
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default StudentsHeader;