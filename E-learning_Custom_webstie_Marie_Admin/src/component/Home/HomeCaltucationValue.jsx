import React, { useEffect } from "react";
import { FiDollarSign, FiUsers, FiBookOpen, FiBox } from "react-icons/fi";
import { FaCalendarAlt } from "react-icons/fa";
import { useGetDashboardStatusQuery } from "../../redux/features/dashboardHome/dashboardHome";
import { useGetProfileQuery } from "../../redux/features/setting/settingApi";
import {
  useConnectCalendlyMutation,
  useDisconnectCalendlyMutation,
} from "../../redux/features/calendly/calendlyApi";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

const HomeCaltucationValue = () => {

  const { data } = useGetDashboardStatusQuery();
  const fulldata = data?.data?.stats;

  const { data: profileData, refetch: refetchProfile } = useGetProfileQuery();
  const calendlyInfo = profileData?.data?.calendly;
  const isCalendlyConnected = Boolean(calendlyInfo?.connected);

  const [connectCalendly, { isLoading: isConnecting }] = useConnectCalendlyMutation();
  const [disconnectCalendly, { isLoading: isDisconnecting }] = useDisconnectCalendlyMutation();

  const [searchParams, setSearchParams] = useSearchParams();

  // Handle redirect back from Calendly OAuth (backend redirects here with ?calendly=connected|error)
  useEffect(() => {
    const calendlyStatus = searchParams.get("calendly");
    if (!calendlyStatus) return;

    if (calendlyStatus === "connected") {
      const name = searchParams.get("name");
      toast.success(
        name ? `Calendly connected successfully (${name})` : "Calendly connected successfully"
      );
      refetchProfile();
    } else if (calendlyStatus === "error") {
      const message = searchParams.get("message");
      toast.error(message || "Failed to connect Calendly");
    }

    searchParams.delete("calendly");
    searchParams.delete("name");
    searchParams.delete("message");
    setSearchParams(searchParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleCalendlyConnect = async () => {
    try {
      const res = await connectCalendly().unwrap();
      const authUrl = res?.data;
      if (!authUrl) {
        toast.error("Could not retrieve the Calendly connection link");
        return;
      }
      window.location.href = authUrl;
    } catch (err) {
      toast.error(err?.data?.message || "Failed to connect Calendly");
    }
  };

  const handleCalendlyDisconnect = async () => {
    try {
      await disconnectCalendly().unwrap();
      toast.success("Calendly disconnected successfully");
      refetchProfile();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to disconnect Calendly");
    }
  };

  return (
    <div className="w-full space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* Revenue */}
        <div className="bg-white rounded-xl shadow-sm border p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <FiDollarSign size={20} />
            </div>
            <span className="text-green-500 text-sm font-medium">+{fulldata?.totalRevenue?.momGrowth}%</span>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold">${fulldata?.totalRevenue?.amount}</h2>
            <p className="text-gray-500 text-sm mt-1">Total Revenue</p>
          </div>
        </div>

        {/* Students */}
        <div className="bg-white rounded-xl shadow-sm border p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="bg-purple-600 text-white p-2 rounded-lg">
              <FiUsers size={20} />
            </div>
            <span className="text-green-500 text-sm font-medium">+{fulldata?.totalStudents?.momGrowth}%</span>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold">{fulldata?.totalStudents?.count}</h2>
            <p className="text-gray-500 text-sm mt-1">Total Students</p>
          </div>
        </div>

        {/* Mentors */}
        <div className="bg-white rounded-xl shadow-sm border p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="bg-green-600 text-white p-2 rounded-lg">
              <FiBookOpen size={20} />
            </div>
            <span className="text-green-500 text-sm font-medium">+{fulldata?.totalMentors?.momGrowth}%</span>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold">{fulldata?.totalMentors?.count}</h2>
            <p className="text-gray-500 text-sm mt-1">Total Mentors</p>
          </div>
        </div>

        {/* Capsules */}
        <div className="bg-white rounded-xl shadow-sm border p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="bg-teal-600 text-white p-2 rounded-lg">
              <FiBox size={20} />
            </div>
            <span className="text-green-500 text-sm font-medium">+{fulldata?.totalCapsules?.momGrowth}%</span>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold">{fulldata?.totalCapsules?.count}</h2>
            <p className="text-gray-500 text-sm mt-1">Individual Capsules</p>
          </div>
        </div>
      </div>

      {/* Calendly Integration Banner */}
      <div
        className={`${
          isCalendlyConnected
            ? "bg-green-50 border border-green-200"
            : "bg-orange-50 border border-orange-200"
        } rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}
      >

        <div className="flex items-start gap-3">
          <div
            className={`${
              isCalendlyConnected ? "bg-green-600" : "bg-orange-500"
            } text-white p-3 rounded-lg`}
          >
            <FaCalendarAlt size={20} />
          </div>

          <div>
            <h3 className="font-semibold text-gray-800">
              Calendly Integration
            </h3>
            {isCalendlyConnected ? (
              <p className="text-green-600 text-sm font-medium mt-1">
                ✅ Calendly Connected{calendlyInfo?.profileUrl ? ` — ${calendlyInfo.profileUrl}` : ""}
              </p>
            ) : (
              <p className="text-orange-600 text-sm font-medium mt-1">
                ⚠️ Calendly Not Connected
              </p>
            )}
            <p className="text-gray-500 text-sm">
              Connect your Calendly account to enable mentor interview scheduling and tracking.
            </p>
          </div>
        </div>

        {isCalendlyConnected ? (
          <button
            onClick={handleCalendlyDisconnect}
            disabled={isDisconnecting}
            className="bg-white border border-red-300 text-red-600 hover:bg-red-50 px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60"
          >
            {isDisconnecting ? "Disconnecting..." : "Disconnect Calendly"}
          </button>
        ) : (
          <button
            onClick={handleCalendlyConnect}
            disabled={isConnecting}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60"
          >
            {isConnecting ? "Connecting..." : "Connect Calendly"}
          </button>
        )}
      </div>

    </div>
  );
};

export default HomeCaltucationValue;