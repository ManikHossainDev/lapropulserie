// import Link from 'next/link';
// import React from 'react';

// const Footer = () => {
//     const columns = [
//         {
//             heading: 'La Propulserie',
//             links: ['Dashboard Check gratuit', 'Parcours d\'expédition', 'Rencontrer un mentor', 'Passer à l\'action'],
//         },
//         {
//             heading: 'Solutions',
//             links: ['Pour les particuliers', 'Pour les entreprises'],
//         },
//         {
//             heading: 'Écosystème',
//             links: ['Les Explorateurs', 'Les Promoteurs', 'Les Mentors', 'Les Promoteurs'],
//         },
//         {
//             heading: 'Pour les Mentors',
//             links: ['Devenir mentor', 'Processus de candidature'],
//         },
//         {
//             heading: 'À propos',
//             links: ['L\'approche', 'Comment ça marche', 'Contact'],
//         },
//         {
//             heading: 'Légal',
//             links: ['Conditions d\'utilisation', 'Politique de confidentialité', 'Politique relative aux cookies', 'Avis légal'],
//         },
//     ];

//     return (
//         <div className="bg-gradient-to-b from-black to-black">
//             <footer className="container mx-auto text-white">

//                 {/* Top bar: logo + tagline */}
//                 <div className="flex flex-wrap items-center justify-between px-12 pt-9 pb-7 gap-3">
//                     <div className="leading-tight">
//                         <img className='w-32' src="/Images/Auth/main_logo.jpg" alt="" />
//                     </div>
//                     <p className="text-xs text-slate-400 m-0">
//                         Matkasi ammattimaiseen oikomishoitoon alkaa tästä
//                     </p>
//                 </div>

//                 {/* Divider */}
//                 <div className="mx-12 border-t border-white/10" />

//                 {/* Link columns */}
//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 px-12 py-10">
//                     {columns.map((col, i) => (
//                         <div key={i}>
//                             <h3 className="text-xs font-semibold text-amber-400 mb-4 tracking-wide">
//                                 {col.heading}
//                             </h3>
//                             <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
//                                 {col.links.map((link, j) => (
//                                     <li key={j}>
//                                         <Link
//                                             href="#"
//                                             className="text-xs text-gray-300 no-underline hover:text-white transition-colors duration-200"
//                                         >
//                                             {link}
//                                         </Link>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                     ))}
//                 </div>

//                 {/* Bottom divider */}
//                 <div className="mx-12 border-t border-white/10" />

//                 {/* Copyright */}
//                 <div className="px-12 py-5 text-center">
//                     <p className="text-xs text-slate-400 m-0">
//                         © 2026 La Propulserie.{' '}
//                         <span className="text-amber-400">★</span>
//                         {' '}Tous droits réservés.
//                     </p>
//                 </div>

//             </footer>
//         </div>
//     );
// };

// export default Footer;


'use client';

import Link from 'next/link';
import React from 'react';
import { openCookiePreferences } from '@/Components/Common/CookieConsentBanner';

const Footer = () => {
    const columns = [
        {
            heading: 'La Propulserie',
            links: [
                { label: 'Check de bord gratuit', href: '#' },
                { label: "Parcours d'exploration", href: '#' },
                { label: 'Rencontrer un mentor', href: '#for-mentors' },
                { label: 'Trouver un accompagnement', href: '#' },
            ],
        },
        {
            heading: 'Solutions',
            links: [
                { label: 'Pour les explorateurs', href: '#' },
                { label: 'Pour les entreprises', href: '#for-companies' },
            ],
        },
        {
            heading: 'Écosystème',
            links: [
                { label: 'Les Explorateurs', href: '#' },
                { label: 'Les Propulseurs', href: '#' },
                { label: 'Les Mentors', href: '#for-mentors' },
            ],
        },
        {
            heading: 'Pour les Mentors',
            links: [
                { label: 'Devenir mentor', href: '#for-mentors' },
                { label: 'Processus de candidature', href: '#for-mentors' },
            ],
        },
        {
            heading: 'À propos',
            links: [
                { label: "L'approche", href: '#' },
                { label: 'Découvrir le fonctionnement', href: '#' },
                { label: 'Contact', href: '#' },
            ],
        },
        {
            heading: 'Légal',
            links: [
                { label: "Conditions générales d'utilisation (CGU)", href: '/legal/cgu' },
                { label: 'Conditions générales de vente – Mentors (CGV)', href: '/legal/cgv-mentors' },
                { label: 'Politique de confidentialité', href: '/legal/politique-de-confidentialite' },
                { label: 'Politique des cookies', href: '/legal/politique-des-cookies' },
                { label: 'Gérer les cookies', href: '#cookies', action: 'cookies' },
                { label: 'Mentions légales', href: '/legal/mentions-legales' },
            ],
        },
    ];

    return (
        <div className="bg-gradient-to-b from-black to-black">
            <footer className="container mx-auto text-white">

                {/* Top bar: logo + tagline */}
                <div className="flex flex-wrap items-center justify-between px-12 pt-10 pb-8 gap-4">
                    <div className="leading-tight">
                        <img
                            className="w-32"
                            src="/Images/Auth/main_logo.jpg"
                            alt="La Propulserie"
                        />
                    </div>
                    <p className="text-xs text-slate-400 m-0 italic">
                        Votre chemin vers un alignement professionnel commence ici
                    </p>
                </div>

                {/* Divider */}
                <div className="mx-12 border-t border-white/10" />

                {/* Link columns */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-6 gap-y-10 px-12 py-12">
                    {columns.map((col, i) => (
                        <div key={i} className="flex flex-col">
                            <h3 className="text-xs font-semibold text-amber-400 mb-5 tracking-widest uppercase">
                                {col.heading}
                            </h3>
                            <ul className="flex flex-col gap-3 list-none p-0 m-0">
                                {col.links.map((link, j) => (
                                    <li key={j}>
                                        {link.action === 'cookies' ? (
                                            <button
                                                type="button"
                                                onClick={openCookiePreferences}
                                                className="text-xs text-gray-400 hover:text-white transition-colors duration-200 leading-relaxed text-left"
                                            >
                                                {link.label}
                                            </button>
                                        ) : (
                                            <Link
                                                href={link.href}
                                                className="text-xs text-gray-400 no-underline hover:text-white transition-colors duration-200 leading-relaxed"
                                            >
                                                {link.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom divider */}
                <div className="mx-12 border-t border-white/10" />

                {/* Copyright */}
                <div className="px-12 py-6 text-center">
                    <p className="text-xs text-slate-400 m-0">
                        © 2026 La Propulserie.{' '}
                        <span className="text-amber-400">★</span>
                        {' '}Tous droits réservés.
                    </p>
                </div>

            </footer>
        </div>
    );
};

export default Footer;