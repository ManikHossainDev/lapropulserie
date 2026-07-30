'use client'; 
import './../../globals.css'
import { useState } from "react";
import MentorHeader from "@/Components/mentors/Common/MentorHeader";
import MentorSidebar from "@/Components/mentors/Common/MentorSidebar";


// not root layout this is main layout

export default function Layout({ children }) {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative flex">
            <MentorSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
            <div className="w-full">
                <MentorHeader isOpen={isOpen} setIsOpen={setIsOpen} />

                <div className="">
                    {children}
                </div>
            </div>
        </div>
    );
}
