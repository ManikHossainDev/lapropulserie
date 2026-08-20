import { StatusCodes } from 'http-status-codes';
import { PurchasedIndividualCapsule } from './purchased-individual-capsule.model';
import { IPurchasedIndividualCapsule } from './purchased-individual-capsule.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { IUser } from '../../token/token.interface';
import { IUser as IMainUser } from '../../user.module/user/user.interface';
import { User } from '../../user.module/user/user.model';
import { TPaymentStatus } from '../../payment.module/paymentTransaction/paymentTransaction.constant';
import ApiError from '../../../errors/ApiError';
import Stripe from "stripe";
import stripe from '../../../config/paymentGateways/stripe.config';
import mongoose from 'mongoose';
import { TCurrency } from '../../../enums/payment';
import { TTransactionFor } from '../../../constants/TTransactionFor';
import { IIndividualCapsule } from '../individual-capsule/individual-capsule.interface';
import { IndividualCapsule } from '../individual-capsule/individual-capsule.model';
import { config } from '../../../config';
import { TPurchasedIndividualCapsuleStatus } from './purchased-individual-capsule.constant';
import { IIndividualCapsuleCategory } from '../individual-capsule-category/individual-capsule-category.interface';
import { IndividualCapsuleCategory } from '../individual-capsule-category/individual-capsule-category.model';
import { IndividualModule } from '../individual-module/individual-module.model';
import { IndividualLesson } from '../individual-lesson/individual-lesson.model';
import { IndividualModuleProgress } from '../individual-module-progress/individual-module-progress.model';
import { LessonProgress } from '../individual-lesson-progress/individual-lesson-progress.model';
import { JourneyCapsule } from '../../journey.module/journey-capsule/journey-capsule.model';
import { isJourneyOnlyDiscoverCategory } from '../shared/capsule-access.helper';


export class PurchasedIndividualCapsuleService extends GenericService<
  typeof PurchasedIndividualCapsule,
  IPurchasedIndividualCapsule
