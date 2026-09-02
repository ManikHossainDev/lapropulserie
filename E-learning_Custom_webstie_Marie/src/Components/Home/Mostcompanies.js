import React from 'react';
import { MARIE_CALENDLY_BOOKING_URL } from '@/constants/siteLinks';

const Mostcompanies = () => {
    const features = [
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <rect x="2" y="3" width="5" height="18" rx="1" fill="#4a9eff" opacity="0.9" />
                    <rect x="9.5" y="7" width="5" height="14" rx="1" fill="#f5a623" opacity="0.9" />
                    <rect x="17" y="11" width="5" height="10" rx="1" fill="#a78bfa" opacity="0.9" />
                </svg>
            ),
            text: 'Détecter les premiers signaux de désengagement',
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <circle cx="9" cy="7" r="3" fill="#f87171" opacity="0.9" />
                    <circle cx="15" cy="7" r="3" fill="#fb923c" opacity="0.9" />
                    <path d="M3 19c0-3.314 2.686-6 6-6h6c3.314 0 6 2.686 6 6" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M15 13l3-2.5" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            ),
            text: 'Soutenir les parcours d\'alignement des employés',
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <circle cx="12" cy="12" r="9" stroke="#f87171" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="5" stroke="#fb923c" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="2" fill="#f5a623" />
                    <line x1="21" y1="12" x2="17" y2="12" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="3" y1="12" x2="7" y2="12" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="12" y1="3" x2="12" y2="7" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="12" y1="17" x2="12" y2="21" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            ),
            text: 'Recruter des candidats avec des motivations plus claires',
        },
    ];

    return (
        <div className="relative p-6 lg:py-20 flex items-center justify-center py-10">
            {/* Dot decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[
                    { top: '5%', left: '18%' }, { top: '8%', right: '5%' },
                    { top: '22%', left: '5%' }, { top: '35%', right: '12%' },
                    { top: '48%', left: '12%' }, { top: '50%', right: '2%' },
                    { top: '62%', left: '2%' }, { top: '65%', right: '18%' },
                    { top: '80%', left: '14%' }, { top: '90%', right: '6%' },
                ].map((pos, i) => (
                    <div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full bg-white opacity-30"
                        style={pos}
                    />
                ))}
            </div>

            <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
                {/* Building emoji */}
                <div className="text-5xl select-none" style={{ filter: 'drop-shadow(0 0 10px rgba(100,150,255,0.4))' }}>
                    🏢
                </div>

                {/* Title */}
                <div className="text-center max-w-2xl">
                    <h1 className="text-3xl md:text-4xl font-bold text-white leading-snug">
                        Solutions pour les <span style={{ color: '#f5a623' }}>entreprises</span>
                    </h1>
                    <p className="mt-3 text-base md:text-lg font-medium text-white leading-snug">
                        Prévenez le désengagement et accompagnez durablement vos collaborateurs.
                    </p>
                    <p className="mt-2 text-sm md:text-base leading-snug" style={{ color: '#8898b8' }}>
                        La Propulserie aide les organisations à identifier les signaux faibles, renforcer l’engagement, la fidélisation et accompagner les parcours professionnels avant que les difficultés ne deviennent des ruptures.
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="w-full flex flex-col gap-3 mt-2">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 px-5 py-4 rounded-xl"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.07)',
                            }}
                        >
                            <div className="flex-shrink-0">{feature.icon}</div>
                            <span className="text-white text-sm font-medium">{feature.text}</span>
                        </div>
                    ))}
                </div>

                {/* Launching soon badge */}
                <div
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium mt-1"
                    style={{
                        border: '1px solid rgba(245,166,35,0.5)',
                        color: '#f5a623',
                        background: 'rgba(245,166,35,0.07)',
                    }}
                >
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                        <path
                            d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
                            stroke="#f5a623" strokeWidth="1.5" strokeLinejoin="round"
                        />
                    </svg>
                    Lancement bientôt
                </div>

                {/* CTA Button */}
                <a
                    href={MARIE_CALENDLY_BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-10 py-3.5 rounded-full font-semibold text-white text-sm transition-opacity hover:opacity-90 active:scale-95 inline-block"
                    style={{
                        background: 'linear-gradient(135deg, #f5a623 0%, #e8870a 100%)',
                        boxShadow: '0 4px 20px rgba(245,166,35,0.35)',
                    }}
                >
                    Découvrez les solutions d'entreprise
                </a>
            </div>
        </div>
    );
};

export default Mostcompanies;