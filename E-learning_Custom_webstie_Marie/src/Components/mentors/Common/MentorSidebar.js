'use client';

import React, { useState } from 'react';
import { FaChevronRight } from 'react-icons/fa';
import { IoIosLogOut } from 'react-icons/io';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RxCross1 } from 'react-icons/rx';
import { Modal, Button } from 'antd';
import { toast, ToastContainer } from 'react-toastify';

const menuItems = [
    {
        title: 'Tableau de bord',
        desc: 'Vue d’ensemble de votre profil, progression et indicateurs clés',
        icon: '⭐',
        path: '/mentor',
    },
    {
        title: 'Revenus',
        desc: 'Suivez vos gains, paiements et performances financières',
        icon: '💵',
        path: '/mentor/revenue',
    },
    {
        title: 'Portefeuille',
        desc: 'Consultez l’historique des dépôts et des retraits',
        icon: '💳',
        path: '/mentor/wallet',
    },
    {
        title: 'Avis & Notes',
        desc: 'Consultez et répondez aux retours des Propulsés',
        icon: '💎',
        path: '/mentor/reviews',
    },
    {
        title: 'Mon compte',
        desc: 'Profil, préférences et informations personnelles',
        icon: '🤖',
        path: '/mentor/my-account',
    },
    {
        title: 'Paramètres',
        desc: 'FAQ, conditions générales et politique de confidentialité',
        icon: '⚙️',
        path: '/mentor/settings',
    },
];

const MentorSidebar = ({ isOpen, setIsOpen }) => {
    const pathname = usePathname();
    const router = useRouter();

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => {
        setShowLogoutModal(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Déconnexion réussie');
        router.push('/login');
    };

    return (
        <>
            <ToastContainer />
            <div
                className={`lg:flex flex-col lg:sticky top-0 lg:z-0 z-10 bg-[#eaeaf1] h-screen min-w-80 border-r border-gray-300
                ${isOpen ? 'block fixed left-0 top-0' : 'hidden'}`}
            >
                <Link href="/" className="p-4 border-b border-gray-300 relative shrink-0">
                    <img
                        className="w-[120px] mx-auto"
                        src="/Images/Auth/main_logo.jpg"
                        alt="Logo"
                    />
                </Link>

                <div
                    onClick={() => setIsOpen(false)}
                    className="absolute top-3 right-3 cursor-pointer z-10"
                >
                    <RxCross1 className="text-3xl lg:hidden" />
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {menuItems.map((item, index) => {
                        const isActive = pathname === item.path;

                        return (
                            <div
                                key={index}
                                onClick={() => {
                                    router.push(item.path);
                                    setIsOpen(false);
                                }}
                                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition
                                    ${isActive
                                        ? 'bg-white shadow-sm'
                                        : 'hover:bg-white/70'
                                    }`}
                            >
                                <div className="text-xl mt-1">{item.icon}</div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-[#2b124f]">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-gray-600">
                                        {item.desc}
                                    </p>
                                </div>
                                {isActive && (
                                    <FaChevronRight className="text-[#2b124f] mt-1" />
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="shrink-0 border-t border-gray-300 p-4">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="flex items-center gap-3 text-red-500 justify-center font-semibold p-3 w-full rounded-xl bg-white/70 hover:bg-white transition"
                    >
                        Se déconnecter <IoIosLogOut />
                    </button>
                </div>
            </div>

            <Modal
                title="Confirmer la déconnexion"
                open={showLogoutModal}
                onCancel={() => setShowLogoutModal(false)}
                width={400}
                footer={[
                    <Button key="cancel" onClick={() => setShowLogoutModal(false)}>
                        Annuler
                    </Button>,
                    <Button
                        key="logout"
                        danger
                        type="primary"
                        onClick={handleLogout}
                    >
                        Se déconnecter
                    </Button>,
                ]}
            >
                <p>Êtes-vous sûr de vouloir vous déconnecter de votre compte ?</p>
            </Modal>
        </>
    );
};

export default MentorSidebar;
