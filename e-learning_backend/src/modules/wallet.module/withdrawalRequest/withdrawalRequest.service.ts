//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { WithdrawalRequest } from './withdrawalRequest.model';
import { IWithdrawalRequest } from './withdrawalRequest.interface';
import { GenericService } from '../../_generic-module/generic.services';

export class WithdrawalRequestService extends GenericService<
  typeof WithdrawalRequest,
  IWithdrawalRequest
> {
  constructor() {
    super(WithdrawalRequest);
  }
}
