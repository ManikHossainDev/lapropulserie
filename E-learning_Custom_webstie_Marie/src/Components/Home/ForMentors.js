import React from 'react';

const CALENDLY_DEMO =
    'https://calendly.com/marie-bouleau-lapropulserie/rdv';

const ForMentors = () => {
    const features = [
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <path d="M12 2L8 6H4v4L2 12l2 2v4h4l4 4 4-4h4v-4l2-2-2-2V6h-4L12 2z" stroke="#c9a96e" strokeWidth="1.5" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" stroke="#c9a96e" strokeWidth="1.5" />
                </svg>
            ),
            text: 'Accédez à des profils déjà en phase de questionnement',
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            text: 'Développez votre activité auprès d’un public ciblé et engagé',
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <circle cx="12" cy="12" r="10" stroke="#c9a96e" strokeWidth="1.5" />
                    <path d="M12 6v6l4 2" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            ),
            text: 'Intervenez au bon moment, lorsque le besoin d’accompagnement est réel',
        },
        {
            icon: (
                <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                        <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            ),
            text: 'Gagnez en visibilité au sein d’un écosystème centré sur l’alignement professionnel',
        },
    ];

    return (
        <div
            className=" flex items-center justify-center p-6"
        //   style={{ background: 'linear-gradient(160deg, #0d1b3e 0%, #0a1628 40%, #10082a 100%)' }}
        >
            {/* Dot decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[
                    { top: '8%', left: '6%' }, { top: '12%', right: '12%' },
                    { top: '30%', right: '5%' }, { top: '48%', left: '4%' },
                    { top: '55%', right: '3%' }, { top: '70%', left: '8%' },
                    { top: '85%', right: '8%' }, { top: '92%', left: '3%' },
                ].map((pos, i) => (
                    <div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full bg-white opacity-40"
                        style={pos}
                    />
                ))}
            </div>

            <div className="relative w-full max-w-md mx-auto flex flex-col items-center gap-6">
                {/* Star Icon */}
                <div className="text-5xl select-none" style={{ filter: 'drop-shadow(0 0 12px rgba(255,180,0,0.5))' }}>
                    ⭐
                </div>

                {/* Title */}
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">
                        Devenez Mentor de <span style={{ color: '#f5a623' }}>La Propulserie</span>
                    </h1>
                    <p className="mt-3 text-base md:text-lg font-medium text-white">
                        Vous êtes coach, thérapeute, consultant, professionnel RH, formateur ou expert de l’accompagnement ?
                    </p>
                    <p className="mt-2" style={{ color: '#8898b8' }}>
                        Mettez votre expertise au service de personnes en quête de sens et accompagnez-les dans leur évolution professionnelle au sein d’une communauté engagée.
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="w-full flex flex-col gap-3">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 px-5 py-4 rounded-xl bg-red-900/20 border border-red-600/20"

                        >
                            <div className="flex-shrink-0">{feature.icon}</div>
                            <span className="text-white text-sm font-medium">{feature.text}</span>
                        </div>
                    ))}
                </div>

                {/* CTA Button */}
                <a
                    href={CALENDLY_DEMO}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-3/4 py-3.5 rounded-md font-semibold text-white text-sm transition-opacity hover:opacity-90 active:scale-95 inline-block text-center"
                    style={{
                        background: 'linear-gradient(135deg, #f5a623 0%, #e8870a 100%)',
                        boxShadow: '0 4px 20px rgba(245,166,35,0.35)',
                    }}
                >
                    🚀 Postuler pour rejoindre l’écosystème
                </a>
            </div>
        </div>
    );
};

export default ForMentors;