'use client';
import { useMyCapsuleModuleQuestionsQuery } from "@/redux/fetures/capsules/capsules";
import React, { useState } from "react";

const initialQuestions = [
    {
        id: 1,
        question:
            "If income was not a factor, what activity would you engage in every single day?",
        answer: "",
        saved: false,
    },
    {
        id: 2,
        question:
            "What type of problems do you feel most energized solving?",
        answer: "",
        saved: false,
    },
    {
        id: 3,
        question:
            "What kind of impact do you want your work to have?",
        answer: "",
        saved: false,
    },
];

const Diagnostics = ({capsuleId}) => {

    const { data } = useMyCapsuleModuleQuestionsQuery(capsuleId);
    const fullModuleVideodata = data?.data;
    console.log("Full Module Video data" ,fullModuleVideodata)

    const [questions, setQuestions] = useState(initialQuestions);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (id, value) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === id ? { ...q, answer: value } : q
            )
        );
    };

    const handleSubmitAll = () => {
        const updatedQuestions = questions.map((q) => ({
            ...q,
            saved: true,
        }));

        setQuestions(updatedQuestions);
        setSubmitted(true);

        console.log("Submitted All Questions:", updatedQuestions);
    };

    return (
        <div className="mx-auto px-6 py-10 text-left ">
            {/* Header */}
            <div className="mb-8 flex justify-start gap-2 items-center">
                <h1 className="text-2xl font-bold text-indigo-900">
                    Internal Diagnostics
                </h1>
                <span className="bg-yellow-100 text-yellow-700 text-sm px-3 py-1 rounded-full">
                    {submitted ? "Completed" : "In Progress"}
                </span>
            </div>

            {/* Questions */}
            <div className="space-y-8">
                {questions.map((q, index) => (
                    <div
                        key={q.id}
                        className="p-6 border rounded-xl shadow-sm bg-white"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-semibold text-indigo-800">
                                Question {index + 1}
                            </h2>

                            {q.saved && (
                                <span className="text-green-600 text-sm bg-green-100 px-3 py-1 rounded-full">
                                    ✔ Saved
                                </span>
                            )}
                        </div>

                        <p className="text-gray-700 mb-4">{q.question}</p>

                        <textarea
                            value={q.answer}
                            onChange={(e) => handleChange(q.id, e.target.value)}
                            rows={4}
                            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            placeholder="Write your answer here..."
                        />
                    </div>
                ))}
            </div>

            {/* Submit All */}
            <div className="mt-10 text-center">
                <button
                    onClick={handleSubmitAll}
                    className="customSignUpButton text-white px-6 py-4 rounded-lg hover:bg-indigo-700 transition"
                >
                    Submit All Answers
                </button>
            </div>
        </div>
    );
};

export default Diagnostics;
