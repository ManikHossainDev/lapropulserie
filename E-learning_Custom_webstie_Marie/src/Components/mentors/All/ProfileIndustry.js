'use client';
import React, { useState, useEffect } from 'react';

const industries = [
    'Technology',
    'Creative & Design',
    'Finance & Fintech',
    'Marketing & Sales',
    'Education',
    'Healthcare',
    'E-Commerce',
];

const ProfileIndustry = ({ data = [] }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [selected, setSelected] = useState('');
    const [saved, setSaved] = useState('');

    useEffect(() => {
        if (data && data.length > 0) {
            setSelected(data[0]);
            setSaved(data[0]);
        }
    }, [data]);

    const handleSave = () => {
        setSaved(selected);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setSelected(saved);
        setIsEditing(false);
    };

    return (
        <div className="p-6 bg-gray-100 rounded-lg min-h-screen">
            <div className="">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🌐</span>
                        <h1 className="text-lg font-bold text-indigo-800">Industry</h1>
                    </div>
                    {isEditing ? (
                        <div className="flex gap-2">
                            <button
                                onClick={handleCancel}
                                className="border border-gray-300 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-indigo-800 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition"
                            >
                                Save
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-indigo-800 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2 rounded-lg transition"
                        >
                            Edit
                        </button>
                    )}
                </div>

                {/* Radio Chips */}
                <div className="flex flex-wrap gap-2">
                    {industries.map((industry) => {
                        const isActive = selected === industry;
                        return (
                            <button
                                key={industry}
                                onClick={() => isEditing && setSelected(industry)}
                                className={`flex items-center gap-2 border rounded-full px-4 py-2 text-sm font-medium transition-all
                                    ${isEditing ? 'cursor-pointer' : 'cursor-default'}
                                    ${isActive
                                        ? 'border-indigo-300 bg-white shadow-sm text-gray-800'
                                        : 'border-gray-200 bg-white text-gray-600'
                                    }`}
                            >
                                {/* Radio dot */}
                                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                                    ${isActive
                                        ? 'border-indigo-800 bg-indigo-800'
                                        : 'border-gray-300 bg-white'
                                    }`}
                                >
                                    {isActive && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                                    )}
                                </span>
                                {industry}
                            </button>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default ProfileIndustry;