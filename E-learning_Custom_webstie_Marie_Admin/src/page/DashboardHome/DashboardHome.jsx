import GrowthTrendsSubscription from "../../component/Home/GrowthTrendsSubscription";
import HomeCaltucationValue from "../../component/Home/HomeCaltucationValue";
import HomeTopMantorsAndActivity from "../../component/Home/HomeTopMantorsAndActivity";

const DashboardHome = () => {

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "/auth";
  }

  return (
    <section className="p-5">
      <HomeCaltucationValue />
      <GrowthTrendsSubscription />
      <HomeTopMantorsAndActivity />
    </section>
  );
};

export default DashboardHome;
