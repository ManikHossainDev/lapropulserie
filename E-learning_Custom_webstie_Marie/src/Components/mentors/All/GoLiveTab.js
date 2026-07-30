'use client';
import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { CheckCircleFilled, WarningFilled } from '@ant-design/icons';
import { useGetSubscriptionPlansQuery, useSubscribeToPlanMutation, useGoLiveMutation } from '@/redux/fetures/Mentors/MentorOnboarding';
import { toast } from 'react-toastify';

const GoLiveTab = ({ onBack, onComplete, initialData }) => {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    const { data: plansData, isLoading: plansLoading } = useGetSubscriptionPlansQuery();
    const [subscribeToPlan] = useSubscribeToPlanMutation();
    const [goLive] = useGoLiveMutation();

    useEffect(() => {
        if (initialData?.isLive) {
            setSelectedPlan(initialData.subscriptionPlanId || null);
        }
    }, [initialData]);

    const handlePlanSelect = (plan) => {
        const planId = plan._id || plan.id || plan;
        setSelectedPlan(planId);
    };

    const handleSubmit = async () => {
        if (!selectedPlan) {
            toast.warning('Veuillez sélectionner une formule d’abonnement');
            return;
        }

        try {
            setLoading(true);

            await subscribeToPlan({ subscriptionPlanId: selectedPlan }).unwrap();

            await goLive({ isLive: true }).unwrap();

            toast.success('Vous êtes maintenant en ligne ! Votre profil est visible pour les mentorés.');
            onComplete?.();
        } catch (error) {
            console.error('Error going live:', error);
            toast.error(error?.data?.message || 'Échec de la mise en ligne');
        } finally {
            setLoading(false);
        }
    };

    const plans = plansData?.data || [];

    return (
        <div className=" space-y-4">

            <div className="flex gap-3 border border-yellow-200 bg-yellow-50 rounded-xl px-4 py-3">
                <WarningFilled style={{ color: '#f59e0b', fontSize: 18, marginTop: 2, flexShrink: 0 }} />
                <div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">
                        Abonnement requis pour la visibilité
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Pour garantir un mentorat de qualité, tous les mentors doivent disposer d’un abonnement actif.
                        Sans formule, votre profil restera masqué du répertoire, des recommandations et des résultats de recherche.
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {plansLoading ? (
                    <div className="text-center py-8 text-gray-500">Chargement des formules...</div>
                ) : plans.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Aucune formule d’abonnement disponible</div>
                ) : (
                    plans.map((plan) => {
                        const planId = plan._id || plan.id;
                        const isSelected = selectedPlan === planId;
                        return (
                            <div
                                key={planId}
                                onClick={() => handlePlanSelect(plan)}
                                className={`relative cursor-pointer border-2 rounded-2xl p-5 transition-all
                                    ${isSelected
                                        ? 'border-indigo-500 bg-white shadow-md'
                                        : 'border-gray-200 bg-white hover:border-indigo-200'
                                    }`}
                            >
                                {plan.isPopular && (
                                    <span className="absolute -top-3 left-5 bg-red-500 text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                                        Populaire
                                    </span>
                                )}

                                <div className="flex gap-5">
                                    <div className="w-36 flex-shrink-0">
                                        <h3 className="text-lg font-bold text-indigo-800 leading-tight mb-1">
                                            {plan.name}
                                        </h3>
                                        <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                                            {plan.description}
                                        </p>
                                        <div className="flex items-baseline gap-0.5">
                                            <span className="text-2xl font-bold text-gray-900">${plan.price}</span>
                                            <span className="text-xs text-gray-400">/mois</span>
                                        </div>
                                    </div>

                                    <div className="w-px bg-gray-100 self-stretch" />

                                    <div className="flex-1 space-y-2.5 pt-1">
                                        {plan.features?.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <CheckCircleFilled style={{ color: '#3730a3', fontSize: 16 }} />
                                                <span className="text-xs text-gray-700">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="flex gap-3 pt-2">
                {onBack && (
                    <Button
                        onClick={onBack}
                        size="large"
                        block
                        className='bg-primary text-white h-12'
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
                    className='bg-primary text-white h-12'
                >
                    Passer en ligne
                </Button>
            </div>

        </div>
    );
};

export default GoLiveTab;