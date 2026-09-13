'use client';
import { getFullImageUrl } from '@/utils/imageUrl';
import {
    useGetStudentMyProfileInfoQuery,
    useUpdateStudentProfileMutation
} from '@/redux/fetures/profile/profile';
import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const ProfileTab = () => {

    const { data: profileInfo, refetch } = useGetStudentMyProfileInfoQuery();
    const profile = profileInfo?.data;

    const [updateStudentProfile, { isLoading }] = useUpdateStudentProfileMutation();

    const fileInputRef = useRef();
    const [preview, setPreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const [form, setForm] = useState({
        fullName: '',
        email: '',
    });

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (profile) {
            setForm({
                fullName: profile?.name || '',
                email: profile?.email || '',
            });
        }
    }, [profile]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            setImageFile(file);
            if (!isEditing) setIsEditing(true);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            const formData = new FormData();
            // Backend expects JSON in `data` + optional profileImage file
            formData.append(
                'data',
                JSON.stringify({
                    name: form.fullName.trim(),
                    email: form.email.trim(),
                }),
            );

            if (imageFile) {
                formData.append('profileImage', imageFile);
            }

            await updateStudentProfile(formData).unwrap();

            toast.success('Profil enregistré.');
            setIsEditing(false);
            setPreview(null);
            setImageFile(null);
            refetch();
        } catch (error) {
            console.error('Update failed:', error);
            toast.error(
                error?.data?.message ||
                    "Échec de l'enregistrement du profil. Réessaie.",
            );
        }
    };

    return (
        <div className="bg-gray-50 rounded-2xl p-6 space-y-6">

            <div className="flex items-center gap-5">
                <div className="relative w-20 h-20">

                    {preview ? (
                        <img src={preview} alt="" className="w-20 h-20 rounded-full object-cover" />
                    ) : profile?.profileImage?.imageUrl ? (
                        <img
                            src={getFullImageUrl(profile.profileImage.imageUrl)}
                            alt=""
                            className="w-20 h-20 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                            {profile?.name?.charAt(0) || 'U'}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-md"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                    />
                </div>

                <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                        Photo de profil
                    </p>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="bg-indigo-900 text-white text-sm px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        Changer l&apos;image
                    </button>
                </div>
            </div>

            <div className="space-y-4">

                <div>
                    <label className="text-sm text-gray-600 mb-1 block">Nom complet</label>
                    <input
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-50"
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-600 mb-1 block">Adresse e-mail</label>
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-50"
                    />
                </div>

            </div>

            <button
                type="button"
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                disabled={isLoading}
                className="w-full py-4 rounded-xl text-white text-sm font-medium customSignUpButton hover:opacity-90 transition disabled:opacity-60"
            >
                {isLoading
                    ? 'Enregistrement...'
                    : isEditing
                        ? 'Enregistrer'
                        : 'Modifier'}
            </button>

        </div>
    );
};

export default ProfileTab;
