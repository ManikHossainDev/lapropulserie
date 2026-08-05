'use client';
import React, { useState } from 'react';
import { Button } from 'antd';
import { CheckCircleFilled, ClockCircleFilled } from '@ant-design/icons';
import { useRequestAdminApprovalMutation } from '@/redux/fetures/Mentors/MentorOnboarding';
import { toast } from 'react-toastify';

/**
 * Step 5 of mentor onboarding (#43):
 * Request admin validation — do NOT subscribe / set isLive here.
 * Subscription / go-live stays separate (see #40 / post-approval).
 */
const GoLiveTab = ({ onBack, onComplete, initialData }) => {
    const [loading, setLoading] = useState(false);
    const [requestAdminApproval] = useRequestAdminApprovalMutation();

    const approvalStatus = initialData?.approvalStatus || 'none';
    const alreadyRequested = ['inRequest', 'interviewScheduled', 'approved'].includes(
        approvalStatus
    );

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await requestAdminApproval().unwrap();
            toast.success(
                'Demande envoyée. Ton profil est en attente de validation par l’équipe.'
            );
            onComplete?.();
        } catch (error) {
            console.error('Error requesting approval:', error);
            toast.error(
                error?.data?.message ||
                    'Impossible d’envoyer la demande de validation'
            );
        } finally {
            setLoading(false);
        }
    };

    if (alreadyRequested) {
        const isApproved = approvalStatus === 'approved';
        return (
            <div className="space-y-4">
                <div className="flex gap-3 border border-indigo-200 bg-indigo-50 rounded-xl px-4 py-4">
                    {isApproved ? (
                        <CheckCircleFilled
                            style={{ color: '#3730a3', fontSize: 20, marginTop: 2, flexShrink: 0 }}
                        />
                    ) : (
                        <ClockCircleFilled
                            style={{ color: '#f59e0b', fontSize: 20, marginTop: 2, flexShrink: 0 }}
                        />
                    )}
                    <div>
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                            {isApproved
                                ? 'Profil validé'
                                : 'Demande en attente de validation'}
                        </p>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            {isApproved
                                ? 'Ton profil mentor a été approuvé par l’équipe.'
                                : 'Nous avons bien reçu ta demande. L’équipe La Propulserie va l’examiner. Tu seras informé(e) dès qu’une décision sera prise.'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    {onBack && (
                        <Button
                            onClick={onBack}
                            size="large"
                            block
                            className="bg-primary text-white h-12"
                        >
                            Retour
                        </Button>
                    )}
                    <Button
                        type="primary"
                        size="large"
                        onClick={() => onComplete?.()}
                        block
                        className="bg-primary text-white h-12"
                    >
                        Continuer vers mon espace
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-3 border border-indigo-200 bg-indigo-50 rounded-xl px-4 py-4">
                <ClockCircleFilled
                    style={{ color: '#3730a3', fontSize: 18, marginTop: 2, flexShrink: 0 }}
                />
                <div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">
                        Dernière étape : demander la validation
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Vérifie que les étapes 1 à 4 sont complètes, puis envoie ta demande.
                        Ton profil apparaîtra ensuite « en attente de validation » côté
                        administration. Tu ne seras visible des mentorés qu’après approbation.
                    </p>
                </div>
            </div>

            <ul className="text-xs text-gray-600 space-y-2 px-1">
                <li className="flex items-start gap-2">
                    <CheckCircleFilled style={{ color: '#3730a3', fontSize: 14, marginTop: 2 }} />
                    <span>Informations de base, mission, valeurs et méthodes enregistrées</span>
                </li>
                <li className="flex items-start gap-2">
                    <CheckCircleFilled style={{ color: '#3730a3', fontSize: 14, marginTop: 2 }} />
                    <span>Lien Calendly renseigné pour les sessions</span>
                </li>
                <li className="flex items-start gap-2">
                    <CheckCircleFilled style={{ color: '#3730a3', fontSize: 14, marginTop: 2 }} />
                    <span>Validation manuelle par un administrateur (pas de paiement à cette étape)</span>
                </li>
            </ul>

            <div className="flex gap-3 pt-2">
                {onBack && (
                    <Button
                        onClick={onBack}
                        size="large"
                        block
                        className="bg-primary text-white h-12"
                    >
                        Retour
                    </Button>
                )}
                <Button
                    type="primary"
                    size="large"
                    onClick={handleSubmit}
                    block
                    loading={loading}
                    className="bg-primary text-white h-12"
                >
                    Demander la validation
                </Button>
            </div>
        </div>
    );
};

export default GoLiveTab;
