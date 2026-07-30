import { IoChevronBack } from "react-icons/io5";
import { Link } from "react-router-dom";
import { TbEdit } from "react-icons/tb";
import CustomButton from "../../utils/CustomButton";
import { Spin } from "antd"; // Importing Spin
import { useEffect } from "react"; 
import { useGetTermsConditionsQuery } from "../../redux/features/setting/getAllData";

const TermsconditionPage = () => {


  const { data: privacyPolicy, isLoading, refetch } = useGetTermsConditionsQuery();

  console.log(privacyPolicy?.data?.content);

  useEffect(() => {
    refetch();
  }, []);

  return (
    <section className="w-full h-full min-h-screen">
      <div className="flex justify-between items-center py-5">
        <Link to="/" className="flex gap-4 items-center">
          <>
            <IoChevronBack className="text-2xl" />
          </>
          <h1 className="text-2xl font-semibold">Terms of Conditions</h1>
        </Link>
        <Link to={"/edit-terms-conditions/11"}>
          <button
            className="bg-[#2d2a71] text-white flex items-center gap-2 p-2 rounded-md font-bold"
            border
          >
            <TbEdit className="size-5" />
            <span>Edit</span>
          </button>
        </Link>
      </div>

      {/* Show Spin loader if data is loading */}
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Spin size="large" />
        </div>
      )
        :
        (
          <div className="w-full h-full ml-3">
            <div dangerouslySetInnerHTML={{ __html: privacyPolicy?.data?.content }} />
          </div>
        )
      }

      {/* Show content if data is available */}

    </section>
  );
};

export default TermsconditionPage;
