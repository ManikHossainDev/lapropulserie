'use client';
import React, { useState } from "react";
import { Modal } from "antd";
import "antd/dist/reset.css"; // AntD styles

const Introduction = ({fullModuleCapsuledata}) => {
   
    const [isModalVisible, setIsModalVisible] = useState(false);

    const openModal = () => setIsModalVisible(true);
    const closeModal = () => setIsModalVisible(false);

    return (
        <div className="max-w-5xl mx-auto px-6 py-12">

            {/* Capsule Header */}
            <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-sm px-4 py-1 rounded-full">
                    ⭐ Capsule {fullModuleCapsuledata?.capsuleNumber}
                </div>

                <h1 className="text-3xl font-bold text-indigo-900 mt-6">
                    {fullModuleCapsuledata?.title}
                </h1>

                <p className="text-gray-500 mt-3">
                    {fullModuleCapsuledata?.description}
                </p> 
            </div>

            {/* Video Preview */}
            <div
                className="mt-10 relative rounded-2xl overflow-hidden border-4 border-indigo-200 shadow-sm cursor-pointer"
                onClick={openModal}
            >
                <img
                    src="https://i.ytimg.com/vi/zob-2dpRtH0/maxresdefault.jpg"
                    alt="Video Preview"
                    className="w-full h-[350px] object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-indigo-700/90 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                        ▶
                    </div>
                </div>
            </div>

            {/* Video Modal */}
            <Modal
                open={isModalVisible}
                onCancel={closeModal}
                footer={null}
                width={800}
                centered
                bodyStyle={{ padding: 0 }}
                destroyOnClose
            >
                <div className="relative w-full h-0" style={{ paddingBottom: "56.25%" }}>
                    <iframe
                        src={fullModuleCapsuledata?.introduction?.introVideo?.url}
                        title="Video"
                        className="absolute top-0 left-0 w-full h-full"
                        allowFullScreen
                    ></iframe>
                </div>
            </Modal>

            {/* Example Text Content */}
            <div className="mt-10 text-left">
                <h2 className="text-xl font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                    <span className="text-indigo-100 bg-primary rounded-full h-8 w-8 flex items-center justify-center">✔</span> The Founder’s Vision{" "}
                    {/* <span className="text-sm text-gray-500 ml-2 bg-slate-200 rounded-full py-1 px-2">In Progress</span> */}
                </h2>

                <p className="text-gray-700 ">
                    {fullModuleCapsuledata?.roadMapBrief}
                </p>
                <p className="text-gray-700 leading-relaxed mt-2">
                    {fullModuleCapsuledata?.description}
                </p>
            </div>
        </div>
    );
};

export default Introduction;
