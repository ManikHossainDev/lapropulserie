//@ts-ignore
import { model, Schema } from 'mongoose';
import { IFaq, IFaqModel } from './faq.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';


const FaqSchema = new Schema<IFaq>(
  {
    faqCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'FaqCategory',
    },

    question: {
      type: String,
      required: [true, 'question is required'],
    },

    answer: {
      type: String,
      required: [true, 'answer is required'],
    },

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

FaqSchema.plugin(paginate);
FaqSchema.plugin(toJSON);

export const Faq = model<
  IFaq,
  IFaqModel
>('Faq', FaqSchema) as any;
