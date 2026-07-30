/* eslint-disable no-unused-vars */
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import DashboardHome from "../page/DashboardHome/DashboardHome";
import ForgetPassword from "../page/Auth/ForgetPassword/ForgetPassword";
import SignIn from "../page/Auth/SignIn/SignIn";
import Otp from "../page/Auth/Otp/Otp";
import NewPassword from "../page/Auth/NewPassword/NewPassword";
import SettingsPage from "../page/Settings/SettingsPage";
import PrivacyPolicyPage from "../page/PrivacyPolicy/PrivacyPolicyPage";
import TermsconditionPage from "../page/TermsCondition/TermsconditionPage";
import AboutUsPage from "../page/AboutUs/AboutUsPage";
import Notification from "../component/Main/Notification/Notification";
import EditPrivacyPolicy from "../page/EditPrivacyPolicy/EditPrivacyPolicy";
import EditTermsConditions from "../page/EditTermsConditions/EditTermsConditions";
import EditAboutUs from "../page/EditAboutUs/EditAboutUs";
import Personalinfo from "../page/ProfileInfo/Personalinfo";
import PersonalinfoEdit from "../page/ProfileInfo/PersonalinfoEdit";
import AllFaq from "../page/Faq/AllFaq";
import AllUsersList from "../page/Users/AllUsersList";
import BookingList from "../page/BookingList/BookingList";
import FreeQuestionnaire from "../page/FreeQuestionnaire/FreeQuestionnaire";
import FreeQuestionnaireCreate from "../page/FreeQuestionnaire/FreeQuestionnaireCreate";
import FreeQuestionnaireEdit from "../page/FreeQuestionnaire/FreeQuestionnaireEdit";
import ExpeditionJourneyHome from "../page/ExpeditionJourney/ExpeditionJourneyHome";
import ExpeditionJourneyHomeCreate from "../page/ExpeditionJourney/ExpeditionJourneyHomeCreate";
import ExpeditionJourneyCapsuleCreate from "../page/ExpeditionJourney/ExpeditionJourneyCapsuleCreate";
import ExpeditionJourneyHomeEdit from "../page/ExpeditionJourney/ExpeditionJourneyHomeEdit";
import Subscription from "../page/Subscription/Subscription";
import Wallet from "../page/Wallet/Wallet";
import IndividualCapsules from "../page/IndividualCapsules/IndividualCapsules";
import IndividualCapsulesCreate from "../page/IndividualCapsules/IndividualCapsulesCreate";
import IndividualCapsulesEdit from "../page/IndividualCapsules/IndividualCapsulesEdit";
import IndividualCapsulesCreateCapsule from "../page/IndividualCapsules/IndividualCapsulesCreateCapsule";
import ExpeditionJourneyCapsuleEdit from "../page/IndividualCapsules/ExpeditionJourneyCapsuleEdit";
import IndividualCapsulesEditCapsule from "../page/IndividualCapsules/IndividualCapsulesEditCapsule";
import { Navigate, useParams } from "react-router-dom";

const RedirectLegacyLessonRoute = () => {
  const { id } = useParams();
  return <Navigate to={`/individual-capsules/edit/${id}`} replace />;
};


const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <MainLayout />
    ),
    errorElement: <h1>Error</h1>,
    children: [
      {
        index: true,
        element: <DashboardHome />,
      },
      //? Start here
      {
        path: "/users",
        element: <AllUsersList />,
      },
      {
        path: "/booking-list",
        element: <BookingList />,
      },
      {
        path: "/free-questionnaire",
        element: <FreeQuestionnaire />,
      },
      {
        path: "/free-questionnaire/create",
        element: <FreeQuestionnaireCreate />,
      },
      {
        path: "/free-questionnaire/edit/:id",
        element: <FreeQuestionnaireEdit />,
      },
      {
        path: "/expedition-journey",
        element: <ExpeditionJourneyHome />,
      },

      {
        path: "/expedition-journey/create",
        element: <ExpeditionJourneyHomeCreate />,
      },
      {
        path: "/expedition-journey/edit/:id",
        element: <ExpeditionJourneyHomeEdit />,
      },
      {
        path: "/expedition-journey/capsule/create",
        element: <ExpeditionJourneyCapsuleCreate />,
      },
      {
        path: "/expedition-journey/capsule/edit/:id",
        element: <ExpeditionJourneyCapsuleEdit />,
      },


      {
        path: "/individual-capsules",
        element: <IndividualCapsules />,
      },
      {
        path: "/individual-capsules/create",
        element: <IndividualCapsulesCreate />,
      },
      {
        path: "/individual-capsules/edit/:id",
        element: <IndividualCapsulesEdit />,
      },
      {
        path: "/individual-capsules/capsule/create",
        element: <IndividualCapsulesCreateCapsule />,
      },
      {
        path: "/individual-capsules/capsule/edit/:id",
        element: <IndividualCapsulesEditCapsule />,
      },
      {
        path: "/individual-capsules/lessons/create/:id",
        element: <RedirectLegacyLessonRoute />,
      },
      {
        path: "/individual-capsules/lessons/edit/:id",
        element: <RedirectLegacyLessonRoute />,
      },



      {
        path: "/subscriptions",
        element: <Subscription />,
      },
      {
        path: "/wallet",
        element: <Wallet />,
      },
      {
        path: "/my-account",
        element: <Personalinfo />,
      },
      {
        path: "/my-account/edit",
        element: <PersonalinfoEdit />,
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicyPage />,
      },
      {
        path: "/edit-privacy-policy",
        element: <EditPrivacyPolicy />,
      },
      {
        path: "/terms-conditions",
        element: <TermsconditionPage />,
      },
      {
        path: "/edit-terms-conditions/:id",
        element: <EditTermsConditions />,
      },
      {
        path: "/faq",
        element: <AllFaq />,
      },




      {
        path: "/notification",
        element: <Notification />,
      },

      //? All Settings Routes
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "/personal-info/edit",
        element: <PersonalinfoEdit />,
      },
      {
        path: "settings/privacy-policy",
        element: <PrivacyPolicyPage />,
      },
      {
        path: "/settings/edit-privacy-policy",
        element: <EditPrivacyPolicy />,
      },
      {
        path: "settings/about-us",
        element: <AboutUsPage />,
      },
      {
        path: "/settings/edit-about-us/:id",
        element: <EditAboutUs />
      },


    ],
  },
  {
    path: "/auth",
    errorElement: <h1>Auth Error</h1>,
    children: [
      {
        index: true,
        element: <SignIn />,
      },
      {
        path: "login",  // Remove the leading slash here
        element: <SignIn />,
      },
      {
        path: "forget-password",
        element: <ForgetPassword />,
      },
      {
        path: "otp/:email",
        element: <Otp />,
      },
      {
        path: "new-password/:email",
        element: <NewPassword />,
      },
    ],
  }

]);

export default router;
