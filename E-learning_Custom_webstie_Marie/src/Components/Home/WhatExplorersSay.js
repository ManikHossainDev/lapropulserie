
import React from 'react';

const WhatExplorersSay = () => {
    return (
        <div className='lg:py-20 py-10'>
            <h2 className='text-3xl text-center font-semibold py-10 text-white'>Trois courts <span className='text-orange-400'>témoignages</span> </h2>
            <div className='text-gray-300 grid sm:grid-cols-2 lg:grid-cols-3 justify-center gap-5 my-10'>
                <div className="text-white border p-10 border-orange-300 rounded-xl bg-gradient-to-b from-orange-400/20 to-black/20">
                    <span className='text-5xl'>💎</span>
                    <p className='text-gray-400 my-5'>&quot;Je n&apos;étais pas épuisé. J&apos;étais mal aligné. Le bilan professionnel gratuit l&apos;a rendu évident.&quot;</p>
                    <p className='text-orange-400'>— Responsable Marketing</p>
                </div>
                <div className="text-white border p-10 border-orange-300 rounded-xl bg-gradient-to-b from-orange-400/20 to-black/20">
                    <span className='text-5xl'>🌍</span>
                    <p className='text-gray-400 my-5'>&quot;Le Parcours Exploration m&apos;a aidé à comprendre ce que j&apos;apprécie vraiment au travail.&quot;</p>
                    <p className='text-orange-400'>— Designer Produit</p>
                </div>
                <div className="text-white border p-10 border-orange-300 rounded-xl bg-gradient-to-b from-orange-400/20 to-black/20">
                    <span className='text-5xl'>🚀</span>
                    <p className='text-gray-400 my-5'>&quot;Enfin, un outil qui ne me pousse pas à quitter, mais m&apos;aide à comprendre.&quot;</p>
                    <p className='text-orange-400'>— Ingénieur Logiciel</p>
                </div>

            </div>
        </div>
    );
}

export default WhatExplorersSay;
