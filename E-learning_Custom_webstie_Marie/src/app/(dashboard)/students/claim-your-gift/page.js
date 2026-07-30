'use client';

import React from "react";
import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";
import DownloadCertificate from "@/Components/others/DownloadCertificate";


export default function Page() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-6">
            <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur rounded-2xl shadow-md border border-gray-200 p-6">
                {/* Header */}
                <div className="flex items-center justify-between border rounded-xl px-5 py-4 bg-gray-50">
                    <div>
                        <h1 className="text-2xl font-semibold text-primary">Achievement Unlocked</h1>
                        <p className="text-sm text-gray-500 mt-1">Completion Date: Oct 24, 2025</p>
                    </div>

                    {/* ✅ Replaces the old button — handles everything internally */}
                    <DownloadCertificate />
                </div>

                {/* Main Card */}
                <div className="mt-6 border rounded-2xl p-10 bg-gray-50 text-center">
                    <div className="flex justify-center mb-6">
                        <img src="/Images/StudentsDash/gift_cliem.png" alt="gift" className="h-72 object-contain" />
                    </div>

                    <h2 className="text-2xl font-semibold text-primary mb-3">A Gift For Your Dedication</h2>

                    <p className="text-gray-600 max-w-xl mx-auto mb-6 text-sm leading-relaxed">
                        You've successfully finished your Stellar Expedition. To celebrate your commitment,
                        we're gifting you a bonus capsule.
                    </p>

                    <div className="flex justify-center">
                        <Link href="/students/claim-your-gift/capsule-modules" className="customSignUpButton hover:bg-indigo-800 text-white px-6 py-3 rounded-lg font-medium shadow flex items-center gap-2">
                            Claim Your Gift <FaArrowRightLong />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}