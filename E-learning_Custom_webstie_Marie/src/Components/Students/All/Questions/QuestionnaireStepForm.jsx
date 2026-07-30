'use client';

import IsLoading from '@/Components/IsLoading';
import {
    useAnswerTheQuestionsMutation,
    useGetAllQuestionCategoryPaidQuery,
    useGetresumeQuestionAnswerQuery,
} from '@/redux/fetures/allQuestion/allQuestion';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
    allAnswersFilled,
    buildInitialAnswers,
    formatAnswersForApi,
    getMaxSelection,
    getQuestionKey,
    isMultiOptionSelected,
    isOptionSelected,
    normalizeMultiSelectAnswer,
    resolveQuestionUiType,
} from './questionnaireStepUtils';

const inputClassName =
    'w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2b124f]';

const QuestionnaireStepForm = ({
    onNext,
    submitLabel = 'Enregistrer et continuer',
    successMessage,
    onSuccess,
}) => {
    const searchParams = useSearchParams();
    const stepId = searchParams.get('StepId');

    const { data: step, isLoading } = useGetAllQuestionCategoryPaidQuery({ id: stepId });
    const { data: resume } = useGetresumeQuestionAnswerQuery({ questionaryId: stepId });

    const fullDataOfStep = step?.data;
    const resumeAnswers = resume?.data?.answers ?? fullDataOfStep?.answers;

    const [answerTheQuestions, { isLoading: isLoadingAnswer }] =
        useAnswerTheQuestionsMutation();

    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const userEditedRef = useRef(false);

    useEffect(() => {
        userEditedRef.current = false;
        setAnswers({});
    }, [stepId]);

    useEffect(() => {
        if (!fullDataOfStep?.questions || !stepId) return;
        if (String(fullDataOfStep?.questionary?.id) !== String(stepId)) return;
        if (userEditedRef.current) return;

        setAnswers(buildInitialAnswers(fullDataOfStep.questions, resumeAnswers));
    }, [fullDataOfStep, resumeAnswers, stepId]);

    const markEdited = () => {
        userEditedRef.current = true;
    };

    const handleInput = (id, value) => {
        markEdited();
        setAnswers((prev) => ({ ...prev, [id]: value }));
    };

    const handleSelect = (id, value) => {
        markEdited();
        setAnswers((prev) => ({ ...prev, [id]: value }));
    };

    const toggleMulti = (id, value, maxSelection, question) => {
        markEdited();
        setAnswers((prev) => {
            // Strip legacy orphan labels so they cannot eat the max budget.
            const current = normalizeMultiSelectAnswer(question, prev[id] || []);

            if (isMultiOptionSelected(current, value)) {
                return {
                    ...prev,
                    [id]: current.filter(
                        (entry) => entry !== value && entry !== Number(value)
                    ),
                };
            }

            if (current.length >= maxSelection) return { ...prev, [id]: current };

            return {
                ...prev,
                [id]: [...current, value],
            };
        });
    };

    const handleSave = async () => {
        if (!allAnswersFilled(answers)) {
            toast.error('Veuillez répondre à toutes les questions');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                data: {
                    answers: formatAnswersForApi(fullDataOfStep.questions, answers),
                },
                questionaryId: fullDataOfStep?.questionary?.id,
            };

            const res = await answerTheQuestions(payload).unwrap();

            if (res?.code === 200) {
                // Always French UI copy (ignore EN API / prop messages)
                toast.success('Tes réponses ont bien été enregistrées');
                if (onSuccess) {
                    onSuccess();
                } else {
                    onNext?.();
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                toast.error(res?.message || 'Échec de l’enregistrement');
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error?.data?.message || 'Échec de l’enregistrement');
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return <IsLoading row={10} />;
    }

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-xl font-semibold">
                    {fullDataOfStep?.questionary?.title}
                </h2>
                <p className="text-gray-500">{fullDataOfStep?.questionary?.brief}</p>
            </div>

            {fullDataOfStep?.questions?.map((question, index) => {
                const questionKey = getQuestionKey(question, index);
                const value = answers[questionKey];
                const uiType = resolveQuestionUiType(question);
                const maxSelection = getMaxSelection({ ...question, type: uiType });
                const isEmailQuestion =
                    /e-?mail|rapport de mission/i.test(question.title || '') ||
                    /e-?mail/i.test(question.helperText || '');

                return (
                    <div key={questionKey} className="space-y-4">
                        <div>
                            <h3 className="font-semibold">{question.title}</h3>
                            {question.helperText && (
                                <p className="text-sm text-gray-500">{question.helperText}</p>
                            )}
                            {uiType === 'Multiple Select' && (
                                <p className="text-sm text-[#2b124f] font-medium mt-1">
                                    Sélectionne jusqu&apos;à {maxSelection} réponses
                                </p>
                            )}
                        </div>

                        {(uiType === 'Text Input' || !uiType) && (
                            <input
                                type={isEmailQuestion ? 'email' : 'text'}
                                value={value || ''}
                                onChange={(e) => handleInput(questionKey, e.target.value)}
                                placeholder={question.helperText}
                                className={inputClassName}
                            />
                        )}

                        {uiType === 'Text Area' && (
                            <textarea
                                value={value || ''}
                                onChange={(e) => handleInput(questionKey, e.target.value)}
                                rows={4}
                                placeholder={question.helperText}
                                className={inputClassName}
                            />
                        )}

                        {uiType === 'Single Select' && (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {question.options?.map((opt) => {
                                    const isActive = isOptionSelected(value, opt.sl);

                                    return (
                                        <button
                                            key={`${questionKey}-${opt.sl}`}
                                            type="button"
                                            onClick={() => handleSelect(questionKey, opt.sl)}
                                            className={`p-4 rounded-lg border text-left ${
                                                isActive
                                                    ? 'border-[#2b124f] bg-[#2b124f]/5'
                                                    : 'border-gray-300 hover:border-[#2b124f]'
                                            }`}
                                        >
                                            {opt.details}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {uiType === 'Multiple Select' && (
                            <>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {question.options?.map((opt) => {
                                        const selectedList = normalizeMultiSelectAnswer(
                                            question,
                                            value || []
                                        );
                                        const isActive = isMultiOptionSelected(selectedList, opt.sl);
                                        const isDisabled =
                                            !isActive && selectedList.length >= maxSelection;

                                        return (
                                            <button
                                                key={`${questionKey}-${opt.sl}`}
                                                type="button"
                                                disabled={isDisabled}
                                                onClick={() =>
                                                    toggleMulti(
                                                        questionKey,
                                                        opt.sl,
                                                        maxSelection,
                                                        question
                                                    )
                                                }
                                                className={`p-4 rounded-lg border text-left ${
                                                    isActive
                                                        ? 'border-[#2b124f] bg-[#2b124f]/5'
                                                        : 'border-gray-300 hover:border-[#2b124f]'
                                                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {opt.details}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-sm text-gray-500">
                                    Sélectionné{' '}
                                    {
                                        normalizeMultiSelectAnswer(question, value || [])
                                            .length
                                    }{' '}
                                    / {maxSelection}
                                </p>
                            </>
                        )}
                    </div>
                );
            })}

            <button
                onClick={handleSave}
                disabled={loading || isLoadingAnswer}
                className="px-8 py-3 bg-[#2b124f] text-white rounded-lg disabled:opacity-50"
            >
                {loading || isLoadingAnswer ? 'Enregistrement...' : submitLabel}
            </button>
        </div>
    );
};

export default QuestionnaireStepForm;
