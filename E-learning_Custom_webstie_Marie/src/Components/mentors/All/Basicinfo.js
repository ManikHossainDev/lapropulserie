'use client';
import React, { useState, useEffect } from 'react';
import { useUpdateMissionMutation } from '@/redux/fetures/Mentors/MentorOnboarding';

const toOptionalNumber = (value) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
};

const Basicinfo = ({ data = {} }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
        fullName: '',
        jobTitle: '',
        company: '',
        experience: '',
        sessionPrice: '',
        shortBio: '',
        calendlyLink: '',
    });
    const [saved, setSaved] = useState({ ...form });

    const [updateProfile, { isLoading: isSaving }] = useUpdateMissionMutation();

    // Sync from server only when not editing — avoids wiping in-progress edits
    // when parent re-renders with a new `data` object reference.
    useEffect(() => {
        if (isEditing) return;
        const newForm = {
            fullName: data.name || '',
            jobTitle: data.currentJobTitle || '',
            company: data.companyName || '',
            experience:
                data.yearsOfExperience === 0 || data.yearsOfExperience
                    ? String(data.yearsOfExperience)
                    : '',
            sessionPrice:
                data.sessionPrice === 0 || data.sessionPrice
                    ? String(data.sessionPrice)
                    : '',
            shortBio: data.bio || '',
            calendlyLink: data.calendlyProfileLink || '',
        };
        setForm(newForm);
        setSaved(newForm);
    }, [
        isEditing,
        data.name,
        data.currentJobTitle,
        data.companyName,
        data.yearsOfExperience,
        data.sessionPrice,
        data.bio,
        data.calendlyProfileLink,
    ]);

    const wordCount = form.shortBio.trim() === '' ? 0 : form.shortBio.trim().split(/\s+/).length;
    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    const handleSave = async () => {
        try {
            // Only send fields edited on this screen (validated by backend zod schema).
            // Do not re-send location/language/availableIn — avoids wiping them with defaults.
            const payload = {
                name: form.fullName.trim(),
                currentJobTitle: form.jobTitle.trim(),
                companyName: form.company.trim(),
                bio: form.shortBio.trim(),
                calendlyProfileLink: form.calendlyLink.trim(),
            };

            const yearsOfExperience = toOptionalNumber(form.experience);
            const sessionPrice = toOptionalNumber(form.sessionPrice);
            if (yearsOfExperience !== undefined) payload.yearsOfExperience = yearsOfExperience;
            if (sessionPrice !== undefined) payload.sessionPrice = sessionPrice;

            await updateProfile(payload).unwrap();

            setSaved({ ...form });
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save profile:', error);
            const apiMessage =
                error?.data?.message ||
                error?.error ||
                'Échec de l’enregistrement du profil. Veuillez réessayer.';
            alert(apiMessage);
        }
    };

    const handleCancel = () => {
        setForm({ ...saved });
        setIsEditing(false);
    };

    const inputClass = (extra = '') =>
        `w-full border rounded-xl px-4 py-3 text-sm transition-all outline-none ${extra} ${isEditing
            ? 'border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400'
            : 'border-gray-200 bg-white text-gray-700 cursor-default'
        }`;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🚀</span>
                        <h1 className="text-xl font-bold text-indigo-800">Infos de base</h1>
                    </div>
                    {isEditing ? (
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="border border-gray-300 text-gray-600 text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-indigo-800 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition disabled:opacity-60"
                            >
                                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="bg-indigo-800 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2 rounded-lg transition"
                        >
                            Modifier
                        </button>
                    )}
                </div>

                {/* Form */}
                <div className="space-y-5">

                    <div>
                        <label className="block text-sm text-gray-600 mb-1.5">Nom complet</label>
                        <input
                            value={form.fullName}
                            onChange={set('fullName')}
                            disabled={!isEditing}
                            className={inputClass()}
                        />
                    </div>

                    <div className="grid lg:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1.5">Poste actuel</label>
                            <input
                                value={form.jobTitle}
                                onChange={set('jobTitle')}
                                disabled={!isEditing}
                                className={inputClass()}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1.5">Entreprise / Organisation</label>
                            <input
                                value={form.company}
                                onChange={set('company')}
                                disabled={!isEditing}
                                className={inputClass()}
                            />
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1.5">Années d’expérience</label>
                            <input
                                value={form.experience}
                                onChange={set('experience')}
                                disabled={!isEditing}
                                type="number"
                                className={inputClass()}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1.5">Prix de la séance</label>
                            <input
                                value={form.sessionPrice}
                                onChange={set('sessionPrice')}
                                disabled={!isEditing}
                                type="number"
                                className={inputClass()}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-sm text-gray-600">Bio courte</label>
                            <span className="text-xs text-gray-400">{wordCount}/2000 mots</span>
                        </div>
                        <textarea
                            value={form.shortBio}
                            onChange={set('shortBio')}
                            disabled={!isEditing}
                            rows={6}
                            className={`${inputClass()} resize-none`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1.5">Lien de profil Calendly</label>
                        <input
                            value={form.calendlyLink}
                            onChange={set('calendlyLink')}
                            disabled={!isEditing}
                            className={inputClass()}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Basicinfo;
