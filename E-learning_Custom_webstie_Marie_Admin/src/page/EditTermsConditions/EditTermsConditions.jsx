import { IoChevronBack } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { Button, Form, message } from "antd";
import ReactQuill from "react-quill"; // Import React Quill
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import { useState } from "react";
import { useUpdateTermConditionsMutation } from "../../redux/features/setting/getAllData";
import { toast } from "sonner";

const EditTermsConditions = () => {

  const [updateTermsConditions, { isLoading }] = useUpdateTermConditionsMutation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    try {
      await updateTermsConditions({ content }).unwrap();
      toast.success("Terms and Conditions updated successfully!");
      navigate("/terms-conditions"); // Navigate back to the Terms and Conditions page
    } catch (error) {
      toast.error("Failed to update Terms and Conditions. Please try again.");
    }
  };

  return (
    <section className="w-full h-full min-h-screen ">
      {/* Header Section */}
      <div className="flex justify-between items-center py-5">
        <Link to="/terms-conditions" className="flex gap-4 items-center">
          <>
            <IoChevronBack className="text-2xl" />
          </>
          <h1 className="text-2xl font-semibold">Terms of Conditions</h1>
        </Link>
      </div>

      {/* Form Section */}
      <div className="w-full p-6 rounded-lg border">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* React Quill for Terms and Conditions Content */}
          <Form.Item name="content" initialValue={content}>
            <ReactQuill
              value={content}
              onChange={(value) => setContent(value)}
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, 4, 5, 6, false] }], // Header dropdown
                  [{ font: [] }], // Font options
                  [{ list: "ordered" }, { list: "bullet" }], // Ordered and bullet lists
                  ["bold", "italic", "underline", "strike"], // Formatting options
                  [{ align: [] }], // Text alignment
                  [{ color: [] }, { background: [] }], // Color and background
                  ["blockquote", "code-block"], // Blockquote and code block
                  ["link", "image", "video"], // Link, image, and video upload
                  [{ script: "sub" }, { script: "super" }], // Subscript and superscript
                  [{ indent: "-1" }, { indent: "+1" }], // Indent
                  ["clean"], // Remove formatting
                ],
              }}
              style={{ height: "300px" }} // Set the increased height
            />
          </Form.Item>

          {/* Update Button */}
          <div className="flex justify-end md:mt-0 mt-40">
            <button
              // type="primary"
              // htmlType="submit"
              className="bg-[#2d2a71] text-white text-xl font-semibold px-5 py-3 rounded-md md:mt-14"
            >
              Update
            </button>
          </div>
        </Form>
      </div>
    </section>
  );
};

export default EditTermsConditions;
