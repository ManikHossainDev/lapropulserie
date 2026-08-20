'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { useLoginMutation } from '@/redux/fetures/auth/login';
import { toast } from 'react-toastify';

const Page = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [loginWithPassowrd, { isLoading }] = useLoginMutation();

    const togglePassword = () => {
        setShowPassword(prevState => !prevState);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const data = {
            email,
            password,
            rememberMe: true
        };

        try {
            const response = await loginWithPassowrd(data).unwrap();
            if (response?.code == 200 || response?.success) {
                const user =
                    response?.data?.userWithoutPassword ||
                    response?.data?.user ||
                    null;
                const accessToken = response?.data?.tokens?.accessToken;

                if (!accessToken || !user?.role) {
                    const message = 'Login succeeded but session data is incomplete. Please try again.';
                    toast.error(message);
                    setErrorMsg(message);
                    return;
                }

                toast.success(response?.message || 'Logged in successfully.');
                localStorage.setItem('token', JSON.stringify(accessToken));
                localStorage.setItem('user', JSON.stringify(user));

                const role = String(user.role).toLowerCase();
                const redirectPath =
                    role === 'student'
                        ? '/students'
                        : role === 'mentor'
                          ? '/mentor'
                          : role === 'admin'
                            ? '/admin'
                            : null;

                if (!redirectPath) {
                    const message = `Unsupported role: ${user.role}`;
                    toast.error(message);
                    setErrorMsg(message);
                    return;
                }

                // Hard navigation so post-login redirect is reliable in App Router
                window.location.assign(redirectPath);
            } else {
                toast.error(response?.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login failed:', error);
            toast.error(error?.data?.message || 'Login failed. Please try again.');
            setErrorMsg(error?.data?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className='bg-[url("/Images/Auth/page_bg.png")] bg-cover bg-center flex items-center justify-center min-h-screen px-4 py-8 sm:px-6 md:px-10'>

            <form onSubmit={handleSubmit} className='w-full max-w-lg bg-slate-100/90 rounded-lg p-5 py-10 sm:p-8 sm:py-14 md:p-10 md:py-20'>
                <div className='w-full min-w-0'>
                    <h2 className='text-2xl sm:text-3xl font-medium text-center'>Connexion</h2>

                    {errorMsg && (
                        <div className='mt-4 p-2 bg-red-100 border border-red-400 text-red-600 text-sm rounded-md text-center break-words'>
                            {errorMsg}
                        </div>
                    )}

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
                        <label className='font-semibold' htmlFor="password">Mot de passe</label>
                        <div className='relative'>
                            <input
                                placeholder='Entrez votre mot de passe'
                                className='mt-2 w-full p-2 pr-10 border border-[#3b398d] rounded-md focus:outline-0 ring-0 bg-white'
                                type={showPassword ? "text" : "password"}
                                name="password"
                                id="password"
                                required
                            />
                            <button
                                type="button"
                                onClick={togglePassword}
                                className='absolute cursor-pointer right-3 top-1/2 mt-1 -translate-y-1/2 text-gray-500'
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {!showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <div className='flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center my-5'>
                        <label htmlFor="remember" className='flex items-center'>
                            <input type="checkbox" name="remember" id="remember" />
                            <span className='ml-2 text-gray-600 text-sm sm:text-base'>Se souvenir de moi</span>
                        </label>
                        <Link className='text-blue-600 text-sm' href="/forgot-password">Mot de passe oublié ?</Link>
                    </div>

                    <div className='mt-5'>
                        <button
                            type='submit'
                            disabled={isLoading}
                            className='cursor-pointer w-full p-2.5 sm:p-2 bg-[#3b398d] font-semibold text-white rounded-md disabled:opacity-60 disabled:cursor-not-allowed'
                        >
                            {isLoading ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </div>

                    <p className='text-center mt-5 text-gray-600 text-sm sm:text-base'>Vous n’avez pas encore de compte ? <Link className='text-blue-600' href="/signup">Créer un compte</Link></p>
                </div>
            </form>

        </div>
    );
};

export default Page;