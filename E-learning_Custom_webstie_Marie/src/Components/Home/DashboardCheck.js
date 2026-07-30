import React from 'react';

const DashboardCheck = () => {
    return (
        <div className='lg:py-20 py-10 '>
            <h2 className='text-3xl text-center py-10 text-white'>Ce que <span className='text-orange-400'> ton bilan </span> révèle vraiment</h2>
            <div className='grid items-center grid-cols-1 lg:grid-cols-2 lg:gap-10 gap-5'>
                <img className='w-full' src="/Images/Home/dashboard_ck.png" alt="" />
                <div className='text-white p-5'>
                    <p className='text-gray-300'>Ce bilan met en lumière ce qui se joue vraiment pour toi aujourd’hui : ton équilibre, ton énergie et les signaux que tu ressens sans toujours les comprendre.</p>
                    <br />
                    <span className='p-4 border-orange-400 rounded-lg bg-orange-500/20 block border my-2'>🎯 Alignement
                        → Ta trajectoire est-elle en phase avec ce qui compte pour toi ?</span>
                    <span className='p-4 border-orange-400 rounded-lg bg-orange-500/20 block border my-2'>⚡ Énergie
                        → Ce qui t’anime… ou t’épuise au quotidien
                    </span>
                    <span className='p-4 border-orange-400 rounded-lg bg-orange-500/20 block border my-2'>🔍 Tensions
                        → Les signaux faibles que tu ressens déjà
                    </span>
                </div>
            </div>
        </div>
    );
}

export default DashboardCheck;
