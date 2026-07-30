'use client';
import React, { useState, useEffect } from 'react';
import { Button, Checkbox, Radio, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useUpdateMissionMutation } from '@/redux/fetures/Mentors/MentorOnboarding';
import { toast } from 'react-toastify';

const careerStages = [
    { value: 'students', label: 'Students & Interns', sub: 'Starting their journey' },
    { value: 'early_career', label: 'Early Career', sub: '0-3 years experience' },
    { value: 'mid_level', label: 'Mid-Level', sub: '3-7 years experience' },
    { value: 'senior', label: 'Senior Leadership', sub: 'Manager, Director, VP' },
    { value: 'executives', label: 'Executives', sub: 'C-Suite, Founders' },
    { value: 'career_pivoters', label: 'Career Pivoters', sub: 'Changing Industries' },
];

const focusAreaOptions = [
    'Career Clarity', 'Leadership', 'Burnout Recovery', 'Salary Negotiation',
    'Personal Branding', 'Startup Growth', 'Imposter Syndrome', 'Technical Skills',
];

const industryOptions = [
    'Technology', 'Creative & Design', 'Finance & Fintech', 'Marketing & Sales',
    'Education', 'Healthcare', 'E-Commerce',
];

const MissionTab = ({ onNext, onBack, initialData }) => {
    const [selectedStages, setSelectedStages] = useState([]);
    const [selectedFocus, setSelectedFocus] = useState([]);
    const [customFocusItems, setCustomFocusItems] = useState([]);
    const [customInput, setCustomInput] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [selectedIndustry, setSelectedIndustry] = useState('');
    const [loading, setLoading] = useState(false);

    const [updateMission] = useUpdateMissionMutation();

    useEffect(() => {
        if (initialData) {
            setSelectedStages(initialData.careerStage || []);
            setSelectedFocus(initialData.focusArea || []);
            setSelectedIndustry(initialData.industry?.[0] || '');
        }
    }, [initialData]);

    const toggleStage = (value) =>
        setSelectedStages((prev) =>
            prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
        );

    const toggleFocus = (value) =>
        setSelectedFocus((prev) =>
            prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]
        );

    const addCustomFocus = () => {
        const trimmed = customInput.trim();
        if (trimmed && !customFocusItems.includes(trimmed)) {
            setCustomFocusItems((prev) => [...prev, trimmed]);
            setSelectedFocus((prev) => [...prev, trimmed]);
        }
        setCustomInput('');
        setShowCustomInput(false);
    };

    const handleSubmit = async () => {
        if (selectedStages.length === 0) {
            toast.warning('Veuillez sélectionner au moins une étape de carrière');
            return;
        }
        if (selectedFocus.length === 0) {
            toast.warning('Veuillez sélectionner au moins un domaine de focus');
            return;
        }
        if (!selectedIndustry) {
            toast.warning('Veuillez sélectionner un secteur');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                careerStage: selectedStages,
                focusArea: selectedFocus,
                industry: [selectedIndustry],
            };

            await updateMission(payload).unwrap();
            toast.success('Mission enregistrée avec succès !');
            onNext(payload);
        } catch (error) {
            console.error('Error saving mission:', error);
            toast.error(error?.data?.message || "Échec de l'enregistrement de la mission");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-7">
            <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    Qui souhaitez-vous accompagner ? <span className="font-normal text-gray-500">(Sélectionnez les étapes de carrière)</span>
                </h3>
                <div className="grid grid-cols-3 gap-3">
                    {careerStages.map((stage) => {
                        const isChecked = selectedStages.includes(stage.value);
                        return (
                            <div
                                key={stage.value}
                                onClick={() => toggleStage(stage.value)}
                                className={`cursor-pointer border rounded-xl p-3 flex items-start gap-2 transition-all
                                    ${isChecked
                                        ? 'border-indigo-400 bg-indigo-50'
                                        : 'border-gray-200 bg-white hover:border-indigo-200'
                                    }`}
                            >
                                <Checkbox checked={isChecked} onChange={() => toggleStage(stage.value)} />
                                <div>
                                    <p className="text-xs font-semibold text-gray-800 leading-tight">{stage.label}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{stage.sub}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    Domaines de focus <span className="font-normal text-gray-500">(Sélectionnez tout ce qui s'applique)</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                    {[...focusAreaOptions, ...customFocusItems].map((area) => {
                        const isSelected = selectedFocus.includes(area);
                        return (
                            <div
                                key={area}
                                onClick={() => toggleFocus(area)}
                                className={`cursor-pointer flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-xs font-medium transition-all
                                    ${isSelected
                                        ? 'border-indigo-400 bg-indigo-50 text-indigo-800'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-200'
                                    }`}
                            >
                                <Checkbox checked={isSelected} onChange={() => toggleFocus(area)} />
                                {area}
                            </div>
                        );
                    })}

                    {showCustomInput ? (
                        <Input
                            autoFocus
                            size="small"
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            onPressEnter={addCustomFocus}
                            onBlur={addCustomFocus}
                            placeholder="Type & press Enter"
                            style={{ width: 160, borderRadius: 8 }}
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowCustomInput(true)}
                            className="flex items-center gap-1 border border-gray-200 bg-white text-gray-500 hover:border-indigo-300 hover:text-indigo-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                        >
                            <PlusOutlined style={{ fontSize: 11 }} />
                            Ajouter
                        </button>
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    Secteur <span className="font-normal text-gray-500">(Sélectionnez le domaine concerné)</span>
                </h3>
                <Radio.Group
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="flex flex-wrap gap-2"
                >
                    {industryOptions.map((industry) => (
                        <Radio
                            key={industry}
                            value={industry}
                            className={`border rounded-full px-4 py-1.5 text-xs font-medium transition-all m-0
                                ${selectedSecteur === industry
                                    ? 'border-indigo-400 bg-indigo-50 text-indigo-800'
                                    : 'border-gray-200 bg-white text-gray-600'
                                }`}
                            style={{ borderRadius: 999 }}
                        >
                            {industry}
                        </Radio>
                    ))}
                </Radio.Group>
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
                    block
                    onClick={handleSubmit}
                    loading={loading}
                    className='bg-primary h-12'
                >
                    Enregistrer et continuer
                </Button>
            </div>

        </div>
    );
};

export default MissionTab;