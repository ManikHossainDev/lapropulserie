'use client';
import React, { useState, useEffect } from 'react';
import { Button, Checkbox, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useUpdateInnerFuelMutation } from '@/redux/fetures/Mentors/MentorOnboarding';
import { toast } from 'react-toastify';

const coreValueOptions = [
    'Growth', 'Empathy', 'Creativity', 'Balance',
    'Impact', 'Authenticity', 'Leadership', 'Innovation',
    'Resilience', 'Community', 'Freedom', 'Fun',
];

const specialtyOptions = [
    'Technology', 'Creative & Design', 'Finance & Fintech', 'Marketing & Sales',
    'Education', 'Healthcare', 'E-Commerce',
];

const MAX_SELECT = 5;

const ChipGrid = ({ options, selected, onToggle, max, customItems = [], onAddCustom }) => {
    const [showInput, setShowInput] = useState(false);
    const [inputVal, setInputVal] = useState('');

    const handleAdd = () => {
        const trimmed = inputVal.trim();
        if (trimmed) onAddCustom(trimmed);
        setInputVal('');
        setShowInput(false);
    };

    const allOptions = [...options, ...customItems];

    return (
        <div className="flex flex-wrap gap-2">
            {allOptions.map((item) => {
                const isSelected = selected.includes(item);
                const isDisabled = !isSelected && selected.length >= max;
                return (
                    <div
                        key={item}
                        onClick={() => !isDisabled && onToggle(item)}
                        className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-xs font-medium transition-all select-none
                            ${isSelected
                                ? 'border-indigo-400 bg-indigo-50 text-indigo-800 cursor-pointer'
                                : isDisabled
                                    ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                                    : 'border-gray-200 bg-white text-gray-700 cursor-pointer hover:border-indigo-200'
                            }`}
                    >
                        <Checkbox
                            checked={isSelected}
                            disabled={isDisabled}
                            onChange={() => !isDisabled && onToggle(item)}
                        />
                        {item}
                    </div>
                );
            })}

            {onAddCustom && (
                showInput ? (
                    <Input
                        autoFocus
                        size="small"
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        onPressEnter={handleAdd}
                        onBlur={handleAdd}
                        placeholder="Type & press Enter"
                        style={{ width: 150, borderRadius: 8 }}
                    />
                ) : (
                    <div
                        onClick={() => setShowInput(true)}
                        className="flex items-center gap-1.5 border border-gray-200 bg-white text-gray-500 hover:border-indigo-300 hover:text-indigo-700 rounded-lg px-3 py-2 text-xs font-medium cursor-pointer transition-all"
                    >
                        <PlusOutlined style={{ fontSize: 11 }} />
                        Ajouter
                    </div>
                )
            )}
        </div>
    );
};

const InnerFuelTab = ({ onNext, onBack, initialData }) => {
    const [selectedValues, setSelectedValues] = useState([]);
    const [selectedSpecialties, setSelectedSpecialties] = useState([]);
    const [customSpecialties, setCustomSpecialties] = useState([]);
    const [loading, setLoading] = useState(false);

    const [updateInnerFuel] = useUpdateInnerFuelMutation();

    useEffect(() => {
        if (initialData) {
            setSelectedValues(initialData.coreValues || []);
            setSelectedSpecialties(initialData.specialties || []);
        }
    }, [initialData]);

    const toggle = (setter) => (item) =>
        setter((prev) =>
            prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
        );

    const addCustomSpecialty = (value) => {
        if (!customSpecialties.includes(value)) {
            setCustomSpecialties((prev) => [...prev, value]);
            setSelectedSpecialties((prev) => [...prev, value]);
        }
    };

    const handleSubmit = async () => {
        if (selectedValues.length < MAX_SELECT) {
            toast.warning(`Veuillez sélectionner au moins ${MAX_SELECT} valeurs fondamentales`);
            return;
        }
        if (selectedSpecialties.length < MAX_SELECT) {
            toast.warning(`Veuillez sélectionner au moins ${MAX_SELECT} spécialités`);
            return;
        }

        try {
            setLoading(true);
            const payload = {
                coreValues: selectedValues,
                specialties: selectedSpecialties,
            };

            await updateInnerFuel(payload).unwrap();
            toast.success('Énergie intérieure enregistrée avec succès !');
            onNext(payload);
        } catch (error) {
            console.error('Error saving inner fuel:', error);
            toast.error(error?.data?.message || "Échec de l'enregistrement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-6">

            <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    Valeurs fondamentales{' '}
                    <span className="font-normal text-gray-500">(Sélectionnez {MAX_SELECT})</span>
                    {selectedValues.length > 0 && (
                        <span className="ml-2 text-xs text-indigo-600 font-medium">
                            {selectedValues.length}/{MAX_SELECT} sélectionné(s)
                        </span>
                    )}
                </h3>
                <ChipGrid
                    options={coreValueOptions}
                    selected={selectedValues}
                    onToggle={toggle(setSelectedValues)}
                    max={MAX_SELECT}
                />
            </div>

            <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    Spécialités{' '}
                    <span className="font-normal text-gray-500">(Sélectionnez {MAX_SELECT})</span>
                    {selectedSpecialties.length > 0 && (
                        <span className="ml-2 text-xs text-indigo-600 font-medium">
                            {selectedSpecialties.length}/{MAX_SELECT} sélectionné(s)
                        </span>
                    )}
                </h3>
                <ChipGrid
                    options={specialtyOptions}
                    selected={selectedSpecialties}
                    onToggle={toggle(setSelectedSpecialties)}
                    max={MAX_SELECT}
                    customItems={customSpecialties}
                    onAddCustom={addCustomSpecialty}
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

export default InnerFuelTab;