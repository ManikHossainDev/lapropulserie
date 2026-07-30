import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import otpImage from "/public/Auth/main_logo.jpg"; 
import { IoIosArrowBack } from "react-icons/io";
import OTPInput from "react-otp-input";
import { toast } from "sonner";

import {
  useForgotPasswordMutation,
  useVerifyEmailMutation,
} from "../../../redux/features/auth/authApi";

const Otp = () => {
  const [otp, setOtp] = useState("");
  const { email } = useParams();
  const navigate = useNavigate();

  const [forgotPassword] = useForgotPasswordMutation();
  const [verifyOtp, { isLoading }] = useVerifyEmailMutation();

  const handleOtpChange = (value) => {
    setOtp(value);
  };

  const handleMatchOtp = async () => {
    try {
      const res = await verifyOtp({ otp }).unwrap();

      if (res) {
        localStorage.setItem("jwtToken", res?.changePasswordToken);
        toast.success("OTP Verified");
        navigate(`/auth/new-password/${email}`);
      }
    } catch (error) {
      toast.error("Invalid OTP");
    }
  };

  const handleResendPassword = async () => {
    try {
      const res = await forgotPassword({ email }).unwrap();
      toast.success(res?.message || "OTP Resent");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="w-full h-full md:h-screen md:flex justify-around overflow-visible">

      <div className="w-full rounded-md grid grid-cols-1 items-center md:grid-cols-2 place-content-center gap-8 bg-white">

        {/* LEFT SIDE (FORM) */}
        <div className="mt-16 px-8 md:w-2/3 md:mx-auto">

          {/* Back */}
          <Link
            to="/auth/login"
            className="flex items-center gap-2 text-sm text-gray-500 mb-4"
          >
            <IoIosArrowBack /> Back to Login
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-semibold text-3xl text-gray-800">
              Verify OTP
            </h1>
            <p className="text-gray-500">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* OTP INPUT */}
          <div className="flex mb-6">
            <OTPInput
              value={otp}
              onChange={handleOtpChange}
              numInputs={6}
              renderInput={(props) => <input {...props} />}
              inputStyle={{
                width: "5rem",
                height: "3rem",
                margin: "0 0.3rem",
                fontSize: "1.5rem",
                fontWeight: "600",
                borderBottom: "2px solid #2d2a71",
                textAlign: "center",
                outline: "none",
              }}
            />
          </div>

          {/* VERIFY BUTTON */}
          <button
            onClick={handleMatchOtp}
            disabled={isLoading}
            className="w-full bg-[#2d2a71] text-xl font-semibold text-white rounded-md py-2"
          >
            Verify
          </button>

          {/* RESEND */}
          <div className="flex justify-between items-center mt-4 text-sm">
            <h1 className="text-gray-500">Didn’t receive code?</h1>

            <button
              onClick={handleResendPassword}
              className="text-[#2d2a71] font-medium"
            >
              Resend
            </button>
          </div>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="hidden md:flex justify-center items-center h-screen bg-[#2d2a71] rounded-md p-10">
          <img
            src={otpImage}
            className="w-auto h-auto"
            alt="OTP Verification"
          />
        </div>

      </div>
    </div>
  );
};

export default Otp;