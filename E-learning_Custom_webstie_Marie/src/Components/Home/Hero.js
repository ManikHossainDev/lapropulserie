import React from "react";
import Link from "next/link";

const SIGNUP_PARTICULIER = "/signup?role=student";

const Hero = () => {
    return (
        <div className="h-screen w-full container mx-auto bg-no-repeat bg-cover bg-center pt-20 grid grid-cols-1 xl:grid-cols-2 items-center gap-10 px-5 2xl:px-0 ">
            <div>
                <h2 className="text-6xl  text-white">(Re)trouver  <span className="text-orange-500">du sens</span> au travail</h2>
                <p className="text-white  my-8">Parce que personne ne vous a jamais appris à vraiment vous connaître</p>
                <div className=" flex flex-wrap gap-5">
                    <Link
                        href={SIGNUP_PARTICULIER}
                        className="lg:px-8 px-2 py-4 text-[#ffffff] bg-orange-500 font-semibold rounded-lg inline-block"
                    >
                        Commencer mon bilan gratuit
                    </Link>
                </div>
                <p className="mt-5 text-white font-semibold">Gratuit • 15 minutes • Sans engagement</p>
            </div>
            <div className="lg:flex items-start justify-center hidden ">
                <img className="w-60 2xl:min-w-[400px]" src="/Images/Home/Hero/DE9B4924-92E4-4E93-A2B2-8DADDA025DC5.png" alt="" />
                <img className="w-60 2xl:min-w-[450px]" src="/Images/Home/Hero/hero_position_top.png" alt="" />
            </div>
        </div>
    );
};

export default Hero;
