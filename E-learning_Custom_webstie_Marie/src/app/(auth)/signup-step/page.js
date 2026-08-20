'use client'
import React, { useState } from "react";
import { MdSchool, MdSupervisorAccount } from "react-icons/md";
import { GrLinkNext } from "react-icons/gr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";


const Page = () => {
    const [selectedRole, setSelectedRole] = useState(null);
    const navigate = useRouter();

    const handleGoNext = () => {
        if (selectedRole) {
            navigate.push(`/signup?role=${selectedRole}`);
        } else {
            toast.error('Veuillez sélectionner un profil pour continuer.');
        }
    };

    return (
        <div className="h-screen  bg-gradient-to-b from-[#f9f5ff] to-[#b6a7ca]">
            <Link href="/">
                <img className='md:pl-10 pt-10  md:w-60 w-48 mx-auto md:ml-0' src="/Images/Auth/logo2.png" alt="" />
            </Link>

            <div className="mt-10 text-center">
                <h2 className="text-3xl font-semibold text-gray-900">Créer un compte</h2>
                <p className="text-gray-500 my-2">Sélectionnez votre profil pour continuer</p>
            </div>

            <div className="flex justify-center mt-10">
                <div className="mt-6 space-y-4 w-96 ">
                    <div
                        className={`relative flex items-center p-5 bg-[#553283] text-white rounded-xl cursor-pointer transition-all duration-300 ${selectedRole === "student" ? "ring-4 ring-purple-400" : ""
                            }`}
                        onClick={() => setSelectedRole("student")}
                    >
                        <div className="min-w-12 h-12 bg-white rounded-full flex items-center justify-center">
                            <MdSchool className="text-green-500 text-xl" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold">Particulier</h3>
                            <p className="text-sm text-gray-200">Accédez au bilan, aux capsules et au Parcours Exploration</p>
                        </div>
                        <input
                            type="checkbox"
                            className="absolute right-5 w-5 h-5"
                            checked={selectedRole === "student"}
                            readOnly
                        />
                    </div>

                    <div
                        className={`relative flex items-center p-5 bg-[#553283] text-white rounded-xl cursor-pointer transition-all duration-300 ${selectedRole === "mentor" ? "ring-4 ring-purple-400" : ""
                            }`}
                        onClick={() => setSelectedRole("mentor")}
                    >
                        <div className="min-w-12 h-12 bg-white rounded-full flex items-center justify-center">
                            <MdSupervisorAccount className="text-green-500 text-2xl" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold">Mentor</h3>
                            <p className="text-sm text-gray-200">Rejoignez l’écosystème et accompagnez les particuliers</p>
                        </div>
                        <input
                            type="checkbox"
                            className="absolute right-5 w-5 h-5"
                            checked={selectedRole === "mentor"}
                            readOnly
                        />
                    </div>
                    <div>
                        <button onClick={handleGoNext} className="w-full p-2 bg-[#553283] mt-10 font-semibold text-white rounded-md flex items-center justify-center cursor-pointer">Continuer <GrLinkNext className="ml-2 text-xl" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
