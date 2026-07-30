import React from 'react';

const steps = [
    { number: 1, label: 'Infos de base' },
    { number: 2, label: 'Mission' },
    { number: 3, label: 'Énergie intérieure' },
    { number: 4, label: 'Méthodes' },
    { number: 5, label: 'Mise en ligne' },
];

const StepProgress = ({ currentStep = 1, onStepClick }) => {
    return (
        <div className="flex items-center justify-center px-4 py-5">
            {steps.map((step, i) => (
                <React.Fragment key={step.number}>
                    {/* Step circle + label */}
                    <div
                        className={`flex flex-col items-center ${step.number < currentStep ? 'cursor-pointer' : ''}`}
                        onClick={() => step.number < currentStep && onStepClick?.(step.number)}
                    >
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all
                                ${step.number === currentStep
                                    ? 'bg-primary border-primary text-white'
                                    : step.number < currentStep
                                    ? 'bg-primary border-primary text-white'
                                    : 'bg-white border-gray-300 text-gray-400'
                                }`}
                        >
                            {step.number < currentStep ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8 15.414l-4.707-4.707a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            ) : step.number}
                        </div>
                        <span className={`text-xs mt-1 whitespace-nowrap ${step.number === currentStep ? 'text-primary font-medium' : 'text-gray-400'}`}>
                            {step.label}
                        </span>
                    </div>

                    {/* Connector line */}
                    {i < steps.length - 1 && (
                        <div className={`h-px w-10 mx-1 mb-4 ${step.number < currentStep ? 'bg-primary' : 'bg-gray-300'}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default StepProgress;