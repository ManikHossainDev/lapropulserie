import { IoChevronBack } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useEffect, useState } from "react";
import { Form } from "antd";
import {
  useGetPrivacyPolicyQuery,
  useUpdatePrivacyPolicyMutation,
} from "../../redux/features/setting/getAllData";
import { toast } from "sonner";

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline", "strike"],
    [{ align: [] }],
    [{ color: [] }, { background: [] }],
    ["blockquote", "code-block"],
    ["link", "image", "video"],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["clean"],
  ],
};

const EditPrivacyPolicy = () => {
  const { data: privacyPolicy, isLoading: isLoadingContent } =
    useGetPrivacyPolicyQuery();
  const [updatePrivacyPolicy, { isLoading }] = useUpdatePrivacyPolicyMutation();

  const [form] = Form.useForm();
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const existing = privacyPolicy?.data?.content;
    if (typeof existing === "string") {
      setContent(existing);
      form.setFieldsValue({ content: existing });
    }
  }, [privacyPolicy, form]);

  const handleSubmit = async () => {
    try {
      await updatePrivacyPolicy({ content }).unwrap();
      toast.success("Privacy Policy updated successfully");
      navigate("/privacy-policy");
    } catch (error) {
      toast.error("Failed to update Privacy Policy");
    }
  };

  return (
    <section className="w-full h-full min-h-screen ">
      <div className="flex justify-between items-center py-5">
        <Link to="/privacy-policy" className="flex gap-4 items-center">
          <IoChevronBack className="text-2xl" />
          <h1 className="text-2xl font-semibold">Privacy Policy</h1>
        </Link>
      </div>

      <div className="w-full p-6 rounded-lg border">
        {isLoadingContent ? (
          <p className="text-gray-400 py-10 text-center">Loading...</p>
        ) : (
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="content">
              <ReactQuill
                value={content}
                onChange={(value) => setContent(value)}
                modules={quillModules}
                style={{ height: "300px" }}
              />
            </Form.Item>

            <div className="w-full flex justify-end mt-20 md:mt-16">
              <button
                type="submit"
                className="bg-[#2d2a71] text-white text-xl gap-2 py-2 px-8 rounded-md font-bold"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update"}
              </button>
            </div>
          </Form>
        )}
      </div>
    </section>
  );
};

export default EditPrivacyPolicy;