> {

  private stripe: Stripe;
  constructor() {
    super(PurchasedIndividualCapsule);
    this.stripe = stripe;
  }


  async createV2(capsuleId:string, user: IUser) : Promise<IPurchasedIndividualCapsule | { url: any}> {

  
    const existingUser:IMainUser = await User.findById(user.userId).select('subscriptionType name');

    const checkAlreadyPurchased = await PurchasedIndividualCapsule.findOne({
      capsuleId,
      studentId: user.userId,
      paymentStatus : TPaymentStatus.completed,
    });

    if(checkAlreadyPurchased){
      throw new ApiError(StatusCodes.BAD_REQUEST, 'You have already purchased this individual capsule');
    }

    const existingIndividualCapsule :IIndividualCapsule | null = await IndividualCapsule.findOne({
      _id: capsuleId,
    })

    if (!existingIndividualCapsule) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Individual capsule not found');
    }

    const category = await IndividualCapsuleCategory.findOne({
      _id: existingIndividualCapsule.capsuleCategoryId,
      isDeleted: false,
    }).select('sellIndividually price priceId capsuleType title');

    if (category && isJourneyOnlyDiscoverCategory(category)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'This capsule is not available for individual purchase. It is included in an Expedition Journey.',
      );
    }

    const journeyLinked = await JourneyCapsule.findOne({
      individualCapsuleId: existingIndividualCapsule._id,
      isDeleted: false,
    })
      .select('_id')
      .lean();

    if (journeyLinked) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'This capsule is not available for individual purchase. It is included in an Expedition Journey.',
      );
    }

    let stripeResult : { url: string | null } | undefined;
    let purchasedIndividualCapsule : IPurchasedIndividualCapsule | any;
    
    try {

    let stripeCustomer;
    if(!user.stripe_customer_id){
        let _stripeCustomer = await stripe.customers.create({
            name: user?.userName,
            email: user?.email,
        });
        
        stripeCustomer = _stripeCustomer.id;

        await User.findByIdAndUpdate(user?.userId, { $set: { stripe_customer_id: stripeCustomer } });
    }else{
        stripeCustomer = user.stripe_customer_id;
    }

    const session = await mongoose.startSession();

    await session.withTransaction(async () => {
  
      purchasedIndividualCapsule = await PurchasedIndividualCapsule.create(
        [{
          studentId: user?.userId,
          capsuleId : capsuleId,
          
          paymentMethod : null,
          paymentTransactionId : null,
          paymentStatus : TPaymentStatus.pending,
          price: Number(existingIndividualCapsule.price),
          status : TPurchasedIndividualCapsuleStatus.start,
          isGifted : false,
          isCertificateUploaded : false,
          totalModules : existingIndividualCapsule.numberOfModules,
        }], { session }
      );

    });
    session.endSession();

    
    if(!purchasedIndividualCapsule){
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Individual Capsule Purchasing Failed !");
    }
    
    const stripeSessionData: any = {
        payment_method_types: ['card'],
        mode: 'payment',
        customer: stripeCustomer,
        locale: 'fr',
        allow_promotion_codes: true,
        line_items: [
          {
            price_data: {
              currency: TCurrency.eur,
              product_data: {
                  name: existingIndividualCapsule.title || 'Capsule individuelle',
              },
              unit_amount : purchasedIndividualCapsule[0].price! * 100,
            },
            quantity: 1,
          },
        ],
        metadata: {
            referenceId: purchasedIndividualCapsule[0]._id.toString(),
            referenceFor: TTransactionFor.PurchasedIndividualCapsule,
            currency: TCurrency.eur,
            amount: purchasedIndividualCapsule[0].price!.toString(),
            user: JSON.stringify(user),
            referenceId2: existingIndividualCapsule._id!.toString(),
            referenceFor2 : 'IndividualCapsule',
        },
        success_url: config.stripe.success_url,
        cancel_url: config.stripe.cancel_url,
    };

      try {
          const session = await stripe.checkout.sessions.create(stripeSessionData);
          console.log({
                  url: session.url,
          });
          stripeResult = { url: session.url };
      } catch (error) {
          console.log({ error });
      }

    } catch (err) {
        console.error("Error while creating Order", err);
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Order creation failed');
    }
    return  stripeResult!;
  }

  async getAllWithGiftedAndCategories(user: IUser) {
    const purchasedCapsules = await PurchasedIndividualCapsule.find({
      studentId: user.userId,
      isDeleted: false,
    })
      .populate('capsuleId')
      .populate('studentId', 'fullName avatar')
      .lean();

    const giftedCapsules = purchasedCapsules.filter((p: any) => p.isGifted);
    const purchased = purchasedCapsules.filter((p: any) => !p.isGifted);

    const categoryIds = [...new Set(purchasedCapsules.map((p: any) => p.capsuleId?.capsuleCategoryId))];
    const categories = await IndividualCapsuleCategory.find({
      _id: { $in: categoryIds },
      isDeleted: false,
    }).lean();

    return {
      purchased,
      gifted: giftedCapsules,
      categories,
    };
  }

  async giftCapsule(studentId: string, capsuleId: string) {
    const student = await User.findById(studentId);
    if (!student) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Student not found');
    }

    const capsule = await IndividualCapsule.findById(capsuleId);
    if (!capsule) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Capsule not found');
    }

    const alreadyPurchased = await PurchasedIndividualCapsule.findOne({
      studentId,
      capsuleId,
      paymentStatus: TPaymentStatus.completed,
    });

    if (alreadyPurchased) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Student already has this capsule');
    }

    const giftedCapsule = await PurchasedIndividualCapsule.create({
      studentId,
      capsuleId,
      paymentStatus: TPaymentStatus.completed,
      price: capsule.price,
      status: TPurchasedIndividualCapsuleStatus.start,
      isGifted: true,
      isCertificateUploaded: false,
      totalModules: capsule.numberOfModules,
      paymentMethod: 'none',
    });

    return giftedCapsule;
  }

  /**
   * Get overall individual capsule progress for a student.
   * Calculates completed modules, lessons and overall progress percentage.
   */
  async getIndividualCapsuleProgress(capsuleId: string, studentId: string) {
    const capsuleObjectId = new mongoose.Types.ObjectId(capsuleId);
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    // 1. Fetch the purchased capsule
    const purchased = await PurchasedIndividualCapsule.findOne({
      capsuleId: capsuleObjectId,
      studentId: studentObjectId,
      isDeleted: false,
    });

    if (!purchased) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Purchased individual capsule not found for this student',
      );
    }

    // 2. Fetch all modules in this capsule
    const modules = await IndividualModule.find({ 
      capsuleId: capsuleObjectId, 
      isDeleted: false 
    }).sort({ orderNumber: 1 });
    
    const moduleIds = modules.map(m => m._id);
    const totalModules = modules.length;

    // 3. Fetch all lessons for these modules
    const totalLessons = await IndividualLesson.countDocuments({
      moduleId: { $in: moduleIds },
      isDeleted: false,
    });

    // 4. Get module progress trackers
    const moduleProgress = await IndividualModuleProgress.find({
      capsuleId: capsuleObjectId,
      studentId: studentObjectId,
    });

    const completedModules = moduleProgress.filter(
      (m: any) => m.status === 'completed'
    ).length;

    // 5. Get lesson progress trackers
    const lessonProgress = await LessonProgress.find({
      capsuleId: capsuleObjectId,
      studentId: studentObjectId,
    });

    const completedLessons = lessonProgress.filter(
      (l: any) => l.status === 'completed'
    ).length;

    // 6. Calculate progression percentage based on modules
    const progressPercentage = totalModules > 0
      ? Math.round((completedModules / totalModules) * 100)
      : 0;

    // 7. Determine overall status
    let status = TPurchasedIndividualCapsuleStatus.start;
    if (completedModules > 0 && completedModules < totalModules) {
      status = TPurchasedIndividualCapsuleStatus.inProgress;
    } else if (completedModules === totalModules && totalModules > 0) {
      status = TPurchasedIndividualCapsuleStatus.complete;
    }

    // 8. Update the record in DB
    await PurchasedIndividualCapsule.findByIdAndUpdate(
      purchased._id,
      {
        $set: {
          completedModules,
          totalModules,
          completedLessons,
          totalLessons,
          progressPercent: progressPercentage,
          status,
          ...(status === TPurchasedIndividualCapsuleStatus.complete && !purchased.completionDate
            ? { completionDate: new Date() }
            : {}),
        },
      }
    );

    return {
      progressPercent: progressPercentage,
      completedModules,
      totalModules,
      completedLessons,
      totalLessons,
      status,
      purchasedCapsule: purchased,
    };
  }
}
