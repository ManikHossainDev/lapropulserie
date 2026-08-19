'use client'
import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSignUpMutation } from '@/redux/fetures/auth/signUp';
import { toast } from 'react-toastify';

const COPY = {
    student: {
        title: 'Commencer votre parcours',
        subtitle:
            'Créez votre compte pour accéder au bilan gratuit, aux capsules et au Parcours Exploration.',
    },
    mentor: {
        title: 'Devenir mentor La Propulserie',
        subtitle:
            'Créez votre compte mentor pour compléter votre profil et demander la validation par notre équipe.',
    },
};

const SignupForm = () => {
    const searchParams = useSearchParams();
    const roleFromUrl = searchParams.get('role');
    const defaultRole = roleFromUrl === 'student' || roleFromUrl === 'mentor' ? roleFromUrl : '';
    const isMentorSignup = defaultRole === 'mentor';
    const headline = isMentorSignup ? COPY.mentor : COPY.student;

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [signUp, { isLoading }] = useSignUpMutation();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        const formData = new FormData(e.target);
        const name = formData.get('name')?.trim();
        const email = formData.get('email')?.trim();
        const role = formData.get('role');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const acceptTOC = formData.get('acceptTOC') === 'on';

        if (!name || !email || !role || !password || !confirmPassword) {
            setErrorMsg('Veuillez renseigner tous les champs obligatoires.');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg('Les mots de passe ne correspondent pas.');
            return;
        }

        if (password.length < 8) {
            setErrorMsg('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }

        if (!acceptTOC) {
            setErrorMsg('Veuillez accepter les conditions générales d’utilisation.');
            return;
        }

        const data = {
            name,
            email,
            password,
            role,
            acceptTOC,
        };

        try {
            const response = await signUp(data).unwrap();

            if (response?.code === 201) {
                toast.success(response?.message || 'Account created successfully.');

                sessionStorage.setItem('verificationToken', response?.data?.verificationToken || '');
                sessionStorage.setItem('verifyType', 'email');

                router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
            } else {
                toast.error(response?.message || 'Sign up failed. Please try again.');
            }
        } catch (error) {
            const message = error?.data?.message || 'Sign up failed. Please try again.';
            toast.error(message);
            setErrorMsg(message);
        }
    };

    return (
        <div className='h-screen bg-[url("/Images/Auth/page_bg.png")] bg-cover bg-center flex items-center justify-center min-h-screen px-10'>

            <form onSubmit={handleSubmit} className='w-full py-20 bg-slate-100/90 rounded-lg p-10 max-w-xl'>
                <div>
                    <h2 className='text-3xl text-center text-[#3b398d] font-semibold'>{headline.title}</h2>
                    <p className='text-center mt-5'>{headline.subtitle}</p>

                    {errorMsg && (
                        <div className='mt-4 p-2 bg-red-100 border border-red-400 text-red-600 text-sm rounded-md text-center'>
                            {errorMsg}
                        </div>
                    )}

                    <div className='mt-5'>
                        <label className='font-semibold' htmlFor="name">Nom et prénom</label>
                        <input
                            placeholder='Entrez votre nom et prénom'
                            className='mt-2 w-full p-2 border border-[#3b398d] rounded-md focus:outline-0 ring-0 bg-white'
                            type="text"
                            name="name"
                            id="name"
                            required
                        />
                    </div>

                    <div className='mt-5'>
                        <label className='font-semibold' htmlFor="email">Email</label>
                        <input
                            placeholder='Entrez votre email'
                            className='mt-2 w-full p-2 border border-[#3b398d] rounded-md focus:outline-0 ring-0 bg-white'
                            type="email"
                            name="email"
                            id="email"
                            required
                        />
                    </div>

                    <div className='mt-5'>
                        <label className='font-semibold' htmlFor="role">Sélectionnez votre profil</label>
                        <select
                            className='mt-2 w-full p-2 border border-[#3b398d] rounded-md focus:outline-0 ring-0 bg-white'
                            name="role"
                            id="role"
                            defaultValue={defaultRole}
                            required
                        >
                            <option value="" disabled>Choisissez votre profil</option>
                            {/* value stays "student" for the API; label is Particulier per client */}
                            <option value="student">Particulier</option>
                            <option value="mentor">Mentor</option>
                        </select>
                    </div>

                    <div className='mt-5'>
                        <label className='font-semibold' htmlFor="password">Mot de passe</label>
                        <div className='relative'>
                            <input
                                placeholder='Entrez votre mot de passe'
                                className='mt-2 w-full p-2 border border-[#3b398d] rounded-md focus:outline-0 ring-0 bg-white'
                                type={showPassword ? "text" : "password"}
                                name="password"
                                id="password"
                                minLength={8}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(p => !p)}
                                className='absolute cursor-pointer right-3 top-[30px] transform -translate-y-1/2 text-gray-500'
                            >
                                {!showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <div className='mt-5'>
                        <label className='font-semibold' htmlFor="confirmPassword">Confirmez votre mot de passe</label>
                        <div className='relative'>
                            <input
                                placeholder='Confirmez votre mot de passe'
                                className='mt-2 w-full p-2 border border-[#3b398d] rounded-md focus:outline-0 ring-0 bg-white'
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                id="confirmPassword"
                                minLength={8}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(p => !p)}
                                className='absolute cursor-pointer right-3 top-[30px] transform -translate-y-1/2 text-gray-500'
                            >
                                {!showConfirmPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <div className='flex justify-between items-center my-5'>
                        <label htmlFor="acceptTOC">
                            <input type="checkbox" name="acceptTOC" id="acceptTOC" />
                            <span className='ml-2 text-gray-600'>J’accepte les conditions générales d’utilisation.</span>
                        </label>
                    </div>

                    <div className='mt-5'>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className='cursor-pointer w-full p-2 bg-[#3b398d] font-semibold text-white rounded-md disabled:opacity-60 disabled:cursor-not-allowed'
                        >
                            {isLoading ? 'Création du compte...' : 'Créer mon compte'}
                        </button>
                    </div>
                    <p className='text-center mt-5 text-gray-600'>Vous avez déjà un compte ? <Link className='text-blue-600' href="/login">Connexion</Link></p>
                </div>
            </form>

        </div>
    );
};

const Page = () => (
    <Suspense
        fallback={
            <div className="flex items-center justify-center min-h-screen text-gray-600">
                Chargement...
            </div>
        }
    >
        <SignupForm />
    </Suspense>
);

export default Page;
