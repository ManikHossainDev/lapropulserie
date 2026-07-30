import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form } from "antd";
import { HiOutlineMail } from "react-icons/hi";
import { IoIosArrowBack } from "react-icons/io";
import signinImage from "/public/Auth/main_logo.jpg";
import { useForgotPasswordMutation } from "../../../redux/features/auth/authApi";
import { toast } from "sonner";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [forgotPassword] = useForgotPasswordMutation();

  const submit = async (values) => {
    // 👉 only UI flow (no API)
    console.log("Email:", values);
    const data = {
      email: values?.email,
    }
    try {
      const res = await forgotPassword(data).unwrap();
      console.log(res);
      toast.success(res?.message);
      navigate(`/auth/otp/${values?.email}`);
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.message || "Something went wrong");
    }

    // simulate navigation to OTP page
  };

  return (
    <div className="w-full h-full md:h-screen md:flex justify-around overflow-visible">
      <div className="w-full rounded-md grid grid-cols-1 items-center md:grid-cols-2 place-content-center gap-8 bg-white">

        {/* LEFT FORM */}
        <div className="mt-16 px-8 md:w-2/3 md:mx-auto">

          <Link
            to="/login"
            className="flex items-center gap-2 text-sm text-gray-500 mb-4"
          >
            <IoIosArrowBack /> Back to Login
          </Link>

          <div className="mb-8">
            <h1 className="font-semibold text-3xl text-gray-800">
              Forgot Password
            </h1>
            <p className="text-gray-500">
              Enter your email to receive a verification code
            </p>
          </div>

          <Form layout="vertical" onFinish={submit} className="space-y-4">
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Enter a valid email!" },
              ]}
            >
              <div className="flex items-center gap-3 px-3 py-2.5 bg-white border border-gray-200 rounded-md">
                <HiOutlineMail className="text-gray-400 text-lg" />

                <input
                  type="email"
                  placeholder="Enter Email"
                  className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                />
              </div>
            </Form.Item>
            <Form.Item>
              <button
                type="submit"
                className="w-full bg-[#2d2a71] text-xl font-semibold text-white rounded-md py-2"
              >
                Send Code
              </button>
            </Form.Item>
          </Form>
        </div>

        {/* RIGHT IMAGE */}
        <div className="hidden md:flex justify-center items-center h-screen bg-[#2d2a71] rounded-md p-10">
          <img
            src={signinImage}
            className="w-auto h-auto"
            alt="Forgot password"
          />
        </div>

      </div>
    </div>
  );
};

export default ForgetPassword;