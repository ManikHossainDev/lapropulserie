'use client';
import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, InputNumber, message } from 'antd';
import { useUpdateProfileWithAvatarMutation } from '@/redux/fetures/Mentors/MentorOnboarding';
import { toast } from 'react-toastify';
import PhotoUpload from './PhotoUpload';

const { TextArea } = Input;

const BasicInfoTab = ({ onNext, initialData }) => {
    const [form] = Form.useForm();
    const [photo, setPhoto] = useState(null);
    const [bioWordCount, setBioWordCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const [updateProfileWithAvatar] = useUpdateProfileWithAvatarMutation();

    useEffect(() => {
        if (initialData) {
            form.setFieldsValue({
                name: initialData.name || '',
                location: initialData.location || '',
                availableIn: initialData.availableIn || [],
                language: initialData.language || [],
                sessionPrice: initialData.sessionPrice || 0,
                currentJobTitle: initialData.currentJobTitle || '',
                companyName: initialData.companyName || '',
                yearsOfExperience: initialData.yearsOfExperience || 0,
                bio: initialData.bio || '',
                facebookLink: initialData.facebookLink || '',
                instagramLink: initialData.instagramLink || '',
                twitterLink: initialData.twitterLink || '',
            });
            setBioWordCount(initialData.bio?.split(/\s+/).filter(Boolean).length || 0);
        }
    }, [initialData, form]);

    const classType = Form.useWatch('classType', form);

    const handleBioChange = (e) => {
        const text = e.target.value;
        setBioWordCount(text.trim() === '' ? 0 : text.trim().split(/\s+/).length);
    };

    const handleFinish = async (values) => {
        try {
            setLoading(true);
            const dataPayload = {
                name: values.name,
                location: values.location,
                availableIn: values.availableIn,
                language: values.language,
                classType: values.classType || 'online',
                sessionPrice: values.sessionPrice,
                currentJobTitle: values.currentJobTitle,
                companyName: values.companyName,
                yearsOfExperience: values.yearsOfExperience,
                bio: values.bio,
                facebookLink: values.facebookLink || '',
                instagramLink: values.instagramLink || '',
                twitterLink: values.twitterLink || '',
            };

            await updateProfileWithAvatar({ data: dataPayload, avatarUrl: photo }).unwrap();
            toast.success('Informations de base enregistrées avec succès !');
            onNext(dataPayload);
        } catch (error) {
            console.error('Error saving basic info:', error);
            toast.error(error?.data?.message || "Échec de l'enregistrement des informations");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
            <PhotoUpload onChange={(file) => setPhoto(file)} avatarUrl={initialData?.avatarUrl} />
            <hr className="border-gray-200 mb-5" />

            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item label="Nom complet" name="name">
                    <Input className='border border-gray-400' placeholder="Saisissez votre nom complet" size="large" />
                </Form.Item>

                <Form.Item label="Localisation" name="location">
                    <Select className='border border-gray-400 rounded-lg' placeholder="Sélectionnez votre localisation" size="large">
                        {['Bangladesh', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'India'].map((opt) => (
                            <Select.Option key={opt} value={opt}>{opt}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label="Disponible en" name="availableIn">

                    <Select className='border border-gray-400 rounded-lg' placeholder="Sélectionnez le type de session" size="large">
                        <Select.Option value="online">En ligne</Select.Option>
                        <Select.Option value="inPerson">En présentiel</Select.Option>
                        <Select.Option value="both">Les deux</Select.Option>
                    </Select>
                </Form.Item>



                <Form.Item label="Langue" name="language">
                    <Select className='border border-gray-400 rounded-lg' placeholder="Sélectionnez la langue" size="large" mode="multiple">
                        {['English', 'Bengali', 'Hindi', 'Arabic', 'French', 'Spanish'].map((opt) => (
                            <Select.Option key={opt} value={opt}>{opt}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label="Prix de la session" name="sessionPrice">
                    <InputNumber
                        className='border border-gray-400 rounded-lg w-full'
                        placeholder="Saisissez le prix de la session"
                        size="large"
                        min={0}
                        prefix="$"
                    // disabled={!classType}
                    />
                </Form.Item>

                <Form.Item label="Poste actuel" name="currentJobTitle">
                    <Select className='border border-gray-400 rounded-lg' placeholder="Sélectionnez le poste" size="large">
                        {['Software Engineer', 'Product Manager', 'UI/UX Designer', 'Data Scientist', 'Marketing Manager', 'Business Analyst'].map((opt) => (
                            <Select.Option key={opt} value={opt}>{opt}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label="Entreprise / Organisation" name="companyName">
                    <Select className='border border-gray-400 rounded-lg' placeholder="Sélectionnez l'entreprise" size="large">
                        {['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Freelance', 'Other'].map((opt) => (
                            <Select.Option key={opt} value={opt}>{opt}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label="Années d'expérience" name="yearsOfExperience">
                    <InputNumber className='border border-gray-400 rounded-lg w-full block' placeholder="e.g. 5" size="large" min={0} max={50} />
                </Form.Item>

                <Form.Item
                    name="bio"
                    label={
                        <div className="flex items-center justify-between w-full">
                            <span>Courte bio </span>
                            <span className="text-xs text-gray-400 font-normal"> {bioWordCount}/2000 mots</span>
                        </div>
                    }
                >
                    <TextArea rows={7} placeholder="Rédigez une courte bio..." onChange={handleBioChange} />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        block
                        loading={loading}
                        className='bg-primary text-white border-primary rounded-lg py-4 h-12'
                    >
                        Enregistrer et continuer
                    </Button>
                </Form.Item>

            </Form>
        </div>
    );
};

export default BasicInfoTab;