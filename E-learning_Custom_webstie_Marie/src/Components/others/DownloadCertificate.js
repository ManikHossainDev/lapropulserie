'use client';
import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import moment from "moment";
import { FaArrowDown } from "react-icons/fa";

const DownloadCertificate = () => {
    // ✅ Initialize as null — populated only on client after mount
    const [user, setUser] = useState(null);
    const certificateRef = useRef(null);

    // ✅ localStorage only runs in the browser, never during SSR/prerender
    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
            setUser(JSON.parse(stored));
        }
    }, []);

    const downloadCertificate2 = async () => {
        const element = certificateRef.current;
        if (!element) return;

        const canvas = await html2canvas(element, {
            scale: 3,
            useCORS: true,
        });

        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF({
            orientation: "landscape",
            unit: "px",
            format: [canvas.width, canvas.height],
        });

        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save("certificate.pdf");
    };

    return (
        <>
            <button
                onClick={downloadCertificate2}
                className="customSignUpButton hover:bg-indigo-800 text-white px-5 py-4 rounded-lg text-sm font-medium flex items-center gap-2"
            >
                Download Certificate <FaArrowDown />
            </button>

            <div className="fixed left-[-9999px] top-0">
                <div ref={certificateRef}>
                    <CertificateTemplate userName={user?.name} />
                </div>
            </div>
        </>
    );
};

export default DownloadCertificate;


function CertificateTemplate({ userName }) {
    return (
        <div className="w-[1200px] h-[850px] bg-white flex items-center justify-center p-6">
            <div className="w-full h-full shadow-2xl relative overflow-hidden">
                <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-200 rounded-full blur-3xl opacity-40" />
                <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-40" />

                <div
                    className="w-full h-full p-10 text-center relative bg-center bg-no-repeat bg-cover"
                    style={{ backgroundImage: "url('/Images/Certificate_border.png')" }}
                >
                    <div className="absolute inset-0 bg-white/60" />

                    <div className="relative z-10 m-5">
                        <div className="mb-6">
                            <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center">
                                <img className="w-full" src="/Images/Auth/main_logo.jpg" alt="logo" />
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold text-primary tracking-wide mb-2">
                            Certificate of Achievement
                        </h1>
                        <p className="text-gray-500 mb-8">This certificate is proudly presented to</p>

                        <h2 className="text-5xl mycertificateFont font-semibold text-gray-900 mb-8 border-b-2 border-dashed border-indigo-300 inline-block px-8 pb-2">
                            {userName}
                        </h2>

                        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed mb-10">
                            In recognition of outstanding dedication and successful completion of the program.
                            Your commitment, passion, and effort have demonstrated excellence and perseverance.
                        </p>

                        <div className="flex justify-between items-end mt-20">
                            <div className="text-center">
                                <h3>{moment().format("DD/MM/YYYY")}</h3>
                                <div className="w-40 border-t border-gray-400 mt-4" />
                                <p className="text-sm text-gray-500">Date</p>
                            </div>
                            <div className="text-center">
                                <h3 className="mycertificateFont font-semibold text-3xl text-gray-900">
                                    la~propulserie
                                </h3>
                                <div className="w-48 border-t border-gray-400 mt-4" />
                                <p className="text-sm text-gray-500">Authorized Signature</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}