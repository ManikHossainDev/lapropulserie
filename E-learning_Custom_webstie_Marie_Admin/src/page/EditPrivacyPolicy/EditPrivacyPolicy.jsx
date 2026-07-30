import { IoChevronBack } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill"; // Import React Quill
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import { useState } from "react";
import { Form, message } from "antd";
import { useUpdatePrivacyPolicyMutation } from "../../redux/features/setting/getAllData";
import { toast } from "sonner";

const EditPrivacyPolicy = () => {
  const [updatePrivacyPolicy, { isLoading }] = useUpdatePrivacyPolicyMutation();

  const [form] = Form.useForm();
  const [content, setContent] = useState(""); // Default content for the privacy policy

  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await updatePrivacyPolicy({ content }).unwrap();
      toast.success("Privacy Policy updated successfully");
      navigate("/privacy-policy"); // Navigate back to the privacy policy page after successful update
    } catch (error) {
      toast.error("Failed to update Privacy Policy");
    }
  };

  return (
    <section className="w-full h-full min-h-screen ">
      {/* Header Section */}
      <div className="flex justify-between items-center py-5">
        <Link to="/privacy-policy" className="flex gap-4 items-center">
          <IoChevronBack className="text-2xl" />
          <h1 className="text-2xl font-semibold">Privacy Policy</h1>
        </Link>
      </div>

      {/* Form Section */}
      <div className="w-full p-6 rounded-lg border">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* React Quill for Privacy Policy Content */}
          <Form.Item name="content" initialValue={content}>
            <ReactQuill
              value={content}
              onChange={(value) => setContent(value)}
              modules={{
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
              }}
              style={{ height: "300px" }}
            />
          </Form.Item>

          {/* Update Button */}
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
      </div>
    </section>
  );
};

export default EditPrivacyPolicy;
