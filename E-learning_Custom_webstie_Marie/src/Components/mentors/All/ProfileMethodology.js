'use client';
import React, { useState, useEffect } from 'react';

const methodologies = [
    { value: 'mindful_reflection', label: 'Mindful Reflection', sub: 'Focusing on self-awareness and inner growth.' },
    { value: 'action_planning', label: 'Action Planning', sub: 'Goal-oriented strategy with clear milestones.' },
    { value: 'basing_thinking', label: 'Basing Thinking', sub: 'Iterative problem-solving and rapid ideation.' },
    { value: 'career_mapping', label: 'Career Mapping', sub: 'Structuring long-term professional trajectories.' },
    { value: 'scenario_method', label: 'Scenario Method', sub: 'Guiding discovery through critical questioning.' },
    { value: 'role_playing', label: 'Role Playing', sub: 'Simulating real-world scenarios for practice.' },
];

const ProfileMethodology = ({ data = {} }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [selected, setSelected] = useState([]);
    const [saved, setSaved] = useState([]);

    useEffect(() => {
        if (data?.coachingMethodologies) {
            setSelected(data.coachingMethodologies);
            setSaved(data.coachingMethodologies);
        }
    }, [data]);

    const toggle = (value) => {
        if (!isEditing) return;
        setSelected((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    };

    const handleSave = () => {
        setSaved([...selected]);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setSelected([...saved]);
        setIsEditing(false);
    };

    return (
        <div className="p-6 bg-gray-100 rounded-lg min-h-screen">
            <div className=" ">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">💎</span>
                        <h1 className="text-lg font-bold text-indigo-800">Methodology</h1>
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

                {/* Cards */}
                <div className=" sm:flex space-y-4 flex-wrap gap-3">
                    {methodologies.map((method) => {
                        const isActive = selected.includes(method.value);
                        return (
                            <div
                                key={method.value}
                                onClick={() => toggle(method.value)}
                                className={`md:w-[175px] border rounded-xl px-4 py-3 transition-all
                                    ${isEditing ? 'cursor-pointer' : 'cursor-default'}
                                    ${isActive
                                        ? 'border-indigo-400 bg-white shadow-sm'
                                        : 'border-gray-200 bg-white'
                                    }`}
                            >
                                <p className="text-xs font-bold text-gray-800 mb-2">{method.label}</p>
                                <div className="flex items-start gap-2">
                                    {/* Checkbox */}
                                    <div className={`w-4 h-4 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-all
                                        ${isActive
                                            ? 'bg-indigo-800 border-indigo-800'
                                            : 'bg-white border-gray-300'
                                        }`}
                                    >
                                        {isActive && (
                                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8 15.414l-4.707-4.707a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 leading-relaxed">{method.sub}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default ProfileMethodology;