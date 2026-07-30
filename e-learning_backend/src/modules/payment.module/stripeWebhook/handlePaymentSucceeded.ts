import ApiError from "../../../errors/ApiError";
import { TRole } from "../../../middlewares/roles";
import { enqueueWebNotification } from "../../../services/notification.service";
import { TNotificationType } from "../../notification/notification.constants";
import { IUser } from "../../token/token.interface";
import { User } from "../../user.module/user/user.model";
import { WalletService } from "../../wallet.module/wallet/wallet.service";
import { TPaymentGateway, TPaymentStatus } from "../paymentTransaction/paymentTransaction.constant";
import { PaymentTransaction } from '../paymentTransaction/paymentTransaction.model';
import Stripe from 'stripe';
import { StatusCodes } from 'http-status-codes';
import mongoose from "mongoose";
import { PurchasedJourney } from "../../journey.module/purchased-journey/purchased-journey.model";
import { TTransactionFor } from "../../../constants/TTransactionFor";
import { IPurchasedJourney } from "../../journey.module/purchased-journey/purchased-journey.interface";
 import { JourneyCapsule } from "../../journey.module/journey-capsule/journey-capsule.model";
 import { IJourneyCapsule } from "../../journey.module/journey-capsule/journey-capsule.interface";
 import { JourneyModule } from "../../journey.module/journey-module/journey-module.model";
 import { JourneyLesson } from "../../journey.module/journey-lesson/journey-lesson.model";
 import { IStudentCapsuleTracker } from "../../journey.module/student-capsule-tracker/student-capsule-tracker.interface";
import { TCurrentSection, TTrackerStatus } from "../../journey.module/student-capsule-tracker/student-capsule-tracker.constant";
import { StudentCapsuleTracker } from "../../journey.module/student-capsule-tracker/student-capsule-tracker.model";
import { IndividualModule } from '../../individualCapsule.module/individual-module/individual-module.model';
import { IIndividualModule } from '../../individualCapsule.module/individual-module/individual-module.interface';
import { IIndividualLesson } from '../../individualCapsule.module/individual-lesson/individual-lesson.interface';
import { IndividualLesson } from '../../individualCapsule.module/individual-lesson/individual-lesson.model';
import { PurchasedIndividualCapsule } from '../../individualCapsule.module/purchased-individual-capsule/purchased-individual-capsule.model';
import { IPurchasedIndividualCapsule } from '../../individualCapsule.module/purchased-individual-capsule/purchased-individual-capsule.interface';
import { IndividualModuleProgress } from '../../individualCapsule.module/individual-module-progress/individual-module-progress.model';
import { MentorSession } from '../../student.module/mentors/mentor-session.model';
import { LessonProgress } from '../../individualCapsule.module/individual-lesson-progress/individual-lesson-progress.model';

interface IPurchasedAdminCapsule {
     _id?: mongoose.Types.ObjectId;
     paymentTransactionId?: string;
     paymentStatus?: string;
     totalIndividualLessons?: number;
     totalModule?: number;
     completedIndividualLessons?: number;
     completedModules?: number;
     isDeleted?: boolean;
}

enum TAdminModuleProgress {
     locked = 'locked',
     unlocked = 'unlocked',
     inProgress = 'inProgress',
     completed = 'completed',
}

interface IAdminModuleProgress {
     moduleId: mongoose.Types.ObjectId;
     capsuleId: string;
     studentId: string;
     totalIndividualLessons: number;
     status: TAdminModuleProgress;
     completedIndividualLessonsCount: number;
}

enum TIndividualLessonProgress {
     locked = 'locked',
     unlocked = 'unlocked',
     inProgress = 'inProgress',
     completed = 'completed',
}

interface IIndividualLessonProgress {
     lessonId: mongoose.Types.ObjectId;
     moduleId: mongoose.Types.ObjectId;
     capsuleId: string;
     studentId: string;
     status: TIndividualLessonProgress;
}

