'use client'
import React from "react";
import {
  FaUserPlus,
  FaRoute,
  FaGraduationCap,
} from "react-icons/fa";
import {
  HiOutlineMap,
  HiOutlineUsers,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";
import { MdOutlineDocumentScanner } from "react-icons/md";


const steps = [
  {
    title: "Faire le point",
    desc: "Réponds à quelques questions pour comprendre où tu en es aujourd’hui",
    icon: MdOutlineDocumentScanner,
  },
  {
    title: "Mettre des mots",
    desc: " Identifie ce qui t’anime… et ce qui te freine réellement ",
    icon: HiOutlineChatBubbleLeftRight,
  },
  {
    title: "Explorer",
    desc: " Avance à ton rythme à travers un parcours guidé pour clarifier ta direction",
    icon: HiOutlineMap,
  },
  {
    title: "Mentor (optionnel)",
    desc: " Prends du recul avec un professionnel",
    icon: HiOutlineUsers,
  },
  {
    title: "Décider",
    desc: " Avance avec plus de clarté et des choix qui te ressemblent",
    icon: FaRoute,
  },
];

const YourPathThrough = () => {
  return (
    <section className="my-20 lg:my-32 px-4">
      {/* Heading */}
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-4xl lg:text-5xl font-semibold text-white">
          Ton voyage en<span className="text-orange-400"> 5 étapes</span>
        </h2>
        <p className="mt-4 text-gray-300 font-medium">
          En quelques étapes, tu passes de la confusion à une vision plus claire de ta situation.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative mt-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center relative">
                {/* Icon Circle */}
                <div className="mx-auto w-20 h-20 rounded-full border bg-primary shadow-[0_0_15px_#2d2a71]  flex items-center justify-center  relative z-10">
                  <Icon className="text-orange-400 text-3xl" />
                </div>

                {/* Content */}
                <h4 className="mt-6 font-semibold text-xl text-white">
                  {step.title}
                </h4>
                <p className="mt-3 text-sm text-gray-300 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default YourPathThrough;
