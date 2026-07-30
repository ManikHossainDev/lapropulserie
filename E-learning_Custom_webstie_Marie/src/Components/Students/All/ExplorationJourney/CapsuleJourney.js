'use client';
import React, { useState } from "react";
import Introduction from "./Introduction";
import Inspiration from "./Inspiration";
import Diagnostics from "./Diagnostics";
import Science from "./Science";
import AISummary from "./AISummary";
import { useMyPurchasedCapsuleModuleQuery } from "@/redux/fetures/capsules/capsules";
import { useSearchParams } from "next/navigation";


/* ---------------------- STEP DATA ---------------------- */

const steps = [
    {
        id: 1,
    },
    {
        id: 2,
    },
    {
        id: 3,
    },
    {
        id: 4,
    },

];

/* ---------------------- PROGRESS COMPONENT ---------------------- */

const ProgressBar = ({ currentStep, totalSteps }) => {
    const percentage = Math.round((currentStep / totalSteps) * 100);

    return (
        <div className="w-full ">
            <div className="flex justify-between mb-2">
                <p className="text-sm text-gray-600">Mission Progress</p>
                <span className="text-sm font-medium text-gray-700">
                    {percentage}%
                </span>
            </div>

            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-2 bg-primary transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

/* ---------------------- MAIN COMPONENT ---------------------- */

const CapsuleJourneyForSingleItem = () => {
    // get capsuleId from search params
    const searchParams = useSearchParams();
    const capsuleId = searchParams.get('capsuleId');

    const { data } = useMyPurchasedCapsuleModuleQuery(capsuleId);
    const fullModuleCapsuledata = data?.data?.capsule;
    const fullModuleVideodata = data?.data?.modules;

    console.log(data)

    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = steps.length;

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const activeData = steps[currentStep - 1];

    return (
        <div className="min-h-screen bg-[#f8f9ff] px-6 py-10">
            <div className="max-w-7xl bg-white rounded-3xl shadow-sm p-10 mx-auto">

                {/* Progress Component */}
                <ProgressBar
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                />

                {
                    currentStep === 1 && (
                        <div className="text-center mt-10">
                            <Introduction fullModuleCapsuledata={fullModuleCapsuledata} />
                        </div>
                    )
                }
                {
                    currentStep === 2 && (
                        <div className="text-center mt-10">
                            <Inspiration fullModuleVideodata={fullModuleVideodata} />
                        </div>
                    )
                }
                {
                    currentStep === 3 && (
                        <div className="text-center mt-10">
                            <Diagnostics capsuleId={capsuleId} />
                        </div>
                    )
                }
                {/* {
                    currentStep === 4 && (
                        <div className="text-center mt-10">
                            <Science />
                        </div>
                    )
                } */}
                {
                    currentStep === 4 && (
                        <div className="text-center mt-10">
                            <AISummary />
                        </div>
                    )
                }



                {/* Navigation Buttons */}
                <div className="flex justify-between mt-10">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className={`px-6 py-3 rounded-xl border transition
                        ${currentStep === 1
                                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                                : "border-primary text-primary hover:bg-indigo-50"
                            }`}
                    >
                        ← Previous
                    </button>

                    <button
                        onClick={nextStep}
                        disabled={currentStep === totalSteps}
                        className={`px-8 py-3 rounded-xl cursor-pointer text-white transition 
                            ${currentStep === totalSteps
                                ? "bg-gray-300 cursor-not-allowed"
                                : "customSignUpButton"
                            }`}
                    >
                        Next →
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CapsuleJourneyForSingleItem;
