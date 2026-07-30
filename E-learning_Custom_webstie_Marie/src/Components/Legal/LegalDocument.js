import React from 'react';

const LegalDocument = ({ title, paragraphs }) => {
    return (
        <div className="min-h-screen text-white">
            <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
                <h1 className="text-3xl md:text-4xl font-bold mb-8 text-amber-400">
                    {title}
                </h1>
                <div className="space-y-4 text-sm md:text-base leading-relaxed text-gray-300">
                    {paragraphs.map((paragraph, index) => {
                        const isHeading =
                            /^(CONDITIONS|POLITIQUE|MENTIONS|Article|\d+\.)/i.test(paragraph) ||
                            (paragraph.length < 80 && paragraph === paragraph.toUpperCase());

                        if (isHeading && index > 0) {
                            return (
                                <h2
                                    key={index}
                                    className="text-lg md:text-xl font-semibold text-white pt-6"
                                >
                                    {paragraph}
                                </h2>
                            );
                        }

                        return (
                            <p key={index} className="whitespace-pre-wrap">
                                {paragraph}
                            </p>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LegalDocument;
