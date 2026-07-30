'use client';

import { useRouter } from 'next/navigation';
import QuestionnaireStepForm from './QuestionnaireStepForm';

const Step7Identification = ({ onNext }) => {
    const router = useRouter();

    return (
        <QuestionnaireStepForm
            onNext={onNext}
            submitLabel="Enregistrer et continuer"
            onSuccess={() => {
                router.push('/students/question-summary');
                onNext?.();
            }}
        />
    );
};

export default Step7Identification;
