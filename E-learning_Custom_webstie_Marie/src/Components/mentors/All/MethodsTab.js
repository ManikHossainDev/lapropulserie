'use client';
import React, { useState, useEffect } from 'react';
import { Button, Checkbox, Input, message } from 'antd';
import { useUpdateMethodsMutation } from '@/redux/fetures/Mentors/MentorOnboarding';
import { toast } from 'react-toastify';

const methodologies = [
    {
        value: 'mindful_reflection',
        label: 'Réflexion consciente',
        sub: 'Accent sur la conscience de soi et la croissance intérieure.',
    },
    {
        value: 'action_planning',
        label: 'Plan d’action',
        sub: 'Stratégie orientée objectifs avec des jalons clairs.',
    },
    {
        value: 'basing_thinking',
        label: 'Pensée itérative',
        sub: 'Résolution de problèmes itérative et idéation rapide.',
    },
    {
        value: 'career_mapping',
        label: 'Cartographie de carrière',
        sub: 'Structurer des trajectoires professionnelles à long terme.',
    },
    {
        value: 'scenario_method',
        label: 'Méthode des scénarios',
        sub: 'Guider la découverte par le questionnement critique.',
    },
    {
        value: 'role_playing',
        label: 'Jeux de rôle',
        sub: 'Simuler des situations réelles pour s’entraîner.',
    },
];

const MethodsTab = ({ onNext, onBack, initialData }) => {
    const [selectedMethods, setSelectedMethods] = useState([]);
    const [calendlyLink, setCalendlyLink] = useState('');
    const [loading, setLoading] = useState(false);

    const [updateMethods] = useUpdateMethodsMutation();

    useEffect(() => {
        if (initialData) {
            setSelectedMethods(initialData.coachingMethodologies || []);
            setCalendlyLink(initialData.calendlyProfileLink || '');
        }
    }, [initialData]);

    const toggleMethod = (value) => {
        setSelectedMethods((prev) =>
            prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value]
        );
    };

    const handleSubmit = async () => {
        if (selectedMethods.length === 0) {
            toast.warning('Veuillez sélectionner au moins une méthodologie');
            return;
        }
        if (!calendlyLink) {
            toast.warning('Veuillez saisir votre lien de profil Calendly');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                coachingMethodologies: selectedMethods,
                calendlyProfileLink: calendlyLink,
            };

            await updateMethods(payload).unwrap();
            toast.success('Méthodes enregistrées avec succès !');
            onNext(payload);
        } catch (error) {
            console.error('Error saving methods:', error);
            toast.error(error?.data?.message || "Échec de l'enregistrement des méthodes");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-6">

            <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    Coaching Methodologies
                </h3>
                <div className="grid grid-cols-3 gap-3">
                    {methodologies.map((method) => {
                        const isChecked = selectedMethods.includes(method.value);
                        return (
                            <div
                                key={method.value}
                                onClick={() => toggleMethod(method.value)}
                                className={`cursor-pointer border rounded-xl p-3 flex flex-col gap-2 transition-all
                                    ${isChecked
                                        ? 'border-indigo-400 bg-indigo-50'
                                        : 'border-gray-200 bg-white hover:border-indigo-200'
                                    }`}
                            >
                                <p className="text-xs font-semibold text-gray-800 leading-tight">
                                    {method.label}
                                </p>
                                <div className="flex items-start gap-2">
                                    <Checkbox
                                        checked={isChecked}
                                        onChange={() => toggleMethod(method.value)}
                                        className="mt-0.5 flex-shrink-0"
                                    />
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        {method.sub}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    Lien de profil Calendly
                </h3>
                <Input
                    size="large"
                    className='py-3'
                    value={calendlyLink}
                    onChange={(e) => setCalendlyLink(e.target.value)}
                    placeholder="https://calendly.com/your-link"
                    style={{ borderRadius: '10px' }}
                />
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
                    Enregistrer et continuer
                </Button>
            </div>

        </div>
    );
};

export default MethodsTab;