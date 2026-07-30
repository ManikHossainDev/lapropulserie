import React from 'react';

const AlignmentFramework = () => {
    return (
        <div className='lg:py-20 py-10 text-center relative'>
            <div className='lg:px-20  md:w-3/4 mx-auto'>
                <h2 className='text-4xl font-semibold text-white'>Une approche <span className='text-orange-400 '> construite sur le réel </span></h2>
                <p className='my-10 text-gray-300'>Derrière chaque parcours, il y a des trajectoires, des doutes, des déclics.
                    Cette méthode s’appuie sur des années d’expérience en ressources humaines,
                    mais surtout sur l’observation de situations concrètes :
                    baisse d’engagement, perte de repères, envies de changement…
                    Elle combine un diagnostic structuré, des phases d’exploration guidées
                    et une restitution claire pour t’aider à comprendre ce qui se joue…
                    et avancer avec plus de justesse. </p>
                <span className='p-4 border-orange-400 rounded-lg bg-orange-500/20 block border  max-w-[700px] mx-auto text-orange-400 font-semibold'>Une méthode issue de 15 ans d’expérience RH, construite à partir de situations professionnelles réelles.
                </span>
            </div>

            <img className='absolute bottom-0 right-0 w-60 lg:block hidden' src="/Images/Home/A0154B82-8401-4046-9DCA-94370259980F.png" alt="" />
        </div>
    );
}

export default AlignmentFramework;
