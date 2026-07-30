import { TTransactionFor } from "../../../constants/TTransactionFor";
import { TCurrency } from "../../../enums/payment";
import ApiError from "../../../errors/ApiError";
import { PurchaseStrategy } from "../../payment.module/payment/purchaseStrategy/purchaseStrategy.abstract";
import { TPaymentStatus } from "../../payment.module/paymentTransaction/paymentTransaction.constant";
import { IUser } from "../../token/token.interface";
import { IIndividualCapsule } from "../individual-capsule/individual-capsule.interface";
import { IndividualCapsule } from "../individual-capsule/individual-capsule.model";
import { TPurchasedIndividualCapsuleStatus } from "./purchased-individual-capsule.constant";
import { PurchasedIndividualCapsule } from "./purchased-individual-capsule.model";
import { StatusCodes } from 'http-status-codes';

export class IndividualCapsulePurchaseStrategy extends PurchaseStrategy<IIndividualCapsule> {

    async checkAlreadyPurchased(capsuleId: string, userId: string) {
        return !!await PurchasedIndividualCapsule.findOne({ 
        capsuleId, studentId: userId,
        paymentStatus: TPaymentStatus.completed 
        });
    }

    async findExisting(capsuleId: string) {
        return IndividualCapsule.findById(capsuleId);
    }

    async createPendingPurchase(capsule: IIndividualCapsule, user: IUser, session: any) {
        const result = await PurchasedIndividualCapsule.create([{
            studentId: user.userId,
            capsuleId: capsule._id,

            paymentMethod : null,
            paymentTransactionId : null,
            paymentStatus : TPaymentStatus.pending,

            price: Number(capsule.price),
            status : TPurchasedIndividualCapsuleStatus.start,

            isGifted: false,
            isCertificateUploaded : false,
            totalModules: capsule.numberOfModules,
            
        }], { session });

        if(!result[0]){
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Individual Capsule Purchasing Failed !");
        }

        return result[0];
    }

    getMetadata(purchase: any, capsule: IIndividualCapsule, user: IUser) {
        return {
        referenceId: purchase._id.toString(),
        referenceFor: TTransactionFor.PurchasedIndividualCapsule,
        referenceId2: capsule._id!.toString(),
        referenceFor2: 'IndividualCapsule',
        amount: purchase.price.toString(),
        currency: TCurrency.eur,
        user: JSON.stringify(user),
        };
    }
}
