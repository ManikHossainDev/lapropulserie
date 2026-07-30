import { Button, Form, Input } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { LuImagePlus } from "react-icons/lu";
import defaultUserImage from "/public/Auth/user.png";
import "react-phone-number-input/style.css";
import Url from "../../redux/baseApi/forImageUrl";
import { useGetProfileQuery, useUpdateProfileMutation } from "../../redux/features/setting/settingApi";
import { toast } from "sonner";

const PersonalinfoEdit = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { data: userProfile, refetch } = useGetProfileQuery();
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();
    const user = userProfile?.data;

    const [fileList, setFileList] = useState([]);
    const [imageUrl, setImageUrl] = useState(defaultUserImage);

    // ✅ Load User Data When API Call Completes
    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                name: user.name || "",
                email: user.email || "",
            });
            setImageUrl(
                user.profileImage?.imageUrl
                    ? user.profileImage.imageUrl
                    : defaultUserImage
            );
        }
    }, [user, form]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    // ✅ Handle File Upload & Preview
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileList([{ originFileObj: file }]);

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => setImageUrl(reader.result);
    };

    // ✅ Handle Form Submission — payload matches API exactly
    const handleUpdateProfile = async (values) => {
        const formData = new FormData();

        // All text fields go inside "data" as a JSON string
        const payload = {
            name: values.name,
        };
        formData.append("data", JSON.stringify(payload));

        // Image file goes separately
        if (fileList[0]?.originFileObj) {
            formData.append("profileImage", fileList[0].originFileObj);
        }

        try {
            await updateProfile(formData).unwrap();
            toast.success("Profile updated successfully!");
            refetch();
            navigate("/my-account");
        } catch (error) {
            toast.error("Failed to update profile. Please try again.");
        }
    };

    return (
        <div className="font-[Aldrich]">
            {/* Back Button */}
            <div
                onClick={() => navigate("/my-account")}
                className="flex items-center cursor-pointer ml-6 my-8"
            >
                <MdOutlineKeyboardArrowLeft size={30} />
                <h1 className="text-xl font-medium ml-2">Edit Profile</h1>
            </div>

            <div className="sm:mx-6 rounded-xl bg-white">
                <Form
                    form={form}
                    layout="vertical"
                    autoComplete="off"
                    onFinish={handleUpdateProfile}
                >
                    <div className="flex flex-col lg:flex-row gap-10">

                        {/* Profile Picture Section */}
                        <div className="flex flex-col items-center w-full lg:w-1/3 border-dotted border p-6">
                            <div className="relative sm:w-56 w-48 sm:h-56 h-48 rounded-full flex justify-center items-center mt-5 bg-gray-50 border overflow-hidden">
                                <img
                                    className="w-full h-full rounded-full object-cover"
                                    src={imageUrl}
                                    alt="Profile"
                                />
                            </div>

                            {/* Hidden file input triggered by label */}
                            <label
                                htmlFor="profileImageInput"
                                className="mt-4 flex items-center gap-2 text-blue-500 cursor-pointer text-sm font-medium hover:text-blue-600 transition-colors"
                            >
                                <LuImagePlus size={20} />
                                Change Picture
                            </label>
                            <input
                                id="profileImageInput"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />

                            <div className="text-center mt-4">
                                <p className="text-lg">Admin</p>
                                <h1 className="text-2xl font-medium mb-2">{user?.name || "N/A"}</h1>
                            </div>
                        </div>

                        {/* Form Inputs Section */}
                        <div className="flex-1 w-full lg:w-2/3 pt-6">
                            <div className="flex flex-col gap-6">
                                <Form.Item
                                    label={<span className="text-lg font-medium">Name</span>}
                                    name="name"
                                    rules={[{ required: true, message: "Please enter your name" }]}
                                >
                                    <Input
                                        placeholder="Name"
                                        className="p-4 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className="text-lg font-medium">Email</span>}
                                    name="email"
                                >
                                    <Input
                                        placeholder="Email"
                                        className="p-4 rounded-lg border-gray-300"
                                        readOnly
                                    />
                                </Form.Item>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex sm:justify-end justify-center items-center mt-8">
                        <Button
                            htmlType="submit"
                            loading={isLoading}
                            className="h-14 md:px-20 !bg-[#2d2a71] !text-white rounded-lg text-lg font-medium"
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default PersonalinfoEdit;