// Simple model registration for PurchasedAdminCapsule (doesn't have a dedicated model file)
const PurchasedAdminCapsule = mongoose.model('PurchasedAdminCapsule', new mongoose.Schema({}), 'purchasedadmincapsules');


const walletService = new WalletService();

// Function for handling a successful payment
export const handlePaymentSucceeded = async (session: Stripe.Checkout.Session) => {
     
     try {

          console.log("session.metadata 🔎🔎", session.metadata)

          const { 
               referenceId, // bookingId
               user,
               referenceFor, // TTransactionFor .. bookingId related to which model
               currency,
               amount,
               referenceId2, // if more data is needed
               referenceFor2, // if more data is needed .. referenceId2 related to which model
               ...rest  // 👈 This captures everything else
          }: any = session.metadata;
          // userId // for sending notification .. 

          let _user:IUser = JSON.parse(user);

          const thisCustomer = await User.findOne({ _id: _user.userId });

          if (!thisCustomer) {
               throw new ApiError(StatusCodes.NOT_FOUND, 'Customer not found');
          }

          // TODO : 🟢🟢
          // Based on referenceId and referenceFor .. we need to check
          // that Id exist or not in our database .. 

          const paymentIntent = session.payment_intent as string;
          console.log('=============================');
          console.log('paymentIntent : ', paymentIntent);
          
          const isPaymentExist = await PaymentTransaction.findOne({ paymentIntent });

          if (isPaymentExist) {
               throw new ApiError(StatusCodes.BAD_REQUEST, 'From Webhook handler : Payment Already exist');
          }

          if(referenceFor === TTransactionFor.UserSubscription){

               // which means we dont create paymentTransaction here ..
               // we want to create  paymentTransaction in handleSuccessfulPayment
               console.log("🟡🟡 which means we dont create paymentTransaction here 🟡🟡 we want to create  paymentTransaction in handleSuccessfulPayment")
               // lets test ... 
               return
          }
          
          const newPayment = await PaymentTransaction.create({
               userId: _user.userId,
               referenceFor, // If this is for Order .. we pass "Order" here
               referenceId, // If this is for Order .. then we pass OrderId here
               paymentGateway: TPaymentGateway.stripe,
               transactionId: session.id,
               paymentIntent: paymentIntent,
               amount: amount,
               currency,
               paymentStatus: TPaymentStatus.completed,
               gatewayResponse: session,
          });

          let updatedObjectOfReferenceFor: any;
          if (referenceFor === TTransactionFor.PurchasedJourney) {
            updatedObjectOfReferenceFor = updatePurchasedJourney(
              _user,
              referenceId, // purchasedJourneyId
              newPayment._id.toString(),
              referenceId2, // journeyId,
              referenceFor2, // Journey Model Name
            );
          } else if (referenceFor === TTransactionFor.PurchasedAdminCapsule) {
            updatedObjectOfReferenceFor = updatePurchasedAdminCapsule(
              _user,
              referenceId, // purchasedJourneyId
              newPayment._id.toString(),
              referenceId2, // adminJourneyCapsuleId,
              referenceFor2, // IndividualCapsule Model Name
            );
          } else if (
            referenceFor === TTransactionFor.PurchasedIndividualCapsule
          ) {
            updatedObjectOfReferenceFor = updatePurchasedIndividualCapsule(
              _user,
              referenceId, // purchasedIndividualCapsuleId
              newPayment._id.toString(),
              referenceId2, // individualCapsuleId,
              referenceFor2, // IndividualCapsule Model Name
            );
          } else if (referenceFor === TTransactionFor.MentorSession) {
            updatedObjectOfReferenceFor = updateMentorSession(
              _user,
              referenceId,
              newPayment._id.toString(),
              referenceId2,
            );
          } else {
            console.log(
              `🔎🔎🔎🔎🔎 May be we need to handle this  ${referenceFor} :: ${referenceId}`,
            );
          }

          // if (!updatedObjectOfReferenceFor) {
          //      throw new ApiError(StatusCodes.NOT_FOUND, `In handlePaymentSucceeded Webhook Handler.. Booking not found 🚫 For '${referenceFor}': Id : ${referenceId}`);
          // }

          //---------------------------------
          // Notification Send korte hobe .. TODO :
          //---------------------------------

          return { payment: newPayment, paymentFor: updatedObjectOfReferenceFor };
     } catch (error) {
          console.error('Error in handlePaymentSucceeded:', error);
     }
};

//---------------------------------
// 🥇
//  const refModel = mongoose.model(result.type);
//  const isExistRefference = await refModel.findById(result.refferenceId).session(session);
//---------------------------------

async function updatePurchasedJourney(
     user: IUser,
     purchasedJourneyId: string,
     paymentTransactionId: string,
     journeyId : string,
     JourneyModelName : string,
){

     // First update payment info and get the purchased journey
     const updatedPurchasedJourney = await PurchasedJourney.findByIdAndUpdate(purchasedJourneyId, { 
           paymentTransactionId : paymentTransactionId,
           paymentStatus: TPaymentStatus.completed,
     }, { new: true });

     // Get all capsules for this journey
     const capsules = await JourneyCapsule.find({
          journeyId : new mongoose.Types.ObjectId(journeyId),
          isDeleted : false,
     });

     const totalCapsules = capsules.length;

     // Calculate total modules from capsules
     const totalModules = capsules.reduce((sum, cap) => sum + (cap.totalModule || 0), 0);

     // Get all modules for these capsules to count lessons
     const capsuleIds = capsules.map(c => c._id);
     const modules = await JourneyModule.find({ 
          capsuleId: { $in: capsuleIds }, 
          isDeleted: false 
     });
     const moduleIds = modules.map(m => m._id);

     const totalLessons = await JourneyLesson.countDocuments({
          moduleId: { $in: moduleIds },
          isDeleted: false,
     });

     // Update the purchased journey with actual counts
     await PurchasedJourney.findByIdAndUpdate(purchasedJourneyId, {
          $set: {
               totalCapsules,
               totalModules,
               totalLessons,
               // Initialize completed counts to 0, progress to 0, status to notStarted
               completedCapsules: 0,
               completedModules: 0,
               completedLessons: 0,
               progressPercentage: 0,
               overallStatus: 'notStarted',
          }
     });

     // Create all Student JourneyCapsule Tracker at purchase time 
     const studentJourneyCapsuleTrackers : IStudentCapsuleTracker[] = capsules.map((capsule : IJourneyCapsule) => ({
          capsuleNumber : capsule.capsuleNumber,
          title : capsule.title,
          capsuleId : capsule._id!,
          studentId : new mongoose.Types.ObjectId(user.userId!),
          overallStatus : TTrackerStatus.notStarted,
          introStatus : TTrackerStatus.inProgress,
          inspirationStatus : TTrackerStatus.notStarted,
          diagnosticsStatus : TTrackerStatus.notStarted,
          scienceStatus : TTrackerStatus.notStarted,
          aiSummaryStatus : TTrackerStatus.notStarted,
          currentSection : TCurrentSection.introduction,
          progressPercentage : 0,
          studentsAnswer: '',
     }));

     const res = await StudentCapsuleTracker.insertMany(studentJourneyCapsuleTrackers);

     
     await enqueueWebNotification(
          `A Student ${user.userId} ${user.userName} purchased a journey, TxnId : ${paymentTransactionId}`,
          user.userId!, // senderId
          '', // receiverId 
          TRole.admin, // receiverRole
          TNotificationType.payment, // type
          new mongoose.Types.ObjectId(), // idOfType
          '', // linkFor // TODO : MUST add the query params 
          purchasedJourneyId, // linkId
          // TTransactionFor.TrainingProgramPurchase, // referenceFor
          // purchaseTrainingProgram._id // referenceId
     );

     return updatedPurchasedJourney;
}

async function updatePurchasedAdminCapsule(
     user: IUser,
     purchasedAdminCapsuleId: string,
     paymentTransactionId: string,
     adminJourneyCapsuleId : string,
     IndividualCapsuleModelName : string,
){

     

     // Create all Student JourneyCapsule Tracker at purchase time 
     // get all capsules by purchasedJourneyId 

     const adminModules: IIndividualModule[] = await IndividualModule.find({
          capsuleId : adminJourneyCapsuleId,
          isDeleted : false,
     }).sort({ orderNumber: 1 }); // ✅ sorted so we know which is first
     
     console.log("adminModules :: ", adminModules)

     // Get all lessons for all modules in one query
     const moduleIds = adminModules.map(m => m._id);

     const allIndividualLessons: IIndividualLesson[] = await IndividualLesson.find({
          moduleId: { $in: moduleIds },
          isDeleted: false,
     }).sort({ orderNumber: 1 });

     // Group lessons by moduleId for easy access
     const lessonsByModule = allIndividualLessons.reduce((acc, lesson) => {
          const key = lesson.moduleId.toString();
          if (!acc[key]) acc[key] = [];
          
          acc[key].push(lesson);
          
          return acc;
     }, {} as Record<string, IIndividualLesson[]>);

     const firstModuleId = adminModules[0]!._id!.toString();


     /*-─────────────────────────────────
     |  Prepare ModuleProgress for bulk insert
     |  First module → unlocked, rest → locked
     └──────────────────────────────────*/
     const moduleProgressDocs: IAdminModuleProgress[] = adminModules.map((module, index) => ({
          moduleId: module._id!,
          capsuleId: adminJourneyCapsuleId,
          studentId: user.userId!,
          totalIndividualLessons: lessonsByModule[module._id!.toString()]?.length || 0, // module.numberOfIndividualLessons,
          status: index === 0 ? TAdminModuleProgress.inProgress : TAdminModuleProgress.locked,
          completedIndividualLessonsCount: 0,
     }));

     /*-─────────────────────────────────
     |  prepare Admin Module Progress for bulk insert
     └──────────────────────────────────*/
     /*---------
     const adminModuleProgresss : IAdminModuleProgress[] = adminModules.map((adminModule : IIndividualModule) => ({
          moduleId : adminModule._id,
          capsuleId : adminJourneyCapsuleId,
          studentId : user.userId,
          totalIndividualLessons : adminModule.numberOfIndividualLessons, // but sure na .. 
          status : TAdminModuleProgress.notStarted, 
          completedIndividualLessonsCount : 0,
     }))
     -----------*/


     /*-─────────────────────────────────
     |  Prepare IndividualLessonProgress for bulk insert
     |  First lesson of first module → unlocked
     |  Everything else → locked
     └──────────────────────────────────*/
     const lessonProgressDocs: IIndividualLessonProgress[] = allIndividualLessons.map((lesson) => {
          const isFirstModule = lesson.moduleId.toString() === firstModuleId;
          const lessonsInFirstModule = lessonsByModule[firstModuleId] ?? [];
          const isFirstIndividualLesson = isFirstModule && lesson._id && lesson._id.toString() === lessonsInFirstModule[0]?._id?.toString();

          return {
               lessonId: lesson._id!,
               moduleId: lesson.moduleId,
               capsuleId: adminJourneyCapsuleId,
               studentId: user.userId!,
               status: isFirstIndividualLesson ? TIndividualLessonProgress.unlocked : TIndividualLessonProgress.locked,
          };
     });
     
     // const res = await IndividualModuleProgress.insertMany(adminModuleProgresss);

     // Bulk insert both in parallel
     await Promise.all([
          IndividualModuleProgress.insertMany(moduleProgressDocs),
          LessonProgress.insertMany(lessonProgressDocs),
     ]);


     const updatedPurchasedAdminCapsule = await PurchasedAdminCapsule.findByIdAndUpdate(purchasedAdminCapsuleId, { 
          /* update fields */ 
          paymentTransactionId : paymentTransactionId,
          paymentStatus: TPaymentStatus.completed,
          totalIndividualLessons : allIndividualLessons.length || 0,
          totalModule : adminModules.length || 0,
          completedIndividualLessons : 0,
          completedModules : 0,
     }, { new: true });

     console.log("updatedPurchasedAdminCapsule :: ", updatedPurchasedAdminCapsule);


     /*-─────────────────────────────────
          ## State at Purchase Time
          Module 1  → unlocked   ← student can start
          IndividualLesson 1 → unlocked  ← only this one is accessible
          IndividualLesson 2 → locked
          IndividualLesson 3 → locked

          Module 2  → locked
          IndividualLesson 1 → locked
          IndividualLesson 2 → locked

          Module 3  → locked
          ...


          ## Unlock Chain (when student completes a lesson)

          Complete IndividualLesson 1 of Module 1
          → IndividualLessonProgress[lesson1] = completed
          → Unlock IndividualLessonProgress[lesson2] of Module 1

          Complete last IndividualLesson of Module 1
          → ModuleProgress[module1] = completed
          → Unlock ModuleProgress[module2]
          → Unlock IndividualLessonProgress[first lesson of module2]
     └──────────────────────────────────*/

     /*-─────────────────────────────────
     | // TODO  notification e click korle kon page e jabe .. chinta korte hobe .. payment txn page e jabe ? naki capsule booking page e jabe ? naki original capsule e jabe ?
     └──────────────────────────────────*/
     await enqueueWebNotification(
          `A Student ${user.userId} ${user.userName} purchased a capsule, TxnId : ${paymentTransactionId}`,
          user.userId!, // senderId
          '', // receiverId 
          TRole.admin, // receiverRole
          TNotificationType.purchasedAdminCapsule, // type
          new mongoose.Types.ObjectId(), // idOfType
          '', // linkFor // TODO : MUST add the query params 
          purchasedAdminCapsuleId, // linkId
          // TTransactionFor.TrainingProgramPurchase, // referenceFor
          // purchaseTrainingProgram._id // referenceId
     );

     return updatedPurchasedAdminCapsule;
}

