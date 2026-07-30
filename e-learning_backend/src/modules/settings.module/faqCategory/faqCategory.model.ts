//@ts-ignore
import { model, Schema } from 'mongoose';
import { IFaqCategory, IFaqCategoryModel } from './faqCategory.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';

const FaqCategorySchema = new Schema<IFaqCategory>(
  {
    categoryName: {
      type: String,
      required: [true, 'categoryName is required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

FaqCategorySchema.plugin(paginate);
FaqCategorySchema.plugin(toJSON);

export const FaqCategory = model<
  IFaqCategory,
  IFaqCategoryModel
>('FaqCategory', FaqCategorySchema);
