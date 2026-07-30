import React from 'react';
import { IoIosCheckmarkCircleOutline } from "react-icons/io";


const ExpertGuideMentor = () => {
    return (
        <div className='my-20 lg:my-32 px-4 grid lg:grid-cols-3 gap-5'>
            <div className='lg:col-span-2'>
                <div>
                    <h2 className="text-2xl lg:text-3xl font-semibold text-primary">
                        Si vous êtes un guide expert, devenez alors un Cosmic <span className='text-orange-500'>Mentor</span>
                    </h2>
                    <p className="mt-4 text-gray-700 ">
                        Illuminez les chemins professionnels et guidez les explorateurs en rejoignant notre constellation de mentors. Si vous avez navigué votre propre univers de carrière, aidez les autres à tracer leur parcours parmi les étoiles. Voyagez avec un but:
                    </p>
                </div>
                <div className='my-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                    {
                        [1, 2, 3, 4, 5, 6].map((item, index) =>
                            <div className='flex gap-3 p-3'>
                                <IoIosCheckmarkCircleOutline className='text-3xl' />
                                <div>
                                    <h2 className='mb-2 font-medium'>Impact Significatif</h2>
                                    <p className='text-gray-500'>Éclairez le chemin pour les professionnels qui cherchent une direction.</p>
                                </div>
                            </div>
                        )
                    }
                </div>

                <button className='px-10 customSignUpButton py-4 rounded-lg text-white'>Commencez votre parcours de mentorat</button>

            </div>
            <div className='lg:col-span-1'>
                <img className='w-full' src="/Images/Home/Others/avatar.png" alt="" />
            </div>
        </div>
    );
}

export default ExpertGuideMentor;

