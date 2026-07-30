'use client';
import React, { useState, useEffect } from 'react';

const ProfileSpecialtis = ({ data = [] }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [specialties, setSpecialties] = useState([]);
    const [saved, setSaved] = useState([]);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (data) {
            setSpecialties(data);
            setSaved(data);
        }
    }, [data]);

    const handleAdd = () => {
        const trimmed = inputValue.trim();
        if (!trimmed || specialties.includes(trimmed)) return;
        setSpecialties([...specialties, trimmed]);
        setInputValue('');
    };

    const handleDelete = (index) => {
        setSpecialties(specialties.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        setSaved([...specialties]);
        setIsEditing(false);
        setInputValue('');
    };

    const handleCancel = () => {
        setSpecialties([...saved]);
        setIsEditing(false);
        setInputValue('');
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">💡</span>
                        <h1 className="text-lg font-bold text-indigo-800">Specialties</h1>
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

                {/* Add Input — only visible when editing */}
                {isEditing && (
                    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 mb-3 shadow-sm">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            placeholder="Add new Specialty"
                            className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400"
                        />
                        <button
                            onClick={handleAdd}
                            className="w-7 h-7 rounded-lg bg-indigo-800 hover:bg-indigo-700 flex items-center justify-center text-white transition flex-shrink-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Specialty List */}
                <div className="space-y-2">
                    {specialties.map((item, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3.5 shadow-sm"
                        >
                            <span className="text-sm text-gray-700">{item}</span>
                            {isEditing && (
                                <button
                                    onClick={() => handleDelete(i)}
                                    className="w-7 h-7 rounded-lg bg-indigo-800 hover:bg-red-600 flex items-center justify-center text-white transition flex-shrink-0"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}

                    {specialties.length === 0 && (
                        <p className="text-center text-sm text-gray-400 py-6">
                            No specialties added yet. Click Edit to add some.
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ProfileSpecialtis;