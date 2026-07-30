// import React from 'react';

// const YourExploration = () => {
//     return (
//         <div className='lg:py-20 py-10 relative'>
//             <h2 className='text-4xl font-semibold text-white text-center mb-10'>Approfondissez votre <span className='text-orange-400'>exploration</span></h2>
//             <div className='max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5'>
//                 <div className='bg-blue-950/25 p-5 rounded-lg border border-orange-400/20'>
//                     <h1 className='text-xl font-semibold text-white'>Parcours exploration complet:
//                     </h1>
//                     <p className='my-3 text-white text-sm'>Un parcours guidé en 5 capsules pour prendre du recul, clarifier tes envies et mieux comprendre ce qui se joue pour toi aujourd’hui.
//                         Chaque étape t’aide à avancer progressivement, avec une synthèse à chaque phase.
//                     </p>
//                     <p className='text-gray-300 mt-5 flex items-center gap-2'><span className='h-1.5 w-1.5 rounded-full inline-block bg-orange-400'></span>5 capsules structurées
//                     </p>
//                     <p className='text-gray-300 mt-5 flex items-center gap-2'><span className='h-1.5 w-1.5 rounded-full inline-block bg-orange-400'></span>réflexion guidée
//                     </p>
//                     <p className='text-gray-300 mt-5 flex items-center gap-2'><span className='h-1.5 w-1.5 rounded-full inline-block bg-orange-400'></span>synthèses personnalisées
//                     </p>
//                     <p className='text-gray-300 mt-5 flex items-center gap-2'><span className='h-1.5 w-1.5 rounded-full inline-block bg-orange-400'></span>progression étape par étape
//                     </p>
//                     <button className='p-2 rounded w-full text-center bg-orange-400 text-white mt-3'>🔍 Découvrir le parcours</button>
//                 </div>
//                 <div className='bg-blue-950/25 p-5 rounded-lg border border-orange-400/20'>
//                     <h1 className='text-xl font-semibold text-white'>Capsules à l’unité </h1>
//                     <p className='my-3 text-white text-sm'>Besoin d’avancer sur un point précis ?
//                         Accède à des capsules thématiques pour travailler une problématique spécifique.
//                         À ton rythme, selon tes besoins.
//                     </p>
//                     <p className='text-gray-300 mt-5 flex items-center gap-2'><span className='h-1.5 w-1.5 rounded-full inline-block bg-orange-400'></span>retrouver du sens
//                     </p>
//                     <p className='text-gray-300 mt-5 flex items-center gap-2'><span className='h-1.5 w-1.5 rounded-full inline-block bg-orange-400'></span>gérer un doute
//                     </p>
//                     <p className='text-gray-300 mt-5 flex items-center gap-2'><span className='h-1.5 w-1.5 rounded-full inline-block bg-orange-400'></span>clarifier une envie de changement

//                     </p>

//                     <button className='p-2 rounded w-full text-center bg-orange-400 text-white mt-3'>🎯 Explorer les capsules</button>
//                 </div>
//             </div>
//             <img className='absolute bottom-0 right-0 w-60 lg:block hidden' src="/Images/Home/4648654D-4885-4FF7-BCED-519D37E225EB.png" alt="" />
//         </div>
//     );
// }

// export default YourExploration;



import React from 'react';

const YourExploration = () => {
    return (
        <div className='lg:py-20 py-10 relative'>
            <img className='absolute bottom-0 right-0 w-60 lg:block hidden z-0' src="/Images/Home/4648654D-4885-4FF7-BCED-519D37E225EB.png" alt="" />

            <div className='relative z-10'>
                <h2 className='text-4xl font-semibold text-white text-center mb-10'>
                    Explore de nouveaux <span className='text-orange-400'>horizons</span>
                </h2>

                <div className='xl:max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5'>
                    <div className='bg-blue-950/25 p-5 rounded-lg border border-orange-400/20 flex flex-col justify-between'>
                        <div>
                            <h1 className='text-xl font-semibold text-white'>Parcours exploration complet</h1>
                            <p className='my-3 text-white text-sm'>
                                Un parcours guidé en 5 capsules pour prendre du recul, clarifier tes envies et mieux comprendre
                                ce qui se joue pour toi aujourd'hui. Chaque étape t'aide à avancer progressivement, avec une
                                synthèse à chaque phase.
                            </p>
                        </div>
                        <div>
                            <p className='text-gray-300 mt-5 flex items-center gap-2'><span className='h-1.5 w-1.5 rounded-full inline-block bg-orange-400'></span>5 capsules structurées</p>
                            <p className='text-gray-300 mt-5 flex items-center gap-2'><span className='h-1.5 w-1.5 rounded-full inline-block bg-orange-400'></span>réflexion guidée</p>
                            <p className='text-gray-300 mt-5 flex items-center gap-2'><span className='h-1.5 w-1.5 rounded-full inline-block bg-orange-400'></span>synthèses personnalisées</p>
                            <p className='text-gray-300 mt-5 flex items-center gap-2'><span className='h-1.5 w-1.5 rounded-full inline-block bg-orange-400'></span>progression étape par étape</p>

                        </div>

                        <button className='p-2 rounded w-full text-center bg-orange-400 text-white mt-3'>🔍 Découvrir le parcours</button>
                    </div>

                    <div className='bg-blue-950/25 p-5 rounded-lg border border-orange-400/20 flex flex-col justify-between'>
                        <div>
                            <h1 className='text-xl font-semibold text-white'>Capsules à l'unité</h1>
                            <p className='my-3 text-white text-sm'>
                                Besoin d'avancer sur un point précis ? Accède à des capsules thématiques pour travailler une
                                problématique spécifique. À ton rythme, selon tes besoins.
                            </p>
                        </div>
                        <div>
                            <p className='text-gray-300 mt-5 flex items-center gap-2'><span className='h-1.5 w-1.5 rounded-full inline-block bg-orange-400'></span>retrouver du sens</p>
                            <p className='text-gray-300 mt-5 flex items-center gap-2'><span className='h-1.5 w-1.5 rounded-full inline-block bg-orange-400'></span>gérer un doute</p>
                            <p className='text-gray-300 mt-5 flex items-center gap-2'><span className='h-1.5 w-1.5 rounded-full inline-block bg-orange-400'></span>clarifier une envie de changement</p>
                        </div>
                        <button className='p-2 rounded w-full text-center bg-orange-400 text-white mt-3'>🎯 Explorer les capsules</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default YourExploration;