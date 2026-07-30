'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import url from '@/redux/api/baseUrl';

const Knowsomeone = () => {
    const [open, setOpen] = useState(false);
    const [friendName, setFriendName] = useState('');
    const [friendEmail, setFriendEmail] = useState('');
    const [senderName, setSenderName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const features = [
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" stroke="#4a9eff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 6l-4-4-4 4" stroke="#4a9eff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 2v13" stroke="#4a9eff" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
            ),
            title: 'Partager',
            description: 'Envoie-lui le bilan gratuit pour l’aider à faire le point.',
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#a0aec0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            title: 'Encourager',
            description: 'Crée un espace où il peut parler, sans pression.',
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <path d="M12 8C10 5 6 5 6 8c0 2 2 4 6 7 4-3 6-5 6-7 0-3-4-3-6 0z" fill="#f5a623" stroke="#f5a623" strokeWidth="1" strokeLinejoin="round" />
                    <path d="M9 3.5C9.5 2.5 10.5 2 12 2s2.5.5 3 1.5" stroke="#f5a623" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M9 20.5C9.5 21.5 10.5 22 12 22s2.5-.5 3-1.5" stroke="#f5a623" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M3.5 9C2.5 9.5 2 10.5 2 12s.5 2.5 1.5 3" stroke="#f5a623" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M20.5 9C21.5 9.5 22 10.5 22 12s-.5 2.5-1.5 3" stroke="#f5a623" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            ),
            title: 'Soutenir',
            description: 'Sois présent, sans chercher à tout résoudre.',
        },
    ];

    const resetForm = () => {
        setFriendName('');
        setFriendEmail('');
        setSenderName('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!friendName.trim() || !friendEmail.trim()) {
            toast.error('Indique le prénom et l’e-mail de ton ami·e.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`${url}/api/v1/recommend-friend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    friendName: friendName.trim(),
                    friendEmail: friendEmail.trim(),
                    senderName: senderName.trim() || undefined,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || data?.success === false) {
                throw new Error(data?.message || 'Impossible d’envoyer l’invitation.');
            }
            toast.success('Invitation envoyée ! Ton ami·e recevra un e-mail avec le lien du bilan gratuit.');
            resetForm();
            setOpen(false);
        } catch (err) {
            toast.error(err?.message || 'Impossible d’envoyer l’invitation.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className=" p-6 lg:py-20 flex items-center justify-center py-10 relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[
                    { top: '8%', left: '6%' }, { top: '12%', right: '12%' },
                    { top: '30%', right: '5%' }, { top: '48%', left: '4%' },
                    { top: '55%', right: '3%' }, { top: '70%', left: '8%' },
                    { top: '85%', right: '8%' }, { top: '92%', left: '3%' },
                ].map((pos, i) => (
                    <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-white opacity-40" style={pos} />
                ))}
            </div>

            <img className='absolute bottom-0 right-0 w-72 lg:block hidden pointer-events-none opacity-90' src="/Images/Home/357D7696-C6E7-40CA-9F3A-A7818B42392F.png" alt="" />

            <div className="relative z-10">
                <div className="text-5xl text-center select-none" style={{ filter: 'drop-shadow(0 0 12px rgba(255,180,0,0.5))' }}>
                    🚀
                </div>

                <div className="text-center my-10 max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold text-white">
                        Connais-tu quelqu&apos;un qui se sent <span style={{ color: '#f5a623' }}>perdu</span> au travail ?
                    </h1>
                    <p className="mt-2" style={{ color: '#8898b8' }}>
                        Parfois, on voit qu’un proche ne va pas bien dans son travail…
                        bien avant qu’il ne mette des mots dessus.
                        Tu peux l’aider, simplement.
                    </p>
                </div>

                <div className="relative w-full max-w-md mx-auto flex flex-col items-center gap-6">
                    <div className="w-full flex flex-col gap-3">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-4 px-5 py-4 rounded-xl bg-red-900/20 border border-red-600/20"
                            >
                                <div className="flex-shrink-0">{feature.icon}</div>
                                <div className="text-white text-sm font-medium leading-snug">
                                    <div>{feature.title}</div>
                                    <div className="font-normal mt-0.5" style={{ color: '#c5d0e6' }}>{feature.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="w-3/4 py-3.5 rounded-md font-semibold text-white text-sm transition-opacity hover:opacity-90 active:scale-95"
                        style={{
                            background: 'linear-gradient(135deg, #f5a623 0%, #e8870a 100%)',
                            boxShadow: '0 4px 20px rgba(245,166,35,0.35)',
                        }}
                    >
                        Envoyez-lui le bilan gratuit
                    </button>
                </div>
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-[#2d2a71]">Envoyer le bilan gratuit</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Ton ami·e recevra un e-mail avec le lien pour créer un compte et commencer.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                                aria-label="Fermer"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <label className="text-sm font-medium text-gray-700">
                                Prénom de ton ami·e *
                                <input
                                    type="text"
                                    value={friendName}
                                    onChange={(e) => setFriendName(e.target.value)}
                                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d2a71]/30"
                                    placeholder="Alex"
                                    required
                                />
                            </label>
                            <label className="text-sm font-medium text-gray-700">
                                E-mail de ton ami·e *
                                <input
                                    type="email"
                                    value={friendEmail}
                                    onChange={(e) => setFriendEmail(e.target.value)}
                                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d2a71]/30"
                                    placeholder="alex@email.com"
                                    required
                                />
                            </label>
                            <label className="text-sm font-medium text-gray-700">
                                Ton prénom (optionnel)
                                <input
                                    type="text"
                                    value={senderName}
                                    onChange={(e) => setSenderName(e.target.value)}
                                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d2a71]/30"
                                    placeholder="Marie"
                                />
                            </label>

                            <div className="flex gap-2 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                                    style={{ background: 'linear-gradient(135deg, #f5a623 0%, #e8870a 100%)' }}
                                >
                                    {submitting ? 'Envoi…' : 'Envoyer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Knowsomeone;
