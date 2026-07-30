import Link from "next/link";
import React from "react";

const Page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f3ff] to-[#efeafe] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-sm p-10">

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center overflow-hidden">
            <img
              className="w-14 h-14 object-contain"
              src="/Images/StudentsDash/explorationJourney_cartoon.png"
              alt="Luna"
            />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-indigo-900">
          Le Parcours Exploration
        </h1>

        <p className="text-center text-indigo-500 mt-3 font-medium">
          Un voyage guidé pour retrouver du sens, de la clarté et une direction qui te correspond vraiment
        </p>

        <p className="text-center text-gray-600 mt-6 leading-relaxed max-w-4xl mx-auto">
          <span className="font-semibold text-primary">
            Le Parcours Exploration
          </span>{" "}
          est une expérience guidée, en plusieurs étapes, conçue pour t&apos;aider
          à mieux te comprendre, clarifier ce qui te freine aujourd&apos;hui,
          et réaligner ta trajectoire professionnelle.
        </p>

        <p className="text-center text-gray-600 mt-4 leading-relaxed max-w-4xl mx-auto">
          À travers une série de capsules mêlant introspection, science et exercices pratiques, tu
          avances pas à pas dans ton exploration intérieure, accompagné(e) par Luna.
        </p>

        <div className="mt-10">
          <p className="text-gray-700 mb-6">À travers plusieurs capsules, tu obtiendras :</p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Une compréhension plus claire de tes valeurs et de tes moteurs",
              "Un sens plus fort de ta direction professionnelle",
              "Des outils concrets pour passer à l'action",
              "Un certificat d'achèvement final",
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm">
                  ✓
                </div>
                <p className="text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-500 text-sm mt-8 text-center max-w-3xl mx-auto">
          Chaque capsule représente une étape du parcours.
          Elles suivent un ordre précis, conçu pour te guider progressivement sans te submerger.
        </p>

        <div className="mt-10 border border-indigo-200 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 bg-indigo-50/40">

          <div>
            <p className="text-gray-700 mb-4">
              <span className="italic font-medium">Luna</span> sera présente tout au long du parcours pour :
            </p>

            <div className="space-y-3">
              {[
                "Te guider tout au long de ton exploration",
                "T'encourager et te rassurer",
                "Te fournir des analyses personnalisées à partir de tes réponses",
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                    ✓
                  </div>
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-60 h-60 rounded-full flex items-center justify-center overflow-hidden bg-white/60">
            <img
              className="w-full h-full object-contain"
              src="/Images/StudentsDash/explorationJourney_cartoon.png"
              alt="Luna"
            />
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <Link href="/students/exploration-journey/capsule-journey" className="bg-blue-950 hover:opacity-90 text-white px-8 py-3 rounded-xl font-medium shadow-md transition">
            Commencer le Parcours Exploration →
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Page;
