'use client';
import React, { useState } from "react";
import { Modal } from "antd";
import "antd/dist/reset.css"; // AntD styles
import { FaChevronDown } from "react-icons/fa";
import moment from "moment";

const modules = [
    {
        title: "The Founder’s Vision",
        status: "In Progress",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        previewImage: "https://t3.ftcdn.net/jpg/11/02/73/30/360_F_1102733023_gxNqjAZ7rsCLu4aU6rNJZKg3kcUPibHo.jpg",
        duration: "45 mins",
        content: `Welcome to the Launch Base. Here we begin our journey into the depth
        of your career meaning and personal development.
        This journey is iterative. We will excavate the foundational "why"
        beneath your professional pursuits, bringing into focus the values
        that give your work weight and direction. We will identify the patterns
        — both empowering and limiting — that have shaped your path thus far.
        From this place of clarity, we will architect a vision that resonates
        not just with your ambition, but with your authentic self.`
    },
    {
        title: "The Founder’s Vision",
        status: "In Progress",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        previewImage: "https://t3.ftcdn.net/jpg/11/02/73/30/360_F_1102733023_gxNqjAZ7rsCLu4aU6rNJZKg3kcUPibHo.jpg",
        duration: "45 mins",
        content: `Welcome to the Launch Base. Here we begin our journey into the depth
        of your career meaning and personal development.
        This journey is iterative. We will excavate the foundational "why"
        beneath your professional pursuits, bringing into focus the values
        that give your work weight and direction. We will identify the patterns
        — both empowering and limiting — that have shaped your path thus far.
        From this place of clarity, we will architect a vision that resonates
        not just with your ambition, but with your authentic self.`
    },
    {
        title: "The Founder’s Vision",
        status: "Completed",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        previewImage: "https://t3.ftcdn.net/jpg/11/02/73/30/360_F_1102733023_gxNqjAZ7rsCLu4aU6rNJZKg3kcUPibHo.jpg",
        duration: "45 mins",
        content: `Welcome to the Launch Base. Here we begin our journey into the depth
        of your career meaning and personal development.
        This journey is iterative. We will excavate the foundational "why"
        beneath your professional pursuits, bringing into focus the values
        that give your work weight and direction. We will identify the patterns
        — both empowering and limiting — that have shaped your path thus far.
        From this place of clarity, we will architect a vision that resonates
        not just with your ambition, but with your authentic self.`
    },
    {
        title: "The Founder’s Vision",
        status: "Completed",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        previewImage: "https://t3.ftcdn.net/jpg/11/02/73/30/360_F_1102733023_gxNqjAZ7rsCLu4aU6rNJZKg3kcUPibHo.jpg",
        duration: "45 mins",
        content: `Welcome to the Launch Base. Here we begin our journey into the depth
        of your career meaning and personal development.
        This journey is iterative. We will excavate the foundational "why"
        beneath your professional pursuits, bringing into focus the values
        that give your work weight and direction. We will identify the patterns
        — both empowering and limiting — that have shaped your path thus far.
        From this place of clarity, we will architect a vision that resonates
        not just with your ambition, but with your authentic self.`
    },
];

const Inspiration = ({ fullModuleVideodata }) => {

    console.log(fullModuleVideodata)

    const [activeModuleIndex, setActiveModuleIndex] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentVideo, setCurrentVideo] = useState("");

    const toggleModule = (index) => {
        setActiveModuleIndex(activeModuleIndex === index ? null : index);
    };

    const openModal = (videoUrl) => {
        setCurrentVideo(videoUrl);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setCurrentVideo("");
    };

    return (
        <div className="mx-auto  py-10">

            <h1 className="text-3xl font-semibold mb-6 text-left">Inspiration</h1>

            {fullModuleVideodata?.map((mod, index) => (
                <div key={index} className="mb-6 border rounded-xl overflow-hidden shadow-sm">
                    {/* Module Header */}
                    <div
                        className="flex justify-between items-center p-4 cursor-pointer bg-gray-100 hover:bg-gray-200"
                        onClick={() => toggleModule(index)}
                    >
                        <div className="text-left">
                            <h2 className="text-lg font-semibold flex items-center text-left justify-start gap-2"><FaChevronDown /> {mod.title}</h2>
                            {
                                mod.status === "Completed" && (
                                    <span className="text-sm ml-6 text-left text-green-500 font-semibold">Completed</span>
                                )
                            }
                        </div>
                        <span className="text-sm text-gray-500">{moment.utc(mod?.moduleVideo?.duration * 1000 * 60).format('mm:ss')} Min</span>
                    </div>

                    {/* Module Content */}
                    {activeModuleIndex === index && (
                        <div className="p-4 space-y-4 text-left">
                            <p className="text-gray-700">{mod?.description}</p>

                            {/* Video Preview */}
                            <div
                                className="relative cursor-pointer rounded-lg overflow-hidden border shadow-sm"
                                onClick={() => openModal(mod?.moduleVideo?.url)}
                            >
                                <img
                                    src={'https://i.ytimg.com/vi/zob-2dpRtH0/maxresdefault.jpg'}
                                    alt="Video Preview"
                                    className="w-full h-[250px] object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-indigo-700/90 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                                        ▶
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}

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
                        src={currentVideo}
                        title="Video"
                        className="absolute top-0 left-0 w-full h-full"
                        allowFullScreen
                    ></iframe>
                </div>
            </Modal>
        </div>
    );
};

export default Inspiration;
