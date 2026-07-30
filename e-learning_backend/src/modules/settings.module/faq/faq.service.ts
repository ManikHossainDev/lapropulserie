import { StatusCodes } from 'http-status-codes';
import { Faq } from './faq.model';
import { IFaq } from './faq.interface';
import { GenericService } from '../../_generic-module/generic.services';
import ApiError from '../../../errors/ApiError';
import mongoose from 'mongoose';

export class FaqService extends GenericService<
  typeof Faq,
  IFaq
> {
  constructor() {
    super(Faq);
  }

  async bulkCreate(faqs: Partial<IFaq>[]) {
    const createdFaqs = await this.model.insertMany(faqs);
    return createdFaqs;
  }

  async bulkUpdate(faqs: Partial<IFaq>[]) {
    const operations = faqs.map((faq) => {
      if (faq._id) {
        return {
          updateOne: {
            filter: { _id: faq._id },
            update: { question: faq.question, answer: faq.answer, faqCategoryId: faq.faqCategoryId },
            upsert: false,
          },
        };
      }
      return null;
    }).filter(Boolean);

    if (operations.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No valid FAQ updates provided');
    }

    const result = await this.model.bulkWrite(operations as any);
    return result;
  }

  async bulkDelete(faqIds: string[]) {
    const objectIds = faqIds.map((id) => new mongoose.Types.ObjectId(id));
    
    const result = await this.model.deleteMany({
      _id: { $in: objectIds },
    });

    return result;
  }

  async bulkSoftDelete(faqIds: string[]) {
    const objectIds = faqIds.map((id) => new mongoose.Types.ObjectId(id));
    
    const result = await this.model.updateMany(
      { _id: { $in: objectIds } },
      { isDeleted: true }
    );

    return result;
  }

  async getFaqsByCategoryId(categoryId: string, options: any = {}) {
    const result = await this.model.paginate(
      { faqCategoryId: categoryId, isDeleted: false },
      options
    );
    return result;
  }
}
