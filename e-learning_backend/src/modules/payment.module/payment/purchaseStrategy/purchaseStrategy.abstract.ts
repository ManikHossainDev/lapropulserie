import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import { IUser } from '../../../token/token.interface';
import { PaymentGateway } from '../gateways/paymentgateway.abstract';

export abstract class PurchaseStrategy<T> {
  abstract findExisting(entityId: string): Promise<T | null>;
  abstract checkAlreadyPurchased(
    entityId: string,
    userId: string,
  ): Promise<boolean>;
  abstract createPendingPurchase(
    entity: T,
    user: IUser,
    session: any,
  ): Promise<any>;
  abstract getMetadata(
    purchase: any,
    entity: T,
    user: IUser,
  ): Record<string, string>;

  async processPayment(
    entityId: string,
    loggedInUser: IUser,
    gateway: PaymentGateway,
  ): Promise<{ url: string }> {
    if (!loggedInUser.userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User context is missing.');
    }

    const alreadyPurchased = await this.checkAlreadyPurchased(
      entityId,
      loggedInUser.userId,
    );
    if (alreadyPurchased) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Already purchased');
    }

    const entity = await this.findExisting(entityId);
    if (!entity) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Not found');
    }

    const customerId = await gateway.resolveCustomer(loggedInUser);

    const pendingPurchase = await this.createPendingPurchase(
      entity,
      loggedInUser,
      null,
    );

    if (!pendingPurchase) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Pending purchase creation failed.',
      );
    }

    return gateway.createSession({
      stripeCustomerId: customerId,
      price: pendingPurchase.price,
      metadata: this.getMetadata(pendingPurchase, entity, loggedInUser),
    });
  }
}
