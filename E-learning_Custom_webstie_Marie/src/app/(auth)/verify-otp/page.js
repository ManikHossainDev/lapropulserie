'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import OTPInput from 'react-otp-input';
import { useVerifyEmailMutation } from '@/redux/fetures/auth/varifyEmail';
import { toast } from 'react-toastify';

const Page = () => {
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const verifyType = typeof window !== 'undefined' ? sessionStorage.getItem('verifyType') : null;
    const isEmailVerification = verifyType === 'email';

    const [otp, setOtp] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
    const router = useRouter();

    const handleVerify = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!email) {
            setErrorMsg('Email is missing. Please sign up again.');
            return;
        }

        if (otp.length < 6) {
            setErrorMsg('Please enter the 6-digit OTP.');
            return;
        }

        if (isEmailVerification) {
            const token = sessionStorage.getItem('verificationToken');

            if (!token) {
                setErrorMsg('Verification session expired. Please sign up again.');
                return;
            }

            try {
                const response = await verifyEmail({ email, otp, token }).unwrap();

                if (response?.code === 200) {
                    toast.success(response?.message || 'Email verified successfully.');

                    localStorage.setItem('token', JSON.stringify(response?.data?.tokens?.accessToken));
                    localStorage.setItem('user', JSON.stringify(response?.data?.user));

                    sessionStorage.removeItem('verificationToken');
                    sessionStorage.removeItem('verifyType');

                    const role = response?.data?.user?.role;
                    if (role === 'student') {
                        router.push('/students');
                    } else if (role === 'mentor') {
                        router.push('/mentor');
                    } else {
                        router.push('/login');
                    }
                } else {
                    toast.error(response?.message || 'Verification failed.');
                }
            } catch (error) {
                const message = error?.data?.message || 'Verification failed. Please try again.';
                toast.error(message);
                setErrorMsg(message);
            }
            return;
        }

        router.push('/update-password');
    };

    return (
        <div className='h-screen bg-gradient-to-b  from-[#f9f5ff] to-[#b6a7ca] '>
            <Link href="/">
                <img className='md:pl-10 pt-10  md:w-60 w-48 mx-auto md:ml-0' src="/Images/Auth/logo2.png" alt="" />
            </Link>
            <div className='flex justify-center mt-20'>
                <form onSubmit={handleVerify} className='min-w-80'>
                    <h2 className='text-3xl font-medium text-center'>Verify OTP</h2>
                    <p className='text-center mt-5 text-gray-600'>
                        {isEmailVerification
                            ? `Please enter the OTP sent to ${email || 'your email'}.`
                            : 'Please enter the OTP sent to your email.'}
                    </p>

                    {errorMsg && (
                        <div className='mt-4 p-2 bg-red-100 border border-red-400 text-red-600 text-sm rounded-md text-center'>
                            {errorMsg}
                        </div>
                    )}

                    <div className='mt-5'>
                        <label className='font-semibold' htmlFor="otp">Enter OTP</label>
                        <OTPInput
                            value={otp}
                            onChange={setOtp}
                            numInputs={6}
                            containerStyle={{ justifyContent: 'space-between' }}
                            renderInput={(props) => (
                                <input
                                    {...props}
                                    className="!border bg-gray-200 border-green-400 rounded-md px-2 py-1"
                                    style={{ width: '50px', height: '50px', textAlign: 'center' }}
                                />
                            )}
                        />
                    </div>

                    <div className='mt-5'>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className='cursor-pointer w-full p-2 bg-green-400 font-semibold text-white rounded-md disabled:opacity-60 disabled:cursor-not-allowed'
                        >
                            {isLoading ? 'Verifying...' : 'Verify'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Page;
