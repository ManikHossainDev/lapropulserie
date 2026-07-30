'use client';

import React, { useState } from 'react';
import { Editor } from 'primereact/editor';

const Science = () => {
    const [text, setText] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        if (!text || text === '<p><br></p>') return;

        console.log("Submitted Content:", text);
        setSubmitted(true);
    };

    return (
        <div className=" mx-auto py-10">

            {/* Header */}
            <div className="mb-3 flex justify-start gap-3 items-center">
                <h1 className="text-2xl font-bold text-indigo-900 capitalize">
                    Your Propulsion Fuel
                </h1>

                <span className={`text-sm px-3 py-1 rounded-full ${submitted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700 '}`}>
                    {submitted ? "Completed" : "In Progress"}
                </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6 text-left">
                This is your core manifest. Write without filters. This text will
                become the nucleus of your professional orbit.
            </p>

            {/* Editor */}
            <Editor
                value={text}
                placeholder='Write your text here...'
                onTextChange={(e) => {
                    setText(e.htmlValue);
                    setSubmitted(false); // reset status if editing again
                }}
                style={{ height: '320px' }}
            />

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={!text || text === '<p><br></p>'}
                className="customSignUpButton disabled:bg-gray-400 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition mt-6"
            >
                Submit
            </button>
        </div>
    );
};

export default Science;
