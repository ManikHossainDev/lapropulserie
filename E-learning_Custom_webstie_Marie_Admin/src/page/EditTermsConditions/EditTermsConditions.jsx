import { IoChevronBack } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { Form } from "antd";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useEffect, useState } from "react";
import {
  useGetTermsConditionsQuery,
  useUpdateTermConditionsMutation,
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

const EditTermsConditions = () => {
  const { data: termsConditions, isLoading: isLoadingContent } =
    useGetTermsConditionsQuery();
  const [updateTermsConditions, { isLoading }] =
    useUpdateTermConditionsMutation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [content, setContent] = useState("");

  useEffect(() => {
    const existing = termsConditions?.data?.content;
    if (typeof existing === "string") {
      setContent(existing);
      form.setFieldsValue({ content: existing });
    }
  }, [termsConditions, form]);

  const handleSubmit = async () => {
    try {
      await updateTermsConditions({ content }).unwrap();
      toast.success("Terms and Conditions updated successfully!");
      navigate("/terms-conditions");
    } catch (error) {
      toast.error("Failed to update Terms and Conditions. Please try again.");
    }
  };

  return (
    <section className="w-full h-full min-h-screen ">
      <div className="flex justify-between items-center py-5">
        <Link to="/terms-conditions" className="flex gap-4 items-center">
          <IoChevronBack className="text-2xl" />
          <h1 className="text-2xl font-semibold">Terms of Conditions</h1>
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

            <div className="flex justify-end md:mt-0 mt-40">
              <button
                type="submit"
                className="bg-[#2d2a71] text-white text-xl font-semibold px-5 py-3 rounded-md md:mt-14"
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

export default EditTermsConditions;
