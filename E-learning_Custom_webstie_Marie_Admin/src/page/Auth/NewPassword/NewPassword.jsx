import React, { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Form } from "antd";
import { IoIosArrowBack } from "react-icons/io";
import { toast } from "sonner";

import changePasswordImage from "/public/Auth/main_logo.jpg";
import CustomInput from "../../../utils/CustomInput";
import { useResetPasswordMutation } from "../../../redux/features/auth/authApi";

const RESET_OTP_KEY = "admin_reset_otp";

const NewPassword = () => {
  const navigate = useNavigate();
  const { email: emailParam } = useParams();
  const email = decodeURIComponent(emailParam || "");
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  useEffect(() => {
    const otp = sessionStorage.getItem(RESET_OTP_KEY);
    if (!email || !otp) {
      toast.error("Please verify the code sent to your email first");
      navigate("/auth/login");
    }
  }, [email, navigate]);

  const submit = async (values) => {
    const { password, confirmPassword } = values;
    const otp = sessionStorage.getItem(RESET_OTP_KEY);

    if (!password || !confirmPassword) {
      toast.error("Password is required");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (!email || !otp) {
      toast.error("Session expired. Please restart forgot password.");
      navigate("/auth/login");
      return;
    }

    try {
      const res = await resetPassword({
        email,
        password,
        otp,
      }).unwrap();

      sessionStorage.removeItem(RESET_OTP_KEY);
      sessionStorage.removeItem("admin_reset_email");
      localStorage.removeItem("jwtToken");

      toast.success(res?.message || "Password updated successfully");
      navigate("/auth/login");
    } catch (error) {
      toast.error(
        error?.data?.message || "Invalid code or something went wrong",
      );
    }
  };

  return (
    <div className="w-full h-full md:h-screen md:flex justify-around overflow-visible">
      <div className="w-full rounded-md grid grid-cols-1 items-center md:grid-cols-2 place-content-center gap-8 bg-white">
        <div className="mt-16 px-8 md:w-2/3 md:mx-auto">
          <Link
            to="/auth/login"
            className="flex items-center gap-2 text-sm text-gray-500 mb-4"
          >
            <IoIosArrowBack /> Back to Login
          </Link>

          <div className="mb-8">
            <h1 className="font-semibold text-3xl text-gray-800">
              Update Password
            </h1>
            <p className="text-gray-500">Set a new password for your account</p>
          </div>

          <Form layout="vertical" onFinish={submit} className="space-y-4">
            <Form.Item
              label="New Password"
              name="password"
              rules={[
                { required: true, message: "Please input your new password" },
                { min: 8, message: "Password must be at least 8 characters" },
              ]}
            >
              <CustomInput
                isPassword
                type="password"
                placeholder="Enter new password"
              />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              rules={[
                { required: true, message: "Please confirm your password" },
              ]}
            >
              <CustomInput
                isPassword
                type="password"
                placeholder="Confirm password"
              />
            </Form.Item>

            <Form.Item>
              <button
                type="submit"
                className="w-full bg-[#2d2a71] text-xl font-semibold text-white rounded-md py-2"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </Form.Item>
          </Form>
        </div>

        <div className="hidden md:flex justify-center items-center h-screen bg-[#2d2a71] rounded-md p-10">
          <img
            src={changePasswordImage}
            className="w-auto h-auto"
            alt="Update Password"
          />
        </div>
      </div>
    </div>
  );
};

export default NewPassword;
