'use client';
import React, { useState, useEffect } from 'react';
import { useUpdateProfileWithAvatarMutation, useUpdateMethodsMutation } from '@/redux/fetures/Mentors/MentorOnboarding';

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

    const [updateProfileWithAvatar] = useUpdateProfileWithAvatarMutation();
    const [updateMethods] = useUpdateMethodsMutation();

    useEffect(() => {
        if (data) {
            const newForm = {
                fullName: data.name || '',
                jobTitle: data.currentJobTitle || '',
                company: data.companyName || '',
                experience: data.yearsOfExperience || '',
                sessionPrice: data.sessionPrice || '',
                shortBio: data.bio || '',
                calendlyLink: data.calendlyProfileLink || '',
            };
            setForm(newForm);
            setSaved(newForm);
        }
    }, [data]);

    const wordCount = form.shortBio.trim() === '' ? 0 : form.shortBio.trim().split(/\s+/).length;
    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    const handleSave = async () => {
        try {
            const basicInfoPayload = {
                name: form.fullName,
                currentJobTitle: form.jobTitle,
                companyName: form.company,
                yearsOfExperience: Number(form.experience),
                sessionPrice: Number(form.sessionPrice),
                bio: form.shortBio,
                language: data.language || ['English'],
                availableIn: data.availableIn || 'both',
                location: data.location || '',
            };

            await updateProfileWithAvatar({ data: basicInfoPayload, avatarUrl: data.avatarUrl }).unwrap();

            const methodsPayload = {
                coachingMethodologies: data.coachingMethodologies || [],
                calendlyProfileLink: form.calendlyLink,
            };
            await updateMethods(methodsPayload).unwrap();

            setSaved({ ...form });
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save profile:', error);
            alert('Failed to save profile. Please try again.');
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
                        <h1 className="text-xl font-bold text-indigo-800">Basic Info</h1>
                    </div>
                    {isEditing ? (
                        <div className="flex gap-2">
                            <button
                                onClick={handleCancel}
                                className="border border-gray-300 text-gray-600 text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-100 transition"
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

                {/* Form */}
                <div className="space-y-5">

                    {/* Full Name */}
                    <div>
                        <label className="block text-sm text-gray-600 mb-1.5">Full Name</label>
                        <input
                            value={form.fullName}
                            onChange={set('fullName')}
                            disabled={!isEditing}
                            className={inputClass()}
                        />
                    </div>

                    {/* Job Title + Company */}
                    <div className="grid lg:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1.5">Current Job Title</label>
                            <input
                                value={form.jobTitle}
                                onChange={set('jobTitle')}
                                disabled={!isEditing}
                                className={inputClass()}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1.5">Company / Organization</label>
                            <input
                                value={form.company}
                                onChange={set('company')}
                                disabled={!isEditing}
                                className={inputClass()}
                            />
                        </div>
                    </div>

                    {/* Experience + Session Price */}
                    <div className="grid lg:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1.5">Years Of Experience</label>
                            <input
                                value={form.experience}
                                onChange={set('experience')}
                                disabled={!isEditing}
                                type="number"
                                className={inputClass()}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1.5">Session Price</label>
                            <input
                                value={form.sessionPrice}
                                onChange={set('sessionPrice')}
                                disabled={!isEditing}
                                type="number"
                                className={inputClass()}
                            />
                        </div>
                    </div>

                    {/* Short Bio */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-sm text-gray-600">Short Bio</label>
                            <span className="text-xs text-gray-400">{wordCount}/2000 Words</span>
                        </div>
                        <textarea
                            value={form.shortBio}
                            onChange={set('shortBio')}
                            disabled={!isEditing}
                            rows={6}
                            className={`${inputClass()} resize-none`}
                        />
                    </div>

                    {/* Calendly Link */}
                    <div>
                        <label className="block text-sm text-gray-600 mb-1.5">Calendly Profile Link</label>
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