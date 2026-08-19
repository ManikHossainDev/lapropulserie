'use client';
import React, { useState, useEffect } from 'react';

const careerStages = [
    { value: 'students', label: 'Étudiants & stagiaires', sub: 'En début de parcours' },
    { value: 'early_career', label: 'Début de carrière', sub: '0-3 ans d’expérience' },
    { value: 'mid_level', label: 'Niveau intermédiaire', sub: '3-7 ans d’expérience' },
    { value: 'senior', label: 'Leadership senior', sub: 'Manager, Director, VP' },
    { value: 'executives', label: 'Dirigeants', sub: 'C-suite, fondateurs' },
    { value: 'career_pivoters', label: 'En reconversion', sub: 'Changement de secteur' },
];

const ProfileMentor = ({ data = [] }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [selected, setSelected] = useState([]);
    const [saved, setSaved] = useState([]);

    useEffect(() => {
        if (data) {
            setSelected(data);
            setSaved(data);
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
            <div className="">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🛸</span>
                        <h1 className="text-lg font-bold text-indigo-800">Accompagne</h1>
                    </div>
                    {isEditing ? (
                        <div className="flex gap-2">
                            <button
                                onClick={handleCancel}
                                className="border border-gray-300 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-indigo-800 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition"
                            >
                                Enregistrer
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-indigo-800 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2 rounded-lg transition"
                        >
                            Modifier
                        </button>
                    )}
                </div>

                {/* Cards Grid */}
                <div className="flex flex-wrap gap-3">
                    {careerStages.map((stage) => {
                        const isSelected = selected.includes(stage.value);
                        return (
                            <div
                                key={stage.value}
                                onClick={() => toggle(stage.value)}
                                className={`flex items-start gap-3 border rounded-xl px-4 py-3 w-[175px] transition-all
                                    ${isEditing ? 'cursor-pointer' : 'cursor-default'}
                                    ${isSelected
                                        ? 'border-indigo-400 bg-white shadow-sm'
                                        : 'border-gray-200 bg-white'
                                    }`}
                            >
                                {/* Checkbox */}
                                <div className={`w-4 h-4 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-all
                                    ${isSelected
                                        ? 'bg-indigo-800 border-indigo-800'
                                        : 'bg-white border-gray-300'
                                    }`}
                                >
                                    {isSelected && (
                                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8 15.414l-4.707-4.707a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>

                                {/* Text */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-800 leading-tight">{stage.label}</p>
                                    <p className="text-xs text-gray-400 mt-0.5 leading-tight">{stage.sub}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default ProfileMentor;