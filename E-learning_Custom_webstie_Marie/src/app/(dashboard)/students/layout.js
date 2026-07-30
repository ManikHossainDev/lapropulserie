'use client';
import { Geist, Geist_Mono } from "next/font/google";
import './../../globals.css'
import StudentsHeader from "@/Components/Students/Common/StudentsHeader";
import StudentsSidebar from "@/Components/Students/Common/StudentsSidebar";
import { useState } from "react";
import { Suspense } from "react";


// not root layout this is main layout

export default function Layout({ children }) {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><p className="text-lg text-gray-500">Loading...</p></div>}>

            <div className="relative flex">
                <StudentsSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
                <div className="w-full">
                    <StudentsHeader isOpen={isOpen} setIsOpen={setIsOpen} />

                    <div className="">
                        {children}
                    </div>
                </div>
            </div>
        </Suspense>
    );
}
