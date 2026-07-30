import signinImage from "/public/Auth/main_logo.jpg";
import authLogo from "../../../assets/auth/auth-logo.png";
import logoimage from '/public/logo/Logo-Orange.png';

import { Link, useNavigate } from "react-router-dom";
import { Form, Checkbox } from "antd";
import { HiOutlineLockClosed, HiOutlineMail } from "react-icons/hi";
import CustomButton from "../../../utils/CustomButton";
import CustomInput from "../../../utils/CustomInput";
import { useLoginMutation } from "../../../redux/features/auth/authApi";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { loggedUser } from "../../../redux/features/auth/authSlice";

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const handleSubmit = async (values) => {
    const { email, password } = values;
    const data = {
      email,
      password,
      rememberMe: false
    }
    try {
      const res = await login(data).unwrap();
 

      if (res?.code === 200) {
        toast.success(res?.message);
        localStorage.setItem("token", res?.data?.tokens?.accessToken);
        localStorage.setItem("user", JSON.stringify(res?.data?.userWithoutPassword));
        navigate("/");
      }
      

      if (res.error) {
        toast.error(res.error.data.message);
        console.log(res.error.data.message);
      }
      if (res) {
        toast.success(res?.message);
      }

      navigate("/");


    } catch (error) {
      toast.error(error?.data?.message || "Failed to login. Please try again.");
    }
  };

  return (
    <div className="w-full  h-full md:h-screen md:flex justify-around overflow-visible">

      <div className="w-full  rounded-md  grid grid-cols-1 items-center md:grid-cols-2 place-content-center gap-8 bg-white ">
        <div className="mt-16 px-8 md:w-2/3 md:mx-auto">
          <div className="mb-8">
            {/* <img src={logoimage} className="w-[200px] mb-5" alt="" /> */}
            <h1 className="font-semibold text-3xl text-gray-800">
              Hello, Welcome!
            </h1>
            <p className="text-gray-500">
              Please Enter Your Details Below to Continue
            </p>
          </div>
          <Form
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-4"
            initialValues={{
              remember: true,
            }}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email!",
                },
                {
                  type: "email",
                  message: "The input is not a valid email!",
                },
              ]}
            >
              <CustomInput
                type="email"
                icon={HiOutlineMail}
                placeholder={"Enter Email"}
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
            >
              <CustomInput
                type="password"
                icon={HiOutlineLockClosed}
                placeholder={"Enter password"}
                isPassword
              />
            </Form.Item>

            <div className="flex justify-between items-center">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
              <Link to="/auth/forget-password" className="underline">
                Forgot password?
              </Link>
            </div>

            <Form.Item>
              <button loading={isLoading} className="w-full bg-[#2d2a71] text-xl font-semibold text-white  rounded-md py-2" border={true}>
                Login
              </button>
            </Form.Item>
          </Form>
        </div>
        <div className="hidden md:flex justify-center items-center h-screen bg-[#2d2a71] rounded-md p-10">
          <img
            src={signinImage}
            className="w-auto h-auto"
            alt="Sign in illustration"
          />
        </div>

      </div>
    </div>
  );
};

export default SignIn;
