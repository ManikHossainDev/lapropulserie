'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSignUpMutation } from '@/redux/fetures/auth/signUp';
import { toast } from 'react-toastify';

const Page = () => {
    const searchParams = useSearchParams();
    const roleFromUrl = searchParams.get('role');
    const defaultRole = roleFromUrl === 'student' || roleFromUrl === 'mentor' ? roleFromUrl : '';

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
            setErrorMsg('Please fill in all required fields.');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            setErrorMsg('Password must be at least 8 characters long.');
            return;
        }

        if (!acceptTOC) {
            setErrorMsg('Please accept the terms and conditions.');
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
                    <h2 className='text-3xl text-center text-[#3b398d] font-semibold'>Begin Your Expedition</h2>
                    <p className='text-center mt-5'>Discover your professional galaxy—where your talents meet your ambitions</p>

                    {errorMsg && (
                        <div className='mt-4 p-2 bg-red-100 border border-red-400 text-red-600 text-sm rounded-md text-center'>
                            {errorMsg}
                        </div>
                    )}

                    <div className='mt-5'>
                        <label className='font-semibold' htmlFor="name">Full Name</label>
                        <input
                            placeholder='Enter your name'
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
                            placeholder='Enter your email'
                            className='mt-2 w-full p-2 border border-[#3b398d] rounded-md focus:outline-0 ring-0 bg-white'
                            type="email"
                            name="email"
                            id="email"
                            required
                        />
                    </div>

                    <div className='mt-5'>
                        <label className='font-semibold' htmlFor="role">Select Role</label>
                        <select
                            className='mt-2 w-full p-2 border border-[#3b398d] rounded-md focus:outline-0 ring-0 bg-white'
                            name="role"
                            id="role"
                            defaultValue={defaultRole}
                            required
                        >
                            <option value="" disabled>Choose your role</option>
                            <option value="student">Student</option>
                            <option value="mentor">Mentor</option>
                        </select>
                    </div>

                    <div className='mt-5'>
                        <label className='font-semibold' htmlFor="password">Password</label>
                        <div className='relative'>
                            <input
                                placeholder='Enter your password'
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
                        <label className='font-semibold' htmlFor="confirmPassword">Confirm Password</label>
                        <div className='relative'>
                            <input
                                placeholder='Confirm your password'
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
                            <span className='ml-2 text-gray-600'>I agree to all terms & conditions.</span>
                        </label>
                    </div>

                    <div className='mt-5'>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className='cursor-pointer w-full p-2 bg-[#3b398d] font-semibold text-white rounded-md disabled:opacity-60 disabled:cursor-not-allowed'
                        >
                            {isLoading ? 'Signing up...' : 'Sign Up'}
                        </button>
                    </div>
                    <p className='text-center mt-5 text-gray-600'>Already have an account? <Link className='text-blue-600' href="/login">Login</Link></p>
                </div>
            </form>

        </div>
    );
};

export default Page;
