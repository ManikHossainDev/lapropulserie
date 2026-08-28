import React, { useEffect, useMemo, useState } from 'react';
import { MdOutlineKeyboardArrowLeft } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { Modal, Button, Input, Form, Select } from 'antd';
import {
    useDeleteFaqMutation,
    useGetAllFaqQuery,
    useCreateFaqMutation,
    useGetFaqCategoriesQuery,
    useCreateFaqCategoryMutation,
} from '../../redux/features/setting/settingApi';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'sonner';

const resolveId = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value.id || value._id || '';
};

const AllFaq = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [ensuringCategory, setEnsuringCategory] = useState(false);
    const triedDefaultCategory = React.useRef(false);

    const { data: allFaq, refetch, isLoading } = useGetAllFaqQuery({ page, limit });
    const {
        data: categoriesRes,
        refetch: refetchCategories,
        isLoading: categoriesLoading,
    } = useGetFaqCategoriesQuery();
    const [deleteFaq] = useDeleteFaqMutation();
    const [addFaq, { isLoading: isAdding }] = useCreateFaqMutation();
    const [createFaqCategory] = useCreateFaqCategoryMutation();

    const fullData = allFaq?.data?.results || [];
    const categories = useMemo(() => {
        const raw = categoriesRes?.data;
        if (Array.isArray(raw)) return raw;
        if (Array.isArray(raw?.results)) return raw.results;
        return [];
    }, [categoriesRes]);

    const categoryOptions = categories
        .map((cat) => ({
            value: resolveId(cat),
            label: cat.categoryName || cat.name || 'Category',
        }))
        .filter((opt) => opt.value);

    // First FAQ list was empty → admin sent faqCategoryId: "" → API 400.
    // Ensure at least one category exists so Add FAQ always has a valid ObjectId.
    useEffect(() => {
        let cancelled = false;
        const ensureDefaultCategory = async () => {
            if (categoriesLoading || triedDefaultCategory.current) return;
            if (categoryOptions.length > 0) return;

            triedDefaultCategory.current = true;
            setEnsuringCategory(true);
            try {
                await createFaqCategory({ categoryName: 'Général' }).unwrap();
                if (!cancelled) await refetchCategories();
            } catch (error) {
                console.error('Error creating default FAQ category:', error);
                toast.error('Could not create FAQ category. Try again.');
                triedDefaultCategory.current = false;
            } finally {
                if (!cancelled) setEnsuringCategory(false);
            }
        };

        ensureDefaultCategory();
        return () => {
            cancelled = true;
        };
    }, [
        categoriesLoading,
        categoryOptions.length,
        createFaqCategory,
        refetchCategories,
    ]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const showModal = () => {
        const defaultCategoryId = categoryOptions[0]?.value || '';
        form.setFieldsValue({
            question: '',
            answer: '',
            faqCategoryId: defaultCategoryId,
        });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleAddFaq = async (values) => {
        const faqCategoryId = resolveId(values.faqCategoryId);
        if (!faqCategoryId) {
            toast.error('Please select a FAQ category');
            return;
        }

        try {
            await addFaq({
                faqCategoryId,
                question: values.question,
                answer: values.answer,
            }).unwrap();
            toast.success('FAQ added successfully');
            setIsModalVisible(false);
            form.resetFields();
            refetch();
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to add FAQ');
            console.error('Error adding FAQ:', error);
        }
    };

    const handleDelete = async (faq) => {
        try {
            await deleteFaq(faq.id || faq._id).unwrap();
            toast.success('FAQ deleted successfully');
            refetch();
        } catch (error) {
            toast.error('Failed to delete FAQ');
            console.error('Error deleting FAQ:', error);
        }
    };

    if (isLoading || categoriesLoading || ensuringCategory) {
        return <p className="text-center text-gray-400 py-10">Loading FAQs...</p>;
    }

    return (
        <div>
            <div className="mt-5 sm:mt-0 flex items-center justify-between">
                <Link to={"/"} className="flex items-center cursor-pointer my-8">
                    <MdOutlineKeyboardArrowLeft size={30} />
                    <h1 className="text-xl font-medium ml-2">FAQ</h1>
                </Link>
                <div>
                    <button
                        className="bg-[#2d2a71] text-white px-10 py-3 rounded-lg flex items-center gap-2"
                        onClick={showModal}
                        disabled={!categoryOptions.length}
                    >
                        <FiPlus className="text-xl font-semibold text-white" /> Add FAQ
                    </button>
                </div>
            </div>

            <div className="mt-5 md:px-8 px-3">
                <div className="my-5">
                    <div className="space-y-4">
                        {fullData?.length > 0 ? (
                            fullData.map((faq, index) => (
                                <div key={faq.id || faq._id || index} className="border rounded">
                                    <p className="font-medium text-lg bg-[#2e2a7142] p-3 flex items-center justify-between">
                                        {faq.question}
                                        <button
                                            className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                                            onClick={() => handleDelete(faq)}
                                        >
                                            Delete
                                        </button>
                                    </p>
                                    <p className="text-gray-500 mt-1 p-3">{faq.answer}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-400 py-10">No FAQs found.</p>
                        )}
                    </div>
                </div>
            </div>

            <Modal
                title="Add New FAQ"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form form={form} onFinish={handleAddFaq} layout="vertical">
                    <Form.Item
                        name="faqCategoryId"
                        label="Category"
                        rules={[{ required: true, message: 'Please select a category!' }]}
                    >
                        <Select
                            placeholder="Select category"
                            options={categoryOptions}
                        />
                    </Form.Item>
                    <Form.Item
                        name="question"
                        label="Question"
                        rules={[{ required: true, message: 'Please enter the question!' }]}
                    >
                        <Input placeholder="Enter the question" />
                    </Form.Item>
                    <Form.Item
                        name="answer"
                        label="Answer"
                        rules={[{ required: true, message: 'Please enter the answer!' }]}
                    >
                        <Input.TextArea placeholder="Enter the answer" rows={4} />
                    </Form.Item>

                    <div className="flex justify-end gap-4">
                        <Button onClick={handleCancel} className="bg-gray-400 text-white">
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isAdding}
                            className="bg-[#2d2a71] text-white"
                        >
                            Add FAQ
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default AllFaq;