async function updatePurchasedIndividualCapsule(
  user: IUser,
  purchasedIndividualCapsuleId: string,
  paymentTransactionId: string,
  individualCapsuleId: string,
  IndividualCapsuleModelName: string,
) {
  // Get all modules for this capsule
  const capsuleModules: IIndividualModule[] = await IndividualModule.find({
    capsuleId: individualCapsuleId,
    isDeleted: false,
  }).sort({ orderNumber: 1 });

  console.log('capsuleModules :: ', capsuleModules);

  // Get all lessons for all modules in one query
  const moduleIds = capsuleModules.map(m => m._id);

  const allIndividualLessons: IIndividualLesson[] = await IndividualLesson.find(
    {
      moduleId: { $in: moduleIds },
      isDeleted: false,
    },
  ).sort({ orderNumber: 1 });

  // Group lessons by moduleId for easy access
  const lessonsByModule = allIndividualLessons.reduce(
    (acc, lesson) => {
      const key = lesson.moduleId.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(lesson);
      return acc;
    },
    {} as Record<string, IIndividualLesson[]>,
  );

  const firstModuleId = capsuleModules[0]?._id?.toString();

  /*-─────────────────────────────────
     |  Prepare ModuleProgress for bulk insert
     |  First module → unlocked, rest → locked
     └──────────────────────────────────*/
  const moduleProgressDocs: IAdminModuleProgress[] = capsuleModules.map(
    (module, index) => ({
      moduleId: module._id!,
      capsuleId: individualCapsuleId,
      studentId: user.userId!,
      totalIndividualLessons:
        lessonsByModule[module._id!.toString()]?.length || 0,
      status:
        index === 0
          ? TAdminModuleProgress.inProgress
          : TAdminModuleProgress.locked,
      completedIndividualLessonsCount: 0,
    }),
  );

  /*-─────────────────────────────────
     |  Prepare IndividualLessonProgress for bulk insert
     |  First lesson of first module → unlocked
     |  Everything else → locked
     └──────────────────────────────────*/
  const lessonProgressDocs: IIndividualLessonProgress[] =
    allIndividualLessons.map(lesson => {
      const isFirstModule = lesson.moduleId.toString() === firstModuleId;
      const lessonsInFirstModule = firstModuleId
        ? (lessonsByModule[firstModuleId] ?? [])
        : [];
      const isFirstIndividualLesson =
        isFirstModule &&
        lesson._id &&
        lesson._id.toString() === lessonsInFirstModule[0]?._id?.toString();

      return {
        lessonId: lesson._id!,
        moduleId: lesson.moduleId,
        capsuleId: individualCapsuleId,
        studentId: user.userId!,
        status: isFirstIndividualLesson
          ? TIndividualLessonProgress.unlocked
          : TIndividualLessonProgress.locked,
      };
    });

  // Bulk insert both in parallel
  await Promise.all([
    IndividualModuleProgress.insertMany(moduleProgressDocs),
    LessonProgress.insertMany(lessonProgressDocs),
  ]);

  // Update the purchased capsule record
  const updatedPurchasedIndividualCapsule =
    await PurchasedIndividualCapsule.findByIdAndUpdate(
      purchasedIndividualCapsuleId,
      {
        paymentTransactionId: paymentTransactionId,
        paymentStatus: TPaymentStatus.completed,
        totalIndividualLessons: allIndividualLessons.length || 0,
        totalModules: capsuleModules.length || 0,
        completedLessons: 0,
        completedModules: 0,
      },
      { new: true },
    );

  console.log(
    'updatedPurchasedIndividualCapsule :: ',
    updatedPurchasedIndividualCapsule,
  );

  /*-─────────────────────────────────
     |  State at Purchase Time:
     |  Module 1  → unlocked   ← student can start
     |  IndividualLesson 1 → unlocked  ← only this one is accessible
     |  IndividualLesson 2 → locked
     |  IndividualLesson 3 → locked
     |
     |  Module 2  → locked
     |  IndividualLesson 1 → locked
     |  IndividualLesson 2 → locked
     |
     |  Unlock Chain (when student completes a lesson):
     |  Complete IndividualLesson 1 of Module 1
     |  → IndividualLessonProgress[lesson1] = completed
     |  → Unlock IndividualLessonProgress[lesson2] of Module 1
     |
     |  Complete last IndividualLesson of Module 1
     |  → ModuleProgress[module1] = completed
     |  → Unlock ModuleProgress[module2]
     |  → Unlock IndividualLessonProgress[first lesson of module2]
     └──────────────────────────────────*/

  // Send notification to admin
  await enqueueWebNotification(
    `A Student ${user.userId} ${user.userName} purchased an individual capsule, TxnId : ${paymentTransactionId}`,
    user.userId!, // senderId
    '', // receiverId
    TRole.admin, // receiverRole
    TNotificationType.purchasedAdminCapsule, // type
    new mongoose.Types.ObjectId(), // idOfType
    '', // linkFor // TODO: MUST add the query params
    purchasedIndividualCapsuleId, // linkId
  );

  return updatedPurchasedIndividualCapsule;
}

async function updateMentorSession(
  user: IUser,
  mentorSessionId: string,
  paymentTransactionId: string,
  mentorProfileId: string,
) {
  const updatedMentorSession = await MentorSession.findByIdAndUpdate(
    mentorSessionId,
    {
      $set: {
        paymentTransactionId,
        paymentStatus: TPaymentStatus.completed,
      },
    },
    { new: true }
  );

  console.log('updatedMentorSession 🟢🟢 : ', updatedMentorSession);

  await enqueueWebNotification(
    `A Student ${user.userId} ${user.userName} booked a mentor session, TxnId : ${paymentTransactionId}`,
    user.userId!,
    '',
    TRole.admin,
    TNotificationType.payment,
    new mongoose.Types.ObjectId(),
    '',
    mentorSessionId,
  );

  return updatedMentorSession;
}
