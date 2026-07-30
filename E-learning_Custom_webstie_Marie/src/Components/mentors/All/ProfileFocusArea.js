'use client';
import React, { useState, useEffect } from 'react';

const ProfileFocusArea = ({ data = [] }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [areas, setAreas] = useState([]);
    const [saved, setSaved] = useState([]);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (data) {
            setAreas(data);
            setSaved(data);
        }
    }, [data]);

    const handleAdd = () => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;
        setAreas([...areas, trimmed]);
        setInputValue('');
    };

    const handleRemove = (index) => {
        setAreas(areas.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        setSaved([...areas]);
        setIsEditing(false);
        setInputValue('');
    };

    const handleCancel = () => {
        setAreas([...saved]);
        setIsEditing(false);
        setInputValue('');
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🚀</span>
                        <h1 className="text-lg font-bold text-indigo-800">Focus Area</h1>
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

                {/* Add Input */}
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3 mb-5 shadow-sm">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && isEditing && handleAdd()}
                        placeholder="Add new Specialty"
                        disabled={!isEditing}
                        className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400 disabled:cursor-default"
                    />
                    <button
                        onClick={handleAdd}
                        disabled={!isEditing}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition flex-shrink-0
                            ${isEditing
                                ? 'border-gray-400 text-gray-500 hover:border-indigo-600 hover:text-indigo-600 cursor-pointer'
                                : 'border-gray-200 text-gray-300 cursor-not-allowed'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>

                {/* Chips */}
                <div className="flex flex-wrap gap-2">
                    {areas.map((item, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-2 border border-gray-300 bg-white rounded-full px-4 py-3 shadow-sm"
                        >
                            <span className="text-sm text-gray-700 font-medium">{item}</span>
                            <button
                                onClick={() => handleRemove(i)}
                                disabled={!isEditing}
                                className={`w-5 h-5 rounded-full flex items-center justify-center transition flex-shrink-0
                                    ${isEditing
                                        ? 'bg-indigo-800 hover:bg-red-500 text-white cursor-pointer'
                                        : 'bg-gray-300 text-white cursor-not-allowed '
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                                </svg>
                            </button>
                        </div>
                    ))}

                    {areas.length === 0 && (
                        <p className="text-sm text-gray-400 py-2">
                            No focus areas added yet. Click Edit to add some.
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ProfileFocusArea